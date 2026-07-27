import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, AlertCircle, Search, Plus } from 'lucide-react';
import { getStudents, deleteStudent } from '../services/api';
import toast from 'react-hot-toast';
import StudentModal from '../components/StudentModal';
import ChatWidget from '../components/ChatWidget';
import { formatName, formatSubject } from '../lib/utils';

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [highlightedRow, setHighlightedRow] = useState(null);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await getStudents(search);
      setStudents(data);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const confirmDelete = async () => {
    if (studentToDelete) {
      try {
        await deleteStudent(studentToDelete);
        toast.success('Student deleted successfully!');
        fetchStudents();
      } catch (error) {
        toast.error('Failed to delete student.');
      }
      setStudentToDelete(null);
    }
  };

  const handleChatAction = (action) => {
    if (action.type === 'REFRESH_TABLE') {
      fetchStudents();
    } else if (action.type === 'HIGHLIGHT_ROW') {
      setSearch(''); // Clear search to ensure we can see it
      setHighlightedRow(action.id);
      setTimeout(() => setHighlightedRow(null), 4000); // Highlight for 4 seconds
    }
  };

  const openAddModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  // Calculations for Stat Cards
  const totalStudents = students.length;
  const passedStudents = students.filter(s => s.isPass).length;
  const failedStudents = totalStudents - passedStudents;
  const avgClassScore = totalStudents > 0 
    ? (students.reduce((acc, curr) => acc + curr.averageScore, 0) / totalStudents).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><Users size={24}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><GraduationCap size={24}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Passed</p>
            <p className="text-2xl font-bold text-gray-900">{passedStudents}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-lg"><AlertCircle size={24}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Failed</p>
            <p className="text-2xl font-bold text-gray-900">{failedStudents}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users size={24}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Class Average</p>
            <p className="text-2xl font-bold text-gray-900">{avgClassScore}%</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          Add Student
        </button>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Users size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No students found</h3>
            <p className="text-gray-500 mt-1">Get started by adding a new student.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600">ID</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Name</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Age</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Subjects</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Average</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Grade</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr 
                    key={student._id} 
                    className={`transition-colors duration-500 ${highlightedRow === student.studentId ? 'bg-purple-100 ring-2 ring-purple-400' : 'hover:bg-gray-50/50'}`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{student.studentId}</td>
                    <td className="px-6 py-4">{formatName(student.name)}</td>
                    <td className="px-6 py-4 text-gray-500">{student.age}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {student.subjects.map(s => formatSubject(s.subjectName)).join(', ')}
                    </td>
                    <td className="px-6 py-4 font-medium">{student.averageScore.toFixed(1)}%</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold
                        ${student.grade === 'A' ? 'bg-emerald-100 text-emerald-700' : 
                          student.grade === 'B' ? 'bg-blue-100 text-blue-700' : 
                          student.grade === 'C' ? 'bg-yellow-100 text-yellow-700' : 
                          student.grade === 'D' ? 'bg-orange-100 text-orange-700' : 
                          'bg-rose-100 text-rose-700'}`}>
                        {student.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {student.isPass ? (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Pass</span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">Fail</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(student)} className="text-indigo-600 hover:text-indigo-900 font-medium mr-4">Edit</button>
                      <button onClick={() => setStudentToDelete(student.studentId)} className="text-rose-600 hover:text-rose-900 font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <StudentModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          studentToEdit={selectedStudent}
          onSuccess={fetchStudents}
        />
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Student</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this student? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setStudentToDelete(null)} 
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors font-medium shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Floating Chat */}
      <ChatWidget onAction={handleChatAction} />
    </div>
  );
};

export default Dashboard;
