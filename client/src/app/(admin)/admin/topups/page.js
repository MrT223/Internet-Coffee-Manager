'use client';
import { useEffect, useState } from 'react';
import axiosClient from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { Wallet, CheckCircle, XCircle, Clock, Banknote, CreditCard } from 'lucide-react';

export default function AdminTopups() {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const { confirm } = useConfirm();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' | 'pending_cash'
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;
        fetchTransactions();
    }, [authLoading, isAuthenticated, filter]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const endpoint = filter === 'pending_cash' 
                ? '/topup/admin/pending-cash'
                : '/topup/admin/all';
            const res = await axiosClient.get(endpoint);
            setTransactions(res.data);
        } catch (error) {
            console.error("Lỗi tải giao dịch:", error);
            toast.error("Lỗi tải danh sách giao dịch");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (tx) => {
        const confirmed = await confirm(
            `Xác nhận nạp ${tx.amount.toLocaleString()}đ tiền mặt cho ${tx.User?.user_name}?`
        );
        if (!confirmed) return;

        setProcessing(tx.transaction_id);
        try {
            const res = await axiosClient.post(`/topup/admin/confirm/${tx.transaction_id}`);
            toast.success(res.data.message);
            fetchTransactions();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi xác nhận");
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (tx) => {
        const confirmed = await confirm(
            `Từ chối giao dịch ${tx.transaction_code} của ${tx.User?.user_name}?`
        );
        if (!confirmed) return;

        setProcessing(tx.transaction_id);
        try {
            await axiosClient.post(`/topup/admin/reject/${tx.transaction_id}`);
            toast.info("Đã từ chối giao dịch");
            fetchTransactions();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi từ chối");
        } finally {
            setProcessing(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            success: 'bg-green-500/10 text-green-400',
            pending: 'bg-yellow-500/10 text-yellow-400',
            expired: 'bg-slate-500/10 text-slate-400',
            cancelled: 'bg-red-500/10 text-red-400',
        };
        const labels = {
            success: '✓ Thành công',
            pending: '⏳ Chờ duyệt',
            expired: 'Hết hạn',
            cancelled: 'Đã hủy',
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-bold ${styles[status] || ''}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getPaymentMethodBadge = (method) => {
        if (method === 'cash') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 text-xs font-bold">
                    <Banknote className="w-3 h-3" /> Tiền mặt
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-xs font-bold">
                <CreditCard className="w-3 h-3" /> Chuyển khoản
            </span>
        );
    };

    // Đếm pending cash
    const pendingCashCount = transactions.filter(
        tx => tx.payment_method === 'cash' && tx.status === 'pending'
    ).length;

    if (loading && transactions.length === 0) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-blue-400 font-medium">Đang tải giao dịch...</div>
        </div>
    );

    return (
        <div className="p-6 min-h-screen bg-slate-950">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-8 flex items-center gap-3">
                <Wallet className="w-8 h-8 text-green-400" />
                Quản Lý Nạp Tiền
            </h2>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                        filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                >
                    Tất cả
                </button>
                <button
                    onClick={() => setFilter('pending_cash')}
                    className={`px-4 py-2 rounded-lg font-bold transition-all relative ${
                        filter === 'pending_cash' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                >
                    💵 Chờ duyệt tiền mặt
                    {pendingCashCount > 0 && filter !== 'pending_cash' && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {pendingCashCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Transactions Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                        <tr>
                            <th className="p-4">Mã GD</th>
                            <th className="p-4">Người dùng</th>
                            <th className="p-4">Số tiền</th>
                            <th className="p-4">Phương thức</th>
                            <th className="p-4">Trạng thái</th>
                            <th className="p-4">Thời gian</th>
                            <th className="p-4">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-slate-500">
                                    {filter === 'pending_cash' ? 'Không có giao dịch tiền mặt nào đang chờ duyệt' : 'Chưa có giao dịch nào'}
                                </td>
                            </tr>
                        ) : transactions.map(tx => (
                            <tr key={tx.transaction_id} className="hover:bg-slate-800/50">
                                <td className="p-4 font-mono text-blue-400">{tx.transaction_code}</td>
                                <td className="p-4 text-white font-medium">{tx.User?.user_name || `ID: ${tx.user_id}`}</td>
                                <td className="p-4 font-bold text-green-400">{parseInt(tx.amount).toLocaleString()}đ</td>
                                <td className="p-4">{getPaymentMethodBadge(tx.payment_method)}</td>
                                <td className="p-4">{getStatusBadge(tx.status)}</td>
                                <td className="p-4 text-slate-400">{new Date(tx.created_at).toLocaleString('vi-VN')}</td>
                                <td className="p-4">
                                    {tx.payment_method === 'cash' && tx.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleConfirm(tx)}
                                                disabled={processing === tx.transaction_id}
                                                className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg disabled:opacity-50 transition-all"
                                                title="Xác nhận đã thu tiền"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleReject(tx)}
                                                disabled={processing === tx.transaction_id}
                                                className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg disabled:opacity-50 transition-all"
                                                title="Từ chối"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    {tx.status === 'success' && (
                                        <span className="text-green-400 text-xs">
                                            {tx.confirmed_at && new Date(tx.confirmed_at).toLocaleString('vi-VN')}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
