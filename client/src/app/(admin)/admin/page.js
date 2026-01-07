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

const chartTypes = [
    { key: 'topup', label: '💵 Tiền Nạp', color: '#3b82f6', gradientId: 'colorTopup' },
    { key: 'food_total', label: '🍔 Đồ Ăn (Tổng)', color: '#22c55e', gradientId: 'colorFoodTotal' },
    { key: 'food_cash', label: '💰 Đồ Ăn (Tiền Mặt)', color: '#f59e0b', gradientId: 'colorFoodCash' },
];

export default function AdminDashboard() {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const [stats, setStats] = useState({
        revenue: 0,
        activeComputers: 0,
        pendingOrders: 0,
        totalUsers: 0
    });
    const [financialStats, setFinancialStats] = useState({
        totalTopup: 0,
        foodRevenueTotal: 0,
        foodRevenueCash: 0,
    });
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([]);
    const [chartType, setChartType] = useState('topup');

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;

        const fetchStats = async () => {
            try {
                const [statsRes, financialRes] = await Promise.all([
                    axiosClient.get('/admin/stats'),
                    axiosClient.get('/admin/stats/financial'),
                ]);

                setStats(statsRes.data);
                setFinancialStats(financialRes.data);
            } catch (error) {
                console.error("Lỗi tải thống kê:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [authLoading, isAuthenticated]);

    // Fetch chart data when chartType changes
    useEffect(() => {
        if (authLoading || !isAuthenticated) return;

        const fetchChartData = async () => {
            try {
                const res = await axiosClient.get(`/admin/stats/chart-data?type=${chartType}`);
                setChartData(res.data);
            } catch (error) {
                console.error("Lỗi tải biểu đồ:", error);
            }
        };
        fetchChartData();
    }, [chartType, authLoading, isAuthenticated]);

    const currentChartConfig = chartTypes.find(c => c.key === chartType) || chartTypes[0];

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

            {/* Stats Cards - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                    title="Tổng Tiền Nạp"
                    value={`${financialStats.totalTopup.toLocaleString()} đ`}
                    icon="💵"
                    color="text-blue-400"
                    subText="Tổng tiền nạp thành công"
                />
                <StatCard
                    title="Doanh Thu Đồ Ăn"
                    value={`${financialStats.foodRevenueTotal.toLocaleString()} đ`}
                    icon="🍔"
                    color="text-green-400"
                    subText="Tổng doanh thu đồ ăn"
                />
                <StatCard
                    title="Đồ Ăn Tiền Mặt"
                    value={`${financialStats.foodRevenueCash.toLocaleString()} đ`}
                    icon="💰"
                    color="text-yellow-400"
                    subText="Thanh toán tiền mặt"
                />
                <StatCard
                    title="Máy Đang Online"
                    value={stats.activeComputers}
                    icon="🖥️"
                    color="text-cyan-400"
                    subText="Số máy đang có người sử dụng"
                />
            </div>

            {/* Stats Cards - Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

            {/* Biểu đồ với Toggle */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-green-400">📈</span> Biểu Đồ 7 Ngày Gần Nhất
                    </h3>
                    
                    {/* Chart Type Toggle */}
                    <div className="flex gap-2 flex-wrap">
                        {chartTypes.map(type => (
                            <button
                                key={type.key}
                                onClick={() => setChartType(type.key)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                    chartType === type.key 
                                        ? 'bg-blue-600 text-white shadow-lg' 
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={currentChartConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={currentChartConfig.color} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={currentChartConfig.color} stopOpacity={0}/>
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
                                tickFormatter={(value) => value >= 1000 ? `${Math.round(value/1000)}k` : value}
                                domain={[0, (dataMax) => Math.max(dataMax, 10000)]}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                                width={50}
                            />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px'}}
                                itemStyle={{color: currentChartConfig.color}}
                                formatter={(value) => [`${value.toLocaleString()} đ`, currentChartConfig.label]}
                                labelStyle={{color: '#94a3b8', marginBottom: '5px'}}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke={currentChartConfig.color} 
                                strokeWidth={4}
                                fillOpacity={1} 
                                fill={`url(#${currentChartConfig.gradientId})`} 
                                activeDot={{ r: 8, strokeWidth: 0, fill: '#fff' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}