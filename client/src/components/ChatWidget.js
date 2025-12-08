import React, { useEffect, useState, useContext, useRef } from "react";
import io from "socket.io-client";
import { AuthContext } from "../context/AuthContext";

const socket = io("http://localhost:3636");

function ChatWidget() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");

  const [activeChatId, setActiveChatId] = useState(null);
  const [userList, setUserList] = useState([]); // Danh sách user bên trái

  const messagesEndRef = useRef(null);

  // --- 1. KẾT NỐI ---
  useEffect(() => {
    if (isAuthenticated && user) {
      socket.emit("identify", user);

      if (user.role_id === 3) {
        socket.emit("load_history", { conversation_id: user.id });
      } else {
        // Nếu là Admin -> Gọi ngay hàm lấy danh sách
        socket.emit("get_conversations");
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Nhận tin nhắn mới
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      // Nếu là Admin, khi có tin nhắn mới -> Cập nhật danh sách nếu chưa có
      if (user && user.role_id !== 3 && msg.conversation_id) {
        setUserList((prev) => {
          if (!prev.find((u) => u.id === msg.conversation_id)) {
            // Tên lấy tạm hoặc fetch lại
            const name =
              msg.role_id === 3
                ? msg.sender_name
                : `User ${msg.conversation_id}`;
            return [...prev, { id: msg.conversation_id, name }];
          }
          return prev;
        });
      }
    });

    // Nhận lịch sử chat
    socket.on("history_loaded", (msgs) => {
      setMessages(msgs);
    });

    // --- NHẬN DANH SÁCH USER CHAT (MỚI) ---
    socket.on("conversations_list", (list) => {
      setUserList(list);
    });

    // Admin tự động yêu cầu list khi join
    socket.on("request_conversations", () => {
      socket.emit("get_conversations");
    });

    return () => {
      socket.off("receive_message");
      socket.off("history_loaded");
      socket.off("conversations_list");
      socket.off("request_conversations");
    };
  }, [user]);

  // Cuộn xuống cuối
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, activeChatId]);

  // --- GỬI TIN ---
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    if (user.role_id === 3) {
      socket.emit("user_send_message", { content: inputMsg });
    } else {
      if (!activeChatId) return alert("Chọn khách hàng để chat!");
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
    if (user.role_id === 3) return true;
    return m.conversation_id === activeChatId;
  });

  // Styles (Giữ nguyên)
  const styles = {
    widget: {
      position: "fixed",
      bottom: 20,
      right: 20,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
    },
    toggleBtn: {
      width: 60,
      height: 60,
      borderRadius: "50%",
      background: "#007bff",
      color: "#fff",
      border: "none",
      fontSize: 24,
      cursor: "pointer",
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    },
    chatBox: {
      width: user?.role_id !== 3 ? 600 : 320,
      height: 450,
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
      marginBottom: 15,
      display: isOpen ? "flex" : "none",
      overflow: "hidden",
      border: "1px solid #ddd",
    },
    adminLayout: { display: "flex", width: "100%", height: "100%" },
    sidebar: {
      width: "180px",
      borderRight: "1px solid #eee",
      background: "#f8f9fa",
      overflowY: "auto",
    },
    sidebarItem: (active) => ({
      padding: "10px",
      cursor: "pointer",
      borderBottom: "1px solid #eee",
      background: active ? "#e2e6ea" : "transparent",
      fontWeight: active ? "bold" : "normal",
    }),
    mainChat: { flex: 1, display: "flex", flexDirection: "column" },
    header: {
      padding: 10,
      background: "#007bff",
      color: "#fff",
      fontWeight: "bold",
      display: "flex",
      justifyContent: "space-between",
    },
    msgArea: { flex: 1, padding: 10, overflowY: "auto", background: "#f1f1f1" },
    inputArea: { padding: 10, borderTop: "1px solid #eee", display: "flex" },
    input: { flex: 1, padding: 8, borderRadius: 4, border: "1px solid #ccc" },
    sendBtn: {
      marginLeft: 5,
      padding: "8px 15px",
      background: "#28a745",
      color: "#fff",
      border: "none",
      borderRadius: 4,
      cursor: "pointer",
    },
    bubble: (isMe) => ({
      maxWidth: "70%",
      padding: "8px 12px",
      borderRadius: 15,
      marginBottom: 5,
      fontSize: 14,
      alignSelf: isMe ? "flex-end" : "flex-start",
      background: isMe ? "#007bff" : "#fff",
      color: isMe ? "#fff" : "#000",
      border: isMe ? "none" : "1px solid #ddd",
      marginLeft: isMe ? "auto" : 0,
    }),
  };

  if (!isAuthenticated) return null;

  return (
    <div style={styles.widget}>
      <div style={styles.chatBox}>
        <div style={styles.header}>
          <span>
            {user.role_id !== 3 ? "🛡️ Hỗ Trợ Khách Hàng" : "💬 Chat Với Admin"}
          </span>
          <span style={{ cursor: "pointer" }} onClick={() => setIsOpen(false)}>
            ✖
          </span>
        </div>

        <div style={styles.adminLayout}>
          {/* SIDEBAR LIST */}
          {user.role_id !== 3 && (
            <div style={styles.sidebar}>
              <div
                style={{
                  padding: 10,
                  fontSize: 12,
                  fontWeight: "bold",
                  color: "#666",
                  borderBottom: "1px solid #ddd",
                }}
              >
                DANH SÁCH KHÁCH
              </div>
              {userList.length === 0 ? (
                <div style={{ padding: 10, fontSize: 12, fontStyle: "italic" }}>
                  Chưa có ai chat
                </div>
              ) : (
                userList.map((u) => (
                  <div
                    key={u.id}
                    style={styles.sidebarItem(activeChatId === u.id)}
                    onClick={() => selectUserToChat(u.id)}
                  >
                    👤 {u.name}
                  </div>
                ))
              )}
            </div>
          )}

          <div style={styles.mainChat}>
            <div style={styles.msgArea}>
              {user.role_id !== 3 && !activeChatId ? (
                <div
                  style={{ textAlign: "center", marginTop: 100, color: "#888" }}
                >
                  👈 Chọn khách hàng bên trái để chat
                </div>
              ) : (
                displayMessages.map((msg, idx) => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div key={idx} style={styles.bubble(isMe)}>
                      {!isMe && (
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: "bold",
                            marginBottom: 2,
                          }}
                        >
                          {msg.sender_name}
                        </div>
                      )}
                      {msg.content}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {(user.role_id === 3 || activeChatId) && (
              <form style={styles.inputArea} onSubmit={handleSend}>
                <input
                  style={styles.input}
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                />
                <button style={styles.sendBtn} type="submit">
                  Gửi
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <button style={styles.toggleBtn} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "⬇" : "💬"}
      </button>
    </div>
  );
}

export default ChatWidget;
