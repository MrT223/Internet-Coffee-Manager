'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChatNotification } from '@/context/ChatContext';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/auth/AuthModal';
import { 
  LayoutDashboard, 
  User, 
  Monitor, 
  Wallet, 
  Settings, 
  LogOut, 
  Home, 
  UtensilsCrossed, 
  LogIn,
  Menu,
  ArrowLeftCircle,
  BookOpen, // Icon cho nội quy
  Info // Icon cho giới thiệu
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { hasUnread, unreadCount, clearUnread } = useChatNotification() || {};
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adminReturnPath, setAdminReturnPath] = useState(null);

  // Check nếu admin đang xem trang chủ (từ sidebar)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const returnFlag = sessionStorage.getItem('adminReturnFlag');
      const lastPath = sessionStorage.getItem('adminLastPath');
      if (returnFlag === 'true' && lastPath) {
        setAdminReturnPath(lastPath);
      }
    }
  }, []);

  // Hàm quay lại admin dashboard
  const handleReturnToAdmin = () => {
    const path = adminReturnPath || '/admin';
    sessionStorage.removeItem('adminReturnFlag');
    sessionStorage.removeItem('adminLastPath');
    setAdminReturnPath(null);
    router.push(path);
  };

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
            <div className="hidden md:flex space-x-6 items-center">
              {/* Nút quay lại Admin nếu admin đang xem trang chủ */}
              {adminReturnPath && (user?.role_id === 1 || user?.role_id === 2) && (
                <button
                  onClick={handleReturnToAdmin}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-medium rounded-full transition-all shadow-lg shadow-blue-900/30"
                >
                  <ArrowLeftCircle className="w-4 h-4" /> Quay lại Admin
                </button>
              )}
              
              <Link href="/" className="hover:text-blue-400 transition-colors text-sm font-medium">Trang chủ</Link>
              <Link href="/menu" className="hover:text-blue-400 transition-colors text-sm font-medium">Dịch vụ & Menu</Link>
              <Link href="/booking" className="hover:text-blue-400 transition-colors text-sm font-medium">Đặt máy</Link>
              <Link href="/rules" className="hover:text-red-400 transition-colors text-sm font-medium flex items-center gap-1">
                 Nội quy
              </Link>
              <Link href="/about" className="hover:text-blue-400 transition-colors text-sm font-medium">Về chúng tôi</Link>
              
              {/* Demo Button - Only show when logged in but not playing */}
              {user && user.status !== 'playing' && (
                <Link 
                  href="/booking?mode=simulation" 
                  className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm font-medium rounded-full transition-all shadow-lg shadow-green-900/30"
                >
                  <span>🎮</span> Demo
                </Link>
              )}

              {user ? (
                <div className="relative group ml-2">
                  <button className="flex items-center space-x-2 focus:outline-none py-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold overflow-hidden border border-blue-400">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        user.name?.charAt(0).toUpperCase() || user.user_name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-sm font-medium truncate max-w-[100px]">{user.name || user.user_name}</span>
                  </button>
                  {/* Dropdown User */}
                  <div className="absolute right-0 mt-0 w-48 bg-white text-black rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                      <LayoutDashboard className="w-4 h-4 text-purple-500" /> Dashboard
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                      <User className="w-4 h-4 text-blue-500" /> Tài khoản
                    </Link>
                    <Link href="/booking" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                      <Monitor className="w-4 h-4 text-cyan-500" /> Đặt máy
                    </Link>
                    <Link href="/topup" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-green-600 font-bold">
                      <Wallet className="w-4 h-4" /> Nạp tiền
                    </Link>
                    {/* Chỉ hiện trang Admin nếu là admin */}
                    {(user.role_id === 1 || user.role_id === 2) && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600 font-bold">
                        <Settings className="w-4 h-4" /> Trang quản lý
                      </Link>
                    )}
                    <hr className="my-1 border-gray-200" />
                    <button onClick={logout} className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                // Nút kích hoạt Modal
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-full transition-colors font-medium shadow-lg shadow-blue-500/30 text-sm ml-2"
                >
                  Đăng nhập
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          {isMenuOpen && (
            <div className="md:hidden bg-slate-800 pb-4 rounded-b-xl">
              {/* Nút quay lại Admin cho mobile */}
              {adminReturnPath && (user?.role_id === 1 || user?.role_id === 2) && (
                <button
                  onClick={handleReturnToAdmin}
                  className="flex items-center gap-2 w-full px-4 py-2 text-blue-400 font-bold hover:bg-slate-700"
                >
                  <ArrowLeftCircle className="w-4 h-4" /> Quay lại Admin
                </button>
              )}
              <Link href="/" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-700">
                <Home className="w-4 h-4 text-slate-400" /> Trang chủ
              </Link>
              <Link href="/menu" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-700">
                <UtensilsCrossed className="w-4 h-4 text-orange-400" /> Menu
              </Link>
              <Link href="/booking" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-700">
                <Monitor className="w-4 h-4 text-cyan-400" /> Đặt máy
              </Link>
              <Link href="/rules" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-700 text-red-400">
                <BookOpen className="w-4 h-4" /> Nội quy
              </Link>
              <Link href="/about" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-700">
                <Info className="w-4 h-4 text-blue-400" /> Về chúng tôi
              </Link>

              {/* Demo Button for Mobile */}
              {user && user.status !== 'playing' && (
                <Link href="/booking?mode=simulation" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-700 text-green-400 font-medium">
                  <span>🎮</span> Demo: Chọn máy
                </Link>
              )}
              {user ? (
                <>
                  <hr className="my-2 border-slate-700" />
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-700">
                    <LayoutDashboard className="w-4 h-4 text-purple-400" /> Dashboard
                  </Link>
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-700">
                    <User className="w-4 h-4 text-blue-400" /> Tài khoản: {user.user_name}
                  </Link>
                  <Link href="/topup" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-700 text-green-400">
                    <Wallet className="w-4 h-4" /> Nạp tiền
                  </Link>
                  {(user.role_id === 1 || user.role_id === 2) && (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-700 text-blue-400">
                      <Settings className="w-4 h-4" /> Trang quản lý
                    </Link>
                  )}
                  <hr className="my-2 border-slate-700" />
                  <button onClick={logout} className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700">
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-blue-400 hover:bg-slate-700"
                >
                  <LogIn className="w-4 h-4" /> Đăng nhập
                </button>
              )}
            </div>
          )}
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