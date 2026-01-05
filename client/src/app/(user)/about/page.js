'use client';
import Navbar from '@/components/user/Navbar';
import Footer from '@/components/shared/Footer';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Về Chúng Tôi</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              CyberOps Gaming - Hệ thống phòng máy cao cấp hàng đầu
            </p>
          </div>
        </section>

        {/* About Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Tại sao chọn CyberOps?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong className="text-blue-600">🎮 Cấu hình khủng:</strong> Toàn bộ máy tính được trang bị RTX 4070/4080, CPU Intel Core i7/i9, RAM 32GB, màn hình 240Hz.
                  </p>
                  <p>
                    <strong className="text-blue-600">🍔 Đồ ăn đa dạng:</strong> Menu phong phú từ đồ uống, snack đến các món ăn nóng hổi phục vụ 24/7.
                  </p>
                  <p>
                    <strong className="text-blue-600">❄️ Không gian thoải mái:</strong> Phòng máy được thiết kế hiện đại, điều hòa mát lạnh, ghế gaming cao cấp.
                  </p>
                  <p>
                    <strong className="text-blue-600">🛠️ Hỗ trợ 24/7:</strong> Đội ngũ kỹ thuật viên sẵn sàng hỗ trợ mọi lúc bạn cần.
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Thông tin liên hệ</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <span>280 An Dương Vương, Quận 5, TP.HCM</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-2xl">📞</span>
                    <span>Hotline: 0966 846 502</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-2xl">📧</span>
                    <span>Email: ikkun2705@gmail.com</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-2xl">⏰</span>
                    <span>Mở cửa: 24/7</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Dịch vụ của chúng tôi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: '🖥️', title: 'Phòng máy VIP', desc: 'Không gian riêng tư, cấu hình cao cấp nhất' },
                { icon: '🎯', title: 'Tổ chức giải đấu', desc: 'Hỗ trợ tổ chức các giải đấu esports chuyên nghiệp' },
                { icon: '☕', title: 'Café & Snacks', desc: 'Đồ ăn thức uống đa dạng phục vụ tận máy' },
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
