'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosClient from '@/api/axios';
import { useRouter } from 'next/navigation';

// Hàm format tiền tệ
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [activeTab, setActiveTab] = useState('info'); // 'info' | 'orders'
    const router = useRouter();

    useEffect(() => {
        // Nếu đã load xong auth mà chưa có user -> đá về login
        if (!authLoading && !user) {
            router.push('/');
        }

        // Lấy lịch sử đơn hàng
        if (user) {
            const fetchOrders = async () => {
                try {
                    // Gọi API getMyOrders đã định nghĩa ở server
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
        return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Cột trái: Thông tin thẻ thành viên */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="bg-slate-900 h-24 relative">
                                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                                    <div className="w-20 h-20 rounded-full bg-blue-600 border-4 border-white flex items-center justify-center text-2xl font-bold text-white shadow-md">
                                        {user.user_name?.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-12 pb-6 px-4 text-center">
                                <h2 className="text-xl font-bold text-gray-800">{user.user_name}</h2>
                                <p className="text-sm text-gray-500 uppercase mt-1">
                                    {user.role_id === 1 ? 'Admin' : user.role_id === 2 ? 'Nhân viên' : 'Hội viên'}
                                </p>
                                
                                <div className="mt-6 border-t pt-4">
                                    <div className="text-sm text-gray-500 mb-1">Số dư tài khoản</div>
                                    <div className="text-3xl font-bold text-green-600">
                                        {formatCurrency(user.balance || 0)}
                                    </div>
                                    <button className="mt-4 w-full py-2 bg-blue-100 text-blue-700 font-semibold rounded hover:bg-blue-200 transition">
                                        Nạp tiền
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Tabs nội dung */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg min-h-[400px]">
                            {/* Tab Header */}
                            <div className="flex border-b">
                                <button
                                    onClick={() => setActiveTab('info')}
                                    className={`px-6 py-4 font-medium text-sm focus:outline-none transition-colors ${
                                        activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Thông tin chung
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`px-6 py-4 font-medium text-sm focus:outline-none transition-colors ${
                                        activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
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
                                                <label className="block text-sm font-medium text-gray-500">Tên đăng nhập</label>
                                                <div className="mt-1 p-2 bg-gray-100 rounded text-gray-800">{user.user_name}</div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">ID Thành viên</label>
                                                <div className="mt-1 p-2 bg-gray-100 rounded text-gray-800">#{user.id}</div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">Ngày tham gia</label>
                                                <div className="mt-1 p-2 bg-gray-100 rounded text-gray-800">
                                                    {new Date(user.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'orders' && (
                                    <div className="overflow-x-auto">
                                        {loadingOrders ? (
                                            <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
                                        ) : orders.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <p>Bạn chưa gọi món nào.</p>
                                            </div>
                                        ) : (
                                            <table className="w-full text-sm text-left text-gray-500">
                                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3">Mã đơn</th>
                                                        <th className="px-4 py-3">Thời gian</th>
                                                        <th className="px-4 py-3">Tổng tiền</th>
                                                        <th className="px-4 py-3">Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orders.map((order) => (
                                                        <tr key={order.order_id} className="bg-white border-b hover:bg-gray-50">
                                                            <td className="px-4 py-3 font-medium text-gray-900">#{order.order_id}</td>
                                                            <td className="px-4 py-3">
                                                                {new Date(order.order_date).toLocaleString('vi-VN')}
                                                            </td>
                                                            <td className="px-4 py-3 font-bold text-blue-600">
                                                                {formatCurrency(order.total_amount)}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
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
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}