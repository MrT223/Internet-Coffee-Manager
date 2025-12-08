import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import UserHome from "./components/UserHome";
import ProtectedRoleRoute from "./components/ProtectedRoleRoute";
import ComputerMap from "./components/ComputerMap";
import MenuManager from "./components/MenuManager";
import UserMenu from "./components/UserMenu";
import OrderManager from "./components/OrderManager";
import ChatWidget from "./components/ChatWidget";
import "./App.css";

const StaffControl = () => <h2 style={{ padding: 20 }}>🛠️ Trang Nhân Viên</h2>;
const Unauthorized = () => (
  <h2 style={{ padding: 20, color: "red" }}>⛔ Không có quyền</h2>
);

function App() {
  return (
    <div className="App">
      <ChatWidget />
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

        <Route
          path="/user/menu"
          element={
            <ProtectedRoleRoute allowedRoles={[3]}>
              <UserMenu />
            </ProtectedRoleRoute>
          }
        />

        <Route
          path="/admin/menu"
          element={
            <ProtectedRoleRoute allowedRoles={[1, 2]}>
              <MenuManager />
            </ProtectedRoleRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoleRoute allowedRoles={[1, 2]}>
              <OrderManager />
            </ProtectedRoleRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
