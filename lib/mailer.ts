import { Resend } from "resend";

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "TutorLink <noreply@tutorlink.cc>",
    to,
    subject,
    html,
  });
}
