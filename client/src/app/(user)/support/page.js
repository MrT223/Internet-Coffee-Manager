'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
    ArrowLeft, 
    MessageCircle, 
    HelpCircle, 
    Phone, 
    ChevronDown, 
    MapPin, 
    Mail, 
    Clock, 
    Smartphone, 
    MessageSquare, 
    Facebook,
    Gamepad2,
    Headset
} from 'lucide-react';

export default function SupportPage() {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('faq');

    const faqs = [
        {
            question: "Làm thế nào để nạp tiền vào tài khoản?",
            answer: "Bạn có thể nạp tiền bằng cách vào mục 'Nạp tiền' trong Dashboard hoặc menu. Chọn mệnh giá muốn nạp, quét mã QR và chuyển khoản theo hướng dẫn."
        },
        {
            question: "Làm sao để đặt máy chơi game?",
            answer: "Vào mục 'Đặt máy', chọn khu vực và máy bạn muốn sử dụng. Hệ thống sẽ hiển thị các máy trống để bạn chọn."
        },
        {
            question: "Tôi có thể gọi đồ ăn như thế nào?",
            answer: "Vào mục 'Menu' hoặc 'Gọi Đồ Ăn', chọn món và số lượng. Nhấn 'Đặt Ngay' và đồ ăn sẽ được phục vụ tận máy bạn đang ngồi."
        },
        {
            question: "Số dư tài khoản có hết hạn không?",
            answer: "Số dư tài khoản của bạn không hết hạn. Bạn có thể sử dụng bất cứ lúc nào."
        },
        {
            question: "Có thể hoàn tiền đơn hàng không?",
            answer: "Vui lòng liên hệ trực tiếp với nhân viên tại quầy để được hỗ trợ về việc hoàn tiền đơn hàng."
        }
    ];

    const [expandedFaq, setExpandedFaq] = useState(null);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-slate-400">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    {user && (
                        <div className="flex items-center gap-2 mb-2">
                            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                                <ArrowLeft className="w-4 h-4" /> Dashboard
                            </Link>
                        </div>
                    )}
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-3">
                        <MessageCircle className="w-8 h-8 text-purple-400" /> Hỗ Trợ
                    </h1>
                    <p className="text-slate-400 mt-1">Chúng tôi luôn sẵn sàng giúp đỡ bạn</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button 
                        onClick={() => setActiveTab('faq')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                            activeTab === 'faq' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                    >
                        <HelpCircle className="w-4 h-4" /> Câu hỏi thường gặp
                    </button>
                    <button 
                        onClick={() => setActiveTab('contact')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                            activeTab === 'contact' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                    >
                        <Phone className="w-4 h-4" /> Liên hệ
                    </button>
                </div>

                {/* FAQ Tab */}
                {activeTab === 'faq' && (
                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index}
                                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                    className="w-full p-4 text-left flex justify-between items-center hover:bg-slate-800/50 transition-colors"
                                >
                                    <span className="font-medium text-white">{faq.question}</span>
                                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedFaq === index && (
                                    <div className="px-4 pb-4 text-slate-400 border-t border-slate-800 pt-3">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Contact Info */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4">Thông tin liên hệ</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-6 h-6 text-red-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-white font-medium">Địa chỉ</div>
                                        <div className="text-slate-400 text-sm">123 Đường Nguyễn Văn Linh, Q.7, TP.HCM</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="w-6 h-6 text-green-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-white font-medium">Hotline</div>
                                        <div className="text-slate-400 text-sm">1900 1234 56</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Mail className="w-6 h-6 text-blue-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-white font-medium">Email</div>
                                        <div className="text-slate-400 text-sm">support@cyberops.vn</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-white font-medium">Giờ mở cửa</div>
                                        <div className="text-slate-400 text-sm">24/7 - Mở cửa cả tuần</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4">Hỗ trợ nhanh</h2>
                            <div className="space-y-3">
                                <a 
                                    href="tel:19001234" 
                                    className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
                                >
                                    <Smartphone className="w-6 h-6 text-green-400" />
                                    <div>
                                        <div className="text-white font-medium">Gọi điện ngay</div>
                                        <div className="text-slate-400 text-sm">Nhân viên sẵn sàng hỗ trợ</div>
                                    </div>
                                </a>
                                <a 
                                    href="https://zalo.me/cyberops" 
                                    target="_blank"
                                    className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
                                >
                                    <MessageSquare className="w-6 h-6 text-blue-400" />
                                    <div>
                                        <div className="text-white font-medium">Chat Zalo</div>
                                        <div className="text-slate-400 text-sm">Nhắn tin nhanh qua Zalo</div>
                                    </div>
                                </a>
                                <a 
                                    href="https://facebook.com/cyberops" 
                                    target="_blank"
                                    className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
                                >
                                    <Facebook className="w-6 h-6 text-blue-500" />
                                    <div>
                                        <div className="text-white font-medium">Facebook</div>
                                        <div className="text-slate-400 text-sm">Theo dõi để cập nhật ưu đãi</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Additional Help */}
                <div className="mt-8 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-6 text-center">
                    <div className="flex justify-center mb-3">
                        <Gamepad2 className="w-12 h-12 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Cần hỗ trợ tại chỗ?</h3>
                    <p className="text-slate-400 mb-4">Hãy gọi nhân viên bằng cách nhấn nút chuông tại máy hoặc đến quầy lễ tân</p>
                    <div className="inline-flex items-center gap-2 bg-purple-600/30 text-purple-300 px-4 py-2 rounded-full text-sm">
                        <Headset className="w-4 h-4 animate-pulse" /> Nhân viên sẵn sàng 24/7
                    </div>
                </div>
            </div>
        </div>
    );
}
