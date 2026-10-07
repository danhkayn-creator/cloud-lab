const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use((req, res, next) => {
    console.log(`Nhận request: ${req.method} ${req.url}`);
    next();
});

// Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Đã kết nối MongoDB Atlas thành công!');
  })
  .catch((err) => {
    console.error('Lỗi kết nối MongoDB Atlas:', err.message);
  });

const Student = require('./models/Student'); 

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Backend đang hoạt động!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});

// Lấy danh sách sinh viên
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm sinh viên mới
app.post('/api/students', async (req, res) => {
  try {
    const newStudent = await Student.create(req.body);
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cập nhật sinh viên theo ID
app.put('/api/students/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!updatedStudent) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    }
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Xóa sinh viên theo ID
app.delete('/api/students/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    }
    res.json({ message: 'Đã xóa sinh viên thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});