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
      // Gọi API tới port 3636
      const response = await axios.post(
        "http://localhost:3636/api/auth/login",
        {
          user_name: username,
          password: password,
        }
      );

      const { token, user } = response.data;
      login(token, user);
      alert("Đăng nhập thành công!");

      // Chuyển hướng
      switch (user.role_id) {
        case 1:
          navigate("/admin/dashboard");
          break;
        case 2:
          navigate("/staff/control");
          break;
        case 3:
          navigate("/user/home");
          break;
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
    <div
      className="login-container"
      style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "300px",
        }}
      >
        <h2>Đăng Nhập</h2>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: "8px" }}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "8px" }}
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            background: "#007bff",
            color: "white",
            border: "none",
          }}
        >
          Đăng Nhập
        </button>
      </form>
    </div>
  );
}

export default Login;
