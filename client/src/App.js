import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoleRoute from "./components/ProtectedRoleRoute";
import ComputerMap from "./components/ComputerMap";
import "./App.css";

// --- Component giả lập các trang (Sẽ thay bằng trang thật sau) ---
const StaffControl = () => (
  <h2 style={{ padding: 20 }}>🛠️ Trang Nhân Viên (Staff)</h2>
);
const UserHome = () => (
  <h2 style={{ padding: 20 }}>👤 Trang Người Dùng (User)</h2>
);
const Unauthorized = () => (
  <h2 style={{ padding: 20, color: "red" }}>⛔ Không có quyền truy cập</h2>
);

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/computers"
          element={
            <ProtectedRoleRoute allowedRoles={[1, 2, 3]}>
              <ComputerMap />
            </ProtectedRoleRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoleRoute allowedRoles={[1]}>
              <AdminDashboard />
            </ProtectedRoleRoute>
          }
        />

        <Route
          path="/staff/control"
          element={
            <ProtectedRoleRoute allowedRoles={[2]}>
              <StaffControl />
            </ProtectedRoleRoute>
          }
        />

        <Route
          path="/user/home"
          element={
            <ProtectedRoleRoute allowedRoles={[3]}>
              <UserHome />
            </ProtectedRoleRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
