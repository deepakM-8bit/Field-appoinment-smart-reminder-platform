import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  try {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log("Email sent to:", to, "resendId:", result?.data?.id);
    return result;
  } catch (err) {
    console.error("Email send failed:", err.message);
    throw err;
  }
}
