import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Sử dụng useCallback để ghi nhớ hàm fetchUsers, tránh tạo lại mỗi lần render
  // Thêm 'token' vào dependency array vì hàm này sử dụng token
  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:3636/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response.data);
    } catch (error) {
      // Nếu lỗi 401/403 thì có thể token hết hạn, logout luôn
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        logout();
        navigate("/login");
      }
      alert(
        "Lỗi tải dữ liệu: " + (error.response?.data?.message || error.message)
      );
    }
  }, [token, logout, navigate]);

  // useEffect giờ đã an toàn với dependency [fetchUsers]
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const styles = {
    container: { padding: "20px", fontFamily: "Arial, sans-serif" },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    logoutBtn: {
      padding: "8px 16px",
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    },
    th: {
      border: "1px solid #ddd",
      padding: "12px",
      backgroundColor: "#007bff",
      color: "white",
      textAlign: "left",
    },
    td: { border: "1px solid #ddd", padding: "10px" },
    tr: { backgroundColor: "#fff" },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>👑 Quản Lý Người Dùng (Admin)</h2>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Đăng Xuất
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Tên Đăng Nhập</th>
            <th style={styles.th}>Vai Trò</th>
            <th style={styles.th}>Số Dư (VNĐ)</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id} style={styles.tr}>
              <td style={styles.td}>{user.user_id}</td>
              <td style={styles.td}>{user.user_name}</td>
              <td style={styles.td}>
                {user.role_id === 1 ? (
                  <b style={{ color: "red" }}>Admin</b>
                ) : user.role_id === 2 ? (
                  <b style={{ color: "green" }}>Staff</b>
                ) : (
                  "User"
                )}
              </td>
              <td style={styles.td}>{user.balance.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
