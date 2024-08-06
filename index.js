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
        return
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

function processFormFieldsIndividual(req, res) {
    //Store the data from the fields in your data store.
    //The data store could be a file or database or any other store based
    //on your application.
    var fields = [];
    var form = new formidable.IncomingForm();
    form.on('field', function (field, value) {
        fields[field] = value;
    });

    form.on('end', function () {
        res.writeHead(200, {
            'content-type': 'text/html'
        });
        let text;
        try {
            text = createHtmlEmailBody(fields)
        } catch (e) {
            console.error('Error creating email body:', e);
            res.end('Error creating email body');
            return;
        }
        let to;
        try {
            to = getTo(fields);
        } catch (e) {
            console.error('Error getting email address:', e);
            res.end('Error getting email address');
            return;
        }
        try {
            sendMail(text, to);
        } catch (e) {
            console.error('Error sending email:', e);
            res.end('Error sending email');
            return;
        }
        res.write(process.env.MESSAGE || 'Thank you for your submission.');
        res.end();
    });
    form.parse(req);
}

function createHtmlEmailBody(fields) {
    return `
        <p>A new form submission was received from your website ${process.env.SITE_NAME}.</p>
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

function sendMail(text, to) {
  // setup email data with unicode symbols
  const mailOptions = {
      from: process.env.FROM || 'Email form data bot <no-reply@no-email.com>',
      to,
      subject: 'New form submission' + (process.env.SITE_NAME ? ' from your website ' + process.env.SITE_NAME : ''),
      text: text
  };
  console.log('sending email: ', 'from:', process.env.FROM, 'to:', to, 'site name:', process.env.SITE_NAME);
  
  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
  });
}
