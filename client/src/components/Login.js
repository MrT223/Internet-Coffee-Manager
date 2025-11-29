import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          user_name: username,
          password: password,
        }
      );

      login(response.data.token, response.data.user);

      alert("Đăng nhập thành công!");
    } catch (error) {
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

const { token, user } = response.data;
login(token, user);

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

export default Login;
