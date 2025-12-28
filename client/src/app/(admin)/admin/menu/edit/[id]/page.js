'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axiosClient from '@/api/axios';
import Link from 'next/link';

export default function EditMenuPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        food_name: '',
        price: '',
        image_url: '',
        stock: true
    });

    useEffect(() => {
        const fetchItem = async () => {
            try {
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
        setSaving(true);
        try {
            await axiosClient.put(`/menu/${id}`, formData);
            alert('Cập nhật thành công!');
            router.push('/admin/menu');
        } catch (error) {
            alert('Lỗi cập nhật: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 bg-slate-950 min-h-screen flex items-center justify-center">
                <div className="text-slate-400">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-950 min-h-screen">
            <div className="max-w-xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">
                        ✏️ Chỉnh Sửa Món Ăn
                    </h2>
                    <Link href="/admin/menu" className="text-slate-400 hover:text-white transition-colors">
                        ← Quay lại
                    </Link>
                </div>

                <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tên món</label>
                            <input
                                value={formData.food_name}
                                onChange={(e) => setFormData({...formData, food_name: e.target.value})}
                                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Giá (VNĐ)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none font-mono"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Link Ảnh</label>
                            <input
                                value={formData.image_url}
                                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-slate-950 rounded-lg border border-slate-700">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, stock: !formData.stock})}
                                className={`relative w-12 h-6 rounded-full transition-colors ${
                                    formData.stock ? 'bg-green-600' : 'bg-slate-600'
                                }`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                                    formData.stock ? 'left-7' : 'left-1'
                                }`}></div>
                            </button>
                            <span className={`font-medium ${formData.stock ? 'text-green-400' : 'text-slate-400'}`}>
                                {formData.stock ? '✓ Còn hàng' : '✕ Hết hàng'}
                            </span>
                        </div>

                        <button 
                            type="submit" 
                            disabled={saving}
                            className={`w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold rounded-lg shadow-lg shadow-yellow-900/30 transition-all ${
                                saving ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            {saving ? 'Đang lưu...' : '✓ LƯU THAY ĐỔI'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}