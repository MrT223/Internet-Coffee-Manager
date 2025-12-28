'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/api/axios';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import { Camera, X } from 'lucide-react'; // Đảm bảo bạn đã cài lucide-react, nếu chưa có thể dùng icon khác hoặc text

export default function AddMenuPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    // State riêng cho file ảnh
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        food_name: '',
        price: '',
        image_url: '' // Vẫn giữ field này để lưu URL sau khi upload
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Xử lý khi chọn file
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Tạo URL preview để hiện ảnh ngay lập tức
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Xử lý xóa ảnh đã chọn
    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        setFormData({ ...formData, image_url: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalImageUrl = formData.image_url;

            // 1. Nếu có chọn file, thực hiện upload trước
            if (selectedFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('image', selectedFile);

                try {
                    const uploadRes = await axiosClient.post('/upload/menu-image', uploadFormData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    
                    // Lấy URL từ response của server
                    finalImageUrl = uploadRes.data.image_url || uploadRes.data.url;
                } catch (uploadError) {
                    console.error("Upload error:", uploadError);
                    toast.error('Lỗi upload ảnh: ' + (uploadError.response?.data?.message || uploadError.message));
                    setLoading(false);
                    return; // Dừng lại nếu upload thất bại
                }
            }

            // 2. Gửi thông tin món ăn với URL ảnh (đã upload hoặc nhập tay)
            const menuData = {
                ...formData,
                image_url: finalImageUrl
            };

            await axiosClient.post('/menu', menuData);
            toast.success('Thêm món thành công!');
            router.push('/admin/menu');

        } catch (error) {
            console.error("Submit error:", error);
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
                        {/* Tên món */}
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

                        {/* Giá */}
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

                        {/* Upload Hình ảnh */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Hình ảnh</label>
                            
                            {/* Khu vực chọn ảnh */}
                            <div className="space-y-4">
                                {/* Preview ảnh nếu có */}
                                {previewUrl ? (
                                    <div className="relative w-full h-64 rounded-lg overflow-hidden border border-slate-700 group">
                                        <img 
                                            src={previewUrl} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={clearFile}
                                            className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-all"
                                            title="Xóa ảnh"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    // Nút upload nếu chưa có ảnh
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-32 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-slate-800/50 transition-all group"
                                    >
                                        <Camera className="w-8 h-8 text-slate-500 group-hover:text-green-400 mb-2" />
                                        <span className="text-sm text-slate-500 group-hover:text-slate-300">
                                            Click để tải ảnh lên
                                        </span>
                                    </div>
                                )}

                                {/* Input file ẩn */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />

                                {/* Input URL dự phòng (nếu muốn paste link trực tiếp) */}
                                <div className="relative">
                                    <input
                                        name="image_url"
                                        className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-sm"
                                        placeholder="Hoặc dán URL ảnh trực tiếp..."
                                        value={formData.image_url}
                                        onChange={(e) => {
                                            handleChange(e);
                                            // Nếu paste URL thì hiện preview luôn nếu hợp lệ
                                            if(!selectedFile) setPreviewUrl(e.target.value);
                                        }}
                                        disabled={!!selectedFile} // Disable nếu đang chọn file upload
                                    />
                                </div>
                            </div>
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