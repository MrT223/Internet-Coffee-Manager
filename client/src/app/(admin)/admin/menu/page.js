'use client';
import { useEffect, useState } from 'react';
import axiosClient from '@/api/axios';
import Image from 'next/image';

export default function MenuPage() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        axiosClient.get('/menu')
            .then(res => setItems(res.data)) // Server trả về mảng MenuItem
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h2 className="text-2xl font-bold">Quản lý Menu</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded">Thêm món</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {items.map(item => (
                    <div key={item.item_id} className="bg-white p-4 rounded shadow">
                         {/* Cloudinary Image */}
                        <div className="relative h-40 w-full mb-2">
                            <Image 
                                src={item.image_url || '/default-food.png'} 
                                alt={item.item_name}
                                fill
                                className="object-cover rounded"
                            />
                        </div>
                        <h3 className="font-bold">{item.item_name}</h3>
                        <p className="text-blue-600 font-bold">{parseInt(item.price).toLocaleString()} đ</p>
                        <div className="flex gap-2 mt-2">
                            <button className="text-yellow-500">Sửa</button>
                            <button className="text-red-500">Xóa</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}