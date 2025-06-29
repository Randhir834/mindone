const nodemailer = require("nodemailer");
require('dotenv').config();

const sendEmail = async (to, subject, text, html) => {
  let transporter;

  try {
    if (process.env.NODE_ENV === 'production') {
      // --- Production Email (Gmail) ---
      console.log('🌐 Using production email settings (Gmail)');
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS, // Your Gmail App Password
        },
      });
    } else {
      // --- Development Email (Ethereal) ---
      console.log('🧪 Using development email settings (Ethereal)');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // Verify transporter connection
    await transporter.verify();
    console.log('✅ Email transporter is ready to send messages');

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Document Manager" <noreply@example.com>',
      to,
      subject,
      text,
      html: html || text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}!`);

    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Ethereal Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return true;

  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Ensure the transporter isn't the issue
    if (!transporter) {
        console.error('❌ Transporter was not created. Check your .env variables.');
    }
    return false;
  }
};

module.exports = sendEmail;