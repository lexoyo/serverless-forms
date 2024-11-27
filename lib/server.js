import http from 'http';
import fs from 'fs/promises';
import { processForm } from './post.js';

async function displayForm(res) {
  try {
    const filePath = process.env.FORM || 'public/form.html';
    const data = await fs.readFile(filePath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Form not found.');
  }
}

function startServer() {
  const port = process.env.PORT || 8080;

  const server = http.createServer((req, res) => {
    if (req.method === 'GET') displayForm(res);
    else if (req.method === 'POST') processForm(req, res);
  });

  server.listen(port, () => console.log(`Server listening on port ${port}`));
}

export default startServer;
