import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { createStudent, updateStudent } from '../services/api';
import toast from 'react-hot-toast';

const StudentModal = ({ isOpen, onClose, studentToEdit, onSuccess }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    age: '',
    subjects: [{ subjectName: '', score: '' }]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        studentId: studentToEdit.studentId,
        name: studentToEdit.name,
        age: studentToEdit.age,
        subjects: studentToEdit.subjects.length > 0 ? studentToEdit.subjects : [{ subjectName: '', score: '' }]
      });
    }
  }, [studentToEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'studentId') {
      value = value.toUpperCase();
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = [...formData.subjects];
    updatedSubjects[index][field] = value;
    setFormData({ ...formData, subjects: updatedSubjects });
  };

  const addSubject = () => {
    setFormData({ ...formData, subjects: [...formData.subjects, { subjectName: '', score: '' }] });
  };

  const removeSubject = (index) => {
    const updatedSubjects = formData.subjects.filter((_, i) => i !== index);
    setFormData({ ...formData, subjects: updatedSubjects });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Convert string scores and ages to numbers
    const payload = {
      ...formData,
      age: Number(formData.age),
      subjects: formData.subjects.map(s => ({
        subjectName: s.subjectName,
        score: Number(s.score)
      }))
    };

    try {
      if (studentToEdit) {
        await updateStudent(studentToEdit.studentId, payload);
        toast.success('Student updated successfully!');
      } else {
        await createStudent(payload);
        toast.success('Student added successfully!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {studentToEdit ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <input
                type="text"
                name="studentId"
                required
                disabled={!!studentToEdit}
                value={formData.studentId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="e.g. STU1001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="age"
                required
                min="5"
                max="100"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="18"
              />
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Subjects & Scores <span className="text-red-500">*</span></label>
            <button
              type="button"
              onClick={addSubject}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} /> Add Subject
            </button>
          </div>
          
          <div className="space-y-3 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {formData.subjects.map((subject, index) => (
              <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex-1">
                  <input
                    type="text"
                    required
                    placeholder="Subject Name (e.g. Math)"
                    value={subject.subjectName}
                    onChange={(e) => handleSubjectChange(index, 'subjectName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-2"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    placeholder="Score"
                    value={subject.score}
                    onChange={(e) => handleSubjectChange(index, 'score', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                {formData.subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubject(index)}
                    className="p-2.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors mt-0.5"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? 'Saving...' : studentToEdit ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
