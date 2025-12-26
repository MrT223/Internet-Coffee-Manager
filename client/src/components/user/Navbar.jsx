'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // Giả định bạn đã setup Context này
import Image from 'next/image';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
               {/* Thay bằng đường dẫn logo thực tế của bạn */}
              <Image src="/cyberopslogo.png" alt="CyberOps Logo" fill className="object-contain" />
            </div>
            <span className="font-bold text-xl tracking-wider text-blue-500">CYBER<span className="text-white">OPS</span></span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="hover:text-blue-400 transition-colors">Trang chủ</Link>
            <Link href="/menu" className="hover:text-blue-400 transition-colors">Dịch vụ & Menu</Link>
            <Link href="/about" className="hover:text-blue-400 transition-colors">Về chúng tôi</Link>
            
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                    {user.user_name?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.user_name}</span>
                </button>
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">Tài khoản</Link>
                  <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100">Lịch sử đặt món</Link>
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">Đăng xuất</button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors font-medium">
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800 pb-4">
          <Link href="/" className="block px-4 py-2 hover:bg-slate-700">Trang chủ</Link>
          <Link href="/menu" className="block px-4 py-2 hover:bg-slate-700">Menu</Link>
          {user ? (
            <>
              <Link href="/profile" className="block px-4 py-2 hover:bg-slate-700">Tài khoản: {user.user_name}</Link>
              <button onClick={logout} className="block w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700">Đăng xuất</button>
            </>
          ) : (
             <Link href="/login" className="block px-4 py-2 text-blue-400 hover:bg-slate-700">Đăng nhập ngay</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;