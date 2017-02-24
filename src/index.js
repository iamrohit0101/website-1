'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const app = require('./app');
const port = app.get('port');

let server;

// Enable https if paths to key, cert, and ca files has been configured
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

server.listen(port);
app.setup(server);
