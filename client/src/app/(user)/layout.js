'use client';
import ChatWidget from '@/components/user/ChatWidget';
import Navbar from '@/components/user/Navbar'; // Tạo Navbar giống Ciname_Galyxa
import { useAuth } from '@/context/AuthContext';

export default function UserLayout({ children }) {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} />
            <main className="container mx-auto p-4">
                {children}
            </main>
            {/* Widget chat luôn hiển thị */}
            {user && <ChatWidget user={user} />}
        </div>
    );
}