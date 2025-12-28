'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Dùng useParams để lấy ID
import axiosClient from '@/api/axios';
import Link from 'next/link';

export default function EditMenuPage() {
    const { id } = useParams(); // Lấy ID từ URL
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        food_name: '',
        price: '',
        image_url: '',
        stock: true
    });

    // Load dữ liệu món cũ
    useEffect(() => {
        const fetchItem = async () => {
            try {
                // Gọi API lấy list rồi tìm (hoặc gọi API detail nếu backend có)
                const res = await axiosClient.get('/menu');
                const item = res.data.find(i => i.item_id.toString() === id);
                
                if (item) {
                    setFormData({
                        food_name: item.food_name,
                        price: item.price,
                        image_url: item.image_url || '',
                        stock: item.stock
                    });
                } else {
                    alert('Không tìm thấy món ăn!');
                    router.push('/admin/menu');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchItem();
    }, [id, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.put(`/menu/${id}`, formData);
            alert('Cập nhật thành công!');
            router.push('/admin/menu');
        } catch (error) {
            alert('Lỗi cập nhật: ' + error.message);
        }
    };

    if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Chỉnh Sửa Món Ăn</h2>
                <Link href="/admin/menu" className="text-gray-500 hover:text-gray-700">← Quay lại</Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên món</label>
                        <input
                            value={formData.food_name}
                            onChange={(e) => setFormData({...formData, food_name: e.target.value})}
                            className="w-full p-3 border rounded-lg text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VNĐ)</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            className="w-full p-3 border rounded-lg text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Link Ảnh</label>
                        <input
                            value={formData.image_url}
                            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                            className="w-full p-3 border rounded-lg text-black"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="stock"
                            checked={formData.stock}
                            onChange={(e) => setFormData({...formData, stock: e.target.checked})}
                            className="w-5 h-5 text-blue-600"
                        />
                        <label htmlFor="stock" className="text-gray-700 font-medium">Còn hàng (Đang phục vụ)</label>
                    </div>

                    <button type="submit" className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg shadow">
                        Lưu Thay Đổi
                    </button>
                </form>
            </div>
        </div>
    );
}