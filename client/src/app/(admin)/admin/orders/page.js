'use client';
import { useEffect, useState } from 'react';
import axiosClient from '@/api/axios';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        axiosClient.get('/orders')
            .then(res => setOrders(res.data))
            .catch(err => console.error(err));
    }, []);

    const updateStatus = (id, newStatus) => {
        // Call API update status
        console.log(`Update order ${id} to ${newStatus}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800">Quản lý Đơn hàng </h2>
                <div className="flex gap-2">
                    <button className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-slate-200">Đang chờ</button>
                    <button className="bg-white text-slate-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-slate-50">Đã xong</button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4 border-b">ID</th>
                            <th className="p-4 border-b">Khách hàng / Máy</th>
                            <th className="p-4 border-b">Món đã gọi</th>
                            <th className="p-4 border-b">Tổng tiền</th>
                            <th className="p-4 border-b">Trạng thái</th>
                            <th className="p-4 border-b text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {orders.map(order => (
                            <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-mono text-slate-500">#{order._id.slice(-6)}</td>
                                <td className="p-4">
                                    <div className="font-bold text-slate-800">{order.user?.username || 'Khách vãng lai'}</div>
                                    <div className="text-xs text-slate-500">Máy: {order.computer_id || 'N/A'}</div>
                                </td>
                                <td className="p-4">
                                    <ul className="list-disc list-inside text-slate-700">
                                        {order.items?.map((item, idx) => (
                                            <li key={idx}>
                                                {item.quantity}x <span className="font-medium">{item.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="p-4 font-bold text-indigo-600">
                                    {parseInt(order.total_price).toLocaleString()} đ
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                        order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {order.status === 'pending' ? 'Đang chờ' : order.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    {order.status === 'pending' && (
                                        <button 
                                            onClick={() => updateStatus(order._id, 'completed')}
                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                                        >
                                            ✓ Hoàn tất
                                        </button>
                                    )}
                                    <button className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <div className="p-8 text-center text-slate-500">Không có đơn nào.</div>
                )}
            </div>
        </div>
    );
}