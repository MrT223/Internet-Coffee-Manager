'use client';
import { Suspense } from 'react';
import ComputerMap from '@/components/user/ComputerMap';

export default function AdminComputersPage() {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden p-4">
                <Suspense fallback={<div className="text-white text-center mt-10">Đang tải bản đồ...</div>}>
                    <ComputerMap />
                </Suspense>
            </div>
        </div>
    );
}