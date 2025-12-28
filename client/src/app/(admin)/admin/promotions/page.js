'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaGift, FaBullhorn, FaCalendarAlt } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3636/api';

// Format date cho input datetime-local (Vietnam timezone)
const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    // Adjust to Vietnam timezone
    const offset = 7 * 60; // UTC+7 in minutes
    const localDate = new Date(date.getTime() + (offset + date.getTimezoneOffset()) * 60000);
    return localDate.toISOString().slice(0, 16);
};

// Format date hiển thị
const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('vi-VN', { 
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const typeLabels = {
    announcement: { label: 'Thông báo', icon: FaBullhorn, color: 'bg-blue-500' },
    topup_bonus: { label: 'Nạp tiền +%', icon: FaGift, color: 'bg-green-500' },
    event: { label: 'Sự kiện', icon: FaCalendarAlt, color: 'bg-purple-500' },
};

export default function PromotionsPage() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { confirm } = useConfirm();
    const [showModal, setShowModal] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [filter, setFilter] = useState('all'); // all, active, expired
    const [form, setForm] = useState({
        title: '',
        description: '',
        type: 'announcement',
        bonus_percent: 0,
        min_amount: 0,
        start_date: '',
        end_date: '',
        is_active: true,
        image_url: '',
    });

    const fetchPromotions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/promotions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPromotions(res.data);
        } catch (err) {
            console.error('Error fetching promotions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const openAddModal = () => {
        setEditingPromotion(null);
        setForm({
            title: '',
            description: '',
            type: 'announcement',
            bonus_percent: 0,
            min_amount: 0,
            start_date: '',
            end_date: '',
            is_active: true,
            image_url: '',
        });
        setShowModal(true);
    };

    const openEditModal = (promo) => {
        setEditingPromotion(promo);
        setForm({
            title: promo.title,
            description: promo.description || '',
            type: promo.type,
            bonus_percent: promo.bonus_percent,
            min_amount: promo.min_amount,
            start_date: formatDateForInput(promo.start_date),
            end_date: formatDateForInput(promo.end_date),
            is_active: promo.is_active,
            image_url: promo.image_url || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = { ...form };

            if (editingPromotion) {
                await axios.put(`${API_URL}/promotions/${editingPromotion.promotion_id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/promotions`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchPromotions();
        } catch (err) {
            console.error('Error saving promotion:', err);
            toast.error('Lỗi khi lưu khuyến mãi');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: 'Xác nhận xóa',
            message: 'Bạn có chắc muốn xóa khuyến mãi này?',
            type: 'danger',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
        });
        if (!confirmed) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/promotions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPromotions();
        } catch (err) {
            console.error('Error deleting promotion:', err);
        }
    };

    const handleToggle = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/promotions/${id}/toggle`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPromotions();
        } catch (err) {
            console.error('Error toggling promotion:', err);
        }
    };

    const isExpired = (endDate) => new Date(endDate) < new Date();
    const isActive = (promo) => promo.is_active && !isExpired(promo.end_date) && new Date(promo.start_date) <= new Date();

    const filteredPromotions = promotions.filter(p => {
        if (filter === 'active') return isActive(p);
        if (filter === 'expired') return isExpired(p.end_date);
        return true;
    });

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="text-slate-400">Đang tải...</div></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                        🎁 Quản lý Khuyến mãi
                    </h1>
                    <p className="text-slate-400 text-sm">Quản lý thông báo, sự kiện và khuyến mãi nạp tiền</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <FaPlus /> Thêm mới
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {[
                    { key: 'all', label: 'Tất cả' },
                    { key: 'active', label: 'Đang diễn ra' },
                    { key: 'expired', label: 'Đã kết thúc' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === tab.key
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Promotions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPromotions.map(promo => {
                    const TypeIcon = typeLabels[promo.type]?.icon || FaBullhorn;
                    const expired = isExpired(promo.end_date);
                    const active = isActive(promo);

                    return (
                        <div
                            key={promo.promotion_id}
                            className={`bg-slate-900 border rounded-xl p-4 ${
                                expired ? 'border-slate-700 opacity-60' : active ? 'border-green-500/50' : 'border-slate-700'
                            }`}
                        >
                            {/* Type Badge */}
                            <div className="flex items-center justify-between mb-3">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${typeLabels[promo.type]?.color}`}>
                                    <TypeIcon className="w-3 h-3" />
                                    {typeLabels[promo.type]?.label}
                                </span>
                                <div className="flex items-center gap-2">
                                    {promo.type === 'topup_bonus' && (
                                        <span className="text-green-400 font-bold">+{promo.bonus_percent}%</span>
                                    )}
                                    <button onClick={() => handleToggle(promo.promotion_id)} className="text-slate-400 hover:text-white">
                                        {promo.is_active ? <FaToggleOn className="w-5 h-5 text-green-500" /> : <FaToggleOff className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Title & Description */}
                            <h3 className="text-lg font-bold text-white mb-1">{promo.title}</h3>
                            <p className="text-slate-400 text-sm mb-3 line-clamp-2">{promo.description}</p>

                            {/* Date Range */}
                            <div className="text-xs text-slate-500 mb-3">
                                <div>Từ: {formatDateDisplay(promo.start_date)}</div>
                                <div>Đến: {formatDateDisplay(promo.end_date)}</div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-medium px-2 py-1 rounded ${
                                    expired ? 'bg-red-500/20 text-red-400' : 
                                    active ? 'bg-green-500/20 text-green-400' : 
                                    'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                    {expired ? 'Đã kết thúc' : active ? 'Đang diễn ra' : 'Chưa bắt đầu'}
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(promo)} className="p-2 text-slate-400 hover:text-blue-400 transition-colors">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDelete(promo.promotion_id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredPromotions.length === 0 && (
                <div className="text-center py-12 text-slate-500">Chưa có khuyến mãi nào</div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-slate-700">
                            <h2 className="text-lg font-bold text-white">
                                {editingPromotion ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Tiêu đề *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({...form, title: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Mô tả</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({...form, description: e.target.value})}
                                    rows={3}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Loại</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({...form, type: e.target.value})}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="announcement">Thông báo</option>
                                        <option value="topup_bonus">Nạp tiền +%</option>
                                        <option value="event">Sự kiện</option>
                                    </select>
                                </div>
                                {form.type === 'topup_bonus' && (
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">% Bonus</label>
                                        <input
                                            type="number"
                                            value={form.bonus_percent}
                                            onChange={(e) => setForm({...form, bonus_percent: parseInt(e.target.value) || 0})}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                )}
                            </div>
                            {form.type === 'topup_bonus' && (
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Nạp tối thiểu (VNĐ)</label>
                                    <input
                                        type="number"
                                        value={form.min_amount}
                                        onChange={(e) => setForm({...form, min_amount: parseInt(e.target.value) || 0})}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Bắt đầu *</label>
                                    <input
                                        type="datetime-local"
                                        value={form.start_date}
                                        onChange={(e) => setForm({...form, start_date: e.target.value})}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Kết thúc *</label>
                                    <input
                                        type="datetime-local"
                                        value={form.end_date}
                                        onChange={(e) => setForm({...form, end_date: e.target.value})}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={form.is_active}
                                    onChange={(e) => setForm({...form, is_active: e.target.checked})}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="is_active" className="text-sm text-slate-400">Kích hoạt</label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    {editingPromotion ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
