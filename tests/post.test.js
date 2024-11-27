import assert from 'assert';
import { handleForm } from '../lib/post.js';
import { getNextEmail, setupMailDev } from './setupMailDev.js';

describe('handleForm', function () {
  const smtpPort = 1025;
  let maildev;
  before(async function () {
    maildev = await setupMailDev({
      smtp: smtpPort,
      web: 1080,
    });
  });

  after(function () {
    maildev.close();
  });

  it('should call sendmmail with the form data', async function () {
    const email = 'alex@test.com';
    const name = 'Alex';

    // Process the form
    await handleForm({
      name,
      email,
    }, undefined, {
      mail: {
        host: 'localhost',
        port: smtpPort,
      },
      to: 'alex@test.com',
    })

    // Wait for email to be received
    const received = await getNextEmail();

    // Assertions
    assert.ok(received, 'Email should be defined');
    assert.strictEqual(received.subject, 'New form submission on your website', 'Subject should match');
    assert.strictEqual(received.html.includes(name), true, 'Name should be in the email');
    assert.strictEqual(received.html.includes(email), true, 'Name should be in the email');
  });

  it('should use the referer in the title', async function () {
    const referer = 'https://example.com';
    await handleForm({}, referer, {
      mail: {
        host: 'localhost',
        port: smtpPort,
      },
      to: 'alex@test.com',
    })

    // Wait for email to be received
    const received = await getNextEmail();

    // Assertions
    assert.ok(received, 'Email should be defined');
    assert.strictEqual(received.subject, `New form submission on ${referer}`, 'Subject should match');
    assert.strictEqual(received.html.includes(referer), true, 'Name should be in the email');
  });

  it('should use the site field in the title', async function () {
    const referer = 'https://example.com';
    const site = 'My Site';
    await handleForm({
      site,
    }, referer, {
      mail: {
        host: 'localhost',
        port: smtpPort,
      },
      to: 'alex@test.com',
      siteField: 'site',
    })

    // Wait for email to be received
    const received1 = await getNextEmail();

    // Assertions
    assert.ok(received1, 'Email should be defined');
    assert.strictEqual(received1.subject, `New form submission on ${site}`, 'Subject should match');
    assert.strictEqual(received1.html.includes(referer), false, 'Referer should be in the email');
    assert.strictEqual(received1.html.includes(site), true, 'Site should be in the email');

    // Now without referer
    await handleForm({
      site,
    }, undefined, {
      mail: {
        host: 'localhost',
        port: smtpPort,
      },
      to: 'alex@test.com',
      siteField: 'site',
    })

    // Wait for email to be received
    const received2 = await getNextEmail();

    // Assertions
    assert.ok(received2, 'Email should be defined');
    assert.strictEqual(received2.subject, `New form submission on ${site}`, 'Subject should match');
    assert.strictEqual(received2.html.includes(referer), false, 'Referer should be in the email');
    assert.strictEqual(received2.html.includes(site), true, 'Site should be in the email');
  });

  it('should not send an email if the honeypot field is filled', async function () {
    await handleForm({
      email: 'alex@test.com',
      phone: '1234567890',
    }, undefined, {
      mail: {
        host: 'localhost',
        port: smtpPort,
      },
      to: 'alex@test.com',
      honeyField: 'phone',
    })

    const received = await getNextEmail();
    assert.strictEqual(received, undefined, 'Email should not be defined');
  });
});
