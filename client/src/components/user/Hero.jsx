'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Hero = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="relative bg-slate-900 overflow-hidden min-h-[500px] flex items-center">
            <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-[url('/Aris.png')] bg-cover bg-center opacity-60"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
                <div className="md:w-1/2">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
                        Trải nghiệm Gaming <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Đỉnh Cao</span>
                    </h1>
                    <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                        Hệ thống máy cấu hình khủng, đường truyền siêu tốc và dịch vụ đồ ăn chuẩn nhà hàng. Quản lý tài khoản và gọi món ngay tại chỗ ngồi.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href={isAuthenticated ? "/menu" : "/login"}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-transform transform hover:scale-105 text-center shadow-lg hover:shadow-blue-500/50"
                        >
                            Đặt máy Ngay
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;