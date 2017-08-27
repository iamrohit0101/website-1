'use strict';

const config = require('../../config/default.json');

module.exports.paywall = function(app) {
  return function(req, res, next) {
    const ip = req.connection.remoteAddress.substring(req.connection.remoteAddress.lastIndexOf(":") + 1, req.connection.remoteAddress.length);
    if (config.adminIPs.includes(ip)) {
      app.service('users').find({
        query: { username: req.params.username }
      })
      .then((users) => {
        if (users.total > 0) {
          const user = users.data[0];
          if(user.paywall) {
              res.render('success.ejs', {message: user.username + " is already paywalled"});
          } else {
              app.service('users').patch(user._id, {
                  paywall: true
              }).then(() => {
                  console.log(user.username + " is now paywalled!");
                  res.render('success.ejs', {message: user.username + " is now paywalled"});
              });
          }
        } else {
          res.render('errors.ejs', {code: 404, message: "could not find " + req.params.username});
        }
      });
    } else {
      res.render('errors.ejs', {code: 500, message: "go away"});
    }
  };
};

module.exports.undoPaywall = function(app) {
  return function(req, res, next) {
    const ip = req.connection.remoteAddress.substring(req.connection.remoteAddress.lastIndexOf(":") + 1, req.connection.remoteAddress.length);
    if (config.adminIPs.includes(ip)) {
      app.service('users').find({
        query: { username: req.params.username }
      })
      .then((users) => {
        const user = users.data[0];
        if (users.total > 0) {
          if(!user.paywall) {
              res.render('success.ejs', {message: "Already not paywalled"});
          } else {
              app.service('users').patch(user._id, {
                  paywall: false
              }).then(() => {
                  console.log(user.username + " is not paywalled any longer!");
                  res.render('success.ejs', {message: user.username + " is not paywalled any longer"});
              });
          }
        } else {
          res.render('errors.ejs', {code: 404, message: "could not find " + req.params.username});
        }
      });
    } else {
      res.render('errors.ejs', {code: 500, message: "go away"});
    }
  };
};