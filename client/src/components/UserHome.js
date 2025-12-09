import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function UserHome() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // State trạng thái để cập nhật realtime (nếu muốn)
  // Hiện tại lấy từ user context là đủ nếu user object được cập nhật đúng

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "playing":
        return {
          text: "🎮 Đang Chơi",
          color: "#004085",
          bg: "#cce5ff",
          border: "#b8daff",
        };
      case "online":
        return {
          text: "🟢 Online",
          color: "#155724",
          bg: "#d4edda",
          border: "#c3e6cb",
        };
      default:
        return {
          text: "⚫ Offline",
          color: "#383d41",
          bg: "#e2e3e5",
          border: "#d6d8db",
        };
    }
  };

  const statusStyle = getStatusLabel(user?.status);

  const styles = {
    container: {
      padding: "40px",
      fontFamily: "'Segoe UI', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      backgroundColor: "#f4f7f6",
      minHeight: "100vh",
    },
    card: {
      backgroundColor: "white",
      padding: "30px",
      borderRadius: "15px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      width: "100%",
      maxWidth: "450px",
      textAlign: "center",
    },
    avatar: { fontSize: "60px", marginBottom: "10px" },
    welcome: {
      margin: "5px 0",
      color: "#333",
      fontSize: "22px",
      fontWeight: "bold",
    },

    // --- STATUS BADGE MỚI ---
    statusBadge: {
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "14px",
      fontWeight: "bold",
      margin: "10px 0 20px",
      color: statusStyle.color,
      backgroundColor: statusStyle.bg,
      border: `1px solid ${statusStyle.border}`,
    },

    balanceBox: {
      fontSize: "20px",
      color: "#28a745",
      fontWeight: "bold",
      margin: "0 0 25px",
      padding: "15px",
      backgroundColor: "#e8f5e9",
      borderRadius: "10px",
      border: "1px solid #c3e6cb",
    },

    btnGroup: { display: "flex", flexDirection: "column", gap: "12px" },
    btn: {
      width: "100%",
      padding: "12px",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      cursor: "pointer",
      color: "white",
      fontWeight: "bold",
      transition: "0.2s",
    },
    btnPrimary: { backgroundColor: "#007bff" },
    btnPurple: { backgroundColor: "#6f42c1" },
    btnOrange: { backgroundColor: "#fd7e14" },
    btnGray: { backgroundColor: "#6c757d" },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.avatar}>👤</div>
        <h2 style={styles.welcome}>{user?.name || "Game thủ"}</h2>

        {/* HIỂN THỊ TRẠNG THÁI */}
        <div style={styles.statusBadge}>{statusStyle.text}</div>

        <div style={styles.balanceBox}>
          💰 {user?.balance ? user.balance.toLocaleString() : 0} VNĐ
        </div>

        <div style={styles.btnGroup}>
          <button
            style={{ ...styles.btn, ...styles.btnPrimary }}
            onClick={() => navigate("/computers")}
          >
            🖥️ Đặt Trước Máy
          </button>

          {/* Nút này chỉ dùng để test, thực tế sẽ ẩn */}
          <button
            style={{ ...styles.btn, ...styles.btnPurple }}
            onClick={() =>
              navigate("/computers", { state: { simulationMode: true } })
            }
          >
            🎮 Vào Chơi (Giả lập)
          </button>

          <button
            style={{ ...styles.btn, ...styles.btnOrange }}
            onClick={() => navigate("/user/menu")}
          >
            🍔 Gọi Đồ Ăn
          </button>

          <button
            style={{ ...styles.btn, ...styles.btnGray }}
            onClick={handleLogout}
          >
            Đăng Xuất
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserHome;
