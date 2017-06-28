'use strict';

const rp = require('request-promise');
const socketio = require('feathers-socketio/client');
const io = require('socket.io-client');

module.exports.individual = function(app) {
  return function(req, res, next) {
    const requested_username = req.params.username;
    console.log('api request for ', requested_username);

    app.service('users').find({
      query: { username: requested_username }
    })

    // Then we're good to check apis
    .then((users) => {
      //console.log(users.total, 'users found for that stream username', requested_username);
      if (users.total > 0) {
      	const user = users.data[0];
        const username = user.username;;
        const title = user.title;
        const date = user.streamCreatedAt;
        var count;

        const socket = io('https://angelthump.com');

        socket.on('connect', function() {
		    socket.emit('channel',username);
		    socket.on('viewers', function(viewers) {
				count = viewers - 1;

				res.json({
					username: user.username,
					live: user.live,
					title: title,
					viewers: parseInt(count, 10),
					poster: user.poster,
					thumbnail: `https://api.angelthump.com/thumbnail/${username}.jpg`,
					created_at: date,
				});

				socket.emit('end');
			});
		});

      }else{
        res.status(404).send(`No Users Named ${requested_username}`);
      }
    })
    // On errors, just call our error middleware
    .catch((e) => {
      console.log(e, 'forbidden requested_username:', requested_username);
      console.error(e.stack);
      res.status(403).send('Forbidden');
    });
  };
};


module.exports.all = function(app) {
  return function(req, res, next) {

    app.service('users').find({
      query: { live: true }
    })
    // Then we're good to check apis
    .then((users) => {
    var total_connections;
    function api(callback) {
    	var jsonArray = [];
    	var number = 0;
    	for(var i = 0; i < users.total; i++) {
			const user = users.data[i];
			const username = user.username;;
			const title = user.title;
			const date = user.streamCreatedAt;
			var count;
			const socket = io('https://angelthump.com');

			socket.on('connect', function() {
				socket.on('total_connections', function(connections) {
					total_connections = connections;
				});
			    socket.emit('channel',username);
			    socket.on('viewers', function(viewers) {
					count = viewers - 1;

					var jsonObject = {
						username: user.username,
						title: `${username}'s stream`,
						// title: title,
						viewers: parseInt(count, 10),
						thumbnail: `https://api.angelthump.com/thumbnail/${username}.jpg`,
						created_at: date,
					};
					jsonArray.push(jsonObject);
					socket.emit('end');

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
    		res.json({stream_list: data, streams: users.total, connections: total_connections});
    	});
	} else {
		res.json({stream_list: [], streams: users.total, connections: total_connections});
	}
})
    // On errors, just call our error middleware
    .catch((e) => {
      console.error(e.stack);
      res.status(403).send('Forbidden');
    });
  };
};