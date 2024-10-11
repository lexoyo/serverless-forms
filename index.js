'use strict';
var http = require('http');
var fs = require('fs');
var formidable = require("formidable");
var util = require('util');
var nodemailer = require('nodemailer');
var dotenv = require('dotenv');

// Init dotenv
dotenv.config();

// check for required env vars
if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.TO) {
    console.log('Missing required env vars. Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS and TO.');
    process.exit(1);
}

const TOKEN_FIELD = process.env.TOKEN_FIELD || 'token'
const SITE_FIELD = process.env.SITE_FIELD || 'site'
const [TO_STRING, TO_TOKENS] = getToWithTokens(process.env.TO);
console.log('TO_STRING:', TO_STRING, 'TO_TOKENS:', TO_TOKENS);

const defaultDisclaimer = 'A form has been submited on your website. This is an automated email. Please do not reply to this email.';

// setup the server
// listen on port specified by the `PORT` env var
var server = http.createServer(function (req, res) {
    if (req.method.toLowerCase() == 'get') {
        displayForm(res);
    } else if (req.method.toLowerCase() == 'post') {
        //processAllFieldsOfTheForm(req, res);
        processFormFieldsIndividual(req, res);
    }
});
var port = process.env.PORT || 8080;
server.listen(port);
console.log("server listening on ", port);

// serve HTML file
// located according to the `FORM` env var
function displayForm(res) {
    fs.readFile(process.env.FORM || 'form.html', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
                'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}


// get the email addresses from the `TO` env var
// @example TO="email1@domain,email2@domain"
// @example TO="{ \"token1\": \"email1@domain\", \"token2\": \"email2@domain\" }"
function getToWithTokens(to) {
    try {
        console.log('to:', to);
        return [null, JSON.parse(to)];
    } catch (e) {
        console.error('Error parsing TO:', e);
        return [to, null];
    }
}

function getTo(fields) {
    const to = TO_STRING || TO_TOKENS[fields[TOKEN_FIELD]]
    if (!to) {
        console.error('No email address found in the form', { TO_STRING, TO_TOKENS, TOKEN_FIELD }, `Add a field named ${TOKEN_FIELD} with a value that matches one of the tokens in the TO env var`);
        throw new Error(`No email address found for token: ${fields[TOKEN_FIELD]}`);
    }
    console.log('to:', to);
    return to
}

// get the POST data 
// and call the sendMail method
function processAllFieldsOfTheForm(req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        //Store the data from the fields in your data store.
        //The data store could be a file or database or any other store based
        //on your application.
        res.writeHead(200, {
            'content-type': 'text/plain'
        });
        res.write('received the data:\n\n');
        res.end(util.inspect({
            fields: fields,
            files: files
        }));
    });
}

function sendError(res, message, err) {
    console.error(message, err);
    res.writeHead(500, { 'content-type': 'text/html' });
    res.end(`
    <html>
        <head>
            <title>Error</title>
        <style>
            body {
                background-color: #f8f9fa;
                font-family: sans-serif;
                margin: 0;
                padding: 0;
            }
            section {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 100vh;
                max-width: 50vw;
                margin: auto;
                border: 1px solid #f0f0f0;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                background-color: #fff;
            }
            h1 {
              text-align: center;
              padding: 20px;
              margin: 0;
              background-color: #333;
              color: white;
            }
            main {
                padding: 1em;
            }
            footer {
                padding: 1em;
                border-top: 1px solid #f0f0f0;
                text-align: center;
            }
            a {
                color: #007bff;
            }
            pre {
                white-space: pre-wrap;
                border: 1px solid #f0f0f0;
                padding: 1em;
                background-color: #f0f0f0;
                border-radius: 5px;
                margin: 1em 0;
            }
            hr {
                border: 0;
                border-top: 1px solid #f0f0f0;
            }
        </style>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta charset="utf-8">
        <meta name="robots" content="noindex, nofollow">
        <meta name="description" content="Error">
        </head>
        <body>
        <section>
            <main>
                <h1>Error / Erreur</h1>
                <p>Sorry, an error occured. Your form was not submitted.</p>
                <p>Une erreur est survenue. Votre formulaire n'a pas été envoyé.</p>
                <hr>
                <p>${message}</p>
                <pre>${err}</pre>
                <p><a href="javascript:history.back()">Go back</a></p>
            </main>
            <footer>
                <p><a href="https://github.com/lexoyo/serverless-forms">Powered by serverless-forms</a></p>
            </footer>
        </section>
        </body>
    `);
}

function processFormFieldsIndividual(req, res) {
    //Store the data from the fields in your data store.
    //The data store could be a file or database or any other store based
    //on your application.
    var fields = [];
    var form = new formidable.IncomingForm();
    form.on('field', function (field, value) {
        fields[field] = value;
    });

    const referer = fields[SITE_FIELD] || req.headers['referer'] || req.headers['x-forwarded'] || req.headers['x-forwarded-for'] || req.headers['origin'] || req.headers['host'] || 'your website';

    form.on('end', function () {
        let text;
        try {
            text = createHtmlEmailBody(fields, referer);
        } catch (e) {
            return sendError(res, 'Error creating email body', e);
        }
        let to;
        try {
            to = getTo(fields);
        } catch (e) {
            return sendError(res, 'Destination email not found for this form.', e);
        }
        try {
            sendMail(text, to, referer);
        } catch (e) {
            return sendError(res, 'Error sending email:', e);
        }
        if(process.env.REDIRECT === 'true' && fields.thanks) {
            if(!process.env.REDIRECT_DOMAINS.split(',').includes(new URL(fields.thanks).hostname)) {
                return sendError(res, `Redirect domain not allowed: ${new URL(fields.thanks).hostname}`, new Error('Redirect domain not allowed'));
            }
            console.log('Redirecting to:', fields.thanks);
            res.writeHead(302, {
                'Location': fields.thanks,
            });
            res.end();
            return;
        }
        res.writeHead(200, { 'content-type': 'text/html' });
        res.write(process.env.MESSAGE || 'Thank you for your submission.');
        res.end();
    });
    form.parse(req);
}

function createHtmlEmailBody(fields, referer) {
    return `
        <p>A new form submission was received from your website ${referer}</p>
        <table border="1" cellpadding="5" cellspacing="0">
            <tr><th>Field</th><th>Value</th></tr>
            ${Object.keys(fields).map(field => `<tr><td>${field}</td><td>${fields[field]}</td></tr>`).join('')}
        </table>
        <p>${process.env.DISCLAIMER || defaultDisclaimer}</p>
    `
}

// setup the email sender
// uses the nodemailer lib
// sends the email to the adress found in the `TO` env var
let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === 465, // secure:true for port 465, secure:false for port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function sendMail(text, to, referer) {
  // setup email data with unicode symbols
  const mailOptions = {
      from: process.env.FROM || 'Email form data bot <no-reply@no-email.com>',
      to,
      subject: `New form submission on ${referer}`,
      text: text
  };
  console.log('sending email: ', 'from:', process.env.FROM, 'to:', to, 'site name:', referer);
  
  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
  });
}
