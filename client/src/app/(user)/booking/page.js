'use client';
import { useEffect, useState } from 'react';
import axiosClient from '@/api/axios';
import Link from 'next/link';

export default function BookingPage() {
    const [computers, setComputers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPc, setSelectedPc] = useState(null);

    // Fetch danh sách máy từ Server
    useEffect(() => {
        axiosClient.get('/computers')
            .then(res => {
                setComputers(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSelectComputer = (pc) => {
        if (pc.status !== 'online') return; // Chỉ cho chọn máy đang hoạt động/trống
        // Nếu logic của bạn: 'online' = máy đang bật nhưng chưa có người login -> có thể đặt
        // Hoặc thêm trạng thái 'available' tùy backend. 
        // Ở đây giả định 'online' là máy trống, 'busy' là có người.
        setSelectedPc(pc);
    };

    const confirmBooking = () => {
        if (!selectedPc) return;
        alert(`Bạn đã gửi yêu cầu đặt máy: ${selectedPc.name || selectedPc.computer_id}. Vui lòng tới quầy thanh toán để nhận máy!`);
        setSelectedPc(null);
        // Tại đây bạn sẽ gọi API POST /bookings để lưu vào CSDL
    };

    // Helper: Màu sắc theo trạng thái
    const getStatusStyle = (status) => {
        switch (status) {
            case 'online': // Giả định online là sẵn sàng
                return 'bg-white border-green-500 text-green-700 hover:bg-green-50 cursor-pointer shadow-green-100';
            case 'busy': // Đang có người dùng
            case 'offline': // Tắt máy
                return 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed opacity-70';
            case 'maintenance': // Bảo trì
                return 'bg-red-50 border-red-300 text-red-500 cursor-not-allowed';
            default:
                return 'bg-slate-100 border-slate-200';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Sơ đồ phòng máy</h1>
                <p className="text-slate-600">Chọn máy còn trống để đặt trước chỗ ngồi của bạn</p>
            </div>

            {/* Chú thích trạng thái */}
            <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-white border-2 border-green-500"></div>
                    <span className="text-slate-700">Máy trống (Online)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-200 border-2 border-slate-300"></div>
                    <span className="text-slate-700">Đang sử dụng / Tắt</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-50 border-2 border-red-300"></div>
                    <span className="text-slate-700">Bảo trì</span>
                </div>
            </div>

            {/* Loading State */}
            {loading && <div className="text-center py-10 text-slate-500">Đang tải danh sách máy...</div>}

            {/* Grid Máy */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
                {computers.map((pc) => (
                    <div
                        key={pc._id}
                        onClick={() => handleSelectComputer(pc)}
                        className={`
                            relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2
                            ${getStatusStyle(pc.status)}
                            ${selectedPc?._id === pc._id ? 'ring-2 ring-indigo-500 ring-offset-2 transform scale-105' : ''}
                        `}
                    >
                        {/* Icon Computer */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        
                        <div className="font-bold text-lg">{pc.name || `PC ${pc.computer_id}`}</div>
                        <div className="text-xs font-medium uppercase px-2 py-0.5 rounded bg-black/5">
                            {pc.status === 'online' ? 'Sẵn sàng' : pc.status}
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Bar (Hiện lên khi chọn máy) */}
            <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg transform transition-transform duration-300 ${selectedPc ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="container mx-auto max-w-6xl flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm">Bạn đang chọn:</p>
                        <p className="text-xl font-bold text-indigo-600">{selectedPc?.name}</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setSelectedPc(null)}
                            className="px-5 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-100"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={confirmBooking}
                            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-colors"
                        >
                            Xác nhận đặt máy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}