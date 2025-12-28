'use client';
import { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function MenuPage() {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState({}); 
    const { user, updateUserBalance } = useAuth();

    useEffect(() => {
        axiosClient.get('/menu')
            .then(res => setMenuItems(res.data))
            .catch(err => console.error("Lỗi tải menu:", err))
            .finally(() => setLoading(false));
    }, []);

    const addToCart = (item) => {
        setCart(prev => ({
            ...prev,
            [item.item_id]: (prev[item.item_id] || 0) + 1
        }));
    };

    const removeFromCart = (itemId) => {
        setCart(prev => {
            const newCart = { ...prev };
            if (newCart[itemId] > 1) {
                newCart[itemId]--;
            } else {
                delete newCart[itemId];
            }
            return newCart;
        });
    };

    const handleCheckout = async () => {
        if (Object.keys(cart).length === 0) return;
        try {
            const cartItems = Object.entries(cart).map(([id, qty]) => {
                const item = menuItems.find(i => i.item_id.toString() === id);
                return {
                    item_id: parseInt(id),
                    quantity: qty,
                    price: item?.price || 0
                };
            });

            const res = await axiosClient.post('/orders', { cart: cartItems });
            alert("Đặt món thành công! Bếp đang chuẩn bị.");
            if (res.data.newBalance !== undefined) {
                updateUserBalance(res.data.newBalance);
            }
            setCart({});
        } catch (error) {
            alert("Đặt món thất bại. " + (error.response?.data?.message || ""));
        }
    };

    const totalAmount = Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = menuItems.find(i => i.item_id.toString() === id);
        return sum + (item ? item.price * qty : 0);
    }, 0);

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-slate-400">Đang tải thực đơn...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 pb-32">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400">
                        🍔 Thực Đơn
                    </h1>
                    <p className="text-slate-400 mt-1">Chọn món và đặt ngay - phục vụ tận máy!</p>
                </div>
                
                {/* Menu Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {menuItems.map(item => {
                        const quantity = cart[item.item_id] || 0;
                        return (
                            <div key={item.item_id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/10 transition-all group">
                                {/* Image */}
                                <div className="relative h-32 bg-slate-800">
                                    <Image 
                                        src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} 
                                        alt={item.food_name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        unoptimized
                                    />
                                    {!item.stock && (
                                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                            <span className="text-red-400 font-bold text-sm">HẾT HÀNG</span>
                                        </div>
                                    )}
                                    {quantity > 0 && (
                                        <div className="absolute top-2 right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                                            {quantity}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Content */}
                                <div className="p-3">
                                    <h3 className="font-bold text-sm text-white truncate mb-1">{item.food_name}</h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-green-400 font-bold text-sm font-mono">
                                            {parseInt(item.price).toLocaleString()}đ
                                        </span>
                                        {item.stock && (
                                            <div className="flex items-center gap-1">
                                                {quantity > 0 && (
                                                    <button 
                                                        onClick={() => removeFromCart(item.item_id)}
                                                        className="w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-xs font-bold transition-all"
                                                    >
                                                        -
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => addToCart(item)}
                                                    className="w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center text-xs font-bold transition-all"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Floating Cart */}
            {totalItems > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-50">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <div className="text-white">
                            <span className="text-slate-400">Giỏ hàng:</span>
                            <span className="font-bold ml-2">{totalItems} món</span>
                            <span className="mx-3 text-slate-600">|</span>
                            <span className="text-green-400 font-bold text-xl font-mono">{totalAmount.toLocaleString()} ₫</span>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setCart({})}
                                className="px-4 py-2 bg-slate-800 text-slate-300 font-medium rounded-lg hover:bg-slate-700 transition-all"
                            >
                                Xóa
                            </button>
                            <button 
                                onClick={handleCheckout}
                                className="px-8 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-lg shadow-lg shadow-orange-900/30 transition-all active:scale-95"
                            >
                                Đặt Ngay 🚀
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}