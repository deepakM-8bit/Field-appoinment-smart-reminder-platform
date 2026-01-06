import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api.js";

export default function AppointmentDetail() {
  const { id } = useParams();

  const [appointment, setAppointment] = useState(null);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/api/appointments/${id}`);
        setAppointment(res.data);
      } catch (err) {
        console.error("Fetch appointment error:", err);
        setMessage("Failed to load appointment");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const requestOtp = async () => {
    try {
      await api.post(`/api/appointments/${id}/request-diagnosis-otp`);
      setMessage("OTP sent to customer");
    } catch (err) {
      console.error("Request OTP error:", err);
      setMessage("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      alert("Enter OTP");
      return;
    }

    try {
      await api.post(`/api/appointments/${id}/verify-diagnosis-otp`, { otp });
      setMessage("OTP verified. Diagnosis started.");
    } catch (err) {
      console.error("Verify OTP error:", err);
      setMessage("Invalid OTP");
    }
  };

  if (loading) return <p>Loading appointment...</p>;
  if (!appointment) return <p>{message}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Appointment #{appointment.id}</h2>

      <p><b>Customer:</b> {appointment.customer_name}</p>
      <p><b>Category:</b> {appointment.category}</p>
      <p><b>Status:</b> {appointment.status}</p>
      <p><b>Time:</b> {appointment.scheduled_time}</p>

      <hr />

      {appointment.status === "diagnosis_scheduled" && (
        <>
          <button onClick={requestOtp}>Request OTP</button>
        </>
      )}

      {appointment.status === "diagnosis_scheduled" && (
        <div style={{ marginTop: "10px" }}>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
          />
          <button onClick={verifyOtp} style={{ marginLeft: "8px" }}>
            Verify OTP
          </button>
        </div>
      )}

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
}
