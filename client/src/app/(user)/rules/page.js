'use client';
import Footer from '@/components/shared/Footer';
import { ShieldAlert, Ban, Utensils, MonitorX, Clock, CreditCard } from 'lucide-react';

export default function RulesPage() {
  const rules = [
    {
      icon: <ShieldAlert className="w-10 h-10 text-red-500" />,
      title: "1. Quy định truy cập",
      content: [
        "Nghiêm cấm truy cập các trang web có nội dung đồi trụy, phản động, chống phá nhà nước.",
        "Không sử dụng các phần mềm hack, cheat, keylog hoặc phát tán virus tại phòng máy.",
        "Tuân thủ luật An ninh mạng của Việt Nam."
      ]
    },
    {
      icon: <MonitorX className="w-10 h-10 text-blue-500" />,
      title: "2. Bảo vệ tài sản",
      content: [
        "Không đập phá bàn phím, chuột, tai nghe hay tác động vật lý lên màn hình.",
        "Nếu làm hư hỏng thiết bị do cố ý, khách hàng phải bồi thường 100% giá trị thiết bị mới.",
        "Không tự ý tháo lắp, di chuyển thiết bị phần cứng."
      ]
    },
    {
      icon: <Utensils className="w-10 h-10 text-orange-500" />,
      title: "3. Dịch vụ ăn uống",
      content: [
        "Không mang đồ ăn, thức uống từ bên ngoài vào phòng máy (trừ nước suối).",
        "Giữ gìn vệ sinh chung, bỏ rác đúng nơi quy định sau khi ăn uống.",
        "Không đổ nước vào bàn phím hay case máy tính."
      ]
    },
    {
      icon: <Ban className="w-10 h-10 text-purple-500" />,
      title: "4. Văn hóa phòng máy",
      content: [
        "Không hút thuốc lá trong phòng lạnh (Vui lòng ra khu vực quy định).",
        "Không gây ồn ào quá mức, chửi thề hoặc gây gổ đánh nhau.",
        "Tự bảo quản tư trang cá nhân (xe, ví tiền, điện thoại). CyberOps không chịu trách nhiệm nếu mất mát."
      ]
    },
    {
      icon: <CreditCard className="w-10 h-10 text-green-500" />,
      title: "5. Tài khoản & Thanh toán",
      content: [
        "Tự bảo mật mật khẩu tài khoản hội viên. Không chia sẻ tài khoản cho người lạ.",
        "Vui lòng nạp tiền trước khi sử dụng dịch vụ.",
        "Kiểm tra kỹ số dư và thông báo ngay cho nhân viên nếu có sai sót."
      ]
    },
    {
      icon: <Clock className="w-10 h-10 text-cyan-500" />,
      title: "6. Giờ giấc hoạt động",
      content: [
        "CyberOps mở cửa phục vụ 24/7.",
        "Khách hàng dưới 18 tuổi vui lòng không chơi quá 22:00 đêm theo quy định pháp luật.",
        "Hệ thống sẽ tự động tắt máy khi hết giờ chơi."
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-900 to-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-4">
              <ShieldAlert size={64} className="text-red-500 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-wider">Nội Quy Phòng Máy</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Vui lòng đọc kỹ và tuân thủ để đảm bảo trải nghiệm tốt nhất cho cộng đồng game thủ CyberOps.
            </p>
          </div>
        </section>

        {/* Rules Grid */}
        <section className="py-16 bg-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rules.map((rule, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all border-l-4 border-slate-800">
                  <div className="flex items-center gap-4 mb-4 border-b border-gray-100 pb-4">
                    <div className="p-3 bg-slate-50 rounded-full">
                      {rule.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{rule.title}</h3>
                  </div>
                  <ul className="space-y-3">
                    {rule.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600 text-sm leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Warning Banner */}
            <div className="mt-12 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <h4 className="text-red-700 font-bold text-lg uppercase mb-2">Lưu ý quan trọng</h4>
              <p className="text-red-600">
                Ban quản lý CyberOps có quyền ngừng cung cấp dịch vụ và khóa tài khoản vĩnh viễn nếu khách hàng cố tình vi phạm các quy định trên mà không hoàn lại tiền.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}