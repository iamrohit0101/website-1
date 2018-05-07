'use strict';
const config = require('../../config/default.json');
const requestIp = require('request-ip');

module.exports.reload = function(app) {
  return function(req, res, next) {
    const requested_username = req.params.username;
    const ip = requestIp.getClientIp(req);
    const io = app.get('socketio');
    if (config.adminIPs.includes(ip)) {
      console.log("reloading " + requested_username);
      io.to(requested_username).emit('reload');
      res.status(200).send("ok");
    } else {
      res.status(403);
    }
  };
};

module.exports.redirect = function(app) {
  return function(req, res, next) {
    const requested_username = req.params.username;
    const puntUsername = req.params.puntUsername;
    const ip = requestIp.getClientIp(req);
    const io = app.get('socketio');
    if (config.adminIPs.includes(ip)) {
      io.to(requested_username).emit('redirect', puntUsername);
      res.status(200).send("ok");
    } else {
      res.status(403);
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
