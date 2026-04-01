import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './App.css';
import { getAuthHeaders } from './auth';

function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);

  const [bookForm, setBookForm] = useState({
    title: '',
    published_year: '',
    publisher: '',
    category: '',
    total_quantity: 1,
    available_quantity: 1,
    description: '',
    cover_image: null
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    note: ''
  });

  const getCoverImageUrl = (coverImage) => {
    if (!coverImage) return '';
    if (String(coverImage).startsWith('http')) return coverImage;
    return `http://127.0.0.1:8000${coverImage}`;
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
        refresh: refreshToken
      });
      const newAccessToken = response.data?.access;
      if (!newAccessToken) return null;
      localStorage.setItem('access_token', newAccessToken);
      return newAccessToken;
    } catch {
      return null;
    }
  };

  const authRequest = async (config) => {
    const authHeaders = getAuthHeaders();

    try {
      return await axios({
        ...config,
        headers: {
          ...(config.headers || {}),
          ...(authHeaders || {})
        }
      });
    } catch (error) {
      const statusCode = error.response?.status;
      if (statusCode !== 401 && statusCode !== 403) throw error;

      const newAccessToken = await refreshAccessToken();
      if (!newAccessToken) throw error;

      return axios({
        ...config,
        headers: {
          ...(config.headers || {}),
          Authorization: `Bearer ${newAccessToken}`
        }
      });
    }
  };

  const loadAdminData = async () => {
    try {
      const [bookRes, categoryRes, userRes, loanRes] = await Promise.all([
        authRequest({ method: 'get', url: 'http://127.0.0.1:8000/api/books/books/' }),
        authRequest({ method: 'get', url: 'http://127.0.0.1:8000/api/books/categories/' }),
        authRequest({ method: 'get', url: 'http://127.0.0.1:8000/api/core/users/' }),
        authRequest({ method: 'get', url: 'http://127.0.0.1:8000/api/loans/loans/' })
      ]);

      setBooks(Array.isArray(bookRes.data) ? bookRes.data : []);
      setCategories(Array.isArray(categoryRes.data) ? categoryRes.data : []);
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
      const formData = new FormData();
      formData.append('title', bookForm.title);

      if (bookForm.published_year) {
        formData.append('published_year', String(Number(bookForm.published_year)));
      }

      formData.append('publisher', bookForm.publisher || '');
      formData.append('description', bookForm.description || '');
      if (bookForm.category) {
        formData.append('category', String(bookForm.category));
      }
      formData.append('total_quantity', String(Number(bookForm.total_quantity)));
      formData.append('available_quantity', String(Number(bookForm.available_quantity)));

      if (bookForm.cover_image) {
        formData.append('cover_image', bookForm.cover_image);
      }

      await authRequest({
        method: 'post',
        url: 'http://127.0.0.1:8000/api/books/books/',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: 'Thêm sách thành công.' });
      setBookForm({
        title: '',
        published_year: '',
        publisher: '',
        category: '',
        total_quantity: 1,
        available_quantity: 1,
        description: '',
        cover_image: null
      });
      await loadAdminData();
    } catch (error) {
      const detail = error.response?.data?.detail || error.response?.data?.title?.[0] || 'Thêm sách thất bại.';
      setMessage({ type: 'error', text: detail });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setCategorySaving(true);
    setMessage({ type: '', text: '' });

    try {
      await authRequest({
        method: 'post',
        url: 'http://127.0.0.1:8000/api/books/categories/',
        data: {
          name: categoryForm.name,
          note: categoryForm.note
        }
      });

      setCategoryForm({ name: '', note: '' });
      setMessage({ type: 'success', text: 'Thêm thể loại thành công.' });
      await loadAdminData();
    } catch (error) {
      const detail = error.response?.data?.detail || error.response?.data?.name?.[0] || 'Thêm thể loại thất bại.';
      setMessage({ type: 'error', text: detail });
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await authRequest({
        method: 'delete',
        url: `http://127.0.0.1:8000/api/books/books/${bookId}/`
      });
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

            <label>Thể loại</label>
            <select value={bookForm.category} onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}>
              <option value="">-- Chọn thể loại --</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            <label>Tổng số lượng</label>
            <input type="number" min="1" value={bookForm.total_quantity} onChange={(e) => setBookForm({ ...bookForm, total_quantity: e.target.value })} required />

            <label>Số lượng sẵn có</label>
            <input type="number" min="0" value={bookForm.available_quantity} onChange={(e) => setBookForm({ ...bookForm, available_quantity: e.target.value })} required />

            <label>Mô tả</label>
            <textarea rows="4" value={bookForm.description} onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })} />

            <label>Ảnh minh họa</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBookForm({ ...bookForm, cover_image: e.target.files?.[0] || null })}
            />

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
                  <th>Ảnh</th>
                  <th>Tên sách</th>
                  <th>Thể loại</th>
                  <th>Sẵn có</th>
                  <th>Tổng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>
                      {book.cover_image ? (
                        <img
                          src={getCoverImageUrl(book.cover_image)}
                          alt={book.title}
                          style={{ width: '48px', height: '64px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                      ) : (
                        <span style={{ color: '#999' }}>Không có</span>
                      )}
                    </td>
                    <td>{book.title}</td>
                    <td>{book.category_name || categories.find((x) => Number(x.id) === Number(book.category))?.name || '-'}</td>
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

        <div className="panel-card">
          <h3>Quản lý thể loại</h3>
          <form onSubmit={handleAddCategory} className="stack-form">
            <label>Tên thể loại</label>
            <input
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              required
            />

            <label>Ghi chú</label>
            <textarea
              rows="3"
              value={categoryForm.note}
              onChange={(e) => setCategoryForm({ ...categoryForm, note: e.target.value })}
            />

            <button className="btn-primary" type="submit" disabled={categorySaving}>
              {categorySaving ? 'Đang lưu...' : 'Thêm thể loại'}
            </button>
          </form>

          <div style={{ marginTop: '16px', textAlign: 'left' }}>
            <strong>Danh sách thể loại:</strong>
            {categories.length === 0 ? (
              <p className="muted">Chưa có thể loại nào.</p>
            ) : (
              <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                {categories.map((category) => (
                  <li key={category.id} style={{ marginBottom: '6px' }}>
                    {category.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
