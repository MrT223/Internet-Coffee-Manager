import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const GRID_SIZE = 25;
const CELL_SIZE = 40;

function ComputerMap() {
  const { token, user } = useContext(AuthContext);
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(false);

  const canManage = user && (user.role_id === 1 || user.role_id === 2);

  const fetchComputers = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:3636/api/computers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComputers(res.data);
    } catch (error) {
      console.error("Lỗi tải bản đồ máy", error);
    }
  }, [token]);

  useEffect(() => {
    fetchComputers();
  }, [fetchComputers]);

  const handleEmptyCellClick = async (x, y) => {
    if (!canManage) return;

    const name = prompt(
      `Nhập tên máy mới tại vị trí [${x}, ${y}]:`,
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
      alert("Lỗi thêm máy: " + error.response?.data?.message);
    }
  };

  const handleComputerClick = async (comp) => {
    if (!canManage) return;

    const action = prompt(
      `Quản lý ${comp.computer_name} (Trạng thái: ${comp.status})\n` +
        `Nhập lệnh:\n` +
        `1: Đặt 'trong' (Trống)\n` +
        `2: Đặt 'bao tri' (Bảo trì)\n` +
        `3: Đặt 'khoa' (Khóa)\n` +
        `del: Xóa máy khỏi bản đồ`
    );

    if (!action) return;

    let body = {};
    if (action === "1") body = { status: "trong", action: "update_status" };
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
                cursor: canManage ? "pointer" : "default",
                border: "2px solid #333",
              }}
              onClick={() => handleComputerClick(comp)}
              title={`Tên: ${comp.computer_name}\nTrạng thái: ${comp.status}`}
            >
              🖥️
              <span style={{ fontSize: "10px", display: "block" }}>
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
                backgroundColor: "#f0f0f0",
                opacity: 0.5,
                cursor: canManage ? "pointer" : "default",
              }}
              onClick={() => handleEmptyCellClick(row, col)}
              title={canManage ? `Thêm máy tại [${row},${col}]` : ""}
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
        return "#28a745";
      case "co nguoi":
        return "#ffc107";
      case "bao tri":
        return "#dc3545";
      case "khoa":
        return "#6c757d";
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
    legend: { marginBottom: "15px", display: "flex", gap: "15px" },
    legendItem: { display: "flex", alignItems: "center", gap: "5px" },
    colorBox: (color) => ({
      width: "20px",
      height: "20px",
      backgroundColor: color,
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
      maxWidth: "100vw",
    },
    cell: {
      width: `${CELL_SIZE}px`,
      height: `${CELL_SIZE}px`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      userSelect: "none",
      borderRadius: "4px",
    },
  };

  return (
    <div style={styles.container}>
      <h2>🖥️ Sơ Đồ Máy Trạm</h2>

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={styles.colorBox("#28a745")}></div> Trống
        </div>
        <div style={styles.legendItem}>
          <div style={styles.colorBox("#ffc107")}></div> Có người
        </div>
        <div style={styles.legendItem}>
          <div style={styles.colorBox("#dc3545")}></div> Bảo trì
        </div>
        <div style={styles.legendItem}>
          <div style={styles.colorBox("#f0f0f0")}></div> Đất trống
        </div>
      </div>

      <div style={styles.gridContainer}>{renderGrid()}</div>

      {canManage && (
        <p style={{ marginTop: 10, fontStyle: "italic" }}>
          * Click vào ô trống để thêm máy. Click vào máy để sửa trạng thái.
        </p>
      )}
    </div>
  );
}

export default ComputerMap;
