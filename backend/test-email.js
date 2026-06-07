// Quick test script to verify SMTP email configuration
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'ibrahimkamil362@gmail.com',
    pass: 'akjm mvdy svcw svec',
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

async function testEmail() {
  try {
    console.log('Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    console.log('\nSending test email...');
    const info = await transporter.sendMail({
      from: '"KSKA" <ibrahimkamil362@gmail.com>',
      to: 'h49410834@gmail.com',
      subject: 'Test Email - OTP System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification Test</h2>
          <p>Your test verification code is:</p>
          <h1 style="font-size: 32px; letter-spacing: 8px; text-align: center; background: #f0f0f0; padding: 20px;">
            123456
          </h1>
          <p>This is a test email to verify SMTP configuration.</p>
        </div>
      `,
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\nCheck the inbox: h49410834@gmail.com');
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
  }
}

testEmail();
