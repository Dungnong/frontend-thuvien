import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './App.css';

function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const [bookForm, setBookForm] = useState({
    title: '',
    published_year: '',
    publisher: '',
    total_quantity: 1,
    available_quantity: 1,
    description: ''
  });

  const loadAdminData = async () => {
    try {
      const [bookRes, userRes, loanRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/books/books/'),
        axios.get('http://127.0.0.1:8000/api/core/users/'),
        axios.get('http://127.0.0.1:8000/api/loans/loans/')
      ]);

      setBooks(Array.isArray(bookRes.data) ? bookRes.data : []);
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);
      setLoans(Array.isArray(loanRes.data) ? loanRes.data : []);
    } catch {
      setMessage({ type: 'error', text: 'Không thể tải dữ liệu quản lý. Kiểm tra quyền truy cập API.' });
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const stats = useMemo(() => {
    const borrowed = loans.filter((x) => x.status === 'borrowed').length;
    const overdue = loans.filter((x) => x.status === 'overdue').length;
    const returned = loans.filter((x) => x.status === 'returned').length;
    return {
      totalBooks: books.length,
      totalUsers: users.length,
      borrowed,
      overdue,
      returned
    };
  }, [books, users, loans]);

  const handleAddBook = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post('http://127.0.0.1:8000/api/books/books/', {
        title: bookForm.title,
        published_year: bookForm.published_year ? Number(bookForm.published_year) : null,
        publisher: bookForm.publisher,
        description: bookForm.description,
        total_quantity: Number(bookForm.total_quantity),
        available_quantity: Number(bookForm.available_quantity)
      });

      setMessage({ type: 'success', text: 'Thêm sách thành công.' });
      setBookForm({
        title: '',
        published_year: '',
        publisher: '',
        total_quantity: 1,
        available_quantity: 1,
        description: ''
      });
      await loadAdminData();
    } catch (error) {
      const detail = error.response?.data?.detail || error.response?.data?.title?.[0] || 'Thêm sách thất bại.';
      setMessage({ type: 'error', text: detail });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/books/books/${bookId}/`);
      setMessage({ type: 'success', text: 'Xóa sách thành công.' });
      await loadAdminData();
    } catch {
      setMessage({ type: 'error', text: 'Xóa sách thất bại.' });
    }
  };

  return (
    <div className="container">
      <h2 style={{ textAlign: 'left', borderBottom: '2px solid #b01e23', paddingBottom: '10px' }}>
        🛠️ Dashboard Quản Lý
      </h2>

      {message.text && (
        <div className={`notice ${message.type === 'success' ? 'notice-success' : 'notice-error'}`}>
          {message.text}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card"><h4>Tổng sách</h4><p>{stats.totalBooks}</p></div>
        <div className="stat-card"><h4>Người dùng</h4><p>{stats.totalUsers}</p></div>
        <div className="stat-card"><h4>Đang mượn</h4><p>{stats.borrowed}</p></div>
        <div className="stat-card"><h4>Quá hạn</h4><p>{stats.overdue}</p></div>
        <div className="stat-card"><h4>Đã trả</h4><p>{stats.returned}</p></div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <h3>Thêm sách mới</h3>
          <form onSubmit={handleAddBook} className="stack-form">
            <label>Tên sách</label>
            <input value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} required />

            <label>Năm xuất bản</label>
            <input type="number" value={bookForm.published_year} onChange={(e) => setBookForm({ ...bookForm, published_year: e.target.value })} />

            <label>Nhà xuất bản</label>
            <input value={bookForm.publisher} onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })} />

            <label>Tổng số lượng</label>
            <input type="number" min="1" value={bookForm.total_quantity} onChange={(e) => setBookForm({ ...bookForm, total_quantity: e.target.value })} required />

            <label>Số lượng sẵn có</label>
            <input type="number" min="0" value={bookForm.available_quantity} onChange={(e) => setBookForm({ ...bookForm, available_quantity: e.target.value })} required />

            <label>Mô tả</label>
            <textarea rows="4" value={bookForm.description} onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })} />

            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Thêm sách'}
            </button>
          </form>
        </div>

        <div className="panel-card">
          <h3>Danh sách sách hiện có</h3>
          {books.length === 0 ? (
            <p className="muted">Chưa có sách nào.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tên sách</th>
                  <th>Sẵn có</th>
                  <th>Tổng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>{book.title}</td>
                    <td>{book.available_quantity}</td>
                    <td>{book.total_quantity}</td>
                    <td>
                      <button className="btn-inline danger" onClick={() => handleDeleteBook(book.id)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
