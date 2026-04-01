import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './App.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Thêm state để chứa thông báo lỗi

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setErrorMessage(''); // Xóa lỗi cũ trước khi thử đăng nhập mới
    
    try {
      // 1. Gõ cửa API Django và nộp tài khoản/mật khẩu
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username: username,
        password: password
      });

      // 2. Nếu Django gật đầu, nó sẽ trả về 2 thẻ Token (access và refresh)
      // Lưu thẻ này vào két sắt của trình duyệt (localStorage)
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', username);

      try {
        const profileResponse = await axios.get('http://127.0.0.1:8000/api/core/users/profile/', {
          headers: {
            Authorization: `Bearer ${response.data.access}`,
          }
        });
        localStorage.setItem('role', profileResponse.data?.role || 'reader');
      } catch {
        localStorage.setItem('role', 'reader');
      }
      
      // 3. Đăng nhập thành công, đá sang trang Cá nhân và load lại web
      window.location.href = '/dashboard';

    } catch (error) {
      // 4. Nếu Django lắc đầu (sai mật khẩu/tài khoản), hiện chữ báo lỗi đỏ
      setErrorMessage('Tài khoản hoặc mật khẩu không chính xác!');
      console.error("Lỗi đăng nhập:", error);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '450px', marginTop: '50px' }}>
      <div style={{ padding: '30px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#b01e23', marginBottom: '25px' }}>
          Đăng Nhập PTIT Library
        </h2>
        
        {/* HIỂN THỊ LỖI NẾU CÓ */}
        {errorMessage && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontWeight: 'bold', color: '#333' }}>Tên tài khoản:</label>
            <input
              type="text"
              placeholder="VD: admin..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', boxSizing: 'border-box' }}
              required
            />
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontWeight: 'bold', color: '#333' }}>Mật khẩu:</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', boxSizing: 'border-box' }}
              required
            />
          </div>
          
          <button type="submit" style={{ padding: '14px', background: '#b01e23', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px', transition: '0.3s' }}>
            Vào Thư Viện
          </button>
        </form>
        
        {/* Link đăng ký */}
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          Chưa có tài khoản? 
          <Link to="/register" style={{ color: '#b01e23', textDecoration: 'none', fontWeight: 'bold', marginLeft: '5px' }}>
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;