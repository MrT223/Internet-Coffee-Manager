import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const GRID_SIZE = 25;
const CELL_SIZE = 40;

function ComputerMap() {
  const { token, user } = useContext(AuthContext);
  const [computers, setComputers] = useState([]);
  const navigate = useNavigate();

  const [bookingModal, setBookingModal] = useState({
    show: false,
    computer: null,
  });

  const canManage = user && (user.role_id === 1 || user.role_id === 2);
  const isUser = user && user.role_id === 3;

  const fetchComputers = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:3636/api/computers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComputers(res.data);
    } catch (error) {
      console.error("Lỗi tải bản đồ", error);
    }
  }, [token]);

  useEffect(() => {
    fetchComputers();
  }, [fetchComputers]);

  // --- ADMIN/STAFF: Quản lý máy ---
  const handleEmptyCellClick = async (x, y) => {
    if (!canManage) return;
    const name = prompt(
      `[ADMIN] Thêm máy mới tại [${x}, ${y}]? Nhập tên:`,
      `Máy ${x}-${y}`
    );
    if (!name) return;

    try {
      await axios.post(
        "http://localhost:3636/api/computers",
        { x, y, computer_name: name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComputers();
    } catch (error) {
      alert("Lỗi: " + error.response?.data?.message);
    }
  };

  const handleAdminClick = async (comp) => {
    const action = prompt(
      `Quản lý ${comp.computer_name} (${comp.status})\n1: Trống | 2: Bảo trì | 3: Khóa | 4: Hủy đặt | del: Xóa`
    );
    if (!action) return;

    let body = {};
    if (action === "1" || action === "4")
      body = { status: "trong", action: "update_status" };
    else if (action === "2")
      body = { status: "bao tri", action: "update_status" };
    else if (action === "3") body = { status: "khoa", action: "update_status" };
    else if (action.toLowerCase() === "del") body = { action: "delete" };
    else return;

    try {
      await axios.put(
        `http://localhost:3636/api/computers/${comp.computer_id}`,
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchComputers();
    } catch (error) {
      alert("Lỗi cập nhật máy");
    }
  };

  // --- USER: Mở Modal Đặt máy ---
  const handleUserClick = (comp) => {
    if (comp.status !== "trong") {
      alert("Máy này không khả dụng!");
      return;
    }
    setBookingModal({ show: true, computer: comp });
  };

  const confirmBooking = async () => {
    const comp = bookingModal.computer;
    if (!comp) return;

    try {
      const res = await axios.post(
        `http://localhost:3636/api/computers/${comp.computer_id}/book`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(res.data.message);
      setBookingModal({ show: false, computer: null });
      fetchComputers();
    } catch (error) {
      alert("Thất bại: " + (error.response?.data?.message || "Lỗi kết nối"));
      setBookingModal({ show: false, computer: null });
    }
  };

  const closeBookingModal = () => {
    setBookingModal({ show: false, computer: null });
  };

  // --- RENDER ---
  const computerMap = {};
  computers.forEach((c) => {
    computerMap[`${c.x}-${c.y}`] = c;
  });

  const renderGrid = () => {
    let grid = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const key = `${row}-${col}`;
        const comp = computerMap[key];

        if (comp) {
          grid.push(
            <div
              key={key}
              style={{
                ...styles.cell,
                backgroundColor: getStatusColor(comp.status),
                cursor: "pointer",
                border: "2px solid #555",
              }}
              onClick={() =>
                canManage
                  ? handleAdminClick(comp)
                  : isUser
                  ? handleUserClick(comp)
                  : null
              }
              title={`${comp.computer_name} - ${comp.status}`}
            >
              🖥️
              <span style={{ fontSize: "9px", fontWeight: "bold" }}>
                {comp.computer_name}
              </span>
            </div>
          );
        } else {
          grid.push(
            <div
              key={key}
              style={{
                ...styles.cell,
                backgroundColor: "#eee",
                cursor: canManage ? "pointer" : "default",
              }}
              onClick={() => handleEmptyCellClick(row, col)}
            />
          );
        }
      }
    }
    return grid;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "trong":
        return "#28a745"; // Xanh lá
      case "dat truoc":
        return "#ffc107"; // Vàng
      case "co nguoi":
        return "#dc3545"; // Đỏ
      case "bao tri":
        return "#fd7e14"; // Cam
      case "khoa":
        return "#6c757d"; // Xám
      default:
        return "#fff";
    }
  };

  const styles = {
    container: {
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    topBar: {
      width: "100%",
      maxWidth: "1000px",
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "10px",
    },
    btnBack: {
      padding: "8px 15px",
      background: "#6c757d",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
    legend: {
      marginBottom: "15px",
      display: "flex",
      gap: "15px",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    item: { display: "flex", alignItems: "center", fontSize: "14px" },
    box: (color) => ({
      width: "15px",
      height: "15px",
      backgroundColor: color,
      marginRight: "5px",
      border: "1px solid #333",
    }),
    gridContainer: {
      display: "grid",
      gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
      gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
      gap: "2px",
      backgroundColor: "#ccc",
      border: "5px solid #333",
      padding: "5px",
      overflow: "auto",
      maxWidth: "95vw",
    },
    cell: {
      width: `${CELL_SIZE}px`,
      height: `${CELL_SIZE}px`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      userSelect: "none",
      borderRadius: "4px",
    },

    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: "white",
      padding: "25px",
      borderRadius: "10px",
      width: "350px",
      boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
      textAlign: "center",
    },
    modalTitle: { margin: "0 0 15px 0", color: "#007bff" },
    modalInfo: { fontSize: "16px", marginBottom: "20px", lineHeight: "1.5" },
    modalBtns: {
      display: "flex",
      justifyContent: "space-around",
      marginTop: "20px",
    },
    btnConfirm: {
      padding: "10px 20px",
      background: "#28a745",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    btnCancel: {
      padding: "10px 20px",
      background: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button
          style={styles.btnBack}
          onClick={() =>
            navigate(canManage ? "/admin/dashboard" : "/user/home")
          }
        >
          ⬅ Quay lại Dashboard
        </button>
        <h2 style={{ margin: 0 }}>🖥️ Sơ Đồ Phòng Máy</h2>
        <div style={{ width: "100px" }}></div>
      </div>

      <div style={styles.legend}>
        <div style={styles.item}>
          <div style={styles.box("#28a745")}></div> Trống
        </div>
        <div style={styles.item}>
          <div style={styles.box("#ffc107")}></div> Đặt trước
        </div>
        <div style={styles.item}>
          <div style={styles.box("#dc3545")}></div> Có người
        </div>
        <div style={styles.item}>
          <div style={styles.box("#fd7e14")}></div> Bảo trì
        </div>
      </div>

      <div style={styles.gridContainer}>{renderGrid()}</div>

      {bookingModal.show && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Xác Nhận Đặt Máy</h3>
            <div style={styles.modalInfo}>
              Bạn có muốn đặt máy <b>{bookingModal.computer.computer_name}</b>?
              <br />
              ----------------
              <br />
              <b>Phí đặt cọc:</b>{" "}
              <span style={{ color: "red", fontWeight: "bold" }}>
                5.000 VNĐ
              </span>
              <br />
              <span style={{ fontSize: "12px", color: "#666" }}>
                (Trừ trực tiếp vào tài khoản)
              </span>
            </div>
            <div style={styles.modalBtns}>
              <button style={styles.btnCancel} onClick={closeBookingModal}>
                Hủy
              </button>
              <button style={styles.btnConfirm} onClick={confirmBooking}>
                Xác Nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComputerMap;
