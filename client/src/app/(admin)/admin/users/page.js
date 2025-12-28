'use client';
import { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function UsersPage() {
    const { loading: authLoading, isAuthenticated, user: currentUser } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    // State cho các Modal
    const [topUpModal, setTopUpModal] = useState({ show: false, user: null, amount: '' });
    const [createModal, setCreateModal] = useState({ show: false, user_name: '', password: '', role_id: 3 });
    const [roleModal, setRoleModal] = useState({ show: false, user: null, role_id: 3 });
    const [confirmModal, setConfirmModal] = useState({ show: false, action: '', user: null });

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
        if (!authLoading && isAuthenticated) {
            fetchUsers();
        }
    }, [authLoading, isAuthenticated]);

    // === HANDLERS ===
    const handleTopUp = async () => {
        if (!topUpModal.amount || parseInt(topUpModal.amount) <= 0) {
            toast.warning("Số tiền không hợp lệ");
            return;
        }
        try {
            await axiosClient.put(`/admin/users/${topUpModal.user.user_id}/topup`, { amount: parseInt(topUpModal.amount) });
            toast.success(`Đã nạp ${parseInt(topUpModal.amount).toLocaleString()}đ cho ${topUpModal.user.user_name}`);
            setTopUpModal({ show: false, user: null, amount: '' });
            fetchUsers();
        } catch (error) {
            toast.error("Nạp tiền thất bại: " + (error.response?.data?.message || "Lỗi server"));
        }
    };

    const handleCreateUser = async () => {
        if (!createModal.user_name || !createModal.password) {
            toast.warning("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        if (createModal.password.length < 6) {
            toast.warning("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        try {
            await axiosClient.post('/admin/users', {
                user_name: createModal.user_name,
                password: createModal.password,
                role_id: parseInt(createModal.role_id)
            });
            toast.success(`Đã tạo tài khoản ${createModal.user_name} thành công!`);
            setCreateModal({ show: false, user_name: '', password: '', role_id: 3 });
            fetchUsers();
        } catch (error) {
            toast.error("Tạo tài khoản thất bại: " + (error.response?.data?.message || "Lỗi server"));
        }
    };

    const handleChangeRole = async () => {
        try {
            await axiosClient.put(`/admin/users/${roleModal.user.user_id}/role`, { role_id: parseInt(roleModal.role_id) });
            toast.success(`Đã đổi vai trò cho ${roleModal.user.user_name} thành công!`);
            setRoleModal({ show: false, user: null, role_id: 3 });
            fetchUsers();
        } catch (error) {
            toast.error("Đổi vai trò thất bại: " + (error.response?.data?.message || "Lỗi server"));
        }
    };

    const handleToggleLock = async (user) => {
        try {
            const res = await axiosClient.put(`/admin/users/${user.user_id}/lock`);
            toast.success(res.data.message);
            fetchUsers();
        } catch (error) {
            toast.error("Thao tác thất bại: " + (error.response?.data?.message || "Lỗi server"));
        }
    };

    const handleResetPassword = async (user) => {
        try {
            const res = await axiosClient.put(`/admin/users/${user.user_id}/reset-password`);
            toast.success(res.data.message);
        } catch (error) {
            toast.error("Reset mật khẩu thất bại: " + (error.response?.data?.message || "Lỗi server"));
        }
    };

    const handleDeleteUser = async (user) => {
        try {
            await axiosClient.delete(`/admin/users/${user.user_id}`);
            toast.success(`Đã xóa tài khoản ${user.user_name}`);
            fetchUsers();
        } catch (error) {
            toast.error("Xóa tài khoản thất bại: " + (error.response?.data?.message || "Lỗi server"));
        }
    };

    const executeConfirmAction = () => {
        const { action, user } = confirmModal;
        setConfirmModal({ show: false, action: '', user: null });
        
        if (action === 'delete') handleDeleteUser(user);
        else if (action === 'reset') handleResetPassword(user);
        else if (action === 'lock') handleToggleLock(user);
    };

    const getStatusDisplay = (status) => {
        if (status === 'online') return { text: 'Online', color: 'bg-green-500 shadow-[0_0_8px_#22c55e]' };
        if (status === 'locked') return { text: 'Bị khóa', color: 'bg-red-500 shadow-[0_0_8px_#ef4444]' };
        if (status === 'playing') return { text: 'Đang chơi', color: 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' };
        return { text: 'Offline', color: 'bg-slate-600' };
    };

    const filteredUsers = users.filter(u => u.user_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                    Quản Lý Hội Viên
                </h2>
                <div className="flex gap-3 items-center w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <input type="text" placeholder="Tìm kiếm theo tên tài khoản..." 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <span className="absolute right-3 top-2.5 text-slate-500">🔍</span>
                    </div>
                    <button onClick={() => setCreateModal({ show: true, user_name: '', password: '', role_id: 3 })}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/30 transition-all active:scale-95 whitespace-nowrap">
                        ➕ Thêm
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Tài khoản</th>
                                <th className="p-4">Vai trò</th>
                                <th className="p-4">Số dư</th>
                                <th className="p-4 text-center">Trạng thái</th>
                                <th className="p-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-sm">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Đang tải...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Không tìm thấy.</td></tr>
                            ) : filteredUsers.map(user => {
                                const statusInfo = getStatusDisplay(user.status);
                                const isCurrentUser = currentUser?.id === user.user_id;
                                const isAdmin = user.role_id === 1;
                                
                                return (
                                    <tr key={user.user_id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 text-slate-500">#{user.user_id}</td>
                                        <td className="p-4 font-bold text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs">
                                                    {user.user_name.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{user.user_name}</span>
                                                {isCurrentUser && <span className="text-xs text-yellow-400">(Bạn)</span>}
                                            </div>
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
                                        <td className="p-4 font-mono font-bold text-green-400">
                                            {parseInt(user.balance).toLocaleString()} ₫
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`w-2 h-2 rounded-full inline-block mr-2 ${statusInfo.color}`}></span>
                                            <span className="text-slate-400">{statusInfo.text}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-1 flex-wrap">
                                                {/* Nạp tiền */}
                                                <button onClick={() => setTopUpModal({ show: true, user, amount: '' })} title="Nạp tiền"
                                                    className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded text-xs font-bold transition-all">💲</button>
                                                
                                                {/* Đổi vai trò */}
                                                {!isAdmin && !isCurrentUser && (
                                                    <button onClick={() => setRoleModal({ show: true, user, role_id: user.role_id })} title="Đổi vai trò"
                                                        className="bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold transition-all">👤</button>
                                                )}
                                                
                                                {/* Khóa/Mở khóa */}
                                                {!isAdmin && !isCurrentUser && (
                                                    <button onClick={() => setConfirmModal({ show: true, action: 'lock', user })} 
                                                        title={user.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                                                        className={`${user.status === 'locked' ? 'bg-green-600 hover:bg-green-500' : 'bg-yellow-600 hover:bg-yellow-500'} text-white px-2 py-1 rounded text-xs font-bold transition-all`}>
                                                        {user.status === 'locked' ? '🔓' : '🔒'}
                                                    </button>
                                                )}
                                                
                                                {/* Reset mật khẩu */}
                                                {!isAdmin && (
                                                    <button onClick={() => setConfirmModal({ show: true, action: 'reset', user })} title="Reset mật khẩu"
                                                        className="bg-orange-600 hover:bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold transition-all">🔑</button>
                                                )}
                                                
                                                {/* Xóa */}
                                                {!isAdmin && !isCurrentUser && (
                                                    <button onClick={() => setConfirmModal({ show: true, action: 'delete', user })} title="Xóa"
                                                        className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs font-bold transition-all">🗑️</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL NẠP TIỀN */}
            {topUpModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                        <button onClick={() => setTopUpModal({ show: false, user: null })} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
                        <h3 className="text-xl font-bold mb-1 text-white">Nạp Tiền</h3>
                        <p className="text-slate-400 text-sm mb-6">Hội viên: <span className="text-blue-400 font-bold">{topUpModal.user?.user_name}</span></p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số tiền nạp (VNĐ)</label>
                                <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-lg font-mono focus:border-green-500 outline-none"
                                    placeholder="Ví dụ: 50000" value={topUpModal.amount} onChange={(e) => setTopUpModal({...topUpModal, amount: e.target.value})} autoFocus />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[10000, 20000, 50000, 100000, 200000, 500000].map(amt => (
                                    <button key={amt} onClick={() => setTopUpModal(prev => ({...prev, amount: amt}))}
                                        className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700">{amt/1000}k</button>
                                ))}
                            </div>
                            <button onClick={handleTopUp} className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg shadow-lg mt-4">
                                XÁC NHẬN NẠP TIỀN
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TẠO NGƯỜI DÙNG */}
            {createModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                        <button onClick={() => setCreateModal({ show: false, user_name: '', password: '', role_id: 3 })} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
                        <h3 className="text-xl font-bold mb-4 text-white">Tạo Người Dùng Mới</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên tài khoản</label>
                                <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                    placeholder="Nhập tên tài khoản" value={createModal.user_name} onChange={(e) => setCreateModal({...createModal, user_name: e.target.value})} autoFocus />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mật khẩu</label>
                                <input type="password" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                    placeholder="Nhập mật khẩu (ít nhất 6 ký tự)" value={createModal.password} onChange={(e) => setCreateModal({...createModal, password: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vai trò</label>
                                <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                    value={createModal.role_id} onChange={(e) => setCreateModal({...createModal, role_id: e.target.value})}>
                                    <option value={3}>Hội viên</option>
                                    <option value={2}>Nhân viên</option>
                                </select>
                            </div>
                            <button onClick={handleCreateUser} className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-lg shadow-lg mt-4">
                                TẠO TÀI KHOẢN
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ĐỔI VAI TRÒ */}
            {roleModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                        <button onClick={() => setRoleModal({ show: false, user: null, role_id: 3 })} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
                        <h3 className="text-xl font-bold mb-1 text-white">Đổi Vai Trò</h3>
                        <p className="text-slate-400 text-sm mb-6">Tài khoản: <span className="text-blue-400 font-bold">{roleModal.user?.user_name}</span></p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vai trò mới</label>
                                <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                                    value={roleModal.role_id} onChange={(e) => setRoleModal({...roleModal, role_id: e.target.value})}>
                                    <option value={3}>Hội viên</option>
                                    <option value={2}>Nhân viên</option>
                                </select>
                            </div>
                            <button onClick={handleChangeRole} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg shadow-lg mt-4">
                                XÁC NHẬN ĐỔI VAI TRÒ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL XÁC NHẬN */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
                        <div className="text-4xl mb-4">
                            {confirmModal.action === 'delete' ? '🗑️' : confirmModal.action === 'reset' ? '🔑' : confirmModal.user?.status === 'locked' ? '🔓' : '🔒'}
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">
                            {confirmModal.action === 'delete' ? 'Xóa tài khoản?' : 
                             confirmModal.action === 'reset' ? 'Reset mật khẩu?' : 
                             confirmModal.user?.status === 'locked' ? 'Mở khóa tài khoản?' : 'Khóa tài khoản?'}
                        </h3>
                        <p className="text-slate-400 mb-6">
                            {confirmModal.action === 'delete' && `Tài khoản ${confirmModal.user?.user_name} sẽ bị xóa vĩnh viễn.`}
                            {confirmModal.action === 'reset' && `Mật khẩu của ${confirmModal.user?.user_name} sẽ được reset về "123456".`}
                            {confirmModal.action === 'lock' && confirmModal.user?.status !== 'locked' && `${confirmModal.user?.user_name} sẽ không thể đăng nhập.`}
                            {confirmModal.action === 'lock' && confirmModal.user?.status === 'locked' && `${confirmModal.user?.user_name} sẽ được mở khóa.`}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmModal({ show: false, action: '', user: null })}
                                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg">Hủy</button>
                            <button onClick={executeConfirmAction}
                                className={`flex-1 py-2 font-bold rounded-lg text-white ${
                                    confirmModal.action === 'delete' ? 'bg-red-600 hover:bg-red-500' : 
                                    confirmModal.action === 'reset' ? 'bg-orange-600 hover:bg-orange-500' : 
                                    confirmModal.user?.status === 'locked' ? 'bg-green-600 hover:bg-green-500' : 'bg-yellow-600 hover:bg-yellow-500'
                                }`}>
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}