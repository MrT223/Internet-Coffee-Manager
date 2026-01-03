'use client';
import { useEffect, useState } from 'react';
import axiosClient from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';


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
    const [chartData, setChartData] = useState([]);
    useEffect(() => {
        // Đợi auth load xong và đã đăng nhập mới fetch
        if (authLoading || !isAuthenticated) return;

        const fetchStats = async () => {
            try {
                const [statsRes, chartRes] = await Promise.all([
                    axiosClient.get('/admin/stats'),
                    axiosClient.get('/admin/stats/chart')
                ]);

                setStats(statsRes.data);
                setChartData(chartRes.data);
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

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-blue-400 font-medium">Đang tải dữ liệu hệ thống...</div>
        </div>
    );
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

            {/* Biểu đồ Doanh thu */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-green-400">📈</span> Biểu Đồ Doanh Thu (7 Ngày)
                    </h3>
                </div>
                
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                stroke="#94a3b8" 
                                tick={{fontSize: 14}}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis 
                                stroke="#94a3b8" 
                                tick={{fontSize: 14}}
                                tickFormatter={(value) => `${value/1000}k`}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                            />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px'}}
                                itemStyle={{color: '#4ade80'}}
                                formatter={(value) => [`${value.toLocaleString()} đ`, "Doanh thu"]}
                                labelStyle={{color: '#94a3b8', marginBottom: '5px'}}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#22c55e" 
                                strokeWidth={4}
                                fillOpacity={1} 
                                fill="url(#colorRevenue)" 
                                activeDot={{ r: 8, strokeWidth: 0, fill: '#fff' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}