'use client';
import { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    // State cho Modal Nạp tiền
    const [topUpModal, setTopUpModal] = useState({ show: false, user: null, amount: '' });

    const fetchUsers = async () => {
        try {
            const res = await axiosClient.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Lỗi tải users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleTopUp = async () => {
        if (!topUpModal.amount || parseInt(topUpModal.amount) <= 0) return alert("Số tiền không hợp lệ");
        
        try {
            await axiosClient.post(`/admin/users/${topUpModal.user.user_id}/topup`, {
                amount: parseInt(topUpModal.amount)
            });
            alert(`Đã nạp ${parseInt(topUpModal.amount).toLocaleString()}đ cho ${topUpModal.user.user_name}`);
            setTopUpModal({ show: false, user: null, amount: '' });
            fetchUsers(); // Refresh lại danh sách để cập nhật số dư
        } catch (error) {
            alert("Nạp tiền thất bại: " + (error.response?.data?.message || "Lỗi server"));
        }
    };

    const filteredUsers = users.filter(u => 
        u.user_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-white">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                    Quản Lý Hội Viên
                </h2>
                <div className="relative w-full md:w-96">
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên tài khoản..." 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute right-3 top-2.5 text-slate-500">🔍</span>
                </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Tài khoản</th>
                                <th className="p-4">Vai trò</th>
                                <th className="p-4">Số dư tài khoản</th>
                                <th className="p-4 text-center">Trạng thái</th>
                                <th className="p-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-sm">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Đang tải dữ liệu...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Không tìm thấy thành viên nào.</td></tr>
                            ) : filteredUsers.map(user => (
                                <tr key={user.user_id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 text-slate-500">#{user.user_id}</td>
                                    <td className="p-4 font-bold text-white flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs">
                                            {user.user_name.charAt(0).toUpperCase()}
                                        </div>
                                        {user.user_name}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            user.role_id === 1 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                            user.role_id === 2 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            'bg-slate-700 text-slate-300'
                                        }`}>
                                            {user.role_id === 1 ? 'Admin' : user.role_id === 2 ? 'Nhân viên' : 'Hội viên'}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono font-bold text-green-400 text-base">
                                        {parseInt(user.balance).toLocaleString()} ₫
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`w-2 h-2 rounded-full inline-block mr-2 ${user.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-600'}`}></span>
                                        <span className="text-slate-400">{user.status === 'online' ? 'Online' : 'Offline'}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => setTopUpModal({ show: true, user: user, amount: '' })}
                                            className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-green-900/20 transition-all active:scale-95"
                                        >
                                            💲 Nạp Tiền
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL NẠP TIỀN */}
            {topUpModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                        <button onClick={() => setTopUpModal({ show: false, user: null })} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
                        
                        <h3 className="text-xl font-bold mb-1 text-white">Nạp Tiền Tài Khoản</h3>
                        <p className="text-slate-400 text-sm mb-6">Hội viên: <span className="text-blue-400 font-bold">{topUpModal.user.user_name}</span></p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số tiền nạp (VNĐ)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-lg font-mono focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                                    placeholder="Ví dụ: 50000"
                                    value={topUpModal.amount}
                                    onChange={(e) => setTopUpModal({...topUpModal, amount: e.target.value})}
                                    autoFocus
                                />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                                {[10000, 20000, 50000, 100000, 200000, 500000].map(amt => (
                                    <button 
                                        key={amt}
                                        onClick={() => setTopUpModal(prev => ({...prev, amount: amt}))}
                                        className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700"
                                    >
                                        {amt/1000}k
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={handleTopUp}
                                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-green-900/30 transition-transform active:scale-95 mt-4"
                            >
                                XÁC NHẬN NẠP TIỀN
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}