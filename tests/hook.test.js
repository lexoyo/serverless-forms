import assert from 'assert';
import http from 'http';
import { sendHook } from '../lib/hook.js';

describe('sendHook', () => {
  it('should send a message to the hook', async () => {
    let receivedData;
    let receivedHeaders;
    const server = await new Promise((resolve) => {
      // Listen for the hook
      const server = http.createServer((req, res) => {
        // get the request body from IncomingMessage
        let data = '';
        req.on('data', (chunk) => {
          data += chunk;
        });
        req.on('end', () => {
          res.end();
          receivedData = JSON.parse(data.toString());
        });
        receivedHeaders = req.headers;
        res.end();
      });
      server.listen(3000, () => resolve(server));
    });
    const html = '<h1>Test</h1>';
    const to = 'alex';
    const reqHeaders = 'test';
    const hook = {
      url: 'http://localhost:3000',
      headers: {
        'Authorization': 'test',
        'Content-Type': 'application/json',
      },
    };
    await sendHook(html, to, reqHeaders, hook, { name: 'Ada', email: 'ada@example.com' }, false, 'response');
    await new Promise((resolve) => setTimeout(resolve, 100));
    server.close();
    assert.ok(receivedData, 'Data should be defined');
    assert.strictEqual(receivedData.message, html, 'Message should match');
    assert.strictEqual(receivedData.to, to, 'Email should match');
    assert.strictEqual(typeof receivedData.fields, 'string', 'Fields should be sent as text');
    assert.deepStrictEqual(JSON.parse(receivedData.fields), { name: 'Ada', email: 'ada@example.com' }, 'Fields should round-trip');
    assert.strictEqual(receivedData.name, 'Ada', 'Each field should still be sent on its own');
    assert.ok(receivedHeaders, 'Headers should be defined');
    assert.strictEqual(receivedHeaders.Authorization, reqHeaders.Authorization, 'Headers should match');
  });
})