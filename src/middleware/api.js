'use strict';

module.exports.individual = function(app) {
	return function(req, res, next) {
		var requested_username = req.params.username.toLowerCase();

		app.service('users').find({
				query: { username: requested_username }
		}).then((users) => {
			if (users.total > 0) {
				const user = users.data[0];
				if(!user.live || user.streamUpdatedAt == null) {
					res.json({
						username: user.username,
						banned: user.banned,
						poster: user.poster
					});
				} else {
					var timeDifference =Math.abs(Math.round(((new Date()).getTime() - user.streamUpdatedAt.getTime()) / 1000 / 60));
					if(timeDifference > 5) {
						app.service('users').patch(user._id, {
							live: false
						}).then(() => {
							console.log(username + " is now not live due to no update");
						});
					}
					const username = user.username;
					const io = app.get('socketio');
					if(io.sockets.adapter.rooms[username] != null) {
						res.json({
							username: user.username,
							live: user.live,
							title: user.title,
							viewers: io.sockets.adapter.rooms[username].length,
							passwordProtected: user.passwordProtected,
							banned: user.banned,
							poster: user.poster,
							thumbnail: `https://thumbnail.angelthump.com/thumbnails/${user.username}.jpeg`,
							created_at: user.streamCreatedAt
						});
					} else {
						res.json({
							username: user.username,
							live: user.live,
							title: user.title,
							viewers: 0,
							passwordProtected: user.passwordProtected,
							banned: user.banned,
							poster: user.poster,
							thumbnail: `https://thumbnail.angelthump.com/thumbnails/${user.username}.jpeg`,
							created_at: user.streamCreatedAt
						});
					}
				}
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
		const io = app.get('socketio');
		app.service('users').find({
			query: { live: true }
		}).then((users) => {
			var total_connections = 0;
			var total_viewers = 0;
			function api(callback) {
				var jsonArray = [];
				var number = 0;
				for(var i = 0; i < users.total; i++) {
					const user = users.data[i];
					if(user.streamUpdatedAt != null) {
						var timeDifference =Math.abs(Math.round(((new Date()).getTime() - user.streamUpdatedAt.getTime()) / 1000 / 60));
						if(timeDifference > 5) {
							app.service('users').patch(user._id, {
								live: false
							}).then(() => {
								console.log(username + " is now not live due to no update");
							});
							continue;
						}
					}
					const username = user.username;
					if(io.sockets.adapter.rooms[username] != null) {
						var jsonObject = {
							username: username,
							viewers: io.sockets.adapter.rooms[username].length
						};
						jsonArray.push(jsonObject);
						total_viewers += io.sockets.adapter.rooms[username].length;
					} else {
						var jsonObject = {
							username: username,
							viewers: 0
						};
						jsonArray.push(jsonObject);
					}
					if (++number == users.total) {
						callback(jsonArray);
					}
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
						res.json({stream_list: data, streams: users.total, total_viewers: total_viewers, connections: io.engine.clientsCount});
				});
			} else {
				res.json({stream_list: [], streams: users.total, total_viewers: total_viewers, connections: io.engine.clientsCount});
			}
		})
		.catch((e) => {
			res.render('errors.ejs', {code: 403, message: e.message});
		});
	};
};