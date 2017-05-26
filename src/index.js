/* eslint-disable no-console */
const logger = require('winston');
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const app = require('./app');
const port = app.get('port');

let server;
if (app.get('key') && app.get('cert') && app.get('ca')) {
  server = https.createServer({
    key: fs.readFileSync(path.resolve(__dirname, app.get('key'))),
    cert: fs.readFileSync(path.resolve(__dirname, app.get('cert'))),
    ca: fs.readFileSync(path.resolve(__dirname, app.get('ca')))
  }, app);
}

// Otherwise fall back to regular http
else {
  server = http.createServer(app);
}

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info(`Feathers application started on ${app.get('host')}:${port}`)
);
