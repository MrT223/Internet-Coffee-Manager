'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosClient from '@/api/axios';
import { useRouter } from 'next/navigation';
import AvatarUpload from '@/components/shared/AvatarUpload';

export default function ProfilePage() {
    const { user, loading: authLoading, updateUserAvatar } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [activeTab, setActiveTab] = useState('info');
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
        if (user) {
            const fetchOrders = async () => {
                try {
                    const res = await axiosClient.get('/orders/my-orders');
                    setOrders(res.data);
                } catch (error) {
                    console.error("Lỗi tải lịch sử đơn hàng:", error);
                } finally {
                    setLoadingOrders(false);
                }
            };
            fetchOrders();
        }
    }, [user, authLoading, router]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-slate-400">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Left: Profile Card */}
                    <div className="md:col-span-1">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-28 relative">
                                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                                    <AvatarUpload 
                                        currentAvatar={user.avatar}
                                        userName={user.name}
                                        size="xl"
                                    />
                                </div>
                            </div>
                            <div className="pt-20 pb-6 px-4 text-center">
                                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                                <p className="text-sm text-slate-400 uppercase mt-1">
                                    {user.role_id === 1 ? 'Admin' : user.role_id === 2 ? 'Nhân viên' : 'Hội viên'}
                                </p>
                                
                                <div className="mt-6 border-t border-slate-800 pt-4">
                                    <div className="text-sm text-slate-500 mb-1">Số dư tài khoản</div>
                                    <div className="text-3xl font-bold text-green-400 font-mono">
                                        {parseInt(user.balance || 0).toLocaleString()} ₫
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Tabs Content */}
                    <div className="md:col-span-2">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
                            {/* Tab Header */}
                            <div className="flex border-b border-slate-800">
                                <button
                                    onClick={() => setActiveTab('info')}
                                    className={`px-6 py-4 font-medium text-sm focus:outline-none transition-colors ${
                                        activeTab === 'info' 
                                            ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-800/50' 
                                            : 'text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    Thông tin chung
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`px-6 py-4 font-medium text-sm focus:outline-none transition-colors ${
                                        activeTab === 'orders' 
                                            ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-800/50' 
                                            : 'text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    Lịch sử gọi món
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {activeTab === 'info' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên đăng nhập</label>
                                                <div className="p-3 bg-slate-950 rounded-lg text-white border border-slate-800">{user.name}</div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID Thành viên</label>
                                                <div className="p-3 bg-slate-950 rounded-lg text-slate-400 border border-slate-800 font-mono">#{user.id}</div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vai trò</label>
                                                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                        user.role_id === 1 ? 'bg-red-500/10 text-red-400' : 
                                                        user.role_id === 2 ? 'bg-blue-500/10 text-blue-400' :
                                                        'bg-slate-700 text-slate-300'
                                                    }`}>
                                                        {user.role_id === 1 ? 'Admin' : user.role_id === 2 ? 'Nhân viên' : 'Hội viên'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Trạng thái</label>
                                                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
                                                    <span className="text-green-400">Online</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'orders' && (
                                    <div className="overflow-x-auto">
                                        {loadingOrders ? (
                                            <p className="text-center text-slate-500 py-8">Đang tải dữ liệu...</p>
                                        ) : orders.length === 0 ? (
                                            <div className="text-center py-12 text-slate-500">
                                                <div className="text-4xl mb-2">🍕</div>
                                                <p>Bạn chưa gọi món nào.</p>
                                            </div>
                                        ) : (
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-slate-400 uppercase bg-slate-950">
                                                    <tr>
                                                        <th className="px-4 py-3">Mã đơn</th>
                                                        <th className="px-4 py-3">Thời gian</th>
                                                        <th className="px-4 py-3">Tổng tiền</th>
                                                        <th className="px-4 py-3">Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800">
                                                    {orders.map((order) => (
                                                        <tr key={order.bill_id} className="hover:bg-slate-800/50 transition-colors">
                                                            <td className="px-4 py-3 font-mono text-blue-400">#{order.bill_id}</td>
                                                            <td className="px-4 py-3 text-slate-400">
                                                                {new Date(order.order_date).toLocaleString('vi-VN')}
                                                            </td>
                                                            <td className="px-4 py-3 font-bold text-green-400 font-mono">
                                                                {parseInt(order.total_amount).toLocaleString()} ₫
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                                    order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                                                                    order.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                                                                    'bg-red-500/10 text-red-400 border border-red-500/30'
                                                                }`}>
                                                                    {order.status === 'pending' ? '⏳ Đang chờ' : 
                                                                     order.status === 'completed' ? '✓ Hoàn thành' : '✕ Đã hủy'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}