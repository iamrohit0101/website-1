const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const configuration = require('@feathersjs/configuration');
const rest = require('@feathersjs/express/rest');
const socketio = require('@feathersjs/socketio');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');

const authentication = require('./authentication');

const mongodb = require('./mongodb');

const fs = require('fs');
const morgan = require('morgan');
const requestIp = require('request-ip');
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs/access.log'), {flags: 'a'});
const util = require('./middleware/util');

const app = express(feathers());

// Load app configuration
app.configure(configuration(path.join(__dirname, '..')));
// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet({
  frameguard: false,
  hsts: false
}));
app.use(compress());
app.use(util.overrideContentType());
var rawBodySaver = function (req, res, buf, encoding) {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
}

app.use(bodyParser.json({ verify: rawBodySaver }));
app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: true }));
app.use(bodyParser.raw({ verify: rawBodySaver, type: '*/*' }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder

app.use('/', express.static(app.get('public')));

morgan.token('remote-addr', function (req) {
  return requestIp.getClientIp(req);
});

//log to file
app.use(morgan(':method :url :status :response-time ms - :res[content-length] - :remote-addr - [:date[clf]]', {stream: accessLogStream, skip: function (req, res) { 
	return app.get('skipIPs').includes(requestIp.getClientIp(req));
}}));

app.configure(mongodb);
app.configure(rest());
app.configure(socketio({
  wsEngine: 'uws'
}));

app.configure(socketio(function(io) {
  app.set('socketio', io);
}))

app.configure(authentication);

// Set up our services (see `services/index.js`)
app.configure(services);
// Configure middleware (see `middleware/index.js`) - always has to be last
app.configure(middleware);
app.hooks(appHooks);

module.exports = app;
