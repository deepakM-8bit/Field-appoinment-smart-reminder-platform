export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;
  const fromName = process.env.FROM_NAME || "Field Appointment System";

  if (!apiKey) throw new Error("BREVO_API_KEY missing in env");
  if (!fromEmail) throw new Error("FROM_EMAIL missing in env");

  const payload = {
    sender: { name: fromName, email: fromEmail },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  try {
    const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      // Brevo returns useful error JSON, show it
      console.error("BREVO API ERROR:", data);
      throw new Error(data?.message || `Brevo API failed: ${resp.status}`);
    }

    console.log("Email sent:", { to, messageId: data?.messageId });
    return data;
  } catch (err) {
    console.error("Email send failed:", err.message);
    throw err;
  }
}
