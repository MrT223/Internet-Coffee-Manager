'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/api/axios';
import Link from 'next/link';

export default function AddMenuPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        food_name: '',
        price: '',
        image_url: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosClient.post('/menu', formData);
            alert('Thêm món thành công!');
            router.push('/admin/menu'); // Quay về danh sách
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Thêm Món Mới</h2>
                <Link href="/admin/menu" className="text-gray-500 hover:text-gray-700">
                    ← Quay lại
                </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên món ăn</label>
                        <input
                            name="food_name"
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                            placeholder="Ví dụ: Cơm gà xối mỡ"
                            value={formData.food_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Giá bán (VNĐ)</label>
                        <input
                            name="price"
                            type="number"
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                            placeholder="Ví dụ: 35000"
                            value={formData.price}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh (URL)</label>
                        <input
                            name="image_url"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                            placeholder="https://..."
                            value={formData.image_url}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition-all ${
                            loading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Đang xử lý...' : 'Thêm Món Ngay'}
                    </button>
                </form>
            </div>
        </div>
    );
}