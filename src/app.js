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
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs/access.log'), {flags: 'a'});

const app = express(feathers());

// Load app configuration
app.configure(configuration(path.join(__dirname, '..')));
// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet({
  frameguard: false
}));
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));

//log to file
app.use(morgan(':method :url :status :response-time ms - :res[content-length] - :remote-addr - [:date[clf]]', {stream: accessLogStream, skip: function (req, res) { 
  var ip = req.connection.remoteAddress;
  if(ip) {
    if (ip.substr(0, 7) == "::ffff:") {
      ip = ip.substr(7)
    }
  }
	return app.get('skipIPs').includes(ip);
}}));

app.configure(mongodb);
app.configure(rest());
app.configure(socketio({
  wsEngine: 'uws'
}));

app.configure(authentication);

// Set up our services (see `services/index.js`)
app.configure(services);
// Configure middleware (see `middleware/index.js`) - always has to be last
app.configure(middleware);
app.hooks(appHooks);

module.exports = app;
