const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 100 }
});

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 5, max: 100 },
  subjects: [subjectSchema],
  averageScore: { type: Number, default: 0 },
  grade: { type: String, default: 'F' },
  isPass: { type: Boolean, default: false }
}, { timestamps: true });

// Pre-save hook to calculate grades before creating a new student
studentSchema.pre('save', function() {
  if (this.subjects && this.subjects.length > 0) {
    const totalScore = this.subjects.reduce((sum, subject) => sum + subject.score, 0);
    this.averageScore = totalScore / this.subjects.length;
    
    if (this.averageScore >= 90) this.grade = 'A';
    else if (this.averageScore >= 80) this.grade = 'B';
    else if (this.averageScore >= 70) this.grade = 'C';
    else if (this.averageScore >= 60) this.grade = 'D';
    else this.grade = 'F';

    this.isPass = this.averageScore >= 40;
  } else {
    this.averageScore = 0;
    this.grade = 'F';
    this.isPass = false;
  }
});

// Hook for updates to ensure calculations happen on edit
studentSchema.pre('findOneAndUpdate', function() {
  const update = this.getUpdate();
  // Only recalculate if subjects are being updated
  if (update.subjects) {
    const totalScore = update.subjects.reduce((sum, subject) => sum + subject.score, 0);
    const averageScore = totalScore / update.subjects.length;
    
    let grade = 'F';
    if (averageScore >= 90) grade = 'A';
    else if (averageScore >= 80) grade = 'B';
    else if (averageScore >= 70) grade = 'C';
    else if (averageScore >= 60) grade = 'D';

    const isPass = averageScore >= 40;

    // Append calculated fields to the update query
    update.averageScore = averageScore;
    update.grade = grade;
    update.isPass = isPass;
  }
});

module.exports = mongoose.model('Student', studentSchema);
