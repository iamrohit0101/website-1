'use strict';
const config = require('../../config/default.json');

module.exports = function(app) {
  return function(req, res, next) {
    const streamname = req.body.streamname;
    const password = req.body.password;

    app.service('users').find({
		query: { username: streamname }
    })
    .then((users) => {
    	const user = users.data[0];
  		if (users.total > 0) {
  			if(user.streamPassword == password || password == config.adminPass) {
				res.json({
	        		result: true
				});
        	} else {
          		res.json({
          	 	 result: false
          		});
        	}
  		} else {
        	res.json({
         	   result: false
          	});
  		}
    })
    // On errors, just call our error middleware
    .catch((error) => {
      res.status(403).send(error.message);
    });
  };
};
