import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import ProtectedRoleRoute from "./components/ProtectedRoleRoute";
import "./App.css";

// Tạo các component tạm thời để test chuyển trang (bạn sẽ thay thế bằng component thật sau)
const AdminDashboard = () => <h2>Trang Admin Dashboard</h2>;
const StaffControl = () => <h2>Trang Nhân viên</h2>;
const UserHome = () => <h2>Trang Người dùng</h2>;
const Unauthorized = () => <h2>Bạn không có quyền truy cập!</h2>;

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Route công khai */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Chuyển hướng mặc định về login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Route Admin (Role ID: 1) */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoleRoute allowedRoles={[1]}>
              <AdminDashboard />
            </ProtectedRoleRoute>
          }
        />

        {/* Route Staff (Role ID: 2) */}
        <Route
          path="/staff/control"
          element={
            <ProtectedRoleRoute allowedRoles={[2]}>
              <StaffControl />
            </ProtectedRoleRoute>
          }
        />

        {/* Route User (Role ID: 3) */}
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
