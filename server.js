// Custom HTTP server for cPanel / Phusion Passenger deployments.
// Passenger sets PORT automatically; PM2 users can ignore this file.
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const app = next({ dev: false });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || '3000', 10);

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  }).listen(port, '0.0.0.0', () => {
    console.log(`Jimbo's Nursery running on port ${port}`);
  });
});
