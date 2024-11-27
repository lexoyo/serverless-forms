import nodemailer from 'nodemailer';

function createTransporter(mailOptions) {
  return nodemailer.createTransport({
    host: mailOptions.host,
    port: Number(mailOptions.port),
    secure: mailOptions.port === '465',
    auth: mailOptions.user && mailOptions.pass ? {
      user: mailOptions.user,
      pass: mailOptions.pass,
    } : undefined,
  });
}

export async function sendMail(html, to, subject, options) {
  const transporter = createTransporter(options);
  const mailOptions = {
    from: options.from,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
}
