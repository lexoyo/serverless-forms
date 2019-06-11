# email-form-data

Nodejs server to forward all POST submission by email. Inspired by [formspree](http://formspree.io/), but with the goal to be simpler to install.

```
$ npm i
$ EMAIL_USER="me@myemail.com" EMAIL_PASS="abcd" EMAIL_HOST="mail.gandi.net" EMAIL_PORT=587 TO="my.name@gmail.com" npm start

> email-form-data start
> node .

server listening on  8080

```

Then open localhost:8080 and you will see the HTML form which resides in `form.html`. Submit the form and it will send you an email with the content of the form.

You can customize the form, it will keep sending you all the field of the form by email.

Here are all the env vars you can use
* PORT: port to listen to
* FORM: path to the HTML file containing the form
* MESSAGE: displayed after the form submission
* EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS: [nodemailer](https://nodemailer.com/) config used to send emails, [see these options here](https://nodemailer.com/smtp/)
* TO: email address to send the form to
* FROM: email address to use as sender address
* SITE_NAME: name of your site, will be displayed in the email title

