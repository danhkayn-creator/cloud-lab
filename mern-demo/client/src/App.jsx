import { useState, useEffect } from 'react';
import './App.css';

// Khai báo biến URL của Backend trên GitHub Codespaces
const API_URL = 'http://localhost:5000/api/students';

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ studentId: '', name: '', email: '' });

  // Lấy danh sách sinh viên
  const fetchStudents = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Thêm sinh viên mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        setForm({ studentId: '', name: '', email: '' });
        fetchStudents();
      } else {
        alert('Lỗi khi thêm sinh viên!');
      }
    } catch (err) {
      console.error('Lỗi kết nối:', err);
    }
  };

  // Xóa sinh viên
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      fetchStudents();
    } catch (err) {
      console.error('Lỗi khi xóa:', err);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Quản lý Sinh viên MERN Stack</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <input 
          placeholder="Mã số sinh viên (MSSV)" 
          value={form.studentId} 
          onChange={e => setForm({...form, studentId: e.target.value})} 
          required 
        />
        <input 
          placeholder="Họ tên" 
          value={form.name} 
          onChange={e => setForm({...form, name: e.target.value})} 
          required 
        />
        <input 
          placeholder="Email" 
          type="email"
          value={form.email} 
          onChange={e => setForm({...form, email: e.target.value})} 
          required 
        />
        <button type="submit" style={{ padding: '8px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Thêm sinh viên
        </button>
      </form>

      <h3>Danh sách sinh viên</h3>
      <ul style={{ paddingLeft: '20px' }}>
        {students.map(s => (
          <li key={s._id} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><b>{s.studentId}</b> - {s.name} ({s.email})</span>
            <button onClick={() => handleDelete(s._id)} style={{ background: 'red', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}>Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;