const Student = require('../models/Student');

// @desc    Create a new student
// @route   POST /students
exports.createStudent = async (req, res) => {
  try {
    let { studentId, name, age, subjects } = req.body;
    
    // Auto-generate studentId if not provided (e.g. STU123456)
    if (!studentId) {
      studentId = `STU${Date.now().toString().slice(-6)}`;
    }
    
    // Check if student already exists
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ message: `Student with ID ${studentId} already exists.` });
    }

    const newStudent = new Student({ studentId, name, age, subjects });
    const savedStudent = await newStudent.save();
    
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all students
// @route   GET /students
exports.getAllStudents = async (req, res) => {
  try {
    // Optional search functionality
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { studentId: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const students = await Student.find(query).sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get a single student by studentId
// @route   GET /students/:id
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.id });
    if (!student) {
      return res.status(404).json({ message: `Student ${req.params.id} was not found.` });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a student
// @route   PUT /students/:id
exports.updateStudent = async (req, res) => {
  try {
    const { name, age, subjects } = req.body;
    
    const updatedStudent = await Student.findOneAndUpdate(
      { studentId: req.params.id },
      { name, age, subjects },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: `Student ${req.params.id} was not found.` });
    }
    
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a student
// @route   DELETE /students/:id
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findOneAndDelete({ studentId: req.params.id });
    if (!deletedStudent) {
      return res.status(404).json({ message: `Student ${req.params.id} was not found.` });
    }
    res.status(200).json({ message: 'Student deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
