'use client';
import Sidebar from '@/components/admin/Sidebar';
import { useState } from 'react';

export default function AdminLayout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar isOpen={isSidebarOpen} />
            <div className="flex-1 flex flex-col transition-all duration-300">
                <header className="bg-white shadow p-4 flex justify-between">
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)}>☰</button>
                    <h1 className="font-bold text-xl text-gray-800">CyberOps Admin</h1>
                </header>
                <main className="p-6 flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}