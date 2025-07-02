/**
 * Email Utility Module
 * Handles email sending functionality with different configurations for production and development
 */

const nodemailer = require("nodemailer");
require('dotenv').config();

/**
 * Send an email using configured transport
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} text - Plain text version of email content
 * @param {string} html - HTML version of email content (optional)
 * @returns {Promise<boolean>} Success status of email sending
 * @description
 * In production: Uses Gmail SMTP with environment variables
 * In development: Uses Ethereal for email testing
 */
const sendEmail = async (to, subject, text, html) => {
  let transporter;

  try {
    if (process.env.NODE_ENV === 'production') {
      // Production configuration using Gmail SMTP
      console.log('🌐 Using production email settings (Gmail)');
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for others
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS, // Gmail App-specific password
        },
      });
    } else {
      // Development configuration using Ethereal
      console.log('🧪 Using development email settings (Ethereal)');
      // Create test account for development
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

    // Verify SMTP connection configuration
    await transporter.verify();
    console.log('✅ Email transporter is ready to send messages');

    // Configure email content and metadata
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Document Manager" <noreply@example.com>',
      to,
      subject,
      text,
      html: html || text, // Fallback to text if HTML not provided
    };

    // Send email and get result
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}!`);

    // In development, log Ethereal preview URL
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Ethereal Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return true;

  } catch (error) {
    // Handle email sending failures
    console.error('❌ Error sending email:', error);
    // Check if transporter configuration failed
    if (!transporter) {
        console.error('❌ Transporter was not created. Check your .env variables.');
    }
    return false;
  }
};

// Export the email sending function
module.exports = sendEmail;