'use strict';

module.exports.create = function(app) {
  return function(req, res, next) {
		const attributes = req.body.data.attributes;
		if(attributes.amount_cents >= 500 && attributes.declined_since == null) {
			const patronID = req.body.data.relationships.patron.data.id;

			var includedInfo;
		    var includedAttributes;

		    includedLoop:
		    for(var x = 0; x < req.body.included.length; x++) {
		        if(req.body.included[x].id == patronID) {
		            includedInfo = req.body.included[x];
		            includedAttributes = includedInfo.attributes;
		            break includedLoop;
		        }
		    }

		    app.service('users').find({
	          query: { email: includedAttributes.email }
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
	                }
	            } else {
	            	console.error(user.email + " may not be verified or is banned or not found in system!");
	            	res.status(500).send("not found");
	            }
	        })
	        .catch(function(error){
	           console.error(error);
	           res.status(400).send("error");
	        });
		} else {
			res.status(400).send("not a 5 dolla patron or payment is declined");
		}
	}
}

module.exports.update = function(app) {
  return function(req, res, next) {
  	const attributes = req.body.data.attributes;
	if(attributes.amount_cents >= 500 && attributes.declined_since == null) {
		const patronID = req.body.data.relationships.patron.data.id;

		var includedInfo;
	    var includedAttributes;

	    includedLoop:
	    for(var x = 0; x < req.body.included.length; x++) {
	        if(req.body.included[x].id == patronID) {
	            includedInfo = req.body.included[x];
	            includedAttributes = includedInfo.attributes;
	            break includedLoop;
	        }
	    }

	    app.service('users').find({
          query: { email: includedAttributes.email }
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
            	console.error(user.email + " may not be verified or is banned or not found in system!");
            	res.status(500).send("not found");
            }
        })
        .catch(function(error){
           console.error(error);
           res.status(400).send("error");
        });
	} else if(attributes.amount_cents < 500 || attributes.declined_since != null) {
		const patronID = req.body.data.relationships.patron.data.id;

		var includedInfo;
	    var includedAttributes;

	    includedLoop:
	    for(var x = 0; x < req.body.included.length; x++) {
	        if(req.body.included[x].id == patronID) {
	            includedInfo = req.body.included[x];
	            includedAttributes = includedInfo.attributes;
	            break includedLoop;
	        }
	    }

	    app.service('users').find({
	      query: { email: includedAttributes.email }
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
	        	console.error(user.email + " not found in system!");
	        	res.status(500).send("not found");
	        }
	    })
	    .catch(function(error){
	       console.error(error);
	       res.status(400).send("error");
	    });
	}
  }
}

module.exports.delete = function(app) {
  return function(req, res, next) {
		const attributes = req.body.data.attributes;
		const patronID = req.body.data.relationships.patron.data.id;

		var includedInfo;
		var includedAttributes;

		includedLoop:
		for(var x = 0; x < req.body.included.length; x++) {
		    if(req.body.included[x].id == patronID) {
		        includedInfo = req.body.included[x];
		        includedAttributes = includedInfo.attributes;
		        break includedLoop;
		    }
		}

		app.service('users').find({
		  query: { email: includedAttributes.email }
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
		    	console.error(user.email + " not found in system!");
		    	res.status(500).send("not found");
		    }
		})
		.catch(function(error){
		   console.error(error);
		   res.status(400).send("error");
		});
	}
}