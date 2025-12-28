'use client';
import { Suspense } from 'react';
import ComputerMap from '@/components/user/ComputerMap';

export default function BookingPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <div className="h-[calc(100vh-64px)] overflow-hidden p-4">
                <Suspense fallback={<div className="text-white text-center mt-10">Đang tải bản đồ...</div>}>
                    <ComputerMap />
                </Suspense>
            </div>
        </div>
    );
}