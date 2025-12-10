import React, { useState, useContext } from 'react'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 
import '../css/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); 
  
  const API_URL = 'http://localhost:3636/api/auth/login'; 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(API_URL, {
        user_name: username, 
        password: password
      });

      login(response.data.token, response.data.user);

      const roleId = response.data.user.role_id;
      
      if (roleId === 1) {
          navigate('/admin/dashboard'); 
      } else if (roleId === 2) {
          navigate('/computers'); 
      } else {
          navigate('/user/home'); 
      }

    } catch (err) {
      console.error("Login Error:", err);
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("Lỗi kết nối Server!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="logo-title">CyberOps</h1>
        <p className="subtitle">Hệ thống quản lý phòng máy</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Tên đăng nhập</label>
            <input 
              type="text" 
              className="input-field"
              placeholder="Nhập user_name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>
            <input 
              type="password" 
              className="input-field"
              placeholder="Nhập password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
          <button 
            type="button" 
            className="btn-back" 
            onClick={() => navigate('/')}
          >
            ⬅ Quay lại Sơ đồ máy
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;