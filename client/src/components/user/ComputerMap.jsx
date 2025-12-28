'use client';
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import axiosClient from '@/api/axios';
import { useRouter, useSearchParams } from "next/navigation";

// Cấu hình Grid
const GRID_SIZE = 25;

// Icons
const MonitorIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v10h16V6H4zm2 14h12v2H6v-2z"/>
    </svg>
);

const UserIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

const ComputerMap = () => {
    const { user, updateUserBalance, updateUserStatus } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Check mode từ URL (?mode=simulation)
    const isSimulationMode = searchParams.get('mode') === 'simulation';

    const [computers, setComputers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modals state
    const [adminModal, setAdminModal] = useState({ show: false, computer: null });
    const [userModal, setUserModal] = useState({ show: false, computer: null });

    const canManage = user && (user.role_id === 1 || user.role_id === 2);
    const isUser = user && user.role_id === 3;

    // --- API CALLS ---
    const fetchComputers = useCallback(async () => {
        try {
            const res = await axiosClient.get("/computers");
            setComputers(res.data);
        } catch (error) {
            console.error("Lỗi tải bản đồ", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchComputers();
        // Auto refresh mỗi 30s
        const interval = setInterval(fetchComputers, 30000);
        return () => clearInterval(interval);
    }, [fetchComputers]);

    // --- HANDLERS ---

    // 1. Admin thêm máy
    const handleEmptyCellClick = async (x, y) => {
        if (!canManage) return;
        
        const name = prompt(`Thêm máy mới tại vị trí [${x},${y}]?`, `MAY-${x}-${y}`);
        if (name) {
            try {
                await axiosClient.post("/computers", { x, y, computer_name: name });
                alert(`Đã thêm máy ${name}`);
                fetchComputers();
            } catch (e) {
                alert("Lỗi khi thêm máy mới: " + (e.response?.data?.message || e.message));
            }
        }
    };

    // 2. Click vào máy
    const handleComputerClick = (comp) => {
        if (canManage) {
            setAdminModal({ show: true, computer: comp });
        } else if (isSimulationMode) {
            handleSimulationLogin(comp);
        } else if (isUser) {
            if (comp.status !== "trong") {
                alert("Máy này không khả dụng!");
                return;
            }
            setUserModal({ show: true, computer: comp });
        }
    };

    // 3. Giả lập đăng nhập (Simulation)
    const handleSimulationLogin = async (comp) => {
        if (comp.status !== "trong" && comp.status !== "dat truoc") {
            return alert("Chỉ có thể vào máy Trống hoặc máy Đã đặt!");
        }
        if (comp.status === "dat truoc" && comp.CurrentUser?.user_id !== user.user_id) {
            return alert("Máy này đã được người khác đặt!");
        }

        if (!window.confirm(`[GIẢ LẬP] Bạn muốn ngồi vào máy ${comp.computer_name}?`)) return;

        try {
            const res = await axiosClient.post("/computers/start-session", { 
                computerId: comp.computer_id, 
                userId: user.user_id || user.id 
            });
            
            alert(res.data.message);
            
            if (res.data.new_balance !== undefined) updateUserBalance(res.data.new_balance);
            if (res.data.new_status !== undefined) updateUserStatus(res.data.new_status);
            
            fetchComputers();
            router.push("/dashboard");
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi kết nối giả lập");
        }
    };

    // 4. User Đặt máy (Booking)
    const confirmBooking = async () => {
        const comp = userModal.computer;
        try {
            const res = await axiosClient.post(`/computers/${comp.computer_id}/book`);
            alert(res.data.message);
            if (res.data.newBalance !== undefined) updateUserBalance(res.data.newBalance);
            setUserModal({ show: false, computer: null });
            fetchComputers();
        } catch (error) {
            alert(error.response?.data?.message || "Đặt máy thất bại");
            setUserModal({ show: false, computer: null });
        }
    };

    // 5. Admin Action
    const handleAdminAction = async (actionType) => {
        const comp = adminModal.computer;
        if (!comp) return;
        try {
            let url = `/computers/${comp.computer_id}`;
            let body = {};

            if (actionType === "force_logout") {
                if (!window.confirm("Bạn chắc chắn muốn ĐUỔI người chơi này?")) return;
                await axiosClient.post(`${url}/force-logout`);
            } else if (actionType === "refund") {
                if (!window.confirm("Hủy đặt cọc và hoàn tiền?")) return;
                await axiosClient.post(`${url}/refund`);
            } else {
                if (actionType === "delete") {
                    if (!window.confirm("Xóa máy khỏi bản đồ?")) return;
                    body = { action: "delete" };
                } else {
                    body = { status: actionType, action: "update_status" };
                }
                await axiosClient.put(url, body);
            }
            
            alert("Thao tác thành công!");
            setAdminModal({ show: false, computer: null });
            fetchComputers();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi thao tác Admin");
        }
    };

    // --- Helper Styles ---
    const getStatusStyle = (status) => {
        switch (status) {
            case "trong": return "bg-slate-800 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)] text-green-400";
            case "dat truoc": return "bg-slate-800 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)] text-yellow-400";
            case "co nguoi": return "bg-red-900/20 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] text-red-400";
            case "bao tri": return "bg-gray-800 border-gray-500 text-gray-400";
            case "khoa": return "bg-slate-950 border-slate-700 text-slate-600";
            default: return "bg-slate-800 border-slate-600";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "trong": return "TRỐNG";
            case "dat truoc": return "ĐẶT TRƯỚC";
            case "co nguoi": return "ONLINE";
            case "bao tri": return "BẢO TRÌ";
            default: return status.toUpperCase();
        }
    };

    // Tạo Map để truy xuất nhanh
    const computerMap = {};
    computers.forEach((c) => { computerMap[`${c.x}-${c.y}`] = c; });

    // --- RENDER ---
    return (
        <div className="flex flex-col items-center w-full bg-slate-950 min-h-screen p-4 text-white font-sans">
            {/* Header */}
            <div className="w-full max-w-7xl flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-800">
                
                <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    {isSimulationMode ? "🎮 Giả Lập Client Máy Trạm" : "🗺️ Sơ Đồ Phòng Máy Center"}
                </h2>

                <div className="flex gap-4 text-xs font-bold">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></span> Trống</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]"></span> Online</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_8px_#eab308]"></span> Đặt trước</div>
                </div>
            </div>

            {/* Grid Map */}
            <div className="w-full max-w-full overflow-auto custom-scrollbar p-2 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl">
                {loading ? (
                    <div className="h-96 flex items-center justify-center text-blue-400">Đang tải bản đồ...</div>
                ) : (
                    <div 
                        className="grid gap-2 mx-auto"
                        style={{ 
                            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(50px, 1fr))`,
                            width: 'fit-content'
                        }}
                    >
                        {Array.from({ length: GRID_SIZE }).map((_, row) => (
                            Array.from({ length: GRID_SIZE }).map((_, col) => {
                                const key = `${row}-${col}`;
                                const comp = computerMap[key];
                                
                                if (comp) {
                                    return (
                                        <div
                                            key={key}
                                            onClick={() => handleComputerClick(comp)}
                                            className={`
                                                w-12 h-12 md:w-14 md:h-14 rounded-md border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10 relative group
                                                ${getStatusStyle(comp.status)}
                                            `}
                                        >
                                            <MonitorIcon className="w-6 h-6 md:w-8 md:h-8 mb-1" />
                                            <span className="text-[10px] font-bold leading-none">{comp.computer_name.replace('Máy ', '')}</span>
                                            
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-3 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity border border-slate-600">
                                                {comp.computer_name} - {getStatusLabel(comp.status)}
                                                {comp.CurrentUser && <div className="text-blue-400">User: {comp.CurrentUser.user_name}</div>}
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div
                                            key={key}
                                            onClick={() => handleEmptyCellClick(row, col)}
                                            className={`
                                                w-12 h-12 md:w-14 md:h-14 rounded-md border border-slate-800/50 bg-slate-900/30
                                                ${canManage ? 'cursor-pointer hover:bg-slate-800 hover:border-slate-600' : ''}
                                            `}
                                        />
                                    );
                                }
                            })
                        ))}
                    </div>
                )}
            </div>

            {/* --- ADMIN MODAL --- */}
            {adminModal.show && adminModal.computer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-md w-full relative">
                        <button onClick={() => setAdminModal({ show: false, computer: null })} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
                        
                        <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                            <MonitorIcon className="w-6 h-6 text-blue-500" />
                            Quản lý {adminModal.computer.computer_name}
                        </h3>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Trạng thái:</span>
                                <span className={`font-bold px-2 py-0.5 rounded text-xs ${getStatusStyle(adminModal.computer.status)}`}>
                                    {getStatusLabel(adminModal.computer.status)}
                                </span>
                            </div>
                            
                            {(adminModal.computer.status === "co nguoi" || adminModal.computer.status === "dat truoc") && (
                                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                    <div className="flex items-center gap-2 mb-1">
                                        <UserIcon className="w-4 h-4 text-blue-400"/>
                                        <span className="text-sm text-white">
                                            Người chơi: <span className="font-bold text-blue-400">{adminModal.computer.CurrentUser?.user_name || "Unknown"}</span>
                                        </span>
                                    </div>
                                    {adminModal.computer.session_start_time && (
                                        <div className="text-xs text-slate-500 ml-6">
                                            Bắt đầu: {new Date(adminModal.computer.session_start_time).toLocaleTimeString()}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {adminModal.computer.status === "co nguoi" ? (
                                <button 
                                    onClick={() => handleAdminAction("force_logout")}
                                    className="col-span-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-900/50"
                                >
                                    ⛔ CƯỠNG CHẾ ĐĂNG XUẤT
                                </button>
                            ) : adminModal.computer.status === "dat truoc" ? (
                                <button 
                                    onClick={() => handleAdminAction("refund")}
                                    className="col-span-2 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold"
                                >
                                    💰 HỦY & HOÀN TIỀN
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => handleAdminAction("trong")} className="py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold">✅ Mở (Trống)</button>
                                    <button onClick={() => handleAdminAction("bao tri")} className="py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold">🛠️ Bảo trì</button>
                                    <button onClick={() => handleAdminAction("khoa")} className="py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold">🔒 Khóa</button>
                                    <button onClick={() => handleAdminAction("delete")} className="py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold">🗑️ Xóa máy</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- USER BOOKING MODAL --- */}
            {userModal.show && userModal.computer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                     <div className="bg-slate-900 border border-blue-500 p-6 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.2)] max-w-sm w-full text-center">
                        <h3 className="text-xl font-bold text-white mb-2">Xác nhận đặt máy</h3>
                        <p className="text-slate-300 mb-4">
                            Bạn muốn đặt trước <span className="text-blue-400 font-bold">{userModal.computer.computer_name}</span>?
                        </p>
                        <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30 mb-6">
                            <p className="text-sm text-slate-400">Phí đặt cọc giữ chỗ</p>
                            <p className="text-2xl font-bold text-green-400">5.000 đ</p>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setUserModal({ show: false, computer: null })}
                                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={confirmBooking}
                                className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-bold shadow-lg"
                            >
                                Xác Nhận
                            </button>
                        </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default ComputerMap;