import React, { useEffect, useState, useContext, useRef } from "react";
import io from "socket.io-client";
import { AuthContext } from "../context/AuthContext";

// Khởi tạo socket (Singleton)
let socket;

function ChatWidget() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");

  const [activeChatId, setActiveChatId] = useState(null);
  const [userList, setUserList] = useState([]);

  const messagesEndRef = useRef(null);

  const safeId = (id) => String(id);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (!socket || !socket.connected) {
        socket = io("http://localhost:3636");
      }

      socket.emit("identify", user);

      socket.on("receive_message", (msg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.message_id === msg.message_id)) return prev;
          return [...prev, msg];
        });

        if (user.role_id !== 3 && msg.conversation_id) {
          setUserList((prevList) => {
            const exists = prevList.find(
              (u) => safeId(u.id) === safeId(msg.conversation_id)
            );

            if (!exists) {
              const name =
                msg.role_id === 3
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

      if (user.role_id === 3) {
        socket.emit("load_history", { conversation_id: user.id });
      } else {
        socket.emit("get_conversations");
      }

      return () => {
        socket.off("receive_message");
        socket.off("history_loaded");
        socket.off("conversations_list");
      };
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, activeChatId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

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
    if (user.role_id === 3) return true;
    return safeId(m.conversation_id) === safeId(activeChatId);
  });

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
      padding: "12px",
      cursor: "pointer",
      borderBottom: "1px solid #eee",
      background: active ? "#e2e6ea" : "transparent",
      fontWeight: active ? "bold" : "normal",
      fontSize: "14px",
    }),
    mainChat: { flex: 1, display: "flex", flexDirection: "column" },
    header: {
      padding: "12px",
      background: "#007bff",
      color: "#fff",
      fontWeight: "bold",
      display: "flex",
      justifyContent: "space-between",
    },
    msgArea: { flex: 1, padding: 10, overflowY: "auto", background: "#f1f1f1" },
    inputArea: {
      padding: 10,
      borderTop: "1px solid #eee",
      display: "flex",
      background: "#fff",
    },
    input: {
      flex: 1,
      padding: "8px 12px",
      borderRadius: 20,
      border: "1px solid #ccc",
      outline: "none",
    },
    sendBtn: {
      marginLeft: 8,
      padding: "8px 15px",
      background: "#28a745",
      color: "#fff",
      border: "none",
      borderRadius: 20,
      cursor: "pointer",
      fontWeight: "bold",
    },
    bubble: (isMe) => ({
      maxWidth: "75%",
      padding: "8px 12px",
      borderRadius: 15,
      marginBottom: 8,
      fontSize: 14,
      alignSelf: isMe ? "flex-end" : "flex-start",
      background: isMe ? "#007bff" : "#fff",
      color: isMe ? "#fff" : "#000",
      border: isMe ? "none" : "1px solid #ddd",
      marginLeft: isMe ? "auto" : 0,
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    }),
    senderName: {
      fontSize: 10,
      color: "#666",
      marginBottom: 2,
      fontWeight: "bold",
    },
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
          {user.role_id !== 3 && (
            <div style={styles.sidebar}>
              <div
                style={{
                  padding: 10,
                  fontSize: 12,
                  fontWeight: "bold",
                  color: "#666",
                  background: "#e9ecef",
                }}
              >
                DANH SÁCH
              </div>
              {userList.map((u) => (
                <div
                  key={u.id}
                  style={styles.sidebarItem(
                    safeId(activeChatId) === safeId(u.id)
                  )}
                  onClick={() => selectUserToChat(u.id)}
                >
                  👤 {u.name}
                </div>
              ))}
              {userList.length === 0 && (
                <div
                  style={{
                    padding: 10,
                    fontSize: 13,
                    fontStyle: "italic",
                    color: "#999",
                  }}
                >
                  Trống
                </div>
              )}
            </div>
          )}

          <div style={styles.mainChat}>
            <div style={styles.msgArea}>
              {user.role_id !== 3 && !activeChatId ? (
                <div
                  style={{ textAlign: "center", marginTop: 120, color: "#888" }}
                >
                  👈 Chọn khách hàng để chat
                </div>
              ) : (
                displayMessages.map((msg, idx) => {
                  const isMe = user && msg.sender_id === user.id;
                  return (
                    <div key={idx} style={styles.msgRow}>
                      <div style={styles.bubble(isMe)}>
                        {!isMe && (
                          <div style={styles.senderName}>{msg.sender_name}</div>
                        )}
                        {msg.content}
                      </div>
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
