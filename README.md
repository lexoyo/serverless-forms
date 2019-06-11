# Serverless Forms

Nodejs server to forward all POST submission by email. Inspired by the excellent [formspree](http://formspree.io/) with the goal to be simpler to install and use. No database, 100% server (nodejs).

## 1 click deploy
Deploy in 1 click on heroku

[![Deploy in 1 click](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/lexoyo/email-form-data/tree/master)

## Local install and use

1- type these 2 commands

```
$ npm install
$ EMAIL_USER="me@myemail.com" \
  EMAIL_PASS="abcd" \
  EMAIL_HOST="mail.gandi.net" \
  EMAIL_PORT=587 TO="my.name@gmail.com" \
  npm start
```

2- Open `http://localhost:8080` to see the HTML form which resides in `form.html`. Submit the form and it will send you an email with the content of the form.

3- You can customize the form, it will keep sending you all the field of the form by email.

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
