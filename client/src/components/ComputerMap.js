import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const GRID_SIZE = 25;
const CELL_SIZE = 40;

function ComputerMap() {
  const { token, user, updateUserBalance } = useContext(AuthContext);
  const navigate = useNavigate();
  const [computers, setComputers] = useState([]);

  const [adminModal, setAdminModal] = useState({ show: false, computer: null });
  const [userModal, setUserModal] = useState({ show: false, computer: null });

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

  const calculateDuration = (startTime) => {
    if (!startTime) return "Vừa mới";
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours} giờ ${mins} phút`;
  };

  const handleAdminClick = (comp) => {
    setAdminModal({ show: true, computer: comp });
  };

  const handleAdminAction = async (actionType) => {
    const comp = adminModal.computer;
    if (!comp) return;

    try {
      let url = `http://localhost:3636/api/computers/${comp.computer_id}`;
      let body = {};

      if (actionType === "force_logout") {
        if (!window.confirm("Bạn chắc chắn muốn ĐUỔI người chơi này?")) return;
        url += "/force-logout";
        await axios.post(
          url,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (actionType === "refund") {
        if (!window.confirm("Hoàn tiền cọc và chuyển máy sang bảo trì?"))
          return;
        url += "/refund";
        await axios.post(
          url,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (actionType === "start_session_test") {
        const userId = prompt("Nhập ID User (Test):");
        if (!userId) return;
        await axios.post(
          "http://localhost:3636/api/computers/start-session",
          { computerId: comp.computer_id, userId: userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        if (actionType === "delete") {
          if (!window.confirm("Xóa máy này khỏi bản đồ?")) return;
          body = { action: "delete" };
        } else {
          body = { status: actionType, action: "update_status" };
        }
        await axios.put(url, body, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      alert("Thao tác thành công!");
      setAdminModal({ show: false, computer: null });
      fetchComputers();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  const handleEmptyCellClick = async (x, y) => {
    if (!canManage) return;
    const name = prompt(`Thêm máy tại [${x},${y}]:`, `Máy ${x}-${y}`);
    if (name) {
      try {
        await axios.post(
          "http://localhost:3636/api/computers",
          { x, y, computer_name: name },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchComputers();
      } catch (e) {
        alert("Lỗi thêm máy");
      }
    }
  };

  const handleUserClick = (comp) => {
    if (comp.status !== "trong") {
      alert("Máy này không khả dụng!");
      return;
    }
    setUserModal({ show: true, computer: comp });
  };

  const confirmBooking = async () => {
    const comp = userModal.computer;
    try {
      const res = await axios.post(
        `http://localhost:3636/api/computers/${comp.computer_id}/book`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(res.data.message);
      if (res.data.newBalance !== undefined)
        updateUserBalance(res.data.newBalance);
      setUserModal({ show: false, computer: null });
      fetchComputers();
    } catch (error) {
      alert("Thất bại: " + (error.response?.data?.message || "Lỗi"));
      setUserModal({ show: false, computer: null });
    }
  };

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
              title={`${comp.computer_name}`}
            >
              🖥️{" "}
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

  const getStatusColor = (s) => {
    switch (s) {
      case "trong":
        return "#28a745";
      case "dat truoc":
        return "#ffc107";
      case "co nguoi":
        return "#dc3545";
      case "bao tri":
        return "#fd7e14";
      default:
        return "#6c757d";
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
      marginBottom: "10px",
      display: "flex",
      justifyContent: "space-between",
    },
    backBtn: {
      padding: "8px 15px",
      cursor: "pointer",
      background: "#6c757d",
      color: "white",
      border: "none",
      borderRadius: "4px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
      gap: "2px",
      border: "5px solid #333",
      backgroundColor: "#ccc",
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
      borderRadius: "4px",
      userSelect: "none",
    },
    legend: {
      display: "flex",
      gap: "15px",
      marginBottom: "10px",
      flexWrap: "wrap",
    },
    box: (c) => ({
      width: 15,
      height: 15,
      background: c,
      border: "1px solid #000",
      marginRight: 5,
      display: "inline-block",
    }),

    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modal: {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "8px",
      minWidth: "350px",
      maxWidth: "450px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    },
    modalHeader: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "15px",
      borderBottom: "1px solid #eee",
      paddingBottom: "10px",
    },
    infoRow: { marginBottom: "8px", fontSize: "14px" },
    btnGroup: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
      marginTop: "20px",
    },
    btnAction: (color) => ({
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      backgroundColor: color,
      color: "white",
      cursor: "pointer",
      fontWeight: "bold",
    }),
    btnClose: {
      marginTop: "15px",
      width: "100%",
      padding: "10px",
      backgroundColor: "#6c757d",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button
          style={styles.backBtn}
          onClick={() =>
            navigate(canManage ? "/admin/dashboard" : "/user/home")
          }
        >
          ⬅ Quay lại
        </button>
        <h2 style={{ margin: 0 }}>🖥️ Sơ Đồ Máy</h2>
        <div style={{ width: 80 }}></div>
      </div>

      <div style={styles.legend}>
        <span>
          <span style={styles.box("#28a745")}></span>Trống
        </span>
        <span>
          <span style={styles.box("#ffc107")}></span>Đặt trước
        </span>
        <span>
          <span style={styles.box("#dc3545")}></span>Có người
        </span>
        <span>
          <span style={styles.box("#fd7e14")}></span>Bảo trì
        </span>
        <span>
          <span style={styles.box("#6c757d")}></span>Khóa
        </span>
      </div>

      <div style={styles.grid}>{renderGrid()}</div>

      {adminModal.show && adminModal.computer && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              Quản Lý {adminModal.computer.computer_name}
            </div>

            <div style={styles.infoRow}>
              🔹 <b>Trạng thái:</b> {adminModal.computer.status}
            </div>

            {(adminModal.computer.status === "co nguoi" ||
              adminModal.computer.status === "dat truoc") && (
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "10px",
                  borderRadius: "5px",
                  margin: "10px 0",
                }}
              >
                <div style={styles.infoRow}>
                  👤 <b>Người dùng:</b>{" "}
                  <span style={{ color: "blue" }}>
                    {adminModal.computer.CurrentUser?.user_name || "Unknown"}
                  </span>
                </div>
                {adminModal.computer.status === "co nguoi" && (
                  <div style={styles.infoRow}>
                    ⏱️ <b>Thời gian:</b>{" "}
                    {calculateDuration(adminModal.computer.session_start_time)}
                  </div>
                )}
              </div>
            )}

            <div style={styles.btnGroup}>
              {adminModal.computer.status === "co nguoi" ? (
                <button
                  style={{
                    ...styles.btnAction("#dc3545"),
                    gridColumn: "span 2",
                  }}
                  onClick={() => handleAdminAction("force_logout")}
                >
                  ⛔ Cưỡng chế Đăng Xuất
                </button>
              ) : adminModal.computer.status === "dat truoc" ? (
                <>
                  <button
                    style={styles.btnAction("#ffc107")}
                    onClick={() => handleAdminAction("start_session_test")}
                  >
                    ▶️ Vào máy (Test)
                  </button>
                  <button
                    style={styles.btnAction("#dc3545")}
                    onClick={() => handleAdminAction("refund")}
                  >
                    💰 Hoàn tiền & Hủy
                  </button>
                </>
              ) : (
                <>
                  <button
                    style={styles.btnAction("#28a745")}
                    onClick={() => handleAdminAction("trong")}
                  >
                    ✅ Mở (Trống)
                  </button>
                  <button
                    style={styles.btnAction("#fd7e14")}
                    onClick={() => handleAdminAction("bao tri")}
                  >
                    🛠️ Bảo trì
                  </button>
                  <button
                    style={styles.btnAction("#6c757d")}
                    onClick={() => handleAdminAction("khoa")}
                  >
                    🔒 Khóa
                  </button>
                  <button
                    style={styles.btnAction("#d63384")}
                    onClick={() => handleAdminAction("delete")}
                  >
                    🗑️ Xóa Máy
                  </button>
                </>
              )}
            </div>
            <button
              style={styles.btnClose}
              onClick={() => setAdminModal({ show: false, computer: null })}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {userModal.show && userModal.computer && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Xác nhận đặt máy</h3>
            <p>
              Bạn muốn đặt <b>{userModal.computer.computer_name}</b>?
            </p>
            <p style={{ color: "red", fontWeight: "bold" }}>
              Phí đặt cọc: 5.000 VNĐ
            </p>
            <div style={styles.btnGroup}>
              <button
                style={styles.btnAction("#6c757d")}
                onClick={() => setUserModal({ show: false, computer: null })}
              >
                Hủy
              </button>
              <button
                style={styles.btnAction("#28a745")}
                onClick={confirmBooking}
              >
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
