import os
import json
import logging
import requests
from groq import Groq, APIConnectionError
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from prompts import SYSTEM_PROMPT, SUMMARY_PROMPT

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('NovaAgent')

load_dotenv()

app = Flask(__name__)
CORS(app)

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:5001/students")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here":
    client = Groq(api_key=GROQ_API_KEY)
else:
    client = None

def clean_json(text):
    text = text.strip()
    if text.startswith("```json"):
        text = text.replace("```json", "", 1)
    if text.startswith("```"):
        text = text.replace("```", "", 1)
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def generate_natural_response(api_response, intent, user_message=""):
    """Pass 2: Uses Groq (Llama) to turn the raw API JSON into a beautiful English response."""
    try:
        prompt = SUMMARY_PROMPT.replace("{api_response}", json.dumps(api_response, indent=2))
        prompt = prompt.replace("{action_intent}", intent)
        prompt = prompt.replace("{user_message}", user_message)
        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )
        return res.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Failed to generate natural response: {e}")
        return "✅ Action completed successfully."

@app.route("/chat", methods=["POST"])
def chat():
    if not client:
        return jsonify({"reply": "⚠️ Please add your Groq API Key in the python-agent/.env file and restart the server.", "action": None})

    user_message = request.json.get("message", "")
    history = request.json.get("history", [])
    if not user_message:
        return jsonify({"reply": "I didn't catch that. How can I help you?", "action": None})

    try:
        # Format history (last 5 messages to save tokens)
        history_text = "\n".join([f"{msg['sender'].upper()}: {msg['text']}" for msg in history[-5:]])
        
        # Pass 1: Intent Extraction
        logger.info(f"Received user message: {user_message}")
        prompt = f"{SYSTEM_PROMPT}\n\nRecent Chat History (for context):\n{history_text}\n\nUser Input: \"{user_message}\""
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )
        
        raw_text = clean_json(response.choices[0].message.content)
        data = json.loads(raw_text)
        
        intent = data.get("intent")
        entities = data.get("entities", {})
        logger.info(f"Extracted Intent: {intent}")
        logger.info(f"Entities: {entities}")
        
        # Pass 2 Execution: Route to appropriate API and get Natural Summary
        if intent == "ADD_STUDENT":
            res = requests.post(API_BASE_URL, json=entities)
            if res.status_code == 201:
                student = res.json()
                reply = generate_natural_response(student, intent, user_message)
                return jsonify({"reply": reply, "action": {"type": "REFRESH_TABLE"}})
            else:
                return jsonify({"reply": f"❌ Failed to add student: {res.json().get('message', res.text)}", "action": None})

        elif intent == "GET_STUDENT":
            search_query = entities.get("studentId", "")
            res = requests.get(f"{API_BASE_URL}?search={search_query}")
            if res.status_code == 200:
                students = res.json()
                if len(students) > 0:
                    student = students[0]
                    reply = generate_natural_response(student, intent, user_message)
                    return jsonify({"reply": reply, "action": {"type": "HIGHLIGHT_ROW", "id": student['studentId']}})
                else:
                    return jsonify({"reply": f"⚠️ Could not find any student matching '{search_query}'.", "action": None})

        elif intent == "UPDATE_STUDENT":
            search_query = entities.get("studentId", "")
            # Find the student first
            search_res = requests.get(f"{API_BASE_URL}?search={search_query}")
            if search_res.status_code == 200 and len(search_res.json()) > 0:
                student_id = search_res.json()[0]['studentId']
                
                # We only send fields that were actually provided in the update
                update_data = {}
                if "name" in entities: update_data["name"] = entities["name"]
                if "age" in entities: update_data["age"] = entities["age"]
                if "subjects" in entities: update_data["subjects"] = entities["subjects"]
                
                # Make the PUT request
                res = requests.put(f"{API_BASE_URL}/{student_id}", json=update_data)
                if res.status_code == 200:
                    reply = generate_natural_response(res.json(), intent, user_message)
                    return jsonify({"reply": reply, "action": {"type": "REFRESH_TABLE"}})
                else:
                    return jsonify({"reply": f"❌ Update failed: {res.text}", "action": None})
            return jsonify({"reply": f"⚠️ Could not find a student matching '{search_query}' to update.", "action": None})

        elif intent == "DELETE_STUDENT":
            search_query = entities.get("studentId", "")
            search_res = requests.get(f"{API_BASE_URL}?search={search_query}")
            
            if search_res.status_code == 200 and len(search_res.json()) > 0:
                student_id = search_res.json()[0]['studentId']
                res = requests.delete(f"{API_BASE_URL}/{student_id}")
                if res.status_code == 200:
                    # Pass the deleted student data to Groq so it knows who was deleted
                    deleted_data = search_res.json()[0]
                    deleted_data['status_message'] = "Successfully deleted"
                    reply = generate_natural_response(deleted_data, intent, user_message)
                    return jsonify({"reply": reply, "action": {"type": "REFRESH_TABLE"}})
            
            return jsonify({"reply": f"⚠️ Could not find a student matching '{search_query}' to delete.", "action": None})

        elif intent == "GET_ALL_STUDENTS":
            res = requests.get(API_BASE_URL)
            if res.status_code == 200:
                reply = generate_natural_response({"all_students": res.json()}, intent, user_message)
                return jsonify({"reply": reply, "action": None})

        elif intent == "DIRECT_REPLY":
            reply = data.get("reply", "I'm not sure how to respond to that.")
            return jsonify({"reply": reply, "action": None})

        return jsonify({"reply": "❌ Unsupported action.", "action": None})

    except json.JSONDecodeError as e:
        logger.error(f"JSON Parsing Error: {e}")
        return jsonify({"reply": "❌ Error: I couldn't properly understand the intent.", "action": None})
    except requests.exceptions.ConnectionError:
        logger.error("Backend Server is Offline.")
        return jsonify({"reply": "🔌 Error: Backend server is offline! Please ensure Node.js is running.", "action": None})
    except APIConnectionError as e:
        logger.error(f"Groq API Connection Error: {e}")
        return jsonify({"reply": "🌐 Error: Could not connect to Groq AI. If you are on Render, Groq might be temporarily blocking datacenter IPs. If local, check your VPN/Antivirus.", "action": None})
    except Exception as e:
        logger.error(f"Unexpected Error: {e}")
        return jsonify({"reply": f"❌ Unexpected Error: {str(e)}", "action": None})

if __name__ == "__main__":
    logger.info("Starting Python AI Agent API on http://localhost:5002")
    app.run(port=5002, debug=True)
