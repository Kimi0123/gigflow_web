import nodemailer from "nodemailer";
import { getSmtpConfig } from "../config/env";

export async function sendPasswordResetEmail(
  to: string,
  code: string,
  resetLink: string,
): Promise<void> {
  try {
    const smtp = getSmtpConfig();

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">GigFlow Password Reset</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.5;">
          You requested a password reset for your GigFlow account. Use the 6-digit code below:
        </p>
        <div style="margin: 25px 0; text-align: center; background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px dashed #cbd5e1;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0ea5e9; font-family: monospace;">${code}</span>
        </div>
        <p style="color: #334155; font-size: 14px; line-height: 1.5;">
          Alternatively, click the button below to open the reset page directly:
        </p>
        <div style="margin: 20px 0;">
          <a href="${resetLink}" target="_blank" style="background-color: #38bdf8; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password Page
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
          This code and link will expire in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">
          Direct Link:<br />
          <a href="${resetLink}" style="color: #0ea5e9; word-break: break-all;">${resetLink}</a>
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"GigFlow Support" <${smtp.user}>`,
      to,
      subject: `Your GigFlow Password Reset Code: ${code}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    // Suppress error so response timing/content does not reveal email status
  }
}
