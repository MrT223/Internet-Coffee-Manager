'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/api/axios'; // Import instance axios đã cấu hình ở bước trước
import Cookies from 'js-cookie';

const LoginForm = () => {
  const [formData, setFormData] = useState({ user_name: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Gọi API login
      const response = await axiosClient.post('/auth/login', formData);
      const { token, user } = response.data;

      // Lưu token và user info
      Cookies.set('token', token, { expires: 1 });
      localStorage.setItem('user', JSON.stringify(user));
      
      // Force reload hoặc update context (tùy cách bạn xử lý state)
      window.dispatchEvent(new Event("storage")); 

      // Điều hướng dựa trên role (Logic từ file server.js: 1,2 là admin)
      if (user.role_id === 1 || user.role_id === 2) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Đăng Nhập</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-sm" role="alert">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản</label>
          <input
            type="text"
            name="user_name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-black"
            placeholder="Nhập tên tài khoản"
            value={formData.user_name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
          <input
            type="password"
            name="password"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-black"
            placeholder="••••••"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Đang xử lý...' : 'Vào hệ thống'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;