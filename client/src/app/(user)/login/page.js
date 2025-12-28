import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
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

      {/* Login Form Container */}
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <LoginForm />
          
          {/* Additional Links */}
          <div className="mt-6 text-center text-gray-400 text-sm">
            <p>
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                Đăng ký ngay
              </Link>
            </p>
            <p className="mt-2">
              <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors">
                ← Quay về trang chủ
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-xs py-4">
        © {new Date().getFullYear()} CyberOps Gaming Center. All rights reserved.
      </footer>
    </div>
  );
}
