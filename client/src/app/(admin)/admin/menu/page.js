'use client';
import { useEffect, useState } from 'react';
import axiosClient from '@/api/axios';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminMenuPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMenu = async () => {
        try {
            const res = await axiosClient.get('/menu');
            setItems(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa món này?")) return;
        try {
            await axiosClient.delete(`/menu/${id}`);
            fetchMenu();
        } catch (error) {
            alert("Lỗi khi xóa món");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý Thực Đơn</h2>
                {/* Link sang trang Thêm */}
                <Link 
                    href="/admin/menu/add" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md flex items-center"
                >
                    + Thêm Món Mới
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="p-4">Hình ảnh</th>
                            <th className="p-4">Tên món</th>
                            <th className="p-4">Giá bán</th>
                            <th className="p-4 text-center">Trạng thái</th>
                            <th className="p-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {items.map(item => (
                            <tr key={item.item_id} className="hover:bg-gray-50 transition text-black">
                                <td className="p-4">
                                    <div className="w-16 h-16 relative rounded-lg overflow-hidden border">
                                        <Image 
                                            src={item.image_url || '/default-food.png'} 
                                            alt={item.food_name} 
                                            fill 
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                </td>
                                <td className="p-4 font-bold text-gray-800 text-base">{item.food_name}</td>
                                <td className="p-4 text-blue-600 font-bold">
                                    {parseInt(item.price).toLocaleString()} đ
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {item.stock ? 'Còn hàng' : 'Hết hàng'}
                                    </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    {/* Link sang trang Sửa */}
                                    <Link 
                                        href={`/admin/menu/edit/${item.item_id}`}
                                        className="text-yellow-600 hover:text-yellow-800 font-bold px-2"
                                    >
                                        Sửa
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(item.item_id)}
                                        className="text-red-600 hover:text-red-800 font-bold px-2"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}