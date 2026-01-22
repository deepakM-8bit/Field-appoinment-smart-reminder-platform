import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  const from = process.env.FROM_EMAIL;

  if (!from) throw new Error("From_EMAIL is missing");
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is missing");

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error("RESEND Error:", result.error);
      throw new Error(result.error.message || "Resend send failed");
    }

    console.log("Email sent to:", to, "resendId:", result?.data?.id);
    return result;
  } catch (err) {
    console.error("Email send failed:", err.message);
    throw err;
  }
}
