'use client';

import AuthModal from '@/components/auth/AuthModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <nav className="p-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-2 w-fit">
            <span className="font-bold text-xl tracking-wider text-blue-500">CYBER<span className="text-white">OPS</span></span>
          </Link>
        </div>
      </nav>

      {/* AuthModal hiển thị tự động */}
      <AuthModal isOpen={true} onClose={handleClose} />
    </div>
  );
}

