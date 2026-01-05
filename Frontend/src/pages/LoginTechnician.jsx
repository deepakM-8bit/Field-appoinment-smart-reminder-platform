import { useState } from "react";
import api from "../services/api.js";
import { useNavigate } from "react-router-dom";

export default function LoginTechnician() {
  const [phoneno, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("api/auth/technician-login", {
        phoneno,
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
      console.log("technician login error:",err.message);
    }
  };

  return (
    <div>
      <h2>Technician Login</h2>
      <input placeholder="Phone" onChange={e => setPhone(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
