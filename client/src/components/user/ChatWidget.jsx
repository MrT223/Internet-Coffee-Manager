'use client';
import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

let socket;

const ChatWidget = ({ user: propUser }) => {
  const { user: contextUser } = useAuth();
  const user = propUser || contextUser; // Ưu tiên user được truyền vào

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [userList, setUserList] = useState([]);
  const [hasNewMsg, setHasNewMsg] = useState(false); 

  const messagesEndRef = useRef(null);
  const safeId = (id) => String(id);

  // URL Socket (Lấy từ env hoặc fallback)
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3636";

  useEffect(() => {
    if (user) {
      if (!socket || !socket.connected) {
        socket = io(SOCKET_URL);
      }

      socket.emit("identify", user);

      socket.on("receive_message", (msg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.message_id === msg.message_id)) return prev;
          return [...prev, msg];
        });

        // Nếu widget đang đóng, bật thông báo chấm đỏ
        if (!isOpen) setHasNewMsg(true);

        // Logic cập nhật danh sách cho Admin
        if (user.role_id !== 3 && msg.conversation_id) {
          setUserList((prevList) => {
            const exists = prevList.find(
              (u) => safeId(u.id) === safeId(msg.conversation_id)
            );

            if (!exists) {
              const name = msg.role_id === 3
                  ? msg.sender_name
                  : `Khách ${msg.conversation_id}`;
              return [...prevList, { id: msg.conversation_id, name: name }];
            }
            return prevList;
          });
        }
      });

      socket.on("history_loaded", (msgs) => {
        setMessages(msgs);
      });

      socket.on("conversations_list", (list) => {
        setUserList(list);
      });

      // Load dữ liệu ban đầu
      if (user.role_id === 3) {
        socket.emit("load_history", { conversation_id: user.user_id || user.id });
      } else {
        socket.emit("get_conversations");
      }

      return () => {
        socket.off("receive_message");
        socket.off("history_loaded");
        socket.off("conversations_list");
      };
    }
  }, [user, SOCKET_URL, isOpen]);

  // Tự động cuộn xuống cuối khi có tin nhắn mới hoặc mở chat
  useEffect(() => {
    if (isOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setHasNewMsg(false); // Đã xem tin nhắn
    }
  }, [messages, isOpen, activeChatId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !socket) return;

    if (user.role_id === 3) {
      socket.emit("user_send_message", { content: inputMsg });
    } else {
      if (!activeChatId) return alert("Vui lòng chọn khách hàng để chat!");
      socket.emit("admin_send_message", {
        target_user_id: activeChatId,
        content: inputMsg,
      });
    }
    setInputMsg("");
  };

  const selectUserToChat = (targetId) => {
    setActiveChatId(targetId);
    setMessages([]);
    socket.emit("load_history", { conversation_id: targetId });
  };

  const displayMessages = messages.filter((m) => {
    if (!user) return false;
    if (user.role_id === 3) return true; // Khách xem hết tin của mình
    return safeId(m.conversation_id) === safeId(activeChatId); // Admin chỉ xem tin của khách đang chọn
  });

  if (!user) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end pointer-events-none">
      
      {/* CỬA SỔ CHAT */}
      <div 
        className={`
            bg-slate-900 border border-blue-500/50 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] 
            mb-4 overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right pointer-events-auto
            ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none h-0'}
            ${user.role_id !== 3 ? 'w-[700px] h-[500px]' : 'w-[350px] h-[450px]'}
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-3 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
             <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
             </span>
             <span className="font-bold text-white text-sm tracking-wide">
                {user.role_id !== 3 ? "SYSTEM CONTROL" : "HỖ TRỢ TRỰC TUYẾN"}
             </span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-blue-200 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body Layout */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar danh sách khách (Chỉ dành cho Admin/Staff) */}
          {user.role_id !== 3 && (
            <div className="w-1/3 border-r border-slate-700 bg-slate-950 flex flex-col">
              <div className="p-3 text-xs font-bold text-slate-400 bg-slate-900 uppercase tracking-wider">
                Danh sách kết nối
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {userList.length === 0 ? (
                    <div className="p-4 text-slate-500 text-sm italic text-center">Chưa có kết nối</div>
                ) : (
                    userList.map((u) => (
                        <div 
                            key={u.id}
                            onClick={() => selectUserToChat(u.id)}
                            className={`p-3 cursor-pointer border-b border-slate-800 hover:bg-slate-800 transition-colors flex items-center gap-2
                                ${safeId(activeChatId) === safeId(u.id) ? 'bg-blue-900/30 border-l-4 border-l-blue-500' : 'text-slate-400'}
                            `}
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-400 border border-slate-600">
                                {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className={`text-sm font-medium ${safeId(activeChatId) === safeId(u.id) ? 'text-white' : ''}`}>
                                {u.name}
                            </span>
                        </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Khu vực tin nhắn chính */}
          <div className="flex-1 flex flex-col bg-slate-900 relative">
            
            {/* Danh sách tin nhắn */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
               {user.role_id !== 3 && !activeChatId ? (
                   <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                       <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                       </svg>
                       <p className="text-sm">Chọn một khách hàng để bắt đầu</p>
                   </div>
               ) : (
                   displayMessages.map((msg, idx) => {
                        const isMe = msg.sender_id === (user.user_id || user.id);
                        return (
                            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && (
                                    <span className="text-[10px] text-slate-400 mb-1 ml-1">{msg.sender_name}</span>
                                )}
                                <div 
                                    className={`
                                        max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-md break-words
                                        ${isMe 
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none' 
                                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                                        }
                                    `}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        );
                   })
               )}
               <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {(user.role_id === 3 || activeChatId) && (
                <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                    <input
                        className="flex-1 bg-slate-900 text-white border border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
                        value={inputMsg}
                        onChange={(e) => setInputMsg(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                    />
                    <button 
                        type="submit" 
                        disabled={!inputMsg.trim()}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
                    >
                        <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            )}
          </div>
        </div>
      </div>

      {/* NÚT BẬT/TẮT WIDGET */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
            relative w-14 h-14 rounded-full shadow-[0_4px_20px_rgba(37,99,235,0.4)] pointer-events-auto
            flex items-center justify-center text-white text-2xl transition-all duration-300 hover:-translate-y-1
            ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-[0_4px_25px_rgba(37,99,235,0.6)]'}
        `}
      >
        {isOpen ? (
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
             </svg>
        ) : (
            <>
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {/* Chấm đỏ báo tin mới */}
                {hasNewMsg && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-slate-900"></span>
                    </span>
                )}
            </>
        )}
      </button>
    </div>
  );
}

export default ChatWidget;