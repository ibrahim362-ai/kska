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
  connectionTimeout: 15000,  // 15 seconds
  greetingTimeout: 15000,    // 15 seconds
  socketTimeout: 20000,      // 20 seconds
});

export async function sendEmail(data: { to: string; subject: string; html: string; text?: string }) {
  const { to, subject, html } = data;
  
  if (!config.smtp.user || !config.smtp.pass) {
    console.error('[EMAIL ERROR] SMTP credentials not configured');
    throw new Error('Email service not configured. Please contact administrator.');
  }

  try {
    console.log(`[EMAIL] Attempting to send email to ${to}...`);
    
    // Add timeout wrapper (25 seconds max to match mobile timeout)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email timeout after 25 seconds')), 25000);
    });
    
    const sendPromise = transporter.sendMail({
      from: `"KSKA" <${config.smtp.user}>`,
      to,
      subject,
      html,
    });
    
    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log('[EMAIL SUCCESS] Message sent:', (info as any).messageId);
    return info;
  } catch (error: any) {
    console.error('[EMAIL ERROR] Failed to send email:', error.message);
    
    // More specific error messages
    if (error.message.includes('timeout')) {
      throw new Error('Email service is slow. Your verification code will arrive shortly. Please check your inbox in a moment.');
    } else if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please contact administrator.');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Cannot connect to email server. Please try again later.');
    }
    
    throw new Error('Failed to send email. Please check your email address or try again later.');
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
