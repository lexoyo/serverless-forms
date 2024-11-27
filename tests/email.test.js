import assert from 'assert';
import { sendMail } from '../lib/email.js';
import { getNextEmail, setupMailDev } from './setupMailDev.js';

describe('sendMail', function () {
  let maildev;
  before(async function () {
    maildev = await setupMailDev({
      smtp: 1025,
      web: 1080,
    });
  });

  after(async function () {
    maildev.close();
  });

  it('should send an email', async function () {
    const subject = 'Test Email';
    const html = '<p>This is a test email</p>';
    const to = 'test@example.com';

    // Send email
    await sendMail(html, to, subject, {
      host: 'localhost',
      port: 1025,
    });

    // Wait for email to be received
    let email = await getNextEmail();

    // Assertions
    assert.ok(email, 'Email should be defined');
    assert.strictEqual(email.subject, subject, 'Subject should match');
    assert.strictEqual(email.to[0].address, to, 'Recipient should match');
  });
})
