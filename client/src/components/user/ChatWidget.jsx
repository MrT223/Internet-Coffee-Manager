'use client';
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChatNotification } from "@/context/ChatContext";

const ChatWidget = ({ user: propUser }) => {
  const { user: contextUser } = useAuth();
  const { getSocket, clearUnread, hasUnread, unreadCount } = useChatNotification() || {};
  const user = propUser || contextUser;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [userList, setUserList] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [hasNewMsg, setHasNewMsg] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState(new Map()); // Map<id, count>
  const [lastActivity, setLastActivity] = useState(new Map()); // Map<id, timestamp>
  const socketRef = useRef(null);

  const messagesEndRef = useRef(null);
  const safeId = (id) => String(id);

  const isAdmin = user && (user.role_id === 1 || user.role_id === 2);
  const isUser = user && user.role_id === 3;

  const userConversationId = isUser && selectedAdminId ? `${user.user_id || user.id}_${selectedAdminId}` : null;

  useEffect(() => {
    if (user && getSocket) {
      // Dùng shared socket từ ChatContext
      const socket = getSocket();
      socketRef.current = socket;

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
        
        // Đánh dấu tin nhắn mới
        if (!isOpen) setHasNewMsg(true);
        
        // Track unread count và last activity
        if (msg.conversation_id) {
          const myId = String(user?.user_id || user?.id);
          const now = Date.now();
          
          // Admin: nếu tin từ user (role_id = 3)
          if (isAdmin && msg.role_id === 3) {
            const convId = msg.conversation_id;
            // Update unread count nếu không đang xem conversation đó
            if (convId !== activeChatId) {
              setUnreadCounts(prev => {
                const newMap = new Map(prev);
                newMap.set(convId, (prev.get(convId) || 0) + 1);
                return newMap;
              });
            }
            // Update last activity
            setLastActivity(prev => {
              const newMap = new Map(prev);
              newMap.set(convId, now);
              return newMap;
            });
          }
          
          // User: nếu tin từ admin
          if (isUser && msg.role_id !== 3) {
            const adminIdFromMsg = msg.conversation_id.split('_')[1];
            // Update unread count nếu không đang xem admin đó
            if (adminIdFromMsg !== String(selectedAdminId)) {
              setUnreadCounts(prev => {
                const newMap = new Map(prev);
                newMap.set(adminIdFromMsg, (prev.get(adminIdFromMsg) || 0) + 1);
                return newMap;
              });
            }
            // Update last activity
            setLastActivity(prev => {
              const newMap = new Map(prev);
              newMap.set(adminIdFromMsg, now);
              return newMap;
            });
          }
        }
      });

      socket.on("history_loaded", (msgs) => {
        setMessages(msgs);
      });

      socket.on("conversations_list", (list) => {
        setUserList(list);
      });

      socket.on("all_admins", (list) => {
        setAllAdmins(list);
      });

      // Admin nhận thông báo conversation mới
      socket.on("new_conversation", (conv) => {
        setUserList((prev) => {
          if (prev.some(c => c.id === conv.id)) return prev;
          return [...prev, { id: conv.id, name: conv.user_name, user_id: conv.user_id }];
        });
      });

      // Nhận unread details từ server
      socket.on("unread_details", (details) => {
        console.log("[ChatWidget] Received unread_details:", details);
        const newCounts = new Map();
        const newActivity = new Map();
        for (const [key, value] of Object.entries(details)) {
          newCounts.set(key, value.count);
          newActivity.set(key, value.lastTime);
        }
        setUnreadCounts(newCounts);
        setLastActivity(newActivity);
      });

      // Load dữ liệu ban đầu
      if (isUser) {
        socket.emit("get_all_admins");
      } else if (isAdmin) {
        socket.emit("get_my_conversations");
      }
      
      // Load unread details từ server
      socket.emit("get_unread_details");

      return () => {
        socket.off("receive_message");
        socket.off("history_loaded");
        socket.off("conversations_list");
        socket.off("all_admins");
        socket.off("new_conversation");
        socket.off("unread_details");
      };
    }
  }, [user, getSocket, isOpen, isAdmin, isUser]);

  useEffect(() => {
    if (isUser && selectedAdminId && socketRef.current) {
      const convId = `${user.user_id || user.id}_${selectedAdminId}`;
      setMessages([]);
      socketRef.current.emit("load_history", { conversation_id: convId });
    }
  }, [selectedAdminId, isUser, user]);

  // Load unread details mỗi khi mở widget
  useEffect(() => {
    if (isOpen && socketRef.current) {
      socketRef.current.emit("get_unread_details");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasNewMsg(false);
    }
  }, [messages, isOpen, activeChatId, selectedAdminId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !socketRef.current) return;

    const now = Date.now();
    
    if (isUser) {
      if (!selectedAdminId) return toast.warning("Vui lòng chọn nhân viên!");
      socketRef.current.emit("user_send_message", { 
        content: inputMsg,
        target_admin_id: selectedAdminId 
      });
      // Update lastActivity khi gửi tin
      setLastActivity(prev => {
        const newMap = new Map(prev);
        newMap.set(String(selectedAdminId), now);
        return newMap;
      });
    } else if (isAdmin) {
      if (!activeChatId) return toast.warning("Vui lòng chọn khách hàng!");
      socketRef.current.emit("admin_send_message", {
        conversation_id: activeChatId,
        content: inputMsg,
      });
      // Update lastActivity khi gửi tin
      setLastActivity(prev => {
        const newMap = new Map(prev);
        newMap.set(activeChatId, now);
        return newMap;
      });
    }
    setInputMsg("");
  };

  // Admin chọn conversation
  const selectConversation = (convId) => {
    setActiveChatId(convId);
    setMessages([]);
    if (socketRef.current) {
      socketRef.current.emit("load_history", { conversation_id: convId });
      socketRef.current.emit("mark_as_read", { conversation_id: convId });
    }
    // Clear unread count cho conversation này
    setUnreadCounts(prev => {
      const newMap = new Map(prev);
      newMap.delete(convId);
      return newMap;
    });
  };

  // User chọn admin
  const selectAdmin = (adminId) => {
    setSelectedAdminId(adminId);
    // Clear unread count cho admin này
    setUnreadCounts(prev => {
      const newMap = new Map(prev);
      newMap.delete(String(adminId));
      return newMap;
    });
    // Mark as read
    if (socketRef.current && user) {
      const convId = `${user.user_id || user.id}_${adminId}`;
      socketRef.current.emit("mark_as_read", { conversation_id: convId });
    }
  };

  // Filter messages
  const displayMessages = messages.filter((m) => {
    if (!user) return false;
    if (isUser && selectedAdminId) return true;
    if (isAdmin && activeChatId) return true;
    return false;
  });

  // Sort lists by lastActivity (người vừa nhắn lên đầu)
  const sortedAdmins = [...allAdmins].sort((a, b) => {
    const timeA = lastActivity.get(String(a.id)) || 0;
    const timeB = lastActivity.get(String(b.id)) || 0;
    return timeB - timeA; // Mới nhất lên đầu
  });

  const sortedUserList = [...userList].sort((a, b) => {
    const timeA = lastActivity.get(a.id) || 0;
    const timeB = lastActivity.get(b.id) || 0;
    return timeB - timeA;
  });

  if (!user) return null;

  const selectedAdminInfo = allAdmins.find(a => safeId(a.id) === safeId(selectedAdminId));

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end pointer-events-none">
      
      {/* CỬA SỔ CHAT */}
      <div 
        className={`
            bg-slate-900 border border-blue-500/50 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] 
            mb-4 overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right pointer-events-auto
            ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none h-0'}
            ${isAdmin ? 'w-[700px] h-[500px]' : 'w-[450px] h-[500px]'}
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
                {isAdmin ? "HỖ TRỢ KHÁCH HÀNG" : selectedAdminInfo ? `Chat với ${selectedAdminInfo.name}` : "HỖ TRỢ TRỰC TUYẾN"}
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
          
          {/* Sidebar */}
          <div className="w-1/3 border-r border-slate-700 bg-slate-950 flex flex-col">
            <div className="p-3 text-xs font-bold text-slate-400 bg-slate-900 uppercase tracking-wider">
              {isAdmin ? `Khách hàng (${userList.length})` : `Nhân viên (${allAdmins.length})`}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isUser ? (
                // User: Chọn admin để chat (sorted by activity)
                sortedAdmins.length === 0 ? (
                  <div className="p-4 text-slate-500 text-sm italic text-center">Không có nhân viên</div>
                ) : (
                  sortedAdmins.map((admin) => {
                    const unreadCount = unreadCounts.get(String(admin.id)) || 0;
                    return (
                      <div 
                        key={admin.id}
                        onClick={() => selectAdmin(admin.id)}
                        className={`p-3 border-b border-slate-800 flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-colors
                          ${safeId(selectedAdminId) === safeId(admin.id) ? 'bg-blue-900/30 border-l-4 border-l-blue-500' : ''}
                        `}
                      >
                        <div className="relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${admin.online ? 'bg-blue-600' : 'bg-slate-600'}`}>
                            {admin.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${admin.online ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${safeId(selectedAdminId) === safeId(admin.id) ? 'text-white' : admin.online ? 'text-white' : 'text-slate-500'}`}>
                            {admin.name}
                          </div>
                          <div className={`text-xs ${admin.online ? 'text-green-400' : 'text-slate-600'}`}>
                            {admin.role_name} • {admin.online ? 'Online' : 'Offline'}
                          </div>
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
                )
              ) : (
                // Admin: Danh sách conversations (sorted by activity)
                sortedUserList.length === 0 ? (
                  <div className="p-4 text-slate-500 text-sm italic text-center">Chưa có tin nhắn</div>
                ) : (
                  sortedUserList.map((conv) => {
                    const unreadCount = unreadCounts.get(conv.id) || 0;
                    return (
                      <div 
                        key={conv.id}
                        onClick={() => selectConversation(conv.id)}
                        className={`p-3 cursor-pointer border-b border-slate-800 hover:bg-slate-800 transition-colors flex items-center gap-2
                            ${activeChatId === conv.id ? 'bg-blue-900/30 border-l-4 border-l-blue-500' : 'text-slate-400'}
                        `}
                      >
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-400 border border-slate-600">
                            {(conv.name || conv.user_name)?.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <span className={`text-sm font-medium flex-1 ${activeChatId === conv.id ? 'text-white' : ''}`}>
                          {conv.name || conv.user_name}
                        </span>
                        {/* Badge số tin nhắn chưa đọc */}
                        {unreadCount > 0 && (
                          <span className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>

          {/* Khu vực tin nhắn */}
          <div className="flex-1 flex flex-col bg-slate-900 relative">
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
               {(isAdmin && !activeChatId) || (isUser && !selectedAdminId) ? (
                   <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                       <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                       </svg>
                       <p className="text-sm">{isUser ? 'Chọn nhân viên để nhắn tin' : 'Chọn khách hàng để hỗ trợ'}</p>
                   </div>
               ) : (
                   displayMessages.map((msg, idx) => {
                        const isMe = String(msg.sender_id) === String(user.user_id || user.id);
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
            {((isUser && selectedAdminId) || (isAdmin && activeChatId)) && (
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
                {/* Chấm đỏ với số tin nhắn - tính tổng từ unreadCounts */}
                {(() => {
                    const totalUnread = Array.from(unreadCounts.values()).reduce((sum, count) => sum + count, 0);
                    return (hasNewMsg || totalUnread > 0) && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-slate-900 items-center justify-center text-[10px] font-bold text-white">
                                {totalUnread > 0 ? (totalUnread > 9 ? '9+' : totalUnread) : ''}
                            </span>
                        </span>
                    );
                })()}
            </>
        )}
      </button>
    </div>
  );
}

export default ChatWidget;