import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export async function sendMail(html, to, subject) {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.FROM || 'no-reply@no-email.com',
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
}
