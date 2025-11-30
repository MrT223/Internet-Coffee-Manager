import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // State cho form tạo mới
  const [newUser, setNewUser] = useState({
    user_name: "",
    password: "",
    role_id: 3,
  });

  // 1. Hàm lấy danh sách
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:3636/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 2. Xử lý Thêm User
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3636/api/admin/users", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Thêm thành công!");
      setNewUser({ user_name: "", password: "", role_id: 3 }); // Reset form
      fetchUsers(); // Tải lại bảng
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi thêm user");
    }
  };

  // 3. Xử lý Xóa User
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa user này?")) return;
    try {
      await axios.delete(`http://localhost:3636/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (error) {
      alert("Lỗi xóa user");
    }
  };

  // 4. Xử lý Nạp tiền nhanh
  const handleTopUp = async (id) => {
    const amount = prompt("Nhập số tiền muốn nạp (VNĐ):");
    if (!amount) return;
    try {
      await axios.put(
        `http://localhost:3636/api/admin/users/${id}/topup`,
        { amount: parseInt(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Nạp tiền thành công!");
      fetchUsers();
    } catch (error) {
      alert("Lỗi nạp tiền");
    }
  };

  const styles = {
    container: { padding: "20px", fontFamily: "Arial" },
    formBox: {
      background: "#f9f9f9",
      padding: "15px",
      marginBottom: "20px",
      borderRadius: "5px",
      border: "1px solid #ddd",
    },
    input: {
      padding: "8px",
      marginRight: "10px",
      border: "1px solid #ccc",
      borderRadius: "4px",
    },
    select: { padding: "8px", marginRight: "10px", borderRadius: "4px" },
    btnGreen: {
      padding: "8px 15px",
      background: "#28a745",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
    btnRed: {
      padding: "5px 10px",
      background: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      marginLeft: "5px",
    },
    btnBlue: {
      padding: "5px 10px",
      background: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "10px" },
    th: {
      background: "#343a40",
      color: "white",
      padding: "10px",
      textAlign: "left",
    },
    td: { padding: "10px", borderBottom: "1px solid #ddd" },
  };

  return (
    <div style={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>👑 Admin Dashboard</h2>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          style={styles.btnRed}
        >
          Đăng Xuất
        </button>
      </div>

      {/* Form thêm mới */}
      <div style={styles.formBox}>
        <h3>➕ Thêm Tài Khoản Mới</h3>
        <form onSubmit={handleAddUser}>
          <input
            style={styles.input}
            type="text"
            placeholder="Tên đăng nhập"
            required
            value={newUser.user_name}
            onChange={(e) =>
              setNewUser({ ...newUser, user_name: e.target.value })
            }
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Mật khẩu"
            required
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />
          <select
            style={styles.select}
            value={newUser.role_id}
            onChange={(e) =>
              setNewUser({ ...newUser, role_id: parseInt(e.target.value) })
            }
          >
            <option value={1}>Admin</option>
            <option value={2}>Staff</option>
            <option value={3}>User</option>
          </select>
          <button type="submit" style={styles.btnGreen}>
            Tạo Tài Khoản
          </button>
        </form>
      </div>

      {/* Bảng danh sách */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>User Name</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Số Dư</th>
            <th style={styles.th}>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_id}>
              <td style={styles.td}>{u.user_id}</td>
              <td style={styles.td}>{u.user_name}</td>
              <td style={styles.td}>
                {u.role_id === 1
                  ? "🔴 Admin"
                  : u.role_id === 2
                  ? "🟢 Staff"
                  : "User"}
              </td>
              <td style={styles.td}>{u.balance.toLocaleString()} đ</td>
              <td style={styles.td}>
                <button
                  style={styles.btnBlue}
                  onClick={() => handleTopUp(u.user_id)}
                >
                  💰 Nạp Tiền
                </button>
                {u.role_id !== 1 && ( // Không cho xóa Admin
                  <button
                    style={styles.btnRed}
                    onClick={() => handleDelete(u.user_id)}
                  >
                    🗑️ Xóa
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
