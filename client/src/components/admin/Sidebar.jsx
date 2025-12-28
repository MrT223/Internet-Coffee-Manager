'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
    { name: 'Tổng quan', href: '/admin', icon: '📊' },
    { name: 'Sơ đồ máy', href: '/admin/computers', icon: '🖥️' },
    { name: 'Quản lý Menu', href: '/admin/menu', icon: '🍔' },
    { name: 'Đơn hàng (Bếp)', href: '/admin/orders', icon: '🔔' },
    { name: 'Hội viên & Nạp tiền', href: '/admin/users', icon: '👥' },
];

const Sidebar = ({ isOpen }) => {
    const pathname = usePathname();
    const { logout } = useAuth(); // Lấy hàm logout từ Context

    return (
        <aside className={`
            bg-slate-900 text-white w-64 min-h-screen flex flex-col transition-all duration-300 border-r border-slate-800
            ${isOpen ? 'translate-x-0' : '-translate-x-64'} fixed md:relative z-30 flex-shrink-0 shadow-xl
        `}>
            {/* Header Logo */}
            <div className="h-16 flex items-center justify-center border-b border-slate-800 bg-slate-950">
                <Link href="/admin" className="text-2xl font-bold tracking-wider text-blue-500 hover:text-blue-400 transition-colors">
                    CYBER<span className="text-white">OPS</span>
                </Link>
            </div>

            {/* Menu Links */}
            <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={`
                                flex items-center px-6 py-3 transition-all duration-200 border-l-4
                                ${isActive 
                                    ? 'bg-slate-800 text-white border-blue-500 shadow-[inset_10px_0_20px_-10px_rgba(59,130,246,0.3)]' 
                                    : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-white'}
                            `}
                        >
                            <span className="mr-3 text-xl">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Actions (Nút mới thêm) */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
                {/* Nút Xem Trang Chủ */}
                <Link 
                    href="/" 
                    target="_blank" // Mở tab mới để không mất trang Admin
                    className="flex items-center justify-center w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors text-sm font-bold border border-slate-700 group"
                >
                    <span className="mr-2 group-hover:scale-110 transition-transform">🏠</span> 
                    Xem Trang Chủ
                </Link>

                {/* Nút Đăng Xuất */}
                <button 
                    onClick={logout}
                    className="flex items-center justify-center w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-sm font-bold shadow-lg shadow-red-900/30 hover:shadow-red-900/50 active:scale-95"
                >
                    <span className="mr-2"></span> Đăng Xuất
                </button>
                
                <div className="text-[10px] text-slate-600 text-center pt-2 uppercase tracking-widest">
                    Admin System v1.0
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;