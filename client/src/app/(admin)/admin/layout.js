'use client';
import { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(true); // Mặc định mở trên Desktop

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-slate-100">
            {/* Sidebar: Truyền state isOpen để nó tự ẩn/hiện */}
            <Sidebar isOpen={isSidebarOpen} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full relative w-full transition-all duration-300">
                
                {/* Mobile Header: Chỉ hiện nút Menu trên màn hình nhỏ */}
                <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between md:hidden z-20 flex-shrink-0">
                    <button 
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="text-white p-2 rounded hover:bg-slate-800"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="font-bold text-blue-500">CYBER<span className="text-white">OPS</span></span>
                </header>

                {/* Nội dung chính (Có thanh cuộn riêng) */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 custom-scrollbar relative">
                    {/* Lớp phủ mờ khi mở Sidebar trên Mobile */}
                    {isSidebarOpen && (
                        <div 
                            className="fixed inset-0 bg-black/50 z-20 md:hidden glass-effect"
                            onClick={() => setSidebarOpen(false)}
                        ></div>
                    )}
                    
                    {children}
                </main>
            </div>
        </div>
    );
}