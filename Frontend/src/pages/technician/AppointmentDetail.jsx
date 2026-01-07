import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api.js";

export default function AppointmentDetail() {
  const { id } = useParams();

  const [appointment, setAppointment] = useState(null);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [issue, setIssue] = useState("");
  const [duration, setDuration] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [finalCost, setFinalCost] = useState("");
  const [requiresParts, setRequiresParts] = useState(false);
  const [repairDate, setRepairDate] = useState("");
  const [repairTime, setRepairTime] = useState("");


 
    const fetchAppointment = useCallback(async () => {
      try {
        const res = await api.get(`/api/appointments/${id}`);
        setAppointment(res.data);
      } catch (err) {
        console.error("Fetch appointment error:", err);
        setMessage("Failed to load appointment");
      } finally {
        setLoading(false);
      }
    }, [id]);

    useEffect(() => {
      fetchAppointment();  
    },[fetchAppointment]);
    
  

  const requestOtp = async () => {
    try {
      await api.post(`/api/otp/${id}/request-diagnosis-otp`);
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
      await api.post(`/api/otp/${id}/verify-diagnosis-otp`, { otp });
      setMessage("OTP verified. Diagnosis started.");
      setOtp("");
    } catch (err) {
      console.error("Verify OTP error:", err);
      setMessage("Invalid OTP");
    }
  };

    const submitDiagnosis = async () => {
      if (!issue || !duration || !estimatedCost || !finalCost || !repairDate) {
         alert("Please fill all required fields");
         return;
    }

    try {
      await api.post(`/api/appointments/${id}/diagnosis-complete`, {
        issue_description: issue,
        estimated_duration: Number(duration),
        estimated_cost: Number(estimatedCost),
        final_cost: Number(finalCost),
        requires_parts: requiresParts,
        suggested_repair_date: repairDate,
        suggested_repair_time: repairTime
    });

     setMessage("Diagnosis completed. Quote sent to customer.");
     await fetchAppointment();

   } catch (err) {
     console.error("Diagnosis completion error:", err);
     alert("Failed to complete diagnosis");
    }
   };

   const requestRepairOtp = async () => {
  try {
    await api.post(`/api/otp/${id}/request-repair-otp`);
    setMessage("Repair OTP sent to customer");
  } catch (err) {
    setMessage("Failed to send repair OTP");
    console.log("error otp sending:",err.message);
  }
};

const verifyRepairOtp = async () => {
  if (!otp) return alert("Enter OTP");

  try {
    await api.post(`/api/otp/${id}/verify-repair-otp`, { otp });
    setOtp("");
    setMessage("Repair started");
    window.location.reload(); // simple refresh
  } catch (err) {
    setMessage("Invalid OTP");
    console.log("invalid otp:",err.message);
  }
};

    const requestPaymentOtp = async () => {
  if (!finalCost) return alert("Enter final amount");

  try {
    await api.post(`/api/otp/${id}/request-payment-otp`);
    setMessage("Payment OTP sent");
  } catch (err) {
    setMessage("Failed to send payment OTP");
    console.log("sending otp error:", err.message);
  }
};

const verifyPaymentOtp = async () => {
  if (!otp) return alert("Enter OTP");

  try {
    await api.post(`/api/otp/${id}/verify-payment-otp`, {
      otp,
      final_cost: Number(finalCost)
    });

    setMessage("Payment completed successfully");
    setOtp("");
    window.location.reload();
  } catch (err) {
    setMessage("Payment verification failed");
    console.log("payment verification error:", err.message);   
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

      {appointment.status === "diagnosis_in_progress" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Complete Diagnosis</h3>

          <textarea
            placeholder="Issue description"
            value={issue}
            onChange={e => setIssue(e.target.value)}
            rows={3}
            style={{ width: "100%" }}
        />

        <input
          placeholder="Estimated duration (minutes)"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          type="number"
        />

        <input
          placeholder="Estimated cost"
          value={estimatedCost}
          onChange={e => setEstimatedCost(e.target.value)}
          type="number"
        />

        <input
          placeholder="Final cost"
          value={finalCost}
          onChange={e => setFinalCost(e.target.value)}
          type="number"
        />

       <label>
         <input
           type="checkbox"
           checked={requiresParts}
           onChange={e => setRequiresParts(e.target.checked)}
         />
         Requires parts
       </label>

       <br />

       <input
         type="date"
         value={repairDate}
         onChange={e => setRepairDate(e.target.value)}
       />

       <input
         type="time"
         value={repairTime}
         onChange={e => setRepairTime(e.target.value)}
       />

       <br />

       <button onClick={submitDiagnosis}>
         Submit Diagnosis
      </button>
    </div>
   )}
    {appointment.status === "repair_scheduled" && (
  <>
    <button onClick={requestRepairOtp}>
      Start Repair (Request OTP)
    </button>

    <div style={{ marginTop: "10px" }}>
      <input
        placeholder="Enter OTP"
        value={otp}
        onChange={e => setOtp(e.target.value)}
      />
      <button onClick={verifyRepairOtp} style={{ marginLeft: "8px" }}>
        Verify OTP
      </button>
    </div>
  </>
)}
    {appointment.status === "repair_in_progress" && (
  <>
    <h3>Complete Repair & Payment</h3>

    <input
      placeholder="Final Amount"
      type="number"
      value={finalCost}
      onChange={e => setFinalCost(e.target.value)}
    />

    <button onClick={requestPaymentOtp}>
      Request Payment OTP
    </button>

    <div style={{ marginTop: "10px" }}>
      <input
        placeholder="Enter Payment OTP"
        value={otp}
        onChange={e => setOtp(e.target.value)}
      />
      <button onClick={verifyPaymentOtp}>
        Verify Payment
      </button>
    </div>
  </>
)}

    </div>
  );
}
