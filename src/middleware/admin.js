'use strict';
const config = require('../../config/default.json');
const request = require('request');

module.exports.reload = function(app) {
  return function(req, res, next) {
    const requested_username = req.params.username;
    const apiKey = req.headers.authorization.split(' ')[1];
    if (config.adminKeys.includes(apiKey)) {
      console.log("reloading " + requested_username);
      request.post({
        url: 'https://viewer-api.angelthump.com/admin/reload/' + requested_username,
        headers: {
          'Authorization': 'Bearer ' + apiKey
        }
      });
      res.status(200).send("ok");
    } else {
      res.status(403).send('wrong key');
    }
  };
};

module.exports.redirect = function(app) {
  return function(req, res, next) {
    const requested_username = req.params.username;
    const puntUsername = req.params.puntUsername;
    const apiKey = req.headers.authorization.split(' ')[1];
    if (config.adminKeys.includes(apiKey)) {
      request.post({
        url: 'https://viewer-api.angelthump.com/admin/redirect/' + requested_username + '/' + puntUsername,
        headers: {
          'Authorization': 'Bearer ' + apiKey
        }
      });
      res.status(200).send("ok");
    } else {
      res.status(403).send('wrong key');
    }
  };
};

module.exports.ban = function(app) {
  return function(req, res, next) {
    const requested_username = req.params.username;
    const apiKey = req.headers.authorization.split(' ')[1];
    if (config.adminKeys.includes(apiKey)) {
      app.service('users').find({
        query: { username: requested_username }
      })
      .then((users) => {
        if(users.total > 0) {
          const user = users.data[0];
          if(!user.banned) {
            app.service('users').patch(user._id, {
              banned: true
            }).then(() => {
              drop(requested_username); 
              res.status(200).send(requested_username + " is now banned!");
            });
          } else {
            res.status(400).send("user is already banned");
          }
        } else {
          res.status(404).send("user not found");
        }
      });
      request.post({
        url: 'https://viewer-api.angelthump.com/admin/reload/' + requested_username,
        headers: {
          'Authorization': 'Bearer ' + apiKey
        }
      });
    } else {
      res.status(403).send('Not Authorized');
    }
  };
};

module.exports.unban = function(app) {
  return function(req, res, next) {
    const requested_username = req.params.username;
    const apiKey = req.headers.authorization.split(' ')[1];
    if (config.adminKeys.includes(apiKey)) {
      app.service('users').find({
        query: { username: requested_username }
      })
      .then((users) => {
        if(users.total > 0) {
          const user = users.data[0];
          if(user.banned) {
            app.service('users').patch(user._id, {
              banned: false
            }).then(() => {
              res.status(200).send(requested_username + " is now unbanned!");
            });
          } else {
            res.status(400).send("user is already not banned");
          }
        } else {
          res.status(404).send("user not found");
        }
      });
    } else {
      res.status(403).send('Not Authorized');
    }
  };
};

module.exports.changeTitle = function(app) {
  return function(req, res, next) {
    const requested_username = req.params.username;
    const apiKey = req.headers.authorization.split(' ')[1];
    const title = req.body.title;
    console.log(req);
    if (config.adminKeys.includes(apiKey)) {
      app.service('users').find({
        query: { username: requested_username }
      })
      .then((users) => {
        if(users.total > 0) {
          const user = users.data[0];
          app.service('users').patch(user._id, {
            title: title
          }).then(() => {
            res.status(200).send("Changed " + requested_username + "'s stream title to: " + title);
          }).catch((e) => {
            res.status(500).send(e);
          });
        } else {
          res.status(404).send("user not found");
        }
      });
    } else {
      res.status(403).send('Not Authorized');
    }
  };
};

function drop(username) {
  for(const server of config.ingestServers) {
    request('https://' + server + '.angelthump.com/control/drop/publisher?app=live&name=' + username);
  }
}

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
