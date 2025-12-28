'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useGameSession } from '@/context/GameSessionContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import axiosClient from '@/api/axios';
import Link from 'next/link';
import { Monitor, UtensilsCrossed, ClipboardList, MessageCircle, Hand, Gamepad2, Clock, Wallet, Power } from 'lucide-react';

export default function UserDashboard() {
    const { user, loading: authLoading, updateUserBalance } = useAuth();
    const { 
        sessionInfo, 
        effectiveBalance, 
        isPlaying, 
        isLoading: sessionLoading,
        formatRemainingTime,
        endSession,
        fetchSession
    } = useGameSession();
    const { toast } = useToast();
    const { confirm } = useConfirm();
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            fetchMyOrders();
            fetchSession(); // Fetch session khi vào dashboard
        }
    }, [authLoading, user]);

    const fetchMyOrders = async () => {
        try {
            const res = await axiosClient.get('/orders/my-orders');
            setOrders(res.data.slice(0, 5)); // Chỉ lấy 5 đơn gần nhất
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEndSession = async () => {
        const confirmed = await confirm({
            title: 'Kết thúc phiên chơi?',
            message: 'Hệ thống sẽ tính tiền theo thời gian bạn đã chơi.',
            type: 'warning',
            confirmText: 'Kết thúc',
            cancelText: 'Tiếp tục chơi',
        });
        if (!confirmed) return;
        
        const result = await endSession();
        if (result.success) {
            toast.success(result.message);
            if (result.newBalance !== undefined) {
                updateUserBalance(result.newBalance);
            }
        } else {
            toast.error(result.message);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-slate-400">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Welcome Card */}
                <div className={`rounded-2xl p-6 shadow-xl ${isPlaying 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
                    <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        {isPlaying ? (
                            <>
                                <Gamepad2 className="w-6 h-6" /> Đang chơi tại {sessionInfo?.computer?.name}
                            </>
                        ) : (
                            <>
                                Xin chào, {user?.name || user?.user_name || 'Hội viên'}! <Hand className="w-6 h-6" />
                            </>
                        )}
                    </h1>
                    <p className={isPlaying ? 'text-green-100' : 'text-blue-100'}>
                        {isPlaying 
                            ? 'Phiên chơi đang hoạt động - Thời gian tính theo số dư tài khoản' 
                            : 'Chào mừng bạn đến với CyberOps Gaming Center'}
                    </p>
                </div>

                {/* Gaming Session Card - Only show when playing */}
                {isPlaying && sessionInfo && (
                    <div className="bg-slate-900 border-2 border-green-500 rounded-xl p-6 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                                Phiên Chơi Đang Hoạt Động
                            </h2>
                            <button 
                                onClick={handleEndSession}
                                disabled={sessionLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
                            >
                                <Power className="w-4 h-4" />
                                {sessionLoading ? 'Đang xử lý...' : 'Kết thúc phiên'}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Computer Info */}
                            <div className="bg-slate-800 rounded-lg p-4 text-center">
                                <Monitor className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                <div className="text-slate-400 text-sm">Máy đang chơi</div>
                                <div className="text-xl font-bold text-white">{sessionInfo.computer?.name}</div>
                            </div>
                            
                            {/* Countdown Timer */}
                            <div className="bg-slate-800 rounded-lg p-4 text-center">
                                <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                <div className="text-slate-400 text-sm">Thời gian còn lại</div>
                                <div className="text-2xl font-bold text-yellow-400 font-mono tracking-wider">
                                    {formatRemainingTime()}
                                </div>
                            </div>
                            
                            {/* Effective Balance */}
                            <div className="bg-slate-800 rounded-lg p-4 text-center">
                                <Wallet className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                <div className="text-slate-400 text-sm">Số dư còn lại</div>
                                <div className="text-xl font-bold text-green-400 font-mono">
                                    {Math.floor(effectiveBalance).toLocaleString()} ₫
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-4 text-center text-sm text-slate-500">
                            Giá: 36,000₫/giờ • Số dư giảm dần theo thời gian chơi
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                        <div className="text-slate-400 text-sm mb-1">Số dư tài khoản</div>
                        <div className="text-2xl font-bold text-green-400 font-mono">
                            {parseInt(user?.balance || 0).toLocaleString()} ₫
                        </div>
                        {isPlaying && (
                            <div className="text-xs text-slate-500 mt-1">
                                (Hiệu lực: {Math.floor(effectiveBalance).toLocaleString()}₫)
                            </div>
                        )}
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                        <div className="text-slate-400 text-sm mb-1">Vai trò</div>
                        <div className="text-xl font-bold text-blue-400">
                            {user?.role_id === 1 ? 'Admin' : user?.role_id === 2 ? 'Nhân viên' : 'Hội viên'}
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                        <div className="text-slate-400 text-sm mb-1">Trạng thái</div>
                        <div className={`text-xl font-bold flex items-center gap-2 ${
                            isPlaying ? 'text-green-400' : 'text-emerald-400'
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${
                                isPlaying 
                                    ? 'bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse' 
                                    : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                            }`}></span>
                            {isPlaying ? 'Đang Chơi' : 'Online'}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Truy cập nhanh</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link href="/booking" className="bg-slate-800 hover:bg-slate-700 rounded-xl p-4 text-center transition-all group">
                            <div className="flex justify-center mb-2">
                                <Monitor className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="text-white font-medium">Đặt Máy</div>
                        </Link>
                        <Link 
                            href="/menu" 
                            className={`rounded-xl p-4 text-center transition-all group ${
                                isPlaying 
                                    ? 'bg-slate-800 hover:bg-slate-700' 
                                    : 'bg-slate-800/50 opacity-60 cursor-not-allowed'
                            }`}
                            onClick={(e) => !isPlaying && e.preventDefault()}
                        >
                            <div className="flex justify-center mb-2">
                                <UtensilsCrossed className={`w-8 h-8 ${isPlaying ? 'text-orange-400' : 'text-slate-500'} group-hover:scale-110 transition-transform`} />
                            </div>
                            <div className={`font-medium ${isPlaying ? 'text-white' : 'text-slate-500'}`}>
                                Gọi Đồ Ăn
                                {!isPlaying && <div className="text-xs text-slate-500 mt-1">(Cần ngồi máy)</div>}
                            </div>
                        </Link>
                        <Link href="/orders" className="bg-slate-800 hover:bg-slate-700 rounded-xl p-4 text-center transition-all group">
                            <div className="flex justify-center mb-2">
                                <ClipboardList className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="text-white font-medium">Lịch Sử Đơn</div>
                        </Link>
                        <Link href="/support" className="bg-slate-800 hover:bg-slate-700 rounded-xl p-4 text-center transition-all group">
                            <div className="flex justify-center mb-2">
                                <MessageCircle className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="text-white font-medium">Hỗ Trợ</div>
                        </Link>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-white">Đơn hàng gần đây</h2>
                        <Link href="/orders" className="text-blue-400 text-sm hover:underline">Xem tất cả →</Link>
                    </div>
                    {loading ? (
                        <div className="text-slate-500 text-center py-4">Đang tải...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-slate-500 text-center py-4">Chưa có đơn hàng nào</div>
                    ) : (
                        <div className="space-y-2">
                            {orders.map(order => (
                                <div key={order.bill_id} className="flex justify-between items-center bg-slate-800 rounded-lg p-3">
                                    <div>
                                        <span className="text-slate-400 text-sm">#{order.bill_id}</span>
                                        <span className="text-white ml-2">{parseInt(order.total_amount).toLocaleString()} ₫</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                        order.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                        'bg-red-500/10 text-red-400'
                                    }`}>
                                        {order.status === 'pending' ? 'Đang chờ' : order.status === 'completed' ? 'Hoàn tất' : 'Đã hủy'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
