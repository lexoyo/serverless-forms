import 'dotenv/config';
import startServer from './server.js';

if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.TO) {
  console.error('Missing required env vars. Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS and TO.');
  process.exit(1);
}

startServer({
  mail: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.FROM || 'no-reply@no-email.com',
  },

  to: process.env.TO,
  hook: process.env.HOOK,

  disclaimer: process.env.DISCLAIMER || 'A form has been submited on your website. This is an automated email. Please do not reply to this email.',
  redirect: process.env.REDIRECT,
  message: process.env.MESSAGE || 'Thank you for your submission.',

  tokenField: process.env.TOKEN_FIELD || 'token',
  thanksField: process.env.THANKS_FIELD || 'thanks',
  siteField: process.env.SITE_FIELD || 'site',
  honeyField: process.env.HONEY_FIELD || 'email2',

  port: process.env.PORT || 8080,
  form: process.env.FORM || 'public/form.html',
});
