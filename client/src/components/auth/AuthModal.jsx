'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosClient from '@/api/axios';
import { useRouter } from 'next/navigation';

// Icons
const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
    </svg>
);

const AuthModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('login');
    const [formData, setFormData] = useState({
        user_name: '',
        password: '',
        confirm_password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    // Reset form khi mở/đóng modal
    useEffect(() => {
        if (isOpen) {
            setError('');
            setFormData({ user_name: '', password: '', confirm_password: '' });
        }
    }, [isOpen, activeTab]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (activeTab === 'login') {
                const res = await axiosClient.post('/auth/login', {
                    user_name: formData.user_name,
                    password: formData.password
                });

                const { token, user } = res.data;
                login(token, user);
                onClose();

                // Đợi cookie được set xong trước khi redirect
                await new Promise(resolve => setTimeout(resolve, 100));

                // Dùng full page redirect để đảm bảo cookie được đọc đúng
                if (user.role_id === 1 || user.role_id === 2) {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/dashboard';
                }
            } else {
                if (formData.password !== formData.confirm_password) {
                    setLoading(false);
                    return;
                }

                await axiosClient.post('/auth/register', {
                    user_name: formData.user_name,
                    password: formData.password
                });

                setActiveTab('login');
                setFormData(prev => ({ ...prev, password: '' }));
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="relative w-full max-w-md mx-4">

                {/* Glow Effect phía sau */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-30"></div>

                <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                    {/* Header: Tabs + Close Button */}
                    <div className="flex items-center justify-between border-b border-slate-700 bg-slate-950/50">
                        <div className="flex-1 flex">
                            <button
                                onClick={() => setActiveTab('login')}
                                className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wider transition-all ${activeTab === 'login'
                                        ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-800/50'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                                    }`}
                            >
                                Đăng Nhập
                            </button>
                            <button
                                onClick={() => setActiveTab('register')}
                                className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wider transition-all ${activeTab === 'register'
                                        ? 'text-cyan-400 border-b-2 border-cyan-500 bg-slate-800/50'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                                    }`}
                            >
                                Đăng Ký
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-4 text-slate-400 hover:text-white transition-colors"
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {activeTab === 'login' ? 'Chào Mừng Trở Lại' : 'Gia Nhập CyberOps'}
                            </h2>
                            <p className="text-slate-400 text-sm">
                                {activeTab === 'login' ? 'Đăng nhập để chiến game & gọi món' : 'Tạo tài khoản thành viên ngay'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm flex items-center">
                                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Input User */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                    <UserIcon />
                                </div>
                                <input
                                    type="text"
                                    name="user_name"
                                    value={formData.user_name}
                                    onChange={handleChange}
                                    placeholder="Tên tài khoản"
                                    className="block w-full pl-10 pr-3 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>

                            {/* Input Password */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                    <LockIcon />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Mật khẩu"
                                    className="block w-full pl-10 pr-3 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>

                            {/* Input Confirm Password (Register Only) */}
                            {activeTab === 'register' && (
                                <div className="relative group animate-in slide-in-from-top-2 duration-200">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-500 transition-colors">
                                        <LockIcon />
                                    </div>
                                    <input
                                        type="password"
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        placeholder="Nhập lại mật khẩu"
                                        className="block w-full pl-10 pr-3 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                                        required
                                    />
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 px-4 mt-2 font-bold text-white rounded-lg shadow-lg transform transition-all hover:-translate-y-0.5 active:scale-95
                                    ${activeTab === 'login'
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-500/20'
                                        : 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-cyan-500/20'
                                    }
                                    ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                                `}
                            >
                                {loading ? 'Đang xử lý...' : (activeTab === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ NGAY')}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-950/50 p-4 text-center border-t border-slate-800">
                        {activeTab === 'login' && (
                            <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
                                Quên mật khẩu?
                            </a>
                        )}
                        {activeTab === 'register' && (
                            <span className="text-sm text-slate-400">
                                Đã có tài khoản? <button onClick={() => setActiveTab('login')} className="text-cyan-400 hover:underline">Đăng nhập</button>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;