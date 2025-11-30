import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gọi API đến port 3636 của server
      const response = await axios.post(
        "http://localhost:3636/api/auth/login",
        {
          user_name: username,
          password: password,
        }
      );

      const { token, user } = response.data;

      // Gọi hàm login từ Context để lưu trạng thái
      login(token, user);

      alert("Đăng nhập thành công!");

      // Điều hướng dựa trên quyền hạn
      switch (user.role_id) {
        case 1: // Admin
          navigate("/admin/dashboard");
          break;
        case 2: // Staff
          navigate("/staff/control");
          break;
        case 3: // User
        default:
          navigate("/user/home");
          break;
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Đăng nhập thất bại.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Đăng Nhập Hệ Thống Cyber</h2>
      <input
        type="text"
        placeholder="Tên đăng nhập"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Đăng Nhập</button>
    </form>
  );
}

export default Login;
