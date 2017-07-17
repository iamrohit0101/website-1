/* eslint-disable no-console */
const logger = require('winston');
const fs = require('fs');
const https = require('https');
const path = require('path');
const app = require('./app');
const port = app.get('port');
const http = require('http');
const httpApp = require('./app');

const httpServer = http.createServer(httpApp).listen(80);

httpApp.get("*", function (req, res, next) {
    res.redirect("https://" + req.headers.host + "/" + req.path);
});

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
