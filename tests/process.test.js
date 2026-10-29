import assert from 'assert';
import http from 'http';
import { processForm } from '../lib/post.js';

describe('processForm', function () {
  let server;
  let port;
  const options = {
    to: JSON.stringify({ knownToken: 'alex@test.com' }),
    tokenField: 'token',
    thanksField: 'thanks',
    honeyField: 'email2',
    redirect: 'true',
    // Unreachable SMTP: the mail fails after the answer, the process must survive it
    mail: { host: '127.0.0.1', port: 9 },
  };

  before(function (done) {
    server = http.createServer((req, res) => processForm(req, res, options));
    server.listen(0, () => {
      port = server.address().port;
      done();
    });
  });

  after(function (done) {
    server.close(done);
  });

  function post(body) {
    return fetch(`http://localhost:${port}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body),
      redirect: 'manual',
    });
  }

  it('should answer 400 to an unknown token without crashing', async function () {
    const res = await post({ token: 'unknownToken', email: 'a@test.com', thanks: 'https://example.com/merci' });
    assert.strictEqual(res.status, 400);
    const text = await res.text();
    assert.ok(!text.includes('alex@test.com'), 'The recipients must not leak in the answer');
    // The server is still up
    const again = await post({ token: 'unknownToken' });
    assert.strictEqual(again.status, 400);
  });

  it('should redirect a known token and survive a mail failure', async function () {
    this.timeout(15000);
    const res = await post({ token: 'knownToken', email: 'a@test.com', thanks: 'https://example.com/merci' });
    assert.strictEqual(res.status, 302);
    assert.strictEqual(res.headers.get('location'), 'https://example.com/merci');
    // Let the mail fail in the background, then check the server still answers
    await new Promise(resolve => setTimeout(resolve, 3000));
    const again = await post({ token: 'unknownToken' });
    assert.strictEqual(again.status, 400);
  });
});
