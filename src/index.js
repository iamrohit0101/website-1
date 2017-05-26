/* eslint-disable no-console */
const logger = require('winston');
const fs = require('fs');
const https = require('https');
const path = require('path');
const app = require('./app');
const port = app.get('port');

const server = https.createServer({
   key: fs.readFileSync(path.resolve(__dirname, app.get('key'))),
   cert: fs.readFileSync(path.resolve(__dirname, app.get('cert'))),
   ca: fs.readFileSync(path.resolve(__dirname, app.get('ca')))
}, app).listen(port);

// Call app.setup to initialize all services and SocketIO
app.setup(server);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info(`Feathers application started on ${app.get('host')}:${port}`)
);
