# Serverless Forms

This project is made for those who need to add forms to their static page or static website.

It is a simple nodejs server which forwards all POST submission by email. Inspired by the excellent [formspree](http://formspree.io/) which is not open source anymore and it was too hard to self host anyway.

No database, 100% server (nodejs or Docker), just sends the submissions by email.

100% free software. No data is kept on the server. No tracking. No cookie.

Suggestion: thanks to the webhook feature you can automate the management of the subissions with tools like [Huginn](https://github.com/huginn/huginn), [node-red](https://nodered.org/), [codeberg](https://codeberg.org/about/)/[forgejo](https://forgejo.org/)...

Links:

* [repository on github](https://github.com/lexoyo/serverless-forms/)
* [package on npm](https://www.npmjs.com/package/serverless-form)

Features and road map

- [x] Send email with submited form data
- [x] Send email to multiple recipients
- [x] Use tokens in place of email addresses to avoid spam
- [x] Make sure sensitive data is not logged or stored on the server
- [x] Thank you page redirection
- [x] Use tokens instead of emails to avoid being scrapped and spammed
- [x] Easy self hosting with a docker image or instructions for nodejs
- [ ] Error page redirection or message in GET
- [ ] Send confirmation email to the form submitter
- [ ] Captcha to avoid spam
- [ ] Honeypot field to avoid spam
- [ ] Webhook to send data to other services
- [ ] Localisation of the messages / emails (i18n, multiple languages)

## Usage

### Test with the example form

Open `http://localhost:8080` to see the HTML form which resides in `form.html`.

Submit the form and it will send you an email with the content of the form.

### Customize the form

Create any html form which POST data to the server, it will keep sending you all the field of the form by email.

Example:

```html
<form method="post" action="http://localhost:8080">
  <input type="text" name="name" placeholder="Name" required>
  <input type="email" name="email" placeholder="Email" required>
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
</form>
```

For this to work, the server must be started with the following environment variables:

```bash
TO="email1@example.com,email2@example.com" \
EMAIL_USER="username" \
EMAIL_PASS="*******" \
EMAIL_HOST="mail.gandi.net" \
EMAIL_PORT=587 \
npm start
```

### Tokens

This is a feature to avoid spam. You can use tokens in place of email addresses to avoid spam. The form will be expected to have a hidden field with the name `token` and the value of the token. If the token is found in the object, the email will be sent to the corresponding email address(es).

Start the app with the following environment variable
  
  ```bash
  TO='{"token1":"email1@example.com","token2":"email2@example.com,email3@example.com"}' \
  # ... other env variables
  npm start
  ```

Add a hidden field to your form with the name `token` and the value of the token you want to use.

```html
<form method="post" action="http://localhost:8080">
  <input type="hidden" name="token" value="token1">
  <input type="text" name="name" placeholder="Name" required>
  <input type="email" name="email" placeholder="Email" required>
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
</form>
```

### Thank you page

You can provide a link to a thank you page in the form. The server will redirect to this page after the form is submitted.

```html
<form method="post" action="http://localhost:8080">
  <input type="text" name="name" placeholder="Name" required>
  <input type="email" name="email" placeholder="Email" required>
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
  <input type="hidden" name="thanks" value="http://localhost:8080/thank-you.html">
</form>

```

For this to work, you need to start the server with the following environment variable:

```bash
REDIRECT=true \
REDIRECT_DOMAINS="localhost,your-domain.com" \
# ... other env variables
npm start
```

### Site name

You can provide a site name to be used in the email subject and body.

```html
<form method="post" action="http://localhost:8080">
  <input type="text" name="name" placeholder="Name" required>
  <input type="email" name="email" placeholder="Email" required>
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
  <input type="hidden" name="site" value="My Site">
</form>
```

## Install

### Docker

You can use the docker image to run the serverless form server.

```
docker run -e EMAIL_USER="username" \
  EMAIL_PASS="********" \
  EMAIL_HOST="mail.gandi.net" \
  EMAIL_PORT=587 \
  TO="me@myemail.com" \
  -p 8080:8080 lexoyo/serverless-form
```

### 1 click deploy

Deploy in 1 click on heroku

[![Deploy in 1 click](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/lexoyo/email-form-data/tree/master)

### Local install

Clone this repository and run the following commands:

```
$ npm install
$ EMAIL_USER="username" \
  EMAIL_PASS="*******" \
  EMAIL_HOST="mail.gandi.net" \
  EMAIL_PORT=587 \
  TO="me@myemail.com" \
  npm start
```

## Config

Here are all the environment variables you can use

| Env var | description |
|---|---|
| MESSAGE | Message to displayed after the form submission. May contain HTML. Default: 'Thank you for your submission.' |
| DISCLAIMER | Message added to the email sent to the recipient. May contain HTML. Default: 'A form has been submited on your website. This is an automated email. Please do not reply to this email.' |
| TO | Email address(es) to send the form to (your email) |
| TO | A json object with tokens as keys and email addresses as values. The form will be expected to have a hidden field with the name `token` and the value of the token. If the token is found in the object, the email will be sent to the corresponding email address(es). |
| FROM | Email address to use as sender address |
| REDIRECT | If set to true, the server will redirect to the URL provided in the `thanks` hidden field of the form |
| REDIRECT_DOMAINS | Comma separated list of domains for which the server will redirect to the URL provided in the `thanks` hidden field of the form |
| PORT | Port to listen to for form submissions |
| FORM | Path to the HTML file containing the example form, defaults to ./form.html |
| EMAIL_HOST | SMTP config: [see these options here](https://nodemailer.com/smtp/) |
| EMAIL_PORT | SMTP config: [see these options here](https://nodemailer.com/smtp/) |
| EMAIL_USER | SMTP config: [see these options here](https://nodemailer.com/smtp/) |
| EMAIL_PASS | SMTP config: [see these options here](https://nodemailer.com/smtp/) |
