'use strict';

// HTTP request receives a number of arguments. 
// POST method is used with application/x-www-form-urlencoded MIME type. 
// The following arguments are passed to caller:

// call=play
// addr - client IP address
// clientid - nginx client id (displayed in log and stat)
// app - application name
// flashVer - client flash version
// swfUrl - client swf url
// tcUrl - tcUrl
// pageUrl - client page url
// name - stream name
// In addition to the above mentioned items all arguments passed explicitly 
// to play command are also sent with the callback. For example if stream 
// is accessed with the url rtmp://localhost/app/movie?a=100&b=face&foo=bar 
// then a, b & foo are also sent with callback.

module.exports = function(app) {
  return function(req, res, next) {
    const body = req.body;
    const streamkey = req.body.name;

    app.service('users').find({
      query: { streamkey: streamkey }
    })
    .then((users) => {
  		if (users.total > 0) {
        const user = users.data[0];
  			const username = user.username;
  			res.redirect(username);
        app.service('users').patch(user._id, {
          live: false
        }).then(() => {
          console.log(user.username + " is now not live");
        });
  		}
    })
    .catch(() => res.status(403).send('Forbidden'));
  };
};
