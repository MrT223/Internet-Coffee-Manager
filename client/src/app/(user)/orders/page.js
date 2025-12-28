'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosClient from '@/api/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ClipboardList, Rocket, Package, CheckCircle, Clock, XCircle, Wallet } from 'lucide-react';

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
        if (user) {
            fetchOrders();
        }
    }, [user, authLoading, router]);

    const fetchOrders = async () => {
        try {
            const res = await axiosClient.get('/orders/my-orders');
            setOrders(res.data);
        } catch (error) {
            console.error("Lỗi tải lịch sử đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-slate-400">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Dashboard
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-blue-400" /> Lịch Sử Đơn Hàng
                    </h1>
                    <p className="text-slate-400 mt-1">Xem tất cả đơn hàng bạn đã đặt</p>
                </div>

                {/* Orders List */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Đang tải...</div>
                    ) : orders.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="flex justify-center mb-4">
                                <Package className="w-16 h-16 text-slate-600" />
                            </div>
                            <p className="text-slate-400 text-lg mb-4">Bạn chưa có đơn hàng nào</p>
                            <Link 
                                href="/menu" 
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:from-orange-500 hover:to-red-500 transition-all"
                            >
                                Đặt món ngay <Rocket className="w-5 h-5" />
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                                <tr>
                                    <th className="p-4">Mã đơn</th>
                                    <th className="p-4">Thời gian</th>
                                    <th className="p-4">Tổng tiền</th>
                                    <th className="p-4">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {orders.map((order) => (
                                    <tr key={order.bill_id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-mono text-blue-400">#{order.bill_id}</td>
                                        <td className="p-4 text-slate-400">
                                            {new Date(order.order_date).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="p-4 font-bold text-green-400 font-mono">
                                            {parseInt(order.total_amount).toLocaleString()} ₫
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                                order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                                                order.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                                                'bg-red-500/10 text-red-400 border border-red-500/30'
                                            }`}>
                                                {order.status === 'pending' && <Clock className="w-3 h-3" />}
                                                {order.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                                {order.status !== 'pending' && order.status !== 'completed' && <XCircle className="w-3 h-3" />}
                                                {order.status === 'pending' ? 'Đang chờ' : 
                                                 order.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Stats */}
                {orders.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Package className="w-4 h-4" /> Tổng đơn hàng
                            </div>
                            <div className="text-2xl font-bold text-white">{orders.length}</div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <CheckCircle className="w-4 h-4" /> Hoàn thành
                            </div>
                            <div className="text-2xl font-bold text-green-400">
                                {orders.filter(o => o.status === 'completed').length}
                            </div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Wallet className="w-4 h-4" /> Tổng chi tiêu
                            </div>
                            <div className="text-2xl font-bold text-blue-400 font-mono">
                                {orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + parseInt(o.total_amount || 0), 0).toLocaleString()} ₫
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
