
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({
  to,
  subject,
  html = '',
  text = '',
  fromName = 'Turfadda',
  cc = [],
  bcc = [],
  attachments = [],
} = {}) => {
  if (!to) throw new Error('Recipient email (to) is required');
  if (!subject) throw new Error('Email subject is required');
  if (!html && !text) throw new Error('Either html or text body is required');

  try {
    const mailOptions = {
      from: `"${fromName}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html,
      cc: cc.length ? cc.join(',') : undefined,
      bcc: bcc.length ? bcc.join(',') : undefined,
      attachments: attachments.length ? attachments : undefined,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully to ${to} - Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};