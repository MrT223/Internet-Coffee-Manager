'use client';
import ComputerMap from '@/components/user/ComputerMap';

export default function AdminComputersPage() {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden p-4">
                <ComputerMap />
            </div>
        </div>
    );
}