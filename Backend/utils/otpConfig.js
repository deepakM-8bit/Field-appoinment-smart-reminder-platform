export const OTP_CONFIG = {
  start_diagnosis: {
    allowedStatus: "diagnosis_scheduled",
    nextStatus: "diagnosis_in_progress",
    emailSubject: "OTP for Diagnosis",
    logEventSend: "diagnosis_otp_sent",
    logEventVerify: "diagnosis_started"
  },

  start_repair: {
    allowedStatus: "repair_scheduled",
    nextStatus: "repair_in_progress",
    emailSubject: "OTP to Start Repair",
    logEventSend: "repair_otp_sent",
    logEventVerify: "repair_started"
  },

  payment: {
    allowedStatus: "repair_in_progress",
    nextStatus: null, // payment does not change appointment status
    emailSubject: "OTP for Payment Confirmation",
    logEventSend: "payment_otp_sent",
    logEventVerify: "payment_completed"
  }
};
