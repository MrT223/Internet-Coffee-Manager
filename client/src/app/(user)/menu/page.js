'use client';
import { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function MenuPage() {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState({}); 
    const { user } = useAuth();
    
    // Nếu bạn dùng alert thay vì ToastContext
    const notify = (msg) => alert(msg); 

    useEffect(() => {
        // Gọi API lấy danh sách món
        axiosClient.get('/menu')
            .then(res => {
                setMenuItems(res.data);
            })
            .catch(err => console.error("Lỗi tải menu:", err))
            .finally(() => setLoading(false));
    }, []);

    const addToCart = (item) => {
        setCart(prev => ({
            ...prev,
            [item.item_id]: (prev[item.item_id] || 0) + 1
        }));
        // notify(`Đã thêm ${item.food_name} vào giỏ`); // Bỏ comment nếu muốn thông báo
    };

    const handleCheckout = async () => {
        if (Object.keys(cart).length === 0) return;
        try {
            const items = Object.entries(cart).map(([id, qty]) => ({
                item_id: parseInt(id),
                quantity: qty
            }));

            await axiosClient.post('/orders', { items });
            notify("Đặt món thành công! Bếp đang chuẩn bị.");
            setCart({});
        } catch (error) {
            notify("Đặt món thất bại. " + (error.response?.data?.message || ""));
        }
    };

    const totalAmount = Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = menuItems.find(i => i.item_id.toString() === id);
        return sum + (item ? item.price * qty : 0);
    }, 0);

    if (loading) return <div className="text-center p-10">Đang tải thực đơn...</div>;

    return (
        <div className="container mx-auto p-4 pb-24">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Thực Đơn Quán</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {menuItems.map(item => (
                    <div key={item.item_id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition flex flex-col">
                        <div className="relative h-48 w-full bg-gray-200">
                            {/* Nếu có ảnh thì hiện, không thì hiện ảnh mặc định */}
                            <Image 
                                src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} 
                                alt={item.food_name}
                                fill
                                className="object-cover"
                                unoptimized // Thêm dòng này nếu ảnh từ nguồn ngoài chưa cấu hình domain
                            />
                            {!item.stock && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">
                                    HẾT HÀNG
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg text-gray-800 mb-1">{item.food_name}</h3>
                            <div className="mt-auto flex justify-between items-center pt-3 border-t border-dashed">
                                <span className="text-blue-600 font-bold text-lg">
                                    {parseInt(item.price).toLocaleString()} đ
                                </span>
                                <button 
                                    onClick={() => addToCart(item)}
                                    disabled={!item.stock}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white transition-colors ${
                                        item.stock 
                                        ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200' 
                                        : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Giỏ hàng Floating */}
            {Object.keys(cart).length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-50 animate-slide-up">
                    <div className="container mx-auto flex justify-between items-center">
                        <div className='text-gray-800'>
                            <span className="font-bold">Giỏ hàng:</span> {Object.values(cart).reduce((a, b) => a + b, 0)} món
                            <span className="mx-3 text-gray-300">|</span>
                            <span className="text-blue-600 font-bold text-xl">{totalAmount.toLocaleString()} đ</span>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setCart({})}
                                className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded-lg hover:bg-gray-200"
                            >
                                Xóa
                            </button>
                            <button 
                                onClick={handleCheckout}
                                className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition-transform active:scale-95"
                            >
                                Đặt Ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}