'use client';
import { useEffect, useState } from 'react';
import axiosClient from '@/api/axios';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';

export default function AdminMenuPage() {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const { confirm } = useConfirm();
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
        if (!authLoading && isAuthenticated) {
            fetchMenu();
        }
    }, [authLoading, isAuthenticated]);

    const handleDelete = async (id, name) => {
        const confirmed = await confirm({
            title: 'Xóa món ăn?',
            message: `Món "${name}" sẽ bị xóa vĩnh viễn.`,
            type: 'danger',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
        });
        if (!confirmed) return;
        
        try {
            await axiosClient.delete(`/menu/${id}`);
            toast.success(`Đã xóa món "${name}"`);
            fetchMenu();
        } catch (error) {
            toast.error("Lỗi khi xóa món: " + (error.response?.data?.message || "Lỗi server"));
        }
    };

    const toggleStock = async (item) => {
        try {
            await axiosClient.put(`/menu/${item.item_id}`, { stock: !item.stock });
            toast.success(item.stock ? `${item.food_name} đã hết hàng` : `${item.food_name} đã có hàng`);
            fetchMenu();
        } catch (error) {
            toast.error("Lỗi cập nhật: " + (error.response?.data?.message || "Lỗi server"));
        }
    };

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
                    🍕 Quản Lý Thực Đơn
                </h2>
                <Link 
                    href="/admin/menu/add" 
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/30 transition-all active:scale-95"
                >
                    ➕ Thêm Món Mới
                </Link>
            </div>

            {/* Grid Cards */}
            {loading ? (
                <div className="text-center text-slate-500 py-12">Đang tải...</div>
            ) : items.length === 0 ? (
                <div className="text-center text-slate-500 py-12">Chưa có món nào trong thực đơn.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map(item => (
                        <div key={item.item_id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-blue-500/10 transition-all group">
                            {/* Image */}
                            <div className="relative h-40 bg-slate-800">
                                <Image 
                                    src={item.image_url || '/default-food.png'} 
                                    alt={item.food_name} 
                                    fill 
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    unoptimized
                                />
                                {/* Stock Badge */}
                                <div className="absolute top-2 right-2">
                                    <button 
                                        onClick={() => toggleStock(item)}
                                        className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                                            item.stock 
                                                ? 'bg-green-600 hover:bg-green-500 text-white' 
                                                : 'bg-red-600 hover:bg-red-500 text-white'
                                        }`}
                                    >
                                        {item.stock ? '✓ Còn hàng' : '✕ Hết hàng'}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-bold text-lg text-white mb-1 truncate">{item.food_name}</h3>
                                <p className="text-green-400 font-mono font-bold text-xl mb-4">
                                    {parseInt(item.price).toLocaleString()} ₫
                                </p>
                                
                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link 
                                        href={`/admin/menu/edit/${item.item_id}`}
                                        className="flex-1 text-center bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded-lg text-sm font-bold transition-all"
                                    >
                                        ✏️ Sửa
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(item.item_id, item.food_name)}
                                        className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-sm font-bold transition-all"
                                    >
                                        🗑️ Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary */}
            <div className="mt-8 flex gap-4 justify-center">
                <div className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-3 text-center">
                    <span className="text-2xl font-bold text-white">{items.length}</span>
                    <span className="text-slate-400 text-sm ml-2">món</span>
                </div>
                <div className="bg-slate-900 border border-green-500/20 rounded-xl px-6 py-3 text-center">
                    <span className="text-2xl font-bold text-green-400">{items.filter(i => i.stock).length}</span>
                    <span className="text-slate-400 text-sm ml-2">còn hàng</span>
                </div>
                <div className="bg-slate-900 border border-red-500/20 rounded-xl px-6 py-3 text-center">
                    <span className="text-2xl font-bold text-red-400">{items.filter(i => !i.stock).length}</span>
                    <span className="text-slate-400 text-sm ml-2">hết hàng</span>
                </div>
            </div>
        </div>
    );
}