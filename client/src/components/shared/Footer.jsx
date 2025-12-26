import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-gray-400 py-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">CyberOps Gaming</h3>
            <p className="text-sm">
              Hệ thống phòng máy cao cấp, dịch vụ ăn uống đa dạng và hỗ trợ game thủ chuyên nghiệp 24/7.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/menu" className="hover:text-white transition-colors">Menu Đồ Ăn</Link></li>
              <li><Link href="/rules" className="hover:text-white transition-colors">Nội quy phòng máy</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Yêu cầu hỗ trợ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
             <h3 className="text-white text-lg font-bold mb-4">Liên hệ</h3>
             <ul className="space-y-2 text-sm">
                <li>📍 280 An Dương Vương Quận 5</li>
                <li>📞 Hotline: 0966846502</li>
                <li>📧 Support: ikkun2705@gmail.com</li>
             </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs">
            &copy; {new Date().getFullYear()} CyberOps Gaming Center. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;