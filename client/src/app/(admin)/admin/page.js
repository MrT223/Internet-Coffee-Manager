'use client';
import { useEffect, useState } from 'react';
import axiosClient from '@/api/axios';
import { useAuth } from '@/context/AuthContext';

const StatCard = ({ title, value, icon, color, subText }) => (
    <div className="relative overflow-hidden bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg hover:shadow-blue-500/10 transition-all group">
        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <span className="text-6xl">{icon}</span>
        </div>
        <div className="relative z-10 flex items-center">
            <div className={`p-3 rounded-xl bg-slate-800 ${color} bg-opacity-20 text-2xl mr-4`}>
                {icon}
            </div>
            <div>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
                {subText && <p className="text-xs text-slate-500 mt-1">{subText}</p>}
            </div>
        </div>
    </div>
);

export default function AdminDashboard() {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const [stats, setStats] = useState({
        revenue: 0,
        activeComputers: 0,
        pendingOrders: 0,
        totalUsers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Đợi auth load xong và đã đăng nhập mới fetch
        if (authLoading || !isAuthenticated) return;
        
        const fetchStats = async () => {
            try {
                const res = await axiosClient.get('/admin/stats');
                setStats(res.data);
            } catch (error) {
                console.error("Lỗi tải thống kê:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
        // Refresh mỗi 30s
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [authLoading, isAuthenticated]);

    if (loading) return <div className="p-8 text-white">Đang tải dữ liệu...</div>;

    return (
        <div className="p-6 min-h-screen bg-slate-950">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-8">
                Tổng Quan Hệ Thống
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Doanh Thu Đồ Ăn" 
                    value={`${stats.revenue.toLocaleString()} đ`} 
                    icon="💰" 
                    color="text-green-400"
                    subText="Tổng doanh thu đơn hàng hoàn thành"
                />
                <StatCard 
                    title="Máy Đang Online" 
                    value={stats.activeComputers} 
                    icon="🖥️" 
                    color="text-blue-400" 
                    subText="Số máy đang có người sử dụng"
                />
                <StatCard 
                    title="Đơn Bếp Chờ Xử Lý" 
                    value={stats.pendingOrders} 
                    icon="🔥" 
                    color="text-orange-400"
                    subText="Cần chế biến ngay" 
                />
                <StatCard 
                    title="Tổng Hội Viên" 
                    value={stats.totalUsers} 
                    icon="👥" 
                    color="text-purple-400" 
                />
            </div>

            {/* Có thể thêm biểu đồ hoặc bảng nhỏ ở đây */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-500">
                <p>Khu vực biểu đồ thống kê (Đang cập nhật...)</p>
            </div>
        </div>
    );
}