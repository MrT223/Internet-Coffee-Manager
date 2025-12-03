import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function OrderManager() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  // Hàm tải dữ liệu
  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:3636/api/orders/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Lỗi tải đơn hàng");
    }
  };

  // Tự động refresh mỗi 10 giây
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Xử lý nút bấm
  const handleStatus = async (id, status) => {
    const actionName =
      status === "completed" ? "Hoàn thành" : "Hủy & Hoàn tiền";
    if (!window.confirm(`Bạn muốn ${actionName} đơn này?`)) return;

    try {
      await axios.put(
        `http://localhost:3636/api/orders/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchOrders();
    } catch (error) {
      alert("Lỗi cập nhật");
    }
  };

  // --- Styles ---
  const styles = {
    container: {
      padding: "20px",
      maxWidth: "800px",
      margin: "0 auto",
      fontFamily: "Arial",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "20px",
    },
    btnBack: {
      padding: "8px 15px",
      cursor: "pointer",
      background: "#6c757d",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
    },

    card: {
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "15px",
      marginBottom: "15px",
      backgroundColor: "#fff",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    topRow: {
      display: "flex",
      justifyContent: "space-between",
      borderBottom: "1px solid #eee",
      paddingBottom: "10px",
      marginBottom: "10px",
    },
    user: { fontWeight: "bold", color: "#007bff" },
    date: { fontSize: "12px", color: "#666" },

    // Status badges
    pending: {
      background: "#fff3cd",
      color: "#856404",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "bold",
    },
    completed: {
      background: "#d4edda",
      color: "#155724",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "bold",
    },
    cancelled: {
      background: "#f8d7da",
      color: "#721c24",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "bold",
    },

    list: { listStyle: "none", padding: 0, margin: "10px 0" },
    item: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "14px",
      padding: "4px 0",
    },

    actions: {
      display: "flex",
      gap: "10px",
      justifyContent: "flex-end",
      marginTop: "10px",
    },
    btnDone: {
      padding: "8px 12px",
      background: "#28a745",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
    btnCancel: {
      padding: "8px 12px",
      background: "#dc3545",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
  };

  const renderStatus = (s) => {
    if (s === "pending")
      return <span style={styles.pending}>⏳ Chờ xử lý</span>;
    if (s === "completed")
      return <span style={styles.completed}>✅ Đã xong</span>;
    return <span style={styles.cancelled}>❌ Đã hủy</span>;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          style={styles.btnBack}
          onClick={() => navigate("/admin/dashboard")}
        >
          ⬅ Dashboard
        </button>
        <h2>📋 Quản Lý Đơn Hàng</h2>
        <div style={{ width: 80 }}></div>
      </div>

      {orders.length === 0 ? (
        <p style={{ textAlign: "center" }}>Chưa có đơn hàng nào.</p>
      ) : (
        orders.map((order) => (
          <div key={order.bill_id} style={styles.card}>
            <div style={styles.topRow}>
              <div>
                <div style={styles.user}>
                  {order.User ? order.User.user_name : "Unknown"}
                </div>
                <div style={styles.date}>
                  {new Date(order.order_date).toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {renderStatus(order.status)}
                <div style={{ marginTop: 5, fontWeight: "bold" }}>
                  {order.total_amount.toLocaleString()} đ
                </div>
              </div>
            </div>

            <ul style={styles.list}>
              {order.OrderDetails &&
                order.OrderDetails.map((d) => (
                  <li key={d.detail_id} style={styles.item}>
                    <span>
                      • {d.MenuItem ? d.MenuItem.food_name : "Món đã xóa"}{" "}
                      <b style={{ color: "#555" }}>x{d.quantity}</b>
                    </span>
                    <span>{d.subtotal.toLocaleString()} đ</span>
                  </li>
                ))}
            </ul>

            {order.status === "pending" && (
              <div style={styles.actions}>
                <button
                  style={styles.btnCancel}
                  onClick={() => handleStatus(order.bill_id, "cancelled")}
                >
                  Hủy & Hoàn tiền
                </button>
                <button
                  style={styles.btnDone}
                  onClick={() => handleStatus(order.bill_id, "completed")}
                >
                  ✅ Phục vụ xong
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default OrderManager;
