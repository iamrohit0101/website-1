/* eslint-disable no-console */
const winston = require('winston');
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

// Call app.setup to initialize all services and SocketIO
app.setup(httpServer);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

httpServer.on('listening', () =>
  logger.info(`Feathers application started on ${app.get('host')}:${port}`)
);