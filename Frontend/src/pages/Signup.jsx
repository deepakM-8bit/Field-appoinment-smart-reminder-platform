import { useState } from "react";
import api from "../services/api.js";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await api.post("/api/auth/signup", {
        name,
        email,
        password
      });

      navigate("/login");
    } catch (err) {
      alert("Signup failed");
      console.log("signup error:",err.message);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Admin Signup</h2>

      <input
        placeholder="Business / Owner Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <br />

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <br />

      <button onClick={handleSignup}>Create Account</button>
    </div>
  );
}
