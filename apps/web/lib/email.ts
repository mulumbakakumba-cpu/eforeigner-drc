import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendApplicationSubmittedEmail(
  email: string,
  fullName: string,
  applicationId: string
){
  await resend.emails.send({
    from: "eForeigner DRC <onboarding@resend.dev>",
    to: email,
    subject: "Visa Application Received",
    html: `
      <h2>Hello ${fullName},</h2>

      <p>Your visa application has been successfully submitted.</p>

      <p><strong>Application ID:</strong> ${applicationId}</p>

      <p>Status: <strong>Submitted</strong></p>

      <p>Thank you for using eForeigner DRC.</p>
    `,
  });
}
export async function sendApplicationApprovedEmail(
  email: string,
  fullName: string,
  applicationId: string
) {
  await resend.emails.send({
    from: "eForeigner DRC <onboarding@resend.dev>",
    to: email,
    subject: "Visa Application Approved",
    html: `
      <h2>Congratulations ${fullName}!</h2>

      <p>Your visa application has been <strong>approved</strong>.</p>

      <p><strong>Application ID:</strong> ${applicationId}</p>

      <p>We look forward to welcoming you to the Democratic Republic of Congo.</p>
    `,
  });
}

export async function sendApplicationRejectedEmail(
  email: string,
  fullName: string,
  applicationId: string
) {
  await resend.emails.send({
    from: "eForeigner DRC <onboarding@resend.dev>",
    to: email,
    subject: "Visa Application Update",
    html: `
      <h2>Hello ${fullName},</h2>

      <p>We regret to inform you that your visa application has been <strong>rejected</strong>.</p>

      <p><strong>Application ID:</strong> ${applicationId}</p>

      <p>If you believe this is an error or wish to reapply, please contact the immigration office.</p>
    `,
  });
}