'use strict';

const socketio = require('@feathersjs/socketio-client');
const io = require('socket.io-client');

module.exports.individual = function(app) {
  return function(req, res, next) {
		var requested_username = req.params.username.toLowerCase();

    app.service('users').find({
      query: { username: requested_username }
    })
    .then((users) => {
      if (users.total > 0) {
      	const user = users.data[0];
        const username = user.username;
        const title = user.title;
        const date = user.streamCreatedAt;
				const passwordProtected = user.passwordProtected;
				const banned = user.banned;
        const socket = io('https://angelthump.com');

        socket.on('connect', function() {
						socket.emit('channel',username);
						socket.on('viewers', function(viewers) {
							res.json({
								username: user.username,
								live: user.live,
								title: title,
								viewers: parseInt(viewers - 1, 10),
								passwordProtected: passwordProtected,
								banned: banned,
								poster: user.poster,
								thumbnail: `https://thumbnail.angelthump.com/thumbnails/${username}.jpeg`,
								created_at: date,
							});
							socket.disconnect();
					});
				});
      } else {
        res.render('errors.ejs', {code: 404, message: `No Users Named ${requested_username}`});
      }
    })
    .catch((e) => {
      res.render('errors.ejs', {code: 403, message: e.message});
    });
  };
};


module.exports.all = function(app) {
  return function(req, res, next) {

    app.service('users').find({
      query: { live: true }
    })
    .then((users) => {
    var total_connections = 0;
    var total_viewers = 0;
    function api(callback) {
    	var jsonArray = [];
    	var number = 0;
    	for(var i = 0; i < users.total; i++) {
			const user = users.data[i];
			const username = user.username;;
			const title = user.title;
			const date = user.streamCreatedAt;
			const socket = io('https://angelthump.com');

			socket.on('connect', function() {
			    socket.emit('channel',username);
			    socket.on('total_connections', function(connections) {
			    	total_connections = connections;
			    });
			    socket.on('viewers', function(viewers) {
			    	total_viewers += (viewers - 1);

					var jsonObject = {
						username: user.username,
						viewers: parseInt(viewers - 1, 10)
					};
					jsonArray.push(jsonObject);
					socket.disconnect();

					if (++number == users.total) {
			    		callback(jsonArray);
			    	}
				});
			});
	    }
    }

    function sortBy(prop){
	   return function(a,b){
	      if( b[prop] > a[prop]){
	          return 1;
	      }else if( b[prop] < a[prop] ){
	          return -1;
	      }
	      return 0;
	   }
	}

	if(users.total != 0) {
			api(function(data) {
					data.sort(sortBy("viewers"));
					res.json({stream_list: data, streams: users.total, total_viewers: total_viewers, connections: total_connections});
				});
		} else {
			res.json({stream_list: [], streams: users.total, total_viewers: total_viewers, connections: total_connections});
		}
	})
    .catch((e) => {
      res.render('errors.ejs', {code: 403, message: e.message});
    });
  };
};