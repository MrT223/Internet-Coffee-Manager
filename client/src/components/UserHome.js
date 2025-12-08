import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function UserHome() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const styles = {
    container: {
      padding: "40px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
      maxWidth: "500px",
      textAlign: "center",
    },
    avatar: {
      fontSize: "50px",
      marginBottom: "10px",
    },
    welcome: {
      margin: "10px 0",
      color: "#333",
    },
    balance: {
      fontSize: "24px",
      color: "#28a745",
      fontWeight: "bold",
      margin: "20px 0",
      padding: "15px",
      backgroundColor: "#e8f5e9",
      borderRadius: "10px",
      border: "1px solid #c3e6cb",
    },
    btnGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      marginTop: "20px",
    },
    btnPrimary: {
      padding: "15px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "18px",
      cursor: "pointer",
      transition: "background 0.3s",
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
    },
    btnSecondary: {
      padding: "12px",
      backgroundColor: "#6c757d",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.avatar}>👤</div>
        <h2 style={styles.welcome}>Xin chào, {user?.name || "Game thủ"}!</h2>

        <div style={styles.balance}>
          💰 Số dư: {user?.balance ? user.balance.toLocaleString() : 0} VNĐ
        </div>

        <div style={styles.btnGroup}>
          <button
            style={styles.btnPrimary}
            onClick={() => navigate("/computers")}
          >
            🖥️ Đặt Máy Ngay
          </button>

          <button
            style={{ ...styles.btn, backgroundColor: "#6f42c1" }}
            onClick={() =>
              navigate("/computers", { state: { simulationMode: true } })
            }
          >
            🎮 Vào Chơi (Test WinForm)
          </button>

          <button
            style={{ ...styles.btnPrimary, backgroundColor: "#fd7e14" }}
            onClick={() => navigate("/user/menu")}
          >
            🍔 Gọi Đồ Ăn
          </button>

          <button style={styles.btnSecondary} onClick={handleLogout}>
            Đăng Xuất
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserHome;
