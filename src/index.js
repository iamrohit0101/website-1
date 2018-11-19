/* eslint-disable no-console */
const winston = require('winston');
const fs = require('fs');
const https = require('https');
const path = require('path');
const app = require('./app');
const port = app.get('port');
const http = require('http');

const logger = winston.createLogger(
  {
    level: 'info',
    format: winston.format.simple(),
    transports: [
      new winston.transports.Console()
    ]
  },
  {
    level: 'debug',
    format: winston.format.simple(),
    transports: [
      new winston.transports.Console()
    ]
  },
  {
    level: 'error',
    format: winston.format.simple(),
    transports: [
      new winston.transports.Console()
    ]
  }
);

//force ipv4
const httpServer = http.createServer(app).listen(port, "0.0.0.0");

const server = https.createServer({
   key: fs.readFileSync(path.resolve(__dirname, app.get('key'))),
   cert: fs.readFileSync(path.resolve(__dirname, app.get('cert'))),
   ca: fs.readFileSync(path.resolve(__dirname, app.get('ca')))
   //force ipv4
}, app).listen(443, "0.0.0.0");

// Call app.setup to initialize all services and SocketIO
app.setup(server);
app.setup(httpServer);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

httpServer.on('listening', () =>
  logger.info(`Feathers application started on ${app.get('host')}:${port}`)
);

server.on('listening', () =>
  logger.info(`Feathers application started on ${app.get('host')}:443`)
);
