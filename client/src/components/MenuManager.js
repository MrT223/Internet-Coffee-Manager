import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function MenuManager() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);

  const [formData, setFormData] = useState({
    food_name: "",
    price: "",
    image_url: "",
  });
  const [editingId, setEditingId] = useState(null);

  const canManage = user && (user.role_id === 1 || user.role_id === 2);

  const fetchMenu = async () => {
    try {
      const res = await axios.get("http://localhost:3636/api/menu", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenu(res.data);
    } catch (error) {
      console.error("Lỗi tải menu");
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.food_name || !formData.price)
      return alert("Vui lòng nhập tên và giá!");

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:3636/api/menu/${editingId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Cập nhật món thành công!");
      } else {
        await axios.post("http://localhost:3636/api/menu", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Thêm món mới thành công!");
      }

      setFormData({ food_name: "", price: "", image_url: "" });
      setEditingId(null);
      fetchMenu();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Không thể thực hiện"));
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.item_id);
    setFormData({
      food_name: item.food_name,
      price: item.price,
      image_url: item.image_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ food_name: "", price: "", image_url: "" });
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
      alert("Lỗi cập nhật kho");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa món này vĩnh viễn?")) return;
    try {
      await axios.delete(`http://localhost:3636/api/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMenu();
    } catch (error) {
      alert("Lỗi xóa món");
    }
  };

  const styles = {
    container: {
      padding: "20px",
      maxWidth: "1000px",
      margin: "0 auto",
      fontFamily: "Arial",
    },
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
      border: editingId ? "2px solid #ffc107" : "1px solid #dee2e6",
    },
    formTitle: { marginTop: 0, color: editingId ? "#d39e00" : "#28a745" },
    inputGroup: {
      display: "flex",
      gap: "10px",
      marginBottom: "10px",
      flexWrap: "wrap",
    },
    input: {
      padding: "10px",
      flex: 1,
      minWidth: "200px",
      borderRadius: "5px",
      border: "1px solid #ced4da",
    },

    btnSubmit: {
      padding: "10px 20px",
      background: editingId ? "#ffc107" : "#28a745",
      color: editingId ? "black" : "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    btnCancel: {
      padding: "10px 20px",
      background: "#6c757d",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
      marginLeft: "10px",
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
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
      height: "140px",
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
      padding: "4px 8px",
      borderRadius: "12px",
      fontSize: "11px",
      float: "right",
      background: stock ? "#d4edda" : "#f8d7da",
      color: stock ? "#155724" : "#721c24",
    }),
    actions: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "15px",
      gap: "5px",
    },

    btnStock: {
      flex: 1,
      fontSize: "12px",
      padding: "6px",
      cursor: "pointer",
      border: "1px solid #ccc",
      background: "white",
      borderRadius: "4px",
    },
    btnEdit: {
      flex: 1,
      fontSize: "12px",
      padding: "6px",
      cursor: "pointer",
      background: "#ffc107",
      color: "black",
      border: "none",
      borderRadius: "4px",
    },
    btnDel: {
      flex: 1,
      fontSize: "12px",
      padding: "6px",
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
        <h3 style={styles.formTitle}>
          {editingId ? "✏️ Chỉnh Sửa Món Ăn" : "➕ Thêm Món Mới"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <input
              style={styles.input}
              placeholder="Tên món (VD: Mì tôm trứng)"
              required
              value={formData.food_name}
              onChange={(e) =>
                setFormData({ ...formData, food_name: e.target.value })
              }
            />
            <input
              style={styles.input}
              type="number"
              placeholder="Giá (VNĐ)"
              required
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              style={styles.input}
              placeholder="Link ảnh minh họa (Tùy chọn)"
              value={formData.image_url}
              onChange={(e) =>
                setFormData({ ...formData, image_url: e.target.value })
              }
            />
            <div>
              <button type="submit" style={styles.btnSubmit}>
                {editingId ? "Lưu Thay Đổi" : "Thêm Ngay"}
              </button>
              {editingId && (
                <button
                  type="button"
                  style={styles.btnCancel}
                  onClick={handleCancelEdit}
                >
                  Hủy
                </button>
              )}
            </div>
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
                style={{ width: "100%", height: "140px", objectFit: "cover" }}
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
                  title="Đổi trạng thái kho"
                >
                  {item.stock ? "Báo Hết" : "Báo Có"}
                </button>
                <button
                  style={styles.btnEdit}
                  onClick={() => handleEditClick(item)}
                  title="Sửa thông tin"
                >
                  Sửa
                </button>
                <button
                  style={styles.btnDel}
                  onClick={() => handleDelete(item.item_id)}
                  title="Xóa món này"
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
