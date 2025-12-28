'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosClient from '@/api/axios';
import Link from 'next/link';

export default function UserDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            fetchMyOrders();
        }
    }, [authLoading, user]);

    const fetchMyOrders = async () => {
        try {
            const res = await axiosClient.get('/orders/my-orders');
            setOrders(res.data.slice(0, 5)); // Chỉ lấy 5 đơn gần nhất
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-slate-400">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-xl">
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Xin chào, {user?.name || 'Hội viên'}! 👋
                    </h1>
                    <p className="text-blue-100">Chào mừng bạn đến với CyberOps Gaming Center</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                        <div className="text-slate-400 text-sm mb-1">Số dư tài khoản</div>
                        <div className="text-2xl font-bold text-green-400 font-mono">
                            {parseInt(user?.balance || 0).toLocaleString()} ₫
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                        <div className="text-slate-400 text-sm mb-1">Vai trò</div>
                        <div className="text-xl font-bold text-blue-400">
                            {user?.role_id === 1 ? 'Admin' : user?.role_id === 2 ? 'Nhân viên' : 'Hội viên'}
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                        <div className="text-slate-400 text-sm mb-1">Trạng thái</div>
                        <div className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
                            Online
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Truy cập nhanh</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link href="/booking" className="bg-slate-800 hover:bg-slate-700 rounded-xl p-4 text-center transition-all">
                            <div className="text-3xl mb-2">🖥️</div>
                            <div className="text-white font-medium">Đặt Máy</div>
                        </Link>
                        <Link href="/food" className="bg-slate-800 hover:bg-slate-700 rounded-xl p-4 text-center transition-all">
                            <div className="text-3xl mb-2">🍔</div>
                            <div className="text-white font-medium">Gọi Đồ Ăn</div>
                        </Link>
                        <Link href="/orders" className="bg-slate-800 hover:bg-slate-700 rounded-xl p-4 text-center transition-all">
                            <div className="text-3xl mb-2">📋</div>
                            <div className="text-white font-medium">Lịch Sử Đơn</div>
                        </Link>
                        <Link href="/support" className="bg-slate-800 hover:bg-slate-700 rounded-xl p-4 text-center transition-all">
                            <div className="text-3xl mb-2">💬</div>
                            <div className="text-white font-medium">Hỗ Trợ</div>
                        </Link>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-white">Đơn hàng gần đây</h2>
                        <Link href="/orders" className="text-blue-400 text-sm hover:underline">Xem tất cả →</Link>
                    </div>
                    {loading ? (
                        <div className="text-slate-500 text-center py-4">Đang tải...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-slate-500 text-center py-4">Chưa có đơn hàng nào</div>
                    ) : (
                        <div className="space-y-2">
                            {orders.map(order => (
                                <div key={order.bill_id} className="flex justify-between items-center bg-slate-800 rounded-lg p-3">
                                    <div>
                                        <span className="text-slate-400 text-sm">#{order.bill_id}</span>
                                        <span className="text-white ml-2">{parseInt(order.total_amount).toLocaleString()} ₫</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                        order.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                        'bg-red-500/10 text-red-400'
                                    }`}>
                                        {order.status === 'pending' ? 'Đang chờ' : order.status === 'completed' ? 'Hoàn tất' : 'Đã hủy'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
