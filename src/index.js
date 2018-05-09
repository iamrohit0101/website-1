/* eslint-disable no-console */
const logger = require('winston');
const fs = require('fs');
const https = require('https');
const path = require('path');
const app = require('./app');
const port = app.get('port');
const http = require('http');

//force ipv4
const httpServer = http.createServer(app).listen(80, "0.0.0.0");

app.get("*", function (req, res, next) {
    res.redirect("https://" + req.headers.host + "/" + req.path);
});

const server = https.createServer({
   key: fs.readFileSync(path.resolve(__dirname, app.get('key'))),
   cert: fs.readFileSync(path.resolve(__dirname, app.get('cert'))),
   ca: fs.readFileSync(path.resolve(__dirname, app.get('ca')))
   //force ipv4
}, app).listen(port, "0.0.0.0");

// Call app.setup to initialize all services and SocketIO
app.setup(server);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

httpServer.on('listening', () =>
  logger.info(`Feathers application started on ${app.get('host')}:80`)
);

server.on('listening', () =>
  logger.info(`Feathers application started on ${app.get('host')}:${port}`)
);
