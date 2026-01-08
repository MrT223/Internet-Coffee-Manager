'use client';
import { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';
import { useAuth } from '@/context/AuthContext';

export default function SessionHistoryPage() {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    
    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', 15);
            if (dateFrom) params.append('startDate', dateFrom);
            if (dateTo) params.append('endDate', dateTo);
            
            const res = await axiosClient.get(`/session-history?${params.toString()}`);
            setSessions(res.data.sessions);
            setTotalPages(res.data.pagination.totalPages);
            setTotal(res.data.pagination.total);
        } catch (error) {
            console.error("Lỗi tải lịch sử:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axiosClient.get('/session-history/stats');
            setStats(res.data);
        } catch (error) {
            console.error("Lỗi tải thống kê:", error);
        }
    };

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchSessions();
            fetchStats();
        }
    }, [authLoading, isAuthenticated, page, dateFrom, dateTo]);

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (minutes) => {
        if (!minutes) return '0 phút';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}p`;
        }
        return `${mins} phút`;
    };

    // Filter sessions by search term (username)
    const filteredSessions = sessions.filter(s => 
        !searchTerm || s.user?.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-white">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    📜 Lịch Sử Phiên Chơi
                </h2>
                <p className="text-slate-400 text-sm mt-1">Xem lại lịch sử chơi máy của tất cả user</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-slate-400 text-xs uppercase mb-1">Tổng phiên</div>
                        <div className="text-2xl font-bold text-white">{stats.totalSessions?.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-slate-400 text-xs uppercase mb-1">Hôm nay</div>
                        <div className="text-2xl font-bold text-blue-400">{stats.todaySessions?.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-slate-400 text-xs uppercase mb-1">Tổng doanh thu</div>
                        <div className="text-2xl font-bold text-green-400">{stats.totalRevenue?.toLocaleString()}đ</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-slate-400 text-xs uppercase mb-1">DT hôm nay</div>
                        <div className="text-2xl font-bold text-emerald-400">{stats.todayRevenue?.toLocaleString()}đ</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tìm theo username</label>
                        <input 
                            type="text" 
                            placeholder="Nhập tên tài khoản..." 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500 text-white placeholder-slate-500"
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Từ ngày</label>
                        <input 
                            type="date" 
                            className="bg-slate-950 border border-slate-700 rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500 text-white"
                            value={dateFrom} 
                            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Đến ngày</label>
                        <input 
                            type="date" 
                            className="bg-slate-950 border border-slate-700 rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500 text-white"
                            value={dateTo} 
                            onChange={(e) => { setDateTo(e.target.value); setPage(1); }} 
                        />
                    </div>
                    <button 
                        onClick={() => { setSearchTerm(''); setDateFrom(''); setDateTo(''); setPage(1); }}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
                    >
                        Xóa lọc
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="p-4">#</th>
                                <th className="p-4">Tài khoản</th>
                                <th className="p-4">Máy</th>
                                <th className="p-4">Bắt đầu</th>
                                <th className="p-4">Kết thúc</th>
                                <th className="p-4 text-center">Thời gian</th>
                                <th className="p-4 text-right">Chi phí</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-sm">
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center text-slate-500">Đang tải...</td></tr>
                            ) : filteredSessions.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-slate-500">Chưa có lịch sử phiên chơi nào.</td></tr>
                            ) : filteredSessions.map((session, index) => (
                                <tr key={session.session_id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 text-slate-500">#{session.session_id}</td>
                                    <td className="p-4 font-bold text-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xs">
                                                {session.user?.user_name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <span>{session.user?.user_name || `User #${session.user_id}`}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/20">
                                            🖥️ {session.computer_name}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-300 text-xs">{formatDateTime(session.start_time)}</td>
                                    <td className="p-4 text-slate-300 text-xs">{formatDateTime(session.end_time)}</td>
                                    <td className="p-4 text-center">
                                        <span className="bg-slate-700 text-slate-200 px-2 py-1 rounded text-xs">
                                            {formatDuration(session.duration_minutes)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-mono font-bold text-green-400">
                                        {session.total_cost?.toLocaleString()}đ
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-800">
                        <div className="text-slate-400 text-sm">
                            Hiển thị {filteredSessions.length} / {total} phiên
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-all"
                            >
                                ←
                            </button>
                            <span className="px-3 py-1 bg-purple-600 text-white rounded font-bold">
                                {page} / {totalPages}
                            </span>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-all"
                            >
                                →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
