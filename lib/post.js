import formidable from 'formidable';
import { sendMail } from './email.js';

function generateEmailBody(fields, referer, options) {
  return `
    <p>A new form submission was received from your website ${referer}</p>
    <table border="1" cellpadding="5" cellspacing="0">
        <tr><th>Field</th><th>Value</th></tr>
        ${Object.keys(fields).map(field => `<tr><td>${field}</td><td>${fields[field]}</td></tr>`).join('')}
    </table>
    <p>${options.disclaimer}</p>
  `
}

// get the email addresses from the `TO` env var
// @example TO="email1@domain,email2@domain"
// @example TO="{ \"token1\": \"email1@domain\", \"token2\": \"email2@domain\" }"
function getToWithTokens(to) {
  try {
    return [null, JSON.parse(to)];
  } catch (e) {
    console.info('TO env var is not a JSON object. Using as a string.');
    return [to, null];
  }
}

function getRecipient(fields, options) {
  const [toStr, toJson] = getToWithTokens(options.to);
  const to = toStr || toJson[fields[options.tokenField]]
  if (!to) {
    console.error('No email address found in the form', { toStr, toJson }, `Add a field named ${options.tokenField} with a value that matches one of the tokens in the TO env var`);
    throw new Error(`No email address found for token: ${fields[options.tokenField]}`);
  }
  return to
}

function handleResponse(res, fields, options) {
  if (options.redirect === 'true' && fields.thanks) {
    res.writeHead(302, { Location: fields.thanks });
    res.end();
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(options.message);
  }
}

function handleError(res, err) {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end(`Error: ${err.message}`);
}

export function processForm(req, res, options) {
  const form = new formidable.IncomingForm();
  const fields = {};

  form.on('field', (field, value) => {
    fields[field] = value;
  });

  form.on('end', async () => {
    try {
      handleForm(fields, req.headers.referer, options);
      handleResponse(res, fields, options);
    } catch (err) {
      handleError(res, err);
    }
  });

  form.parse(req);
}

// Exported for testing
export async function handleForm(fields, refererHeader, options) {
  const referer = fields[options.siteField] || refererHeader || 'your website';
  console.log('Received form submission', { fields, referer, options });
  const html = generateEmailBody(fields, referer, options);
  const to = getRecipient(fields, options);
  await sendMail(html, to, `New form submission on ${referer}`, {
    host: options.mail.host,
    port: options.mail.port,
    user: options.mail.user,
  });
}
