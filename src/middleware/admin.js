'use strict';

const socketio = require('@feathersjs/socketio-client');
const io = require('socket.io-client');
const config = require('../../config/default.json');

module.exports.reload = function(app) {
  return function(req, res, next) {
    const requested_username = req.params.username;
    const ip = req.connection.remoteAddress.substring(req.connection.remoteAddress.lastIndexOf(":") + 1, req.connection.remoteAddress.length);
    if (config.adminIPs.includes(ip)) {
      const socket = io('https://angelthump.com');
      socket.on('connect', function() {
        socket.emit('channel', requested_username);
        socket.emit('reload', requested_username);
        res.status(200).send("ok");
        socket.disconnect();
      });
    }
  };
};

module.exports.redirect = function(app) {
  return function(req, res, next) {
    const requested_username = req.params.username;
    const puntUsername = req.params.puntUsername;
    const ip = req.connection.remoteAddress.substring(req.connection.remoteAddress.lastIndexOf(":") + 1, req.connection.remoteAddress.length);
    if (config.adminIPs.includes(ip)) {
      const socket = io('https://angelthump.com');
      socket.on('connect', function() {
        socket.emit('channel', requested_username);
        socket.emit('redirect', requested_username, "https://angelthump.com/embed/" + puntUsername);
        res.status(200).send("ok");
        socket.disconnect();
      });
    }
  };
};

module.exports.checkPassword = function(app) {
  return function(req, res, next) {
    const streamname = req.body.streamname;
    const password = req.body.password;

    app.service('users').find({
		query: { username: streamname }
    })
    .then((users) => {
    	const user = users.data[0];
      if(user.streamPassword == password || password == config.adminPass) {
        res.redirect('https://angelthump.com/embed/' + streamname + "?password=" + password);
      } else {
        res.redirect('https://angelthump.com/embed/' + streamname);
      }
    })
    // On errors, just call our error middleware
    .catch((error) => {
      res.status(400).send(error.message);
    });
  };
};
