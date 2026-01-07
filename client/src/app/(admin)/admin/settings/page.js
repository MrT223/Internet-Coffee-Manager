'use client';
import { useEffect, useState } from 'react';
import axiosClient from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Settings, Clock, Save } from 'lucide-react';

export default function AdminSettings() {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [bookingTimeout, setBookingTimeout] = useState(60);

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;

        const fetchSettings = async () => {
            try {
                const res = await axiosClient.get('/settings/booking-timeout');
                setBookingTimeout(res.data.booking_timeout_minutes);
            } catch (error) {
                console.error("Lỗi tải cài đặt:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [authLoading, isAuthenticated]);

    const formatTimeDisplay = (minutes) => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            if (mins === 0) return `${hours} giờ`;
            return `${hours} giờ ${mins} phút`;
        }
        return `${minutes} phút`;
    };

    const handleSave = async () => {
        if (bookingTimeout < 5 || bookingTimeout > 180) {
            toast.warning("Thời gian phải từ 5 đến 180 phút!");
            return;
        }

        setSaving(true);
        try {
            await axiosClient.put('/settings/booking_timeout_minutes', {
                value: bookingTimeout
            });
            toast.success(`Đã lưu: Thời gian đặt trước = ${formatTimeDisplay(bookingTimeout)}`);
        } catch (error) {
            toast.error("Lỗi lưu cài đặt: " + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-blue-400 font-medium">Đang tải cài đặt...</div>
        </div>
    );

    return (
        <div className="p-6 min-h-screen bg-slate-950">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-8 flex items-center gap-3">
                <Settings className="w-8 h-8 text-blue-400" />
                Cài Đặt Hệ Thống
            </h2>

            {/* Booking Timeout Setting */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg max-w-2xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    Thời Gian Đặt Trước
                </h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">
                            Thời gian giữ chỗ khi user đặt máy trước (phút)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                min="5"
                                max="180"
                                value={bookingTimeout}
                                onChange={(e) => setBookingTimeout(parseInt(e.target.value) || 0)}
                                className="w-32 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-lg font-bold focus:outline-none focus:border-blue-500"
                            />
                            <span className="text-slate-500">phút</span>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <p className="text-sm text-slate-400 mb-1">Hiển thị cho user:</p>
                        <p className="text-lg text-white">
                            "Máy được giữ trong <span className="text-blue-400 font-bold">{formatTimeDisplay(bookingTimeout)}</span>"
                        </p>
                    </div>

                    {/* Quick Presets */}
                    <div>
                        <p className="text-sm text-slate-400 mb-2">Chọn nhanh:</p>
                        <div className="flex gap-2 flex-wrap">
                            {[15, 30, 45, 60, 90, 120].map(mins => (
                                <button
                                    key={mins}
                                    onClick={() => setBookingTimeout(mins)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        bookingTimeout === mins 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                                >
                                    {formatTimeDisplay(mins)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Đang lưu...' : 'Lưu Cài Đặt'}
                    </button>
                </div>
            </div>
        </div>
    );
}
