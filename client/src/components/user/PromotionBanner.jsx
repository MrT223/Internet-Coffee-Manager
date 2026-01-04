'use client';
import { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';
import { FaChevronLeft, FaChevronRight, FaGift, FaBullhorn, FaCalendarAlt } from 'react-icons/fa';

const typeIcons = {
    announcement: FaBullhorn,
    topup_bonus: FaGift,
    event: FaCalendarAlt,
};

const typeColors = {
    announcement: 'from-blue-600 to-blue-800',
    topup_bonus: 'from-green-600 to-emerald-800',
    event: 'from-purple-600 to-indigo-800',
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit', month: '2-digit'
    });
};

export default function PromotionBanner() {
    const [promotions, setPromotions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const res = await axiosClient.get('/promotions/active');
                setPromotions(res.data);
            } catch (err) {
                console.error('Error fetching promotions:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPromotions();
    }, []);

    // Auto slide every 5s
    useEffect(() => {
        if (promotions.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % promotions.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [promotions.length]);

    const goToPrev = () => {
        setCurrentIndex(prev => (prev - 1 + promotions.length) % promotions.length);
    };

    const goToNext = () => {
        setCurrentIndex(prev => (prev + 1) % promotions.length);
    };

    if (loading) return null;
    if (!promotions || promotions.length === 0) return null;

    const currentPromo = promotions[currentIndex];
    if (!currentPromo) return null;
    
    const Icon = typeIcons[currentPromo.type] || FaBullhorn;
    const bgColor = typeColors[currentPromo.type] || 'from-blue-600 to-blue-800';

    return (
        <div className="bg-slate-900 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative">
                    {/* Banner Card */}
                    <div className={`relative bg-gradient-to-r ${bgColor} rounded-2xl p-6 md:p-8 overflow-hidden shadow-2xl`}>
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                                        {currentPromo.title}
                                    </h3>
                                    <p className="text-white/80 text-sm md:text-base line-clamp-2">
                                        {currentPromo.description}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-white/60 text-xs">
                                        <span>📅 {formatDate(currentPromo.start_date)} - {formatDate(currentPromo.end_date)}</span>
                                        {currentPromo.type === 'topup_bonus' && currentPromo.min_amount > 0 && (
                                            <span>💰 Nạp tối thiểu {currentPromo.min_amount.toLocaleString('vi-VN')}đ</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {currentPromo.type === 'topup_bonus' && (
                                <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
                                    <div className="text-3xl md:text-4xl font-extrabold text-white">
                                        +{currentPromo.bonus_percent}%
                                    </div>
                                    <div className="text-white/80 text-sm">BONUS</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {promotions.length > 1 && (
                        <>
                            <button
                                onClick={goToPrev}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
                            >
                                <FaChevronLeft />
                            </button>
                            <button
                                onClick={goToNext}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
                            >
                                <FaChevronRight />
                            </button>
                        </>
                    )}

                    {/* Dots Indicator */}
                    {promotions.length > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            {promotions.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        idx === currentIndex ? 'w-6 bg-blue-500' : 'bg-slate-600 hover:bg-slate-500'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
