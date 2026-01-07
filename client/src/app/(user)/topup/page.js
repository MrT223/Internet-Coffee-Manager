'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useGameSession } from '@/context/GameSessionContext';
import { useToast } from '@/context/ToastContext';
import axiosClient from '@/api/axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const AMOUNTS = [
    { value: 10000, label: '10.000đ' },
    { value: 20000, label: '20.000đ' },
    { value: 50000, label: '50.000đ' },
    { value: 100000, label: '100.000đ' },
    { value: 200000, label: '200.000đ' },
    { value: 500000, label: '500.000đ' },
];

export default function TopupPage() {
    const { user, loading: authLoading, updateUserBalance } = useAuth();
    const { isPlaying } = useGameSession();
    const { toast } = useToast();
    const router = useRouter();
    
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [currentTx, setCurrentTx] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [activeTab, setActiveTab] = useState('topup'); // 'topup' | 'history'
    const [activeBonus, setActiveBonus] = useState(null);
    const [cashLoading, setCashLoading] = useState(false);

    useEffect(() => {
        fetchActiveBonus();
    }, []);

    const fetchActiveBonus = async () => {
        try {
            const res = await axiosClient.get('/promotions/topup-bonus');
            setActiveBonus(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
        if (user) {
            fetchPending();
            fetchHistory();
        }
    }, [user, authLoading, router]);

    const fetchPending = async () => {
        try {
            const res = await axiosClient.get('/topup/pending');
            if (res.data) {
                setCurrentTx(res.data);
                setSelectedAmount(res.data.transaction?.amount);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await axiosClient.get('/topup/history');
            setHistory(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreateTopup = async () => {
        if (!selectedAmount) {
            toast.warning('Vui lòng chọn mệnh giá!');
            return;
        }
        setLoading(true);
        try {
            const res = await axiosClient.post('/topup/create', { amount: selectedAmount });
            setCurrentTx(res.data);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Lỗi tạo giao dịch');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!currentTx?.transaction?.id) return;
        setConfirming(true);
        try {
            const res = await axiosClient.post(`/topup/confirm/${currentTx.transaction.id}`);
            toast.success(res.data.message);
            updateUserBalance(res.data.newBalance);
            setCurrentTx(null);
            setSelectedAmount(null);
            fetchHistory();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Lỗi xác nhận');
        } finally {
            setConfirming(false);
        }
    };

    const handleCancel = async () => {
        if (!currentTx?.transaction?.id) return;
        try {
            await axiosClient.delete(`/topup/${currentTx.transaction.id}`);
            setCurrentTx(null);
            setSelectedAmount(null);
            toast.info('Đã hủy giao dịch');
        } catch (e) {
            toast.error('Lỗi hủy giao dịch');
        }
    };

    // Nạp tiền mặt (chỉ khi đang chơi tại máy)
    const handleCashTopup = async () => {
        if (!selectedAmount) {
            toast.warning('Vui lòng chọn mệnh giá!');
            return;
        }
        if (!isPlaying) {
            toast.warning('Bạn cần đang ngồi tại máy để nạp tiền mặt!');
            return;
        }
        setCashLoading(true);
        try {
            const res = await axiosClient.post('/topup/cash', { amount: selectedAmount });
            toast.success(res.data.message);
            setSelectedAmount(null);
            fetchHistory();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Lỗi tạo giao dịch tiền mặt');
        } finally {
            setCashLoading(false);
        }
    };

    // VietQR URL format
    const getQRUrl = () => {
        if (!currentTx?.bankInfo) return null;
        const { bankId, accountNumber, accountName, content } = currentTx.bankInfo;
        const amount = currentTx.transaction?.amount || 0;
        return `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(accountName)}`;
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-slate-400">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
                        💳 Nạp Tiền
                    </h1>
                    <p className="text-slate-400 mt-1">Số dư hiện tại: <span className="text-green-400 font-bold">{parseInt(user.balance || 0).toLocaleString()}đ</span></p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button 
                        onClick={() => setActiveTab('topup')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${
                            activeTab === 'topup' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                    >
                        Nạp tiền
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${
                            activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                    >
                        Lịch sử
                    </button>
                </div>

                {activeTab === 'topup' && (
                    <div className="space-y-6">
                        {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Nạp Tiền Tài Khoản</h1>
                    <p className="text-slate-400">Chọn mệnh giá để nạp tiền vào tài khoản hội viên qua quét mã QR</p>
                    
                    {/* Active Bonus Banner */}
                    {activeBonus && (
                        <div className="mt-4 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/30 rounded-xl p-4 flex items-center gap-4 animate-pulse">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">🎁</span>
                            </div>
                            <div>
                                <h3 className="text-green-400 font-bold text-lg">{activeBonus.title}</h3>
                                <p className="text-green-200/80 text-sm">
                                    Tặng thêm <span className="font-bold text-white">{activeBonus.bonus_percent}%</span> giá trị nạp
                                    {activeBonus.min_amount > 0 && ` (tối thiểu ${activeBonus.min_amount.toLocaleString('vi-VN')}đ)`}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Amount Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {AMOUNTS.map((amt) => {
                        const hasBonus = activeBonus && amt.value >= activeBonus.min_amount;
                        const bonusAmount = hasBonus ? Math.floor(amt.value * activeBonus.bonus_percent / 100) : 0;
                        
                        return (
                            <button
                                key={amt.value}
                                onClick={() => !currentTx && setSelectedAmount(amt.value)}
                                disabled={!!currentTx}
                                className={`
                                    relative p-4 rounded-xl border-2 transition-all duration-200
                                    ${selectedAmount === amt.value
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                                    }
                                    ${currentTx ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                <div className="text-lg font-bold text-white">{amt.label}</div>
                                {hasBonus && (
                                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                                        +{bonusAmount.toLocaleString('vi-VN')}đ
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                        {/* Continue Buttons */}
                        {!currentTx && (
                            <div className="space-y-3">
                                <button
                                    onClick={handleCreateTopup}
                                    disabled={!selectedAmount || loading}
                                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Đang xử lý...' : '💳 CHUYỂN KHOẢN QUA MÃ QR →'}
                                </button>
                                
                                {/* Nút nạp tiền mặt - chỉ hiện khi đang chơi tại máy */}
                                {isPlaying ? (
                                    <button
                                        onClick={handleCashTopup}
                                        disabled={!selectedAmount || cashLoading}
                                        className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-yellow-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {cashLoading ? 'Đang xử lý...' : '💵 NẠP TIỀN MẶT TẠI QUẦY'}
                                    </button>
                                ) : (
                                    <div className="text-center text-slate-500 text-sm py-2">
                                        💻 Đang ngồi tại máy? Bạn có thể nạp tiền mặt tại quầy
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Hiển thị QR Code */}
                        {currentTx && (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                <h2 className="text-lg font-bold text-white mb-4 text-center">Quét mã QR để chuyển khoản</h2>
                                
                                {/* QR Code */}
                                <div className="flex justify-center mb-6">
                                    <div className="bg-white p-3 rounded-2xl">
                                        <Image 
                                            src={getQRUrl()} 
                                            alt="QR Code" 
                                            width={250} 
                                            height={250}
                                            unoptimized
                                        />
                                    </div>
                                </div>

                                {/* Thông tin chuyển khoản */}
                                <div className="bg-slate-950 rounded-xl p-4 mb-6 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Ngân hàng</span>
                                        <span className="text-white font-bold">{currentTx.bankInfo?.bankName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Số tài khoản</span>
                                        <span className="text-white font-mono">{currentTx.bankInfo?.accountNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Chủ tài khoản</span>
                                        <span className="text-white">{currentTx.bankInfo?.accountName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Số tiền</span>
                                        <span className="text-green-400 font-bold text-xl">{currentTx.transaction?.amount?.toLocaleString()}đ</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Nội dung CK</span>
                                        <span className="text-yellow-400 font-mono font-bold">{currentTx.bankInfo?.content}</span>
                                    </div>
                                </div>

                                {/* Warning */}
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                                    <p className="text-yellow-400 text-sm text-center">
                                        ⚠️ Vui lòng nhập đúng NỘI DUNG CHUYỂN KHOẢN để hệ thống tự động xác nhận
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={confirming}
                                        className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/30 transition-all disabled:opacity-50"
                                    >
                                        {confirming ? 'Đang xử lý...' : '✓ ĐÃ CHUYỂN KHOẢN'}
                                    </button>
                                </div>

                                <p className="text-center text-slate-500 text-xs mt-4">
                                    Mã giao dịch: <span className="text-slate-400">{currentTx.transaction?.code}</span>
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                                <tr>
                                    <th className="p-4">Mã GD</th>
                                    <th className="p-4">Số tiền</th>
                                    <th className="p-4">Trạng thái</th>
                                    <th className="p-4">Thời gian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-sm">
                                {history.length === 0 ? (
                                    <tr><td colSpan="4" className="p-8 text-center text-slate-500">Chưa có giao dịch nào</td></tr>
                                ) : history.map(tx => (
                                    <tr key={tx.transaction_id} className="hover:bg-slate-800/50">
                                        <td className="p-4 font-mono text-blue-400">{tx.transaction_code}</td>
                                        <td className="p-4 font-bold text-green-400">{parseInt(tx.amount).toLocaleString()}đ</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                tx.status === 'success' ? 'bg-green-500/10 text-green-400' :
                                                tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                                tx.status === 'expired' ? 'bg-slate-500/10 text-slate-400' :
                                                'bg-red-500/10 text-red-400'
                                            }`}>
                                                {tx.status === 'success' ? '✓ Thành công' :
                                                 tx.status === 'pending' ? '⏳ Chờ xử lý' :
                                                 tx.status === 'expired' ? 'Hết hạn' : 'Đã hủy'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400">{new Date(tx.created_at).toLocaleString('vi-VN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
