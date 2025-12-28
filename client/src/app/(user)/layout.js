'use client';
import ChatWidget from '@/components/user/ChatWidget';
import Navbar from '@/components/user/Navbar';
import { useAuth } from '@/context/AuthContext';
import { GameSessionProvider } from '@/context/GameSessionContext';

export default function UserLayout({ children }) {
    const { user } = useAuth();

    return (
        <GameSessionProvider>
            <div className="min-h-screen bg-slate-950">
                <Navbar user={user} />
                <main>
                    {children}
                </main>
                {/* Widget chat luôn hiển thị */}
                {user && <ChatWidget user={user} />}
            </div>
        </GameSessionProvider>
    );
}
