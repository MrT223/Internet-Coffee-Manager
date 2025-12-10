import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import UserHome from "./components/UserHome";
import ProtectedRoleRoute from "./components/ProtectedRoleRoute";
import ComputerMap from "./components/ComputerMap";
import MenuManager from "./components/MenuManager";
import UserMenu from "./components/UserMenu";
import OrderManager from "./components/OrderManager";
import ChatWidget from "./components/ChatWidget";
import "./css/App.css";

const StaffControl = () => <h2 style={{ padding: 20 }}>🛠️ Trang Nhân Viên</h2>;
const Unauthorized = () => (
  <h2 style={{ padding: 20, color: "red" }}>⛔ Không có quyền truy cập</h2>
);

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <ChatWidget />
        <Routes>
          
          <Route path="/" element={<ComputerMap />} />

          <Route path="/computers" element={<ComputerMap />} />

          {/* 3. Trang Login */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* --- CÁC ROUTE CẦN ĐĂNG NHẬP --- */}
          
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoleRoute allowedRoles={[1]}>
                <AdminDashboard />
              </ProtectedRoleRoute>
            }
          />

          {/* ... Các route khác (Menu, Orders, Staff...) giữ nguyên ... */}
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

        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
