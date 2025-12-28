'use client';
import ChatWidget from '@/components/user/ChatWidget';
import Navbar from '@/components/user/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function UserLayout({ children }) {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar user={user} />
            <main>
                {children}
            </main>
            {/* Widget chat luôn hiển thị */}
            {user && <ChatWidget user={user} />}
        </div>
    );
}