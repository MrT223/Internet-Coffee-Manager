import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function MenuManager() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);

  const [newItem, setNewItem] = useState({
    food_name: "",
    price: "",
    image_url: "",
  });

  const canManage = user && (user.role_id === 1 || user.role_id === 2);

  const fetchMenu = async () => {
    try {
      const res = await axios.get("http://localhost:3636/api/menu", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenu(res.data);
    } catch (error) {
      console.error("Lỗi load menu");
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3636/api/menu", newItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Thêm món thành công!");
      setNewItem({ food_name: "", price: "", image_url: "" });
      fetchMenu();
    } catch (error) {
      alert("Lỗi thêm món");
    }
  };

  const toggleStock = async (item) => {
    try {
      await axios.put(
        `http://localhost:3636/api/menu/${item.item_id}`,
        { stock: !item.stock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMenu();
    } catch (error) {
      alert("Lỗi cập nhật");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa món này khỏi menu?")) return;
    try {
      await axios.delete(`http://localhost:3636/api/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMenu();
    } catch (error) {
      alert("Lỗi xóa");
    }
  };

  const styles = {
    container: { padding: "20px", maxWidth: "1000px", margin: "0 auto" },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    btnBack: {
      padding: "8px 15px",
      background: "#6c757d",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },

    formCard: {
      background: "#f8f9fa",
      padding: "20px",
      borderRadius: "10px",
      marginBottom: "30px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    },
    inputGroup: { display: "flex", gap: "10px", marginBottom: "10px" },
    input: {
      padding: "10px",
      flex: 1,
      borderRadius: "5px",
      border: "1px solid #ced4da",
    },
    btnAdd: {
      padding: "10px 20px",
      background: "#28a745",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "20px",
    },
    card: {
      border: "1px solid #eee",
      borderRadius: "10px",
      overflow: "hidden",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
      background: "white",
      position: "relative",
    },
    imgPlaceholder: {
      height: "120px",
      background: "#e9ecef",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "40px",
      color: "#adb5bd",
    },
    cardBody: { padding: "15px" },
    itemName: { margin: "0 0 5px 0", fontSize: "18px" },
    itemPrice: { color: "#dc3545", fontWeight: "bold", fontSize: "16px" },
    badge: (stock) => ({
      padding: "5px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      float: "right",
      background: stock ? "#d4edda" : "#f8d7da",
      color: stock ? "#155724" : "#721c24",
    }),
    actions: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "15px",
    },
    btnStock: {
      fontSize: "12px",
      padding: "5px 10px",
      cursor: "pointer",
      border: "1px solid #ccc",
      background: "white",
      borderRadius: "4px",
    },
    btnDel: {
      fontSize: "12px",
      padding: "5px 10px",
      cursor: "pointer",
      background: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "4px",
    },
  };

  if (!canManage)
    return (
      <h2 style={{ textAlign: "center", marginTop: 50 }}>
        ⛔ Bạn không có quyền quản lý Menu
      </h2>
    );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          style={styles.btnBack}
          onClick={() => navigate("/admin/dashboard")}
        >
          ⬅ Quay lại
        </button>
        <h2>🍔 Quản Lý Menu & Dịch Vụ</h2>
        <div style={{ width: 80 }}></div>
      </div>

      <div style={styles.formCard}>
        <h3>➕ Thêm Món Mới</h3>
        <form onSubmit={handleAdd}>
          <div style={styles.inputGroup}>
            <input
              style={styles.input}
              placeholder="Tên món (VD: Mì tôm trứng)"
              required
              value={newItem.food_name}
              onChange={(e) =>
                setNewItem({ ...newItem, food_name: e.target.value })
              }
            />
            <input
              style={styles.input}
              type="number"
              placeholder="Giá (VNĐ)"
              required
              value={newItem.price}
              onChange={(e) =>
                setNewItem({ ...newItem, price: e.target.value })
              }
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              style={styles.input}
              placeholder="Link ảnh minh họa (Tùy chọn)"
              value={newItem.image_url}
              onChange={(e) =>
                setNewItem({ ...newItem, image_url: e.target.value })
              }
            />
            <button type="submit" style={styles.btnAdd}>
              Lưu Món
            </button>
          </div>
        </form>
      </div>

      <div style={styles.grid}>
        {menu.map((item) => (
          <div
            key={item.item_id}
            style={{ ...styles.card, opacity: item.stock ? 1 : 0.6 }}
          >
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.food_name}
                style={{ width: "100%", height: "120px", objectFit: "cover" }}
              />
            ) : (
              <div style={styles.imgPlaceholder}>🍽️</div>
            )}

            <div style={styles.cardBody}>
              <span style={styles.badge(item.stock)}>
                {item.stock ? "Còn hàng" : "Hết hàng"}
              </span>
              <h4 style={styles.itemName}>{item.food_name}</h4>
              <div style={styles.itemPrice}>
                {item.price.toLocaleString()} đ
              </div>

              <div style={styles.actions}>
                <button
                  style={styles.btnStock}
                  onClick={() => toggleStock(item)}
                >
                  {item.stock ? "Báo Hết" : "Báo Có"}
                </button>
                <button
                  style={styles.btnDel}
                  onClick={() => handleDelete(item.item_id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuManager;
