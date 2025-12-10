// src/components/ComputerMap.js
import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/ComputerMap.css";

const GRID_SIZE = 25;

function ComputerMap() {
  const { token, user, updateUserBalance } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [computers, setComputers] = useState([]);

  // --- STATE QUẢN LÝ POPUP  ---
  const [selectedComputer, setSelectedComputer] = useState(null);
  const [editData, setEditData] = useState({ name: "", status: "" });

  // --- STATE NGƯỜI DÙNG ---
  const [userModal, setUserModal] = useState({ show: false, computer: null });

  // --- PHÂN QUYỀN ---
  const isSimulationMode = location.state?.simulationMode;
  const isAdminOrStaff = user && (user.role_id === 1 || user.role_id === 2);
  const isUser = user && user.role_id === 3;
  const isGuest = !user;

  // --- 1. TẢI DANH SÁCH MÁY ---
  const fetchComputers = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:3636/api/computers");
      setComputers(res.data);
    } catch (error) {
      console.error("Lỗi tải bản đồ", error);
    }
  }, []);

  useEffect(() => {
    fetchComputers();
  }, [fetchComputers]);

  // --- 2. LOGIC CLICK VÀO MÁY ---
  const handleComputerClick = (comp, e) => {
    if (e) e.stopPropagation();

    if (isAdminOrStaff && !isSimulationMode) {
      if (selectedComputer && selectedComputer.computer_id === comp.computer_id) {
        setSelectedComputer(null);
      } else {
        setSelectedComputer(comp);
        setEditData({ name: comp.computer_name, status: comp.status }); // Load dữ liệu cũ
      }
      return;
    }

    if (isGuest) {
      if (comp.status !== "trong") return alert("Máy này đang bận hoặc bảo trì.");
      const doLogin = window.confirm("Bạn cần Đăng Nhập để đặt máy này. Chuyển đến trang đăng nhập?");
      if (doLogin) navigate("/login");
      return;
    }

    if (isUser) {
      if (comp.status !== "trong") return alert("Máy này không khả dụng!");
      setUserModal({ show: true, computer: comp });
    }
  };

  // --- 3. ADMIN: LƯU CHỈNH SỬA  ---
  const handleSavePopup = async () => {
    if (!selectedComputer) return;
    try {
      await axios.put(
        `http://localhost:3636/api/computers/${selectedComputer.computer_id}`,
        {
          computer_name: editData.name,
          status: editData.status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Tắt popup và load lại
      setSelectedComputer(null);
      fetchComputers();
    } catch (error) {
      alert("Lỗi lưu: " + (error.response?.data?.message || error.message));
    }
  };

  // --- 4. ADMIN: XÓA MÁY  ---
  const handleDeletePopup = async () => {
    if (!window.confirm(`Xóa máy ${selectedComputer.computer_name} khỏi hệ thống?`)) return;
    try {
      await axios.delete(
        `http://localhost:3636/api/computers/${selectedComputer.computer_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedComputer(null);
      fetchComputers();
    } catch (error) {
      alert("Lỗi xóa: " + (error.response?.data?.message || error.message));
    }
  };

  // --- 5. ADMIN: THÊM MÁY MỚI ---
  const handleAddComputer = async (x, y) => {
    const name = prompt(`Tên máy tại [${x},${y}]:`, `MAY-${x}-${y}`);
    if (name) {
      try {
        await axios.post(
          "http://localhost:3636/api/computers",
          { x, y, computer_name: name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchComputers();
      } catch (e) {
        alert("Lỗi thêm: " + (e.response?.data?.message || e.message));
      }
    }
  };

  // --- 6. USER: XÁC NHẬN ĐẶT MÁY ---
  const confirmBooking = async () => {
    const comp = userModal.computer;
    if (!comp) return;

    try {
      const res = await axios.post(
        `http://localhost:3636/api/computers/${comp.computer_id}/book`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message);

      // Cập nhật số dư hiển thị ngay lập tức nếu server trả về
      if (res.data.newBalance !== undefined) {
        updateUserBalance(res.data.newBalance);
      }

      setUserModal({ show: false, computer: null });// 
      fetchComputers(); 
    } catch (error) {
      alert("Thất bại: " + (error.response?.data?.message || "Lỗi kết nối"));
    }
  };

  // --- 7. EFFECT: CLICK RA NGOÀI THÌ ĐÓNG POPUP ---
  useEffect(() => {
    const handleClickOutside = () => setSelectedComputer(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // --- 8. RENDER LƯỚI ---
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
        
        // Kiểm tra xem máy này có đang được chọn để hiện popup không
        const isSelected = selectedComputer && selectedComputer.computer_id === comp?.computer_id;

        if (comp) {
          // --- Ô CÓ MÁY ---
          grid.push(
            <div key={key} style={{ position: "relative" }}>
              <div
                className={`computer-card status-${comp.status}`}
                onClick={(e) => handleComputerClick(comp, e)}
                onContextMenu={(e) => {
                  e.preventDefault(); // Chuột phải cũng mở menu
                  handleComputerClick(comp, e);
                }}
                title={comp.computer_name}
              >
                <div className="screen-icon">🖥️</div>
                <div className="comp-name">{comp.computer_name}</div>
              </div>

              {isSelected && (
                <div
                  className="mini-popup"
                  style={{ top: "10px", left: "100%", marginLeft: "10px" }}
                  onClick={(e) => e.stopPropagation()} 
                >
                  <div className="popup-row">
                    <label className="popup-label">Tên Máy</label>
                    <input
                      className="popup-input"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="popup-row">
                    <label className="popup-label">Trạng Thái</label>
                    <select
                      className="popup-select"
                      value={editData.status}
                      onChange={(e) =>
                        setEditData({ ...editData, status: e.target.value })
                      }
                    >
                      <option value="trong">✅ Trống</option>
                      <option value="bao_tri">🛠️ Bảo Trì</option>
                      <option value="khoa">🔒 Khóa</option>
                      {/* Giữ lại option có người nếu đang dùng */}
                      {comp.status === "co nguoi" && (
                        <option value="co nguoi">🎮 Có Người</option>
                      )}
                    </select>
                  </div>

                  <div className="popup-actions">
                    <button className="btn-mini delete" onClick={handleDeletePopup}>
                      🗑️ Xóa
                    </button>
                    <button className="btn-mini save" onClick={handleSavePopup}>
                      💾 Lưu
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        } else {
          // --- Ô TRỐNG ---
          if (isAdminOrStaff) {
            grid.push(
              <div
                key={key}
                className="empty-cell admin-add"
                onClick={() => handleAddComputer(row, col)}
                title="Thêm máy mới"
              >
                +
              </div>
            );
          } else {
            grid.push(<div key={key} className="empty-cell" />);
          }
        }
      }
    }
    return grid;
  };

  return (
    <div className="map-container">
      {/* HEADER */}
      <header className="map-header">
        <div className="brand">
          <h1>CYBER OPS MAP</h1>
          <span className="live-badge">● LIVE</span>
        </div>
        
        <div className="user-controls">
          {user ? (
            <div className="logged-in-box">
              <span>
                Hi, <strong>{user.user_name}</strong>
              </span>
              {isAdminOrStaff && (
                <>
                    <button onClick={() => navigate("/admin/dashboard")}>Quản Lý</button>
                    <span style={{marginLeft: 10, fontSize: '0.8rem', color: '#00ff99'}}>🛠️ Chuột phải để sửa máy</span>
                </>
              )}
              {isUser && (
                <button onClick={() => navigate("/user/home")}>Tài Khoản</button>
              )}
            </div>
          ) : (
            <button className="btn-login-nav" onClick={() => navigate("/login")}>
              ĐĂNG NHẬP
            </button>
          )}
        </div>
      </header>

      {/* CHÚ THÍCH TRẠNG THÁI */}
      <div className="status-legend">
        <div className="legend-item"><span className="dot dot-free"></span>Trống</div>
        <div className="legend-item"><span className="dot dot-busy"></span>Có người</div>
        <div className="legend-item"><span className="dot dot-fix"></span>Bảo trì</div>
      </div>

      {/* LƯỚI MÁY (CÓ THANH CUỘN) */}
      <div className="grid-wrapper">
        <div className="computer-grid">{renderGrid()}</div>
      </div>

      {/* MODAL USER BOOKING */}
      {userModal.show && userModal.computer && (
        <div className="modal-overlay">
          <div className="cyber-modal">
            <h3>Xác nhận đặt máy</h3>
            <p>
              Bạn muốn đặt <b>{userModal.computer.computer_name}</b>?
            </p>
            <p style={{ color: "#ff0055", fontWeight: "bold" }}>
              Phí đặt cọc: 5.000 VNĐ
            </p>
            <div className="modal-actions">
              <button
                className="btn-action btn-secondary"
                onClick={() => setUserModal({ show: false, computer: null })}
              >
                Hủy
              </button>
              <button className="btn-action btn-success" onClick={confirmBooking}>
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