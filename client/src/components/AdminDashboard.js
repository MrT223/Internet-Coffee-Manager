import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [newUser, setNewUser] = useState({
    user_name: "",
    password: "",
    role_id: 3,
  });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:3636/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (parseInt(newUser.role_id) === 1) {
      alert("Không được phép tạo thêm Admin!");
      return;
    }
    try {
      await axios.post("http://localhost:3636/api/admin/users", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Thêm thành công!");
      setNewUser({ user_name: "", password: "", role_id: 3 });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi thêm user");
    }
  };

  const handleRoleChange = async (userId, newRoleId) => {
    const roleMap = { 2: "Staff", 3: "User" };

    const confirmChange = window.confirm(
      `Bạn có chắc muốn đổi quyền user này thành "${roleMap[newRoleId]}" không?`
    );

    if (!confirmChange) {
      fetchUsers();
      return;
    }

    try {
      await axios.put(
        `http://localhost:3636/api/admin/users/${userId}/role`,
        { role_id: parseInt(newRoleId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi cập nhật quyền");
      fetchUsers();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa user này?")) return;
    try {
      await axios.delete(`http://localhost:3636/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi xóa user");
    }
  };

  const handleTopUp = async (id) => {
    const amount = prompt("Nhập số tiền muốn nạp (VNĐ):");
    if (!amount) return;

    if (isNaN(amount) || parseInt(amount) <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ!");
      return;
    }

    try {
      await axios.put(
        `http://localhost:3636/api/admin/users/${id}/topup`,
        { amount: parseInt(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Nạp tiền thành công!");
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi nạp tiền");
    }
  };

  const styles = {
    container: { padding: "20px", fontFamily: "Arial, sans-serif" },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    title: { color: "#333", margin: 0 },

    formBox: {
      background: "#f8f9fa",
      padding: "15px",
      marginBottom: "20px",
      borderRadius: "8px",
      border: "1px solid #e9ecef",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    formTitle: { marginTop: 0, marginBottom: "10px", fontSize: "16px" },

    input: {
      padding: "8px",
      marginRight: "10px",
      border: "1px solid #ced4da",
      borderRadius: "4px",
    },
    select: {
      padding: "8px",
      marginRight: "10px",
      borderRadius: "4px",
      border: "1px solid #ced4da",
    },

    tableSelect: {
      padding: "6px",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      cursor: "pointer",
      fontWeight: "bold",
      width: "100%",
      backgroundColor: "#fff",
    },

    btnRed: {
      padding: "6px 12px",
      background: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      marginLeft: "5px",
    },
    btnBlue: {
      padding: "6px 12px",
      background: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
    btnGreen: {
      padding: "8px 15px",
      background: "#28a745",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "10px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      background: "#fff",
    },
    th: {
      background: "#343a40",
      color: "white",
      padding: "12px",
      textAlign: "left",
    },
    td: {
      padding: "12px",
      borderBottom: "1px solid #dee2e6",
      verticalAlign: "middle",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>👑 Quản Lý Hệ Thống</h2>
        <div>
          <button
            onClick={() => navigate("/computers")}
            style={{ ...styles.btnBlue, marginRight: "10px" }}
            title="Xem và quản lý sơ đồ máy trạm"
          >
            🖥️ Sơ Đồ Máy
          </button>

          <button
            onClick={() => navigate("/admin/orders")}
            style={{
              ...styles.btnBlue,
              marginRight: "10px",
              backgroundColor: "#6f42c1",
            }}
          >
            📋 Đơn Hàng
          </button>

          <button
            onClick={() => navigate("/admin/menu")}
            style={{ ...styles.btnOrange, marginRight: "10px" }}
            title="Quản lý đồ ăn thức uống"
          >
            🍔 Menu Dịch Vụ
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            style={styles.btnRed}
            title="Đăng xuất khỏi hệ thống"
          >
            Đăng Xuất
          </button>
        </div>
      </div>

      <div style={styles.formBox}>
        <h3 style={styles.formTitle}>➕ Thêm Nhân Viên / Khách Hàng</h3>
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
            <option value={2}>Staff (Nhân viên)</option>
            <option value={3}>User (Khách)</option>
          </select>
          <button type="submit" style={styles.btnGreen}>
            Tạo Mới
          </button>
        </form>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Tên Đăng Nhập</th>
            <th style={styles.th} width="160px">
              Role (Quyền)
            </th>
            <th style={styles.th}>Số Dư (VNĐ)</th>
            <th style={styles.th}>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_id}>
              <td style={styles.td}>{u.user_id}</td>
              <td style={styles.td}>
                <b>{u.user_name}</b>
              </td>

              <td style={styles.td}>
                {u.role_id === 1 ? (
                  <span style={{ color: "red", fontWeight: "bold" }}>
                    🔴 Admin
                  </span>
                ) : (
                  <select
                    style={{
                      ...styles.tableSelect,
                      color: u.role_id === 2 ? "#28a745" : "#007bff",
                      borderColor: u.role_id === 2 ? "#28a745" : "#007bff",
                    }}
                    value={u.role_id}
                    onChange={(e) =>
                      handleRoleChange(u.user_id, e.target.value)
                    }
                  >
                    <option
                      value={2}
                      style={{ color: "green", fontWeight: "bold" }}
                    >
                      🟢 Staff
                    </option>
                    <option
                      value={3}
                      style={{ color: "blue", fontWeight: "bold" }}
                    >
                      👤 User
                    </option>
                  </select>
                )}
              </td>

              <td style={styles.td}>{u.balance.toLocaleString()} đ</td>

              <td style={styles.td}>
                <button
                  style={styles.btnBlue}
                  onClick={() => handleTopUp(u.user_id)}
                  title="Nạp tiền vào tài khoản"
                >
                  💰 Nạp
                </button>

                {u.role_id !== 1 && (
                  <button
                    style={styles.btnRed}
                    onClick={() => handleDelete(u.user_id)}
                    title="Xóa tài khoản này"
                  >
                    🗑️
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
