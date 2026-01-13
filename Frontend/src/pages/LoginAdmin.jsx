import { useState } from "react";
import api from "../services/api.js";
import { useNavigate } from "react-router-dom";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("api/auth/login", {
        email,
        password
      });

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminRole", res.data.role);

      navigate("/admin/dashboard");
    } catch (err) {
      alert("Login failed");
      console.log("admin login error:",err);
    }
  };

  return (
    <div>
      <h2>Admin Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <button
        type="button"
        onClick={() => navigate("/forgot-password?type=admin")}
        className="mt-3 w-full text-sm text-slate-500 hover:underline"
      >
        Forgot password?
      </button>

    </div>
  );
}
