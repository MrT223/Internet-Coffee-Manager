'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/api/axios';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

export default function AddMenuPage() {
    const router = useRouter();
    const { toast } = useToast();
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
            toast.success('Thêm món thành công!');
            router.push('/admin/menu');
        } catch (error) {
            toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-slate-950 min-h-screen">
            <div className="max-w-xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
                        ➕ Thêm Món Mới
                    </h2>
                    <Link href="/admin/menu" className="text-slate-400 hover:text-white transition-colors">
                        ← Quay lại
                    </Link>
                </div>

                <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tên món ăn</label>
                            <input
                                name="food_name"
                                required
                                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                                placeholder="Ví dụ: Cơm gà xối mỡ"
                                value={formData.food_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Giá bán (VNĐ)</label>
                            <input
                                name="price"
                                type="number"
                                required
                                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none font-mono"
                                placeholder="Ví dụ: 35000"
                                value={formData.price}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Hình ảnh (URL)</label>
                            <input
                                name="image_url"
                                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                                placeholder="https://..."
                                value={formData.image_url}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-green-900/30 transition-all ${
                                loading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? 'Đang xử lý...' : '✓ THÊM MÓN'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}