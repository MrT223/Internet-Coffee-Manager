'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axiosClient from '@/api/axios';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import { Camera, X, UploadCloud } from 'lucide-react';

export default function EditMenuPage() {
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

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
                    if (item.image_url) {
                        setPreviewUrl(item.image_url);
                    }
                } else {
                    toast.error('Không tìm thấy món ăn!');
                    router.push('/admin/menu');
                }
            } catch (error) {
                console.error(error);
                toast.error('Lỗi tải dữ liệu món ăn');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchItem();
    }, [id, router, toast]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        setFormData({ ...formData, image_url: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let finalImageUrl = formData.image_url;

            // 1. Nếu có file mới -> Upload
            if (selectedFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('image', selectedFile);

                try {
                    const uploadRes = await axiosClient.post('/upload/menu-image', uploadFormData);
                    
                    finalImageUrl = uploadRes.data.image_url || uploadRes.data.url;
                } catch (uploadError) {
                    console.error("Upload error:", uploadError);
                    toast.error('Lỗi upload ảnh: ' + (uploadError.response?.data?.message || uploadError.message));
                    setSaving(false);
                    return; 
                }
            }

            // 2. Cập nhật món ăn
            const updateData = {
                ...formData,
                image_url: finalImageUrl
            };

            await axiosClient.put(`/menu/${id}`, updateData);
            toast.success('Cập nhật thành công!');
            router.push('/admin/menu');
        } catch (error) {
            console.error("Update error:", error);
            toast.error('Lỗi cập nhật: ' + (error.response?.data?.message || error.message));
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
                        {/* Tên món */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tên món</label>
                            <input
                                value={formData.food_name}
                                onChange={(e) => setFormData({...formData, food_name: e.target.value})}
                                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                                required
                            />
                        </div>

                        {/* Giá */}
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

                        {/* Hình ảnh */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Hình ảnh</label>
                            
                            <div className="space-y-4">
                                {previewUrl ? (
                                    <div className="relative w-full h-64 rounded-lg overflow-hidden border border-slate-700 group">
                                        <img 
                                            src={previewUrl} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                        />
                                        
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all"
                                                title="Đổi ảnh khác"
                                            >
                                                <Camera size={20} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={clearImage}
                                                className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-full transition-all"
                                                title="Xóa ảnh"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-40 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 hover:bg-slate-800/50 transition-all group"
                                    >
                                        <UploadCloud className="w-10 h-10 text-slate-500 group-hover:text-yellow-400 mb-2" />
                                        <span className="text-sm text-slate-500 group-hover:text-slate-300">
                                            Click để tải ảnh mới lên
                                        </span>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Trạng thái */}
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