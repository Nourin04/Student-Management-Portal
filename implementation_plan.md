# Intelligent Student Management System Implementation Plan

This document outlines the step-by-step plan to build the Student Management System. We are splitting the project into three main components: the Backend (Express/MongoDB), the Frontend (React), and the Python AI Agent. 

Since you are new to the MERN stack, we will tackle this step-by-step, making sure each piece is thoroughly explained and robustly built before moving to the next.

## User Review Required

> [!IMPORTANT]
> Please review the steps below. Once you approve, we will begin with **Step 1**, and I will explain what I'm doing and why. We will do this one step at a time!

## Open Questions

> [!NOTE]
> 1. **MongoDB Connection:** We need a MongoDB database to connect to. Do you already have a MongoDB URI (e.g., from MongoDB Atlas) you'd like me to use, or should we use a local MongoDB instance for development?
> 2. **Gemini API Key:** For the Python AI agent, we will need a Gemini API key. Please ensure you have one ready (we will use it securely via an environment variable and will not expose it in the code).

## Proposed Changes

### 1. Backend (MERN - Express & MongoDB)
This will act as the source of truth and data layer.
- **Initialize Node.js Server:** Setup a basic Express server.
- **Database Schema (Mongoose):** Create a `Student` model with `studentId`, `name`, `age`, and `subjects` (subject name, score). We will add logic to automatically calculate the Average Score, Grade (A-F), and Pass/Fail status.
- **RESTful APIs:**
  - `POST /students` - Create a new student.
  - `GET /students` - Fetch all students (with optional search parameters).
  - `GET /students/:id` - Fetch a single student.
  - `PUT /students/:id` - Update student details.
  - `DELETE /students/:id` - Delete a student.
- **Error Handling:** Ensure invalid inputs or missing students return clean, readable error messages.

### 2. Frontend (MERN - React.js)
This will be the beautiful, user-facing UI.
- **Initialize Vite + React:** Set up a fast modern React environment.
- **Styling Setup:** Use Tailwind CSS for a premium, modern design with hover effects, micro-animations, and a clean layout.
- **Dashboard UI:** 
  - Top stat cards (Total Students, Passed, Failed, Average Score).
  - A responsive table or grid listing students.
  - Live search bar.
- **Forms and Modals:**
  - Modern "Add Student" and "Edit Student" forms with validation.
  - Confirmation dialogs before deleting.
  - Toast notifications for success/error alerts.

### 3. Python AI Agent
This agent will act as a natural language bridge to our Express Backend.
- **Python Setup:** Create a clean virtual environment and install `google-generativeai` and `requests`.
- **Prompt Engineering:** Write a structured system prompt that teaches Gemini to extract intents (ADD, GET, etc.) and entities (Name, Age, Subjects) from user input and output them in a strict JSON format.
- **API Orchestration:** Based on Gemini's JSON output, the Python script will make the corresponding HTTP request to our local Express backend.
- **Response Generation:** It will take the backend's response and use Gemini (or template responses) to reply naturally to the user.
- **Error Handling:** Manage "Not Found", "Invalid Request", "Backend Offline", and "Ambiguous Query" scenarios elegantly.

## Verification Plan

### Automated Tests
- We will test the backend API endpoints directly (e.g., using `curl` or by writing quick automated test scripts) before connecting the frontend.
- We will test the Python Agent with at least 10 varied prompts to ensure intent extraction is robust.

### Manual Verification
- Run the full stack locally.
- Manually create, read, update, and delete students through the beautiful React UI.
- Send natural language commands to the Python Agent and verify the changes reflect instantly in the MongoDB database and React UI.
