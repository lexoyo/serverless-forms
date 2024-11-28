import formidable from 'formidable';
import { sendMail } from './email.js';
import { sendHook } from './hook.js';

function generateEmailBody(fields, referer, options) {
  return `
    <p>A new form submission was received from your website ${referer}</p>
    <table border="1" cellpadding="5" cellspacing="0">
        <tr><th>Field</th><th>Value</th></tr>
        ${Object
          .keys(fields)
          .filter(field => field !== options.honeyField)
          .filter(field => field !== options.siteField)
          .filter(field => field !== options.tokenField)
          .filter(field => field !== options.thanksField)
          .map(field => `<tr><td>${field}</td><td>${fields[field]}</td></tr>`)
          .join('')}
    </table>
    <p>${options.disclaimer}</p>
  `
}

// get the email addresses from the `TO` env var
// @example TO="email1@domain,email2@domain"
// @example TO="{ \"token1\": \"email1@domain\", \"token2\": \"email2@domain\" }"
function toJsonOrString(jsonOrString) {
  try {
    if(typeof jsonOrString === 'string') {
      return [null, JSON.parse(jsonOrString)];
    } else {
      return [null, jsonOrString];
    }
  } catch (e) {
    console.info('TO env var is not a JSON object. Using as a string.');
    return [jsonOrString, null];
  }
}

function getRecipient(fields, options) {
  const [toStr, toJson] = toJsonOrString(options.to);
  const to = toStr || toJson[fields[options.tokenField]];
  if (!to) {
    console.error('No email address found in the form', { toStr, toJson }, `Add a field named ${options.tokenField} with a value that matches one of the tokens in the TO env var`);
    throw new Error(`No email address found for token: ${fields[options.tokenField]}`);
  }
  return to
}

function getHook(fields, options) {
  if(!options.hook || !options.tokenField) {
    return null;
  }
  const key = fields[options.tokenField];
  if(!key) {
    console.warn(`No token found in the form for field ${options.tokenField}`);
    return null;
  }
  try {
    if(typeof options.hook === 'string') {
      const hookJson = JSON.parse(options.hook);
      return hookJson[key];
    } else {
      return options.hook[key];
    }
  } catch(e) {
    console.error('HOOK env var is not a JSON object');
    throw new Error(`HOOK env var is not a JSON object. ${e.message}`);
  }
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
      handleForm(fields, req.headers.referer, options, JSON.stringify(req.headers));
      handleResponse(res, fields, options);
    } catch (err) {
      handleError(res, err);
    }
  });

  form.parse(req);
}

// Exported for testing
export async function handleForm(fields, refererHeader, options, headersString) {
  const referer = fields[options.siteField] || refererHeader || 'your website';
  const html = generateEmailBody(fields, referer, options);
  const to = getRecipient(fields, options);
  const hook = getHook(fields, options);
  // Hook
  if(hook) {
    await sendHook(html, to, headersString, hook);
  }
  // Honey pot
  if (fields[options.honeyField]) {
    console.error('Honey pot field was filled. Headers:', headersString);
    return;
  }
  // Email
  await sendMail(html, to, `New form submission on ${referer}`, options.mail);
}
