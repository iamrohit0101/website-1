'use strict';

module.exports.create = function(app) {
  return function(req, res, next) {
		const attributes = req.body.data.attributes;
		if(attributes.amount_cents >= 500 && attributes.declined_since == null) {
			const includedEmail = req.body.included[0].attributes.email;

		    console.log(includedEmail + " to be created");

		    app.service('users').find({
	          query: { email: includedEmail }
	        })
	        .then((users) => {
				const user = users.data[0];
	            if (users.total > 0 && !user.banned && user.isVerified) {
	                if(!user.ifPatreon) {
	                	app.service('users').patch(user._id, {
	                        ifPatreon: true
	                    }).then(() => {
	                        console.log(user.email + " is now a patron!");
	                        res.status(200).send("ok!");
	                    });
	                } else {
						res.status(200).send("already a patron!");
					}
	            } else {
	            	console.log(includedEmail + " may not be verified or is banned or not found in system!");
	            	res.status(200).send("not found");
	            }
	        })
	        .catch(function(error){
	           console.log(error);
	           res.status(200).send("error");
	        });
		} else {
			res.status(200).send("not a 5 dolla patron or payment is declined");
		}
	}
}

module.exports.update = function(app) {
  return function(req, res, next) {
  	const attributes = req.body.data.attributes;
	if(attributes.amount_cents >= 500 && attributes.declined_since == null) {
		const includedEmail = req.body.included[0].attributes.email;

	    console.log(includedEmail + " to be updated & created");

	    app.service('users').find({
          query: { email: includedEmail }
        })
        .then((users) => {
            const user = users.data[0];
            if (users.total > 0 && !user.banned && user.isVerified) {
                if(!user.ifPatreon) {
                	app.service('users').patch(user._id, {
                        ifPatreon: true
                    }).then(() => {
                        console.log(user.email + " is now a patron!");
                        res.status(200).send("ok!");
                    });
                } else {
	            	console.log(user.email + " is already a patron!");
	                res.status(200).send("ok!");
	            }
            } else {
            	console.log(includedEmail + " may not be verified or is banned or not found in system!");
            	res.status(200).send("not found");
            }
        })
        .catch(function(error){
           console.log(error);
           res.status(200).send("error");
        });
	} else if(attributes.amount_cents < 500 || attributes.declined_since != null) {
		const includedEmail = req.body.included[0].attributes.email;

	    console.log(includedEmail + " to be updated & deleted");

	    app.service('users').find({
	      query: { email: includedEmail }
	    })
	    .then((users) => {
	        const user = users.data[0];
	        if (users.total > 0) {
	            if(user.ifPatreon) {
	            	app.service('users').patch(user._id, {
	                    ifPatreon: false
	                }).then(() => {
	                    console.log(user.email + " is now not a patron!");
	                    res.status(200).send("ok!");
	                });
	            } else {
	            	console.log(user.email + " is already not a patron!");
	                res.status(200).send("ok!");
	            }
	        } else {
	        	console.log(includedEmail.email + " not found in system!");
	        	res.status(200).send("not found");
	        }
	    })
	    .catch(function(error){
	       console.log(error);
	       res.status(200).send("error");
	    });
	}
  }
}

module.exports.delete = function(app) {
  return function(req, res, next) {
		const includedEmail = req.body.included[0].attributes.email;

		console.log(includedEmail + " to be deleted");

		app.service('users').find({
		  query: { email: includedEmail }
		})
		.then((users) => {
		    const user = users.data[0];
		    if (users.total > 0) {
		        if(user.ifPatreon) {
		        	app.service('users').patch(user._id, {
		                ifPatreon: false
		            }).then(() => {
		                console.log(user.email + " is now not a patron!");
		                res.status(200).send("ok!");
		            });
		        } else {
		        	console.log(user.email + " is already not a patron!");
		            res.status(200).send("ok!");
		        }
		    } else {
		    	console.log(includedEmail + " not found in system!");
		    	res.status(200).send("not found");
		    }
		})
		.catch(function(error){
		   console.log(error);
		   res.status(200).send("error");
		});
	}
}