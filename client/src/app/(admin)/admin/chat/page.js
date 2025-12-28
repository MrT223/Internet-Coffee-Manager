'use client';
import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { useChatNotification } from "@/context/ChatContext";

let socket;

export default function AdminChatPage() {
    const { user, loading: authLoading } = useAuth();
    const { clearUnread } = useChatNotification() || {};
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const [activeChatId, setActiveChatId] = useState(null);
    const [userList, setUserList] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState(new Map());
    const [lastActivity, setLastActivity] = useState(new Map());
    const messagesEndRef = useRef(null);

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3636";

    useEffect(() => {
        if (user && !authLoading) {
            if (!socket || !socket.connected) {
                socket = io(SOCKET_URL);
            }

            socket.emit("identify", {
                id: user.user_id || user.id,
                user_id: user.user_id || user.id,
                name: user.user_name || user.name,
                user_name: user.user_name || user.name,
                role_id: user.role_id
            });

            socket.on("receive_message", (msg) => {
                setMessages((prev) => {
                    if (prev.some((m) => m.message_id === msg.message_id)) return prev;
                    return [...prev, msg];
                });
                
                // Track unread và lastActivity khi nhận tin từ user
                if (msg.role_id === 3 && msg.conversation_id) {
                    const now = Date.now();
                    // Update lastActivity
                    setLastActivity(prev => {
                        const newMap = new Map(prev);
                        newMap.set(msg.conversation_id, now);
                        return newMap;
                    });
                    // Update unread nếu không đang xem conversation đó
                    if (msg.conversation_id !== activeChatId) {
                        setUnreadCounts(prev => {
                            const newMap = new Map(prev);
                            newMap.set(msg.conversation_id, (prev.get(msg.conversation_id) || 0) + 1);
                            return newMap;
                        });
                    }
                }
            });

            socket.on("new_conversation", (conv) => {
                setUserList((prev) => {
                    if (prev.some(c => c.id === conv.id)) return prev;
                    return [...prev, { id: conv.id, name: conv.user_name, user_id: conv.user_id }];
                });
                // Đánh dấu conversation mới có unread
                setUnreadCounts(prev => {
                    const newMap = new Map(prev);
                    newMap.set(conv.id, 1);
                    return newMap;
                });
                setLastActivity(prev => {
                    const newMap = new Map(prev);
                    newMap.set(conv.id, Date.now());
                    return newMap;
                });
            });

            socket.on("history_loaded", (msgs) => {
                setMessages(msgs);
            });

            socket.on("conversations_list", (list) => {
                setUserList(list);
            });

            // Nhận unread details từ server
            socket.on("unread_details", (details) => {
                console.log("[AdminChat] Received unread_details:", details);
                const newCounts = new Map();
                const newActivity = new Map();
                for (const [key, value] of Object.entries(details)) {
                    newCounts.set(key, value.count);
                    newActivity.set(key, value.lastTime);
                }
                setUnreadCounts(newCounts);
                setLastActivity(newActivity);
            });

            socket.emit("get_my_conversations");
            socket.emit("get_unread_details");
            
            // Clear unread count trên sidebar
            if (clearUnread) clearUnread();

            return () => {
                socket.off("receive_message");
                socket.off("history_loaded");
                socket.off("conversations_list");
                socket.off("new_conversation");
                socket.off("unread_details");
            };
        }
    }, [user, authLoading, SOCKET_URL]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputMsg.trim() || !socket || !activeChatId) return;

        socket.emit("admin_send_message", {
            conversation_id: activeChatId,
            content: inputMsg,
        });
        
        // Update lastActivity khi gửi tin
        setLastActivity(prev => {
            const newMap = new Map(prev);
            newMap.set(activeChatId, Date.now());
            return newMap;
        });
        
        setInputMsg("");
    };

    const selectUserToChat = (targetId) => {
        setActiveChatId(targetId);
        setMessages([]);
        socket.emit("load_history", { conversation_id: targetId });
        socket.emit("mark_as_read", { conversation_id: targetId });
        
        // Clear unread cho conversation này
        setUnreadCounts(prev => {
            const newMap = new Map(prev);
            newMap.delete(targetId);
            return newMap;
        });
    };

    // Sort userList theo lastActivity (người mới nhắn lên đầu)
    const sortedUserList = [...userList].sort((a, b) => {
        const timeA = lastActivity.get(a.id) || 0;
        const timeB = lastActivity.get(b.id) || 0;
        return timeB - timeA;
    });

    const displayMessages = activeChatId ? messages : [];

    if (authLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-slate-400">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col">
            <div className="mb-4">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                    💬 Hỗ Trợ Khách Hàng
                </h1>
                <p className="text-slate-400 text-sm">Trả lời tin nhắn từ khách hàng</p>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* User List */}
                <div className="w-64 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
                    <div className="p-3 bg-slate-800 border-b border-slate-700">
                        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Khách hàng ({userList.length})</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {sortedUserList.length === 0 ? (
                            <div className="p-4 text-slate-500 text-sm text-center">Chưa có tin nhắn</div>
                        ) : (
                            sortedUserList.map((conv) => {
                                const unreadCount = unreadCounts.get(conv.id) || 0;
                                return (
                                    <div
                                        key={conv.id}
                                        onClick={() => selectUserToChat(conv.id)}
                                        className={`p-3 cursor-pointer border-b border-slate-800 hover:bg-slate-800 transition-colors flex items-center gap-3
                                            ${activeChatId === conv.id ? 'bg-blue-900/30 border-l-4 border-l-blue-500' : ''}
                                        `}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-blue-400">
                                            {(conv.name || conv.user_name)?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`font-medium ${activeChatId === conv.id ? 'text-white' : 'text-slate-400'}`}>
                                                {conv.name || conv.user_name}
                                            </div>
                                            <div className="text-xs text-slate-500">ID: {conv.user_id}</div>
                                        </div>
                                        {/* Badge số tin nhắn chưa đọc */}
                                        {unreadCount > 0 && (
                                            <span className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 animate-pulse">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
                    {!activeChatId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p>Chọn một khách hàng để bắt đầu hỗ trợ</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-3 bg-slate-800 border-b border-slate-700 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">
                                    {(userList.find(c => c.id === activeChatId)?.name || userList.find(c => c.id === activeChatId)?.user_name)?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div>
                                    <div className="font-bold text-white">
                                        {userList.find(c => c.id === activeChatId)?.name || userList.find(c => c.id === activeChatId)?.user_name || 'Khách hàng'}
                                    </div>
                                    <div className="text-xs text-green-400 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        Đang hỗ trợ
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {displayMessages.map((msg) => (
                                    <div
                                        key={msg.message_id}
                                        className={`flex ${msg.role_id !== 3 ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                            msg.role_id !== 3
                                                ? 'bg-blue-600 text-white rounded-br-md'
                                                : 'bg-slate-800 text-slate-100 rounded-bl-md'
                                        }`}>
                                            <p className="text-sm">{msg.content}</p>
                                            <span className="text-[10px] opacity-60 mt-1 block">
                                                {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSend} className="p-3 border-t border-slate-700 flex gap-2">
                                <input
                                    type="text"
                                    value={inputMsg}
                                    onChange={(e) => setInputMsg(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 bg-slate-800 text-white px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
                                >
                                    Gửi
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
