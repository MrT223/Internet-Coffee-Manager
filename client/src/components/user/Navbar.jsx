'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import AuthModal from '@/components/auth/AuthModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-wider text-blue-500">CYBER<span className="text-white">OPS</span></span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              <Link href="/" className="hover:text-blue-400 transition-colors">Trang chủ</Link>
              <Link href="/menu" className="hover:text-blue-400 transition-colors">Dịch vụ & Menu</Link>
              <Link href="/booking" className="hover:text-blue-400 transition-colors">Đặt máy</Link>
              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 focus:outline-none py-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                      {user.user_name?.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.user_name}</span>
                  </button>
                  {/* Dropdown User */}
                  <div className="absolute right-0 mt-0 w-48 bg-white text-black rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">Tài khoản</Link>
                    {/* Chỉ hiện trang Admin nếu là admin */}
                    {(user.role_id === 1 || user.role_id === 2) && (
                      <Link href="/admin" className="block px-4 py-2 hover:bg-gray-100 text-blue-600 font-bold">Trang quản lý</Link>
                    )}
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">Đăng xuất</button>
                  </div>
                </div>
              ) : (
                // Nút kích hoạt Modal
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full transition-colors font-medium shadow-lg shadow-blue-500/30"
                >
                  Đăng nhập
                </button>
              )}
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
                  <Link href="/" className="block px-4 py-2 text-blue-400 hover:bg-slate-700"></Link>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default Navbar;