import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function UserMenu() {
  // Lấy hàm updateUserBalance từ Context để cập nhật tiền sau khi mua
  const { token, user, updateUserBalance } = useContext(AuthContext);
  const navigate = useNavigate();

  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({}); // Lưu giỏ hàng dạng { id_món: số_lượng }
  const [isOrdering, setIsOrdering] = useState(false);

  // 1. Tải danh sách Menu từ Server khi vào trang
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get("http://localhost:3636/api/menu", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMenu(res.data);
      } catch (error) {
        console.error("Lỗi tải menu:", error);
      }
    };
    fetchMenu();
  }, [token]);

  // 2. Hàm Thêm/Bớt số lượng món
  const updateCart = (itemId, change) => {
    setCart((prevCart) => {
      const currentQty = prevCart[itemId] || 0;
      const newQty = currentQty + change;

      // Nếu số lượng <= 0 thì xóa khỏi giỏ
      if (newQty <= 0) {
        const newCart = { ...prevCart };
        delete newCart[itemId];
        return newCart;
      }

      // Ngược lại cập nhật số lượng mới
      return { ...prevCart, [itemId]: newQty };
    });
  };

  // 3. Tính tổng tiền giỏ hàng
  const calculateTotal = () => {
    let total = 0;
    Object.keys(cart).forEach((itemId) => {
      const item = menu.find((i) => i.item_id === parseInt(itemId));
      if (item) {
        total += item.price * cart[itemId];
      }
    });
    return total;
  };

  // 4. Xử lý Đặt Món (Gọi API)
  const handleOrder = async () => {
    const total = calculateTotal();
    if (total === 0) return alert("Giỏ hàng đang trống!");

    // Kiểm tra số dư người dùng trước (Client check sơ bộ)
    if (user && user.balance < total) {
      return alert("Số dư không đủ để thanh toán!");
    }

    if (
      !window.confirm(
        `Xác nhận thanh toán ${total.toLocaleString()} VNĐ từ tài khoản?`
      )
    )
      return;

    setIsOrdering(true);

    // Chuẩn bị dữ liệu gửi lên server
    const cartItems = Object.keys(cart).map((itemId) => {
      const item = menu.find((i) => i.item_id === parseInt(itemId));
      return {
        item_id: item.item_id,
        food_name: item.food_name,
        price: item.price,
        quantity: cart[itemId],
      };
    });

    try {
      const res = await axios.post(
        "http://localhost:3636/api/orders",
        { cart: cartItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message); // Thông báo thành công
      setCart({}); // Xóa giỏ hàng

      // --- QUAN TRỌNG: Cập nhật số dư mới vào Context ---
      if (res.data.newBalance !== undefined) {
        updateUserBalance(res.data.newBalance);
      }

      // Quay về trang chủ
      navigate("/user/home");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Lỗi đặt món. Vui lòng thử lại.");
    } finally {
      setIsOrdering(false);
    }
  };

  // --- CSS Styles ---
  const styles = {
    page: {
      backgroundColor: "#f4f7f6",
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif",
    },
    header: {
      padding: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "#fff",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    backBtn: {
      padding: "8px 16px",
      cursor: "pointer",
      border: "1px solid #ccc",
      background: "#fff",
      borderRadius: "4px",
      fontWeight: "bold",
    },
    title: { margin: 0, color: "#333" },

    container: {
      padding: "20px",
      display: "flex",
      gap: "20px",
      maxWidth: "1200px",
      margin: "0 auto",
      alignItems: "flex-start",
    },

    // Grid Menu (Bên trái)
    menuGrid: {
      flex: 2,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "20px",
    },
    card: {
      border: "1px solid #eee",
      borderRadius: "10px",
      overflow: "hidden",
      background: "white",
      padding: "15px",
      textAlign: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      transition: "transform 0.2s",
    },
    imgBox: {
      height: "120px",
      background: "#f8f9fa",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "8px",
      marginBottom: "10px",
      fontSize: "40px",
    },
    img: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "8px",
    },
    foodName: {
      margin: "10px 0 5px",
      fontSize: "16px",
      fontWeight: "bold",
      color: "#444",
    },
    price: { color: "#d32f2f", fontWeight: "bold", fontSize: "15px" },

    // Control (+ -)
    controls: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "10px",
      marginTop: "15px",
    },
    btnQty: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      border: "1px solid #ddd",
      cursor: "pointer",
      background: "#fff",
      fontSize: "16px",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    qty: { fontSize: "16px", fontWeight: "bold", minWidth: "20px" },

    // Giỏ hàng (Bên phải - Sticky)
    cartPanel: {
      flex: 1,
      background: "white",
      padding: "25px",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      position: "sticky",
      top: "20px",
      minWidth: "300px",
    },
    cartTitle: {
      marginTop: 0,
      borderBottom: "2px solid #f0f0f0",
      paddingBottom: "10px",
      marginBottom: "15px",
    },
    cartItem: {
      display: "flex",
      justifyContent: "space-between",
      padding: "10px 0",
      borderBottom: "1px solid #eee",
      fontSize: "14px",
    },
    totalLine: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "20px",
      fontSize: "18px",
      fontWeight: "bold",
      color: "#2e7d32",
    },

    btnOrder: {
      width: "100%",
      padding: "15px",
      background: "#28a745",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "16px",
      fontWeight: "bold",
      marginTop: "25px",
      cursor: "pointer",
      transition: "background 0.2s",
    },
    emptyCart: {
      textAlign: "center",
      color: "#888",
      fontStyle: "italic",
      margin: "20px 0",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => navigate("/user/home")} style={styles.backBtn}>
          ⬅ Quay lại
        </button>
        <h2 style={styles.title}>🍔 Menu & Gọi Đồ</h2>
        <div style={{ width: "80px" }}></div> {/* Spacer để cân giữa tiêu đề */}
      </div>

      <div style={styles.container}>
        {/* DANH SÁCH MÓN ĂN */}
        <div style={styles.menuGrid}>
          {menu.map((item) => (
            <div
              key={item.item_id}
              style={{ ...styles.card, opacity: item.stock ? 1 : 0.6 }}
            >
              <div style={styles.imgBox}>
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    style={styles.img}
                    alt={item.food_name}
                  />
                ) : (
                  "🍽️"
                )}
              </div>
              <div style={styles.foodName}>{item.food_name}</div>
              <div style={styles.price}>{item.price.toLocaleString()} đ</div>

              {item.stock ? (
                <div style={styles.controls}>
                  <button
                    style={{ ...styles.btnQty, color: "#d32f2f" }}
                    onClick={() => updateCart(item.item_id, -1)}
                  >
                    -
                  </button>

                  <span style={styles.qty}>{cart[item.item_id] || 0}</span>

                  <button
                    style={{
                      ...styles.btnQty,
                      color: "#28a745",
                      borderColor: "#28a745",
                    }}
                    onClick={() => updateCart(item.item_id, 1)}
                  >
                    +
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    color: "red",
                    marginTop: "15px",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  Hết hàng
                </div>
              )}
            </div>
          ))}
        </div>

        {/* GIỎ HÀNG */}
        <div style={styles.cartPanel}>
          <h3 style={styles.cartTitle}>🛒 Giỏ Hàng</h3>

          {Object.keys(cart).length === 0 ? (
            <div style={styles.emptyCart}>Chưa chọn món nào</div>
          ) : (
            <div>
              {Object.keys(cart).map((itemId) => {
                const item = menu.find((i) => i.item_id === parseInt(itemId));
                if (!item) return null;
                return (
                  <div key={itemId} style={styles.cartItem}>
                    <span>
                      {item.food_name}{" "}
                      <b style={{ color: "#555" }}>x{cart[itemId]}</b>
                    </span>
                    <span>
                      {(item.price * cart[itemId]).toLocaleString()} đ
                    </span>
                  </div>
                );
              })}

              <div style={styles.totalLine}>
                <span>Tổng cộng:</span>
                <span>{calculateTotal().toLocaleString()} đ</span>
              </div>

              <button
                style={{ ...styles.btnOrder, opacity: isOrdering ? 0.7 : 1 }}
                onClick={handleOrder}
                disabled={isOrdering}
              >
                {isOrdering ? "Đang xử lý..." : "Thanh Toán Ngay"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserMenu;
