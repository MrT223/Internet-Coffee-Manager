'use client';
import ComputerMap from '@/components/user/ComputerMap';

export default function BookingPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <div className="h-[calc(100vh-64px)] overflow-hidden p-4">
                <ComputerMap />
            </div>
        </div>
    );
}