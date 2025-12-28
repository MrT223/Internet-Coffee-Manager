'use client';
import { useEffect, useState } from 'react';
import axiosClient from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';

export default function OrdersPage() {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const { confirm } = useConfirm();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled

    const fetchOrders = async () => {
        try {
            const res = await axiosClient.get('/orders/all');
            setOrders(res.data);
        } catch (err) {
            console.error("Lỗi tải đơn hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchOrders();
        }
    }, [authLoading, isAuthenticated]);

    const updateStatus = async (id, newStatus) => {
        try {
            await axiosClient.put(`/orders/${id}`, { status: newStatus });
            fetchOrders();
        } catch (error) {
            toast.error("Cập nhật thất bại: " + (error.response?.data?.message || "Lỗi server"));
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
            case 'completed': return 'bg-green-500/10 text-green-400 border border-green-500/30';
            case 'cancelled': return 'bg-red-500/10 text-red-400 border border-red-500/30';
            default: return 'bg-slate-700 text-slate-300';
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'pending': return '⏳ Đang chờ';
            case 'completed': return '✓ Hoàn tất';
            case 'cancelled': return '✕ Đã hủy';
            default: return status;
        }
    };

    const filteredOrders = filter === 'all' 
        ? orders 
        : orders.filter(o => o.status === filter);

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400">
                    🍔 Quản Lý Đơn Hàng
                </h2>
                <div className="flex gap-2">
                    {['all', 'pending', 'completed', 'cancelled'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                                filter === f 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            {f === 'all' ? 'Tất cả' : f === 'pending' ? 'Đang chờ' : f === 'completed' ? 'Hoàn tất' : 'Đã hủy'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="p-4">Mã đơn</th>
                                <th className="p-4">Khách hàng</th>
                                <th className="p-4">Món đã gọi</th>
                                <th className="p-4">Tổng tiền</th>
                                <th className="p-4">Thời gian</th>
                                <th className="p-4 text-center">Trạng thái</th>
                                <th className="p-4 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-sm">
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center text-slate-500">Đang tải...</td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-slate-500">Không có đơn hàng nào.</td></tr>
                            ) : filteredOrders.map(order => (
                                <tr key={order.bill_id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 font-mono text-blue-400">#{order.bill_id}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-white">{order.User?.user_name || 'N/A'}</div>
                                    </td>
                                    <td className="p-4">
                                        {order.OrderDetails && order.OrderDetails.length > 0 ? (
                                            <ul className="text-slate-300 space-y-1">
                                                {order.OrderDetails.map((detail, idx) => (
                                                    <li key={idx} className="flex items-center gap-1">
                                                        <span className="text-orange-400">{detail.quantity}x</span>
                                                        <span>{detail.MenuItem?.food_name || 'Món đã xóa'}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-slate-500">Không có chi tiết</span>
                                        )}
                                    </td>
                                    <td className="p-4 font-mono font-bold text-green-400">
                                        {parseInt(order.total_amount).toLocaleString()} ₫
                                    </td>
                                    <td className="p-4 text-slate-400 text-xs">
                                        {order.order_date ? new Date(order.order_date).toLocaleString('vi-VN') : 'N/A'}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusStyle(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-1">
                                            {order.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => updateStatus(order.bill_id, 'completed')}
                                                        className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded text-xs font-bold transition-all"
                                                        title="Hoàn tất"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button 
                                                        onClick={async () => {
                                                            const confirmed = await confirm({
                                                                title: 'Hủy đơn hàng?',
                                                                message: 'Tiền sẽ được hoàn lại cho khách.',
                                                                type: 'warning',
                                                                confirmText: 'Hủy đơn',
                                                                cancelText: 'Không',
                                                            });
                                                            if (confirmed) {
                                                                updateStatus(order.bill_id, 'cancelled');
                                                            }
                                                        }}
                                                        className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs font-bold transition-all"
                                                        title="Hủy đơn"
                                                    >
                                                        ✕
                                                    </button>
                                                </>
                                            )}
                                            {order.status !== 'pending' && (
                                                <span className="text-slate-500 text-xs">—</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{orders.length}</div>
                    <div className="text-slate-400 text-sm">Tổng đơn</div>
                </div>
                <div className="bg-slate-900 border border-yellow-500/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{orders.filter(o => o.status === 'pending').length}</div>
                    <div className="text-slate-400 text-sm">Đang chờ</div>
                </div>
                <div className="bg-slate-900 border border-green-500/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{orders.filter(o => o.status === 'completed').length}</div>
                    <div className="text-slate-400 text-sm">Hoàn tất</div>
                </div>
                <div className="bg-slate-900 border border-red-500/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">{orders.filter(o => o.status === 'cancelled').length}</div>
                    <div className="text-slate-400 text-sm">Đã hủy</div>
                </div>
            </div>
        </div>
    );
}