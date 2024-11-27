import formidable from 'formidable';
import { sendMail } from './email.js';

const TOKEN_FIELD = process.env.TOKEN_FIELD || 'token';
const SITE_FIELD = process.env.SITE_FIELD || 'site';
const [TO_STRING, TO_TOKENS] = getToWithTokens(process.env.TO);
console.log('TO_STRING:', TO_STRING, 'TO_TOKENS:', TO_TOKENS);

function generateEmailBody(fields, referer) {
  return `
    <p>A new form submission was received from your website ${referer}</p>
    <table border="1" cellpadding="5" cellspacing="0">
        <tr><th>Field</th><th>Value</th></tr>
        ${Object.keys(fields).map(field => `<tr><td>${field}</td><td>${fields[field]}</td></tr>`).join('')}
    </table>
    <p>${process.env.DISCLAIMER || defaultDisclaimer}</p>
  `
}

// get the email addresses from the `TO` env var
// @example TO="email1@domain,email2@domain"
// @example TO="{ \"token1\": \"email1@domain\", \"token2\": \"email2@domain\" }"
function getToWithTokens(to) {
  try {
    console.log('to:', to);
    return [null, JSON.parse(to)];
  } catch (e) {
    console.info('TO env var is not a JSON object. Using as a string.');
    return [to, null];
  }
}

function getRecipient(fields) {
  const to = TO_STRING || TO_TOKENS[fields[TOKEN_FIELD]]
  if (!to) {
    console.error('No email address found in the form', { TO_STRING, TO_TOKENS, TOKEN_FIELD }, `Add a field named ${TOKEN_FIELD} with a value that matches one of the tokens in the TO env var`);
    throw new Error(`No email address found for token: ${fields[TOKEN_FIELD]}`);
  }
  console.log('to:', to);
  return to
}

function handleResponse(res, fields) {
  if (process.env.REDIRECT === 'true' && fields.thanks) {
    console.log('Redirecting to:', fields.thanks);
    res.writeHead(302, { Location: fields.thanks });
    res.end();
  } else {
    console.log('Sending response...');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(process.env.MESSAGE || 'Thank you for your submission.');
  }
}

function handleError(res, err) {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end(`Error: ${err.message}`);
}

export function processForm(req, res) {
  console.log('Processing form submission...');
  const form = new formidable.IncomingForm();
  const fields = {};

  form.on('field', (field, value) => {
    fields[field] = value;
  });

  form.on('end', async () => {
    try {
      const referer = fields[SITE_FIELD] || req.headers.referer || 'your website';
      const html = generateEmailBody(fields, referer);
      const to = getRecipient(fields);
      await sendMail(html, to, `New form submission on ${referer}`);
      handleResponse(res, fields);
    } catch (err) {
      handleError(res, err);
    }
  });

  form.parse(req);
}
