import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!config.smtp.user || !config.smtp.pass) {
    console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Community Platform" <${config.smtp.user}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send email:', error);
    // Don't throw - email failure shouldn't break signup
  }
}

export function getVerificationEmailHtml(code: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1 style="font-size: 32px; letter-spacing: 8px; text-align: center; background: #f0f0f0; padding: 20px;">
        ${code}
      </h1>
      <p>This code expires in 10 minutes.</p>
    </div>
  `;
}
