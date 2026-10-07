import { useState, useEffect, useMemo } from 'react';
import './App.css';

// URL của Backend (đổi sang URL Codespaces nếu chạy trên GitHub Codespaces)
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/students`;

const EMPTY_FORM = { studentId: '', name: '', email: '' };

// Lấy chữ cái đầu của tên để làm avatar
const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const last = parts[parts.length - 1][0];
  const first = parts.length > 1 ? parts[0][0] : '';
  return (first + last).toUpperCase();
};

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null); // _id của sinh viên đang sửa
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', text }

  const isEditing = editingId !== null;

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  // Lấy danh sách sinh viên
  const fetchStudents = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
      showToast('error', 'Không tải được danh sách. Kiểm tra lại kết nối tới server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Bắt đầu sửa: đưa dữ liệu của sinh viên lên form
  const startEdit = (student) => {
    setEditingId(student._id);
    setForm({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  // Thêm mới hoặc lưu thay đổi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(isEditing ? `${API_URL}/${editingId}` : API_URL, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        showToast('success', isEditing ? 'Đã lưu thay đổi.' : 'Đã thêm sinh viên.');
        cancelEdit();
        fetchStudents();
      } else {
        showToast(
          'error',
          isEditing
            ? 'Không lưu được thay đổi. MSSV có thể trùng với sinh viên khác.'
            : 'Không thêm được sinh viên. MSSV có thể đã tồn tại.'
        );
      }
    } catch (err) {
      console.error('Lỗi kết nối:', err);
      showToast('error', 'Không kết nối được tới server.');
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa sinh viên
  const handleDelete = async (student) => {
    if (!window.confirm(`Xóa sinh viên ${student.name}?`)) return;
    try {
      await fetch(`${API_URL}/${student._id}`, { method: 'DELETE' });
      if (editingId === student._id) cancelEdit();
      showToast('success', 'Đã xóa sinh viên.');
      fetchStudents();
    } catch (err) {
      console.error('Lỗi khi xóa:', err);
      showToast('error', 'Không xóa được sinh viên.');
    }
  };

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  // Lọc theo tên, MSSV hoặc email
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.studentId?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
    );
  }, [students, query]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Quản lý sinh viên</h1>
        <p>Thêm, sửa, tìm kiếm và xóa sinh viên trong danh sách lớp.</p>
      </header>

      <main className="layout">
        {/* Form thêm / sửa sinh viên */}
        <section className={`panel form-panel ${isEditing ? 'is-editing' : ''}`}>
          <h2>{isEditing ? 'Sửa thông tin sinh viên' : 'Thêm sinh viên'}</h2>
          <form onSubmit={handleSubmit} className="form">
            <label className="field">
              <span>Mã số sinh viên</span>
              <input
                placeholder="Ví dụ: B2100123"
                value={form.studentId}
                onChange={updateField('studentId')}
                required
              />
            </label>

            <label className="field">
              <span>Họ và tên</span>
              <input
                placeholder="Ví dụ: Nguyễn Văn An"
                value={form.name}
                onChange={updateField('name')}
                required
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                placeholder="ten@truong.edu.vn"
                value={form.email}
                onChange={updateField('email')}
                required
              />
            </label>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting
                  ? 'Đang lưu...'
                  : isEditing
                  ? 'Lưu thay đổi'
                  : 'Thêm sinh viên'}
              </button>
              {isEditing && (
                <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                  Hủy
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Danh sách sinh viên */}
        <section className="panel list-panel">
          <div className="list-head">
            <h2>
              Danh sách sinh viên
              <span className="count">{students.length}</span>
            </h2>
            <input
              type="search"
              className="search"
              placeholder="Tìm theo tên, MSSV hoặc email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Tìm sinh viên"
            />
          </div>

          {loading ? (
            <p className="empty">Đang tải danh sách...</p>
          ) : students.length === 0 ? (
            <div className="empty">
              <strong>Chưa có sinh viên nào</strong>
              <p>Nhập thông tin ở biểu mẫu bên cạnh để thêm sinh viên đầu tiên.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <strong>Không tìm thấy kết quả</strong>
              <p>Thử tìm bằng từ khóa khác.</p>
            </div>
          ) : (
            <ul className="student-list">
              {filtered.map((s) => (
                <li
                  key={s._id}
                  className={`student ${editingId === s._id ? 'is-editing' : ''}`}
                >
                  <div className="avatar" aria-hidden="true">
                    {getInitials(s.name)}
                  </div>
                  <div className="student-info">
                    <span className="student-name">{s.name}</span>
                    <span className="student-meta">{s.email}</span>
                  </div>
                  <span className="student-id">{s.studentId}</span>
                  <div className="actions">
                    <button
                      className="btn btn-ghost"
                      onClick={() => startEdit(s)}
                      aria-label={`Sửa ${s.name}`}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(s)}
                      aria-label={`Xóa ${s.name}`}
                    >
                      Xóa
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          {toast.text}
        </div>
      )}
    </div>
  );
}

export default App;