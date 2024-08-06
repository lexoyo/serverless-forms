# Serverless Forms

This project is made for those who need to add custom HTML forms a static page or static website.

It is a simple nodejs server which forwards all POST submission by email. Inspired by the excellent [formspree](http://formspree.io/) with the goal to be simpler to install and cheaper to host. No database, 100% server (nodejs), just sends the submissions by email.

Suggestion: you can automate the management of the subissions with tools like [Huginn](https://github.com/huginn/huginn), [node-red](https://nodered.org/), [IFTTT](https://ifttt.com/discover), [Zappier](https://zapier.com/)

Links:

* [repository on github](https://github.com/lexoyo/serverless-forms/)
* [package on npm](https://www.npmjs.com/package/serverless-form)

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

## Usage

### Test with the example form

Open `http://localhost:8080` to see the HTML form which resides in `form.html`.

Submit the form and it will send you an email with the content of the form.

### Send data with forms

Create any html form and POST data to the server, it will keep sending you all the field of the form by email.

## Config

Here are all the environment variables you can use

| Env var | description |
|---|---|
| MESSAGE | Message to displayed after the form submission. May contain HTML. Default: 'Thank you for your submission.' |
| TO | Email address to send the form to (your email) |
| FROM | Email address to use as sender address |
| SITE_NAME | Name of your site, will be displayed in the email title |
| PORT | Port to listen to for form submissions |
| FORM | Path to the HTML file containing the example form, defaults to ./form.html |
| EMAIL_HOST | SMTP config: [see these options here](https://nodemailer.com/smtp/) |
| EMAIL_PORT | SMTP config: [see these options here](https://nodemailer.com/smtp/) |
| EMAIL_USER | SMTP config: [see these options here](https://nodemailer.com/smtp/) |
| EMAIL_PASS | SMTP config: [see these options here](https://nodemailer.com/smtp/) |
