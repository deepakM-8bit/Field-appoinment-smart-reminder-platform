import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>Field Appointment System</h1>
      <p>Automate your service business operations.</p>

      <div style={{ marginTop: "20px" }}>
        <Link to="/login">
          <button>Admin Login</button>
        </Link>

        <Link to="/signup" style={{ marginLeft: "10px" }}>
          <button>Admin Signup</button>
        </Link>

        <Link to="/tech-login" style={{ marginLeft: "10px" }}>
          <button>Technician Login</button>
        </Link>
      </div>
    </div>
  );
}
