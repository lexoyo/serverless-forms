import http from 'http';
import fs from 'fs/promises';
import { processForm } from './post.js';

async function displayForm(res, options) {
  try {
    const { form } = options;
    const data = await fs.readFile(form, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Form not found.');
  }
}

function startServer(options) {
  const { port } = options;
  const server = http.createServer((req, res) => {
    if (req.method === 'GET') displayForm(res, options);
    else if (req.method === 'POST') /* await */processForm(req, res, options);
  });

  server.listen(port, () => console.log(`Server listening on port ${port}`));
}

export default startServer;
