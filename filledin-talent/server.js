/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const next = require('next');

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Health check endpoint useful for cPanel/monitors
  server.get('/health', (_req, res) => res.status(200).send('OK'));

  // Let Next.js handle all other routes
  server.all('*', (req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});