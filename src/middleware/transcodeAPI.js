'use strict'

const request = require('request-promise');
const config = require('../../config/default.json');
const fs = require('fs');
const path = require('path');

module.exports.transcodable = function(app) {
    return function(req, res, next) {
        if(req.headers['authorization']) {
            const apiKey = req.headers.authorization.split(' ')[1];
            if (config.transcodeKey.includes(apiKey)) {
                var transcodableStreams = [];

                getStreams(function(data) {
                    res.json(data);
                });
            } else {
                res.status(403).send('wrong key');
            }
        } else {
            res.status(403).send('no key');
        }

        function getStreams(callback) {
             request({
                url: 'https://angelthump.com/api',
                json: true
            }).then(async function (json) {
                var index = 0;
                for(const stream of json.stream_list) {
                    await getUser(function(data) {
                        if((data.patron || data.partner) && !data.transcode) {
                            transcodableStreams.push({username: stream.username});
                        } else if(index < 2 && !data.transcode) {
                            transcodableStreams.push({username: stream.username});
                        }
                        if (++index == json.stream_list.length) {
                            callback(transcodableStreams);
                        }
                    }, stream.username);
                }
            }).catch((e) => {
                res.render('errors.ejs', {code: 403, message: e.message});
            });
        }

        async function getUser(callback, username) {
            await request({
                url: 'https://angelthump.com/api/' + username,
                json: true
            }).then(function (userAPI) {
                callback({
                    patron: userAPI.patron,
                    partner: userAPI.partner,
                    transcode: userAPI.transcode
                });
            }).catch((e) => {
                res.render('errors.ejs', {code: 403, message: e.message});
            });
        }
    };
  };
  
module.exports.transcode = function(app) {
	return function(req, res, next) {
        if(req.headers['authorization']) {
            const apiKey = req.headers.authorization.split(' ')[1];
            if (config.transcodeKey.includes(apiKey)) {
                const username = req.body.username;
                app.service('users').find({
                    query: { username: username }
                }).then((users) => {
                    if (users.total > 0) {
                        const user = users.data[0];
                        app.service('users').patch(user._id, {
                            transcode: req.body.transcode
                        }).then(() => {
                            res.status(200).send(user.username + ": " + req.body.transcode);
                        }).catch((e) => {
                            res.status(500).send(e);
                        });
                    } else {
                        res.status(404).send("Can't find user");
                    }
                });
            } else {
                res.status(403).send('wrong key');
            }
        } else {
            res.status(403).send('no key');
        }
	};
};

/*
 * Add droplet to list
 */
module.exports.addDroplet = function(app) {
	return function(req, res, next) {
        if(req.headers['authorization']) {
            const apiKey = req.headers.authorization.split(' ')[1];
            if (config.transcodeKey.includes(apiKey)) {
                const dropletJSON = require('../../config/droplet.json');
                const username = req.body.username;
                const dropletID = req.body.dropletID;
                var exists = false;
                for(const droplet of dropletJSON) {
                    if(droplet.dropletID == dropletID || droplet.username == username) {
                        exists = true;
                        break;
                    }
                }
                if(!exists) {
                    dropletJSON.push({dropletID: dropletID, username: username});
                    fs.writeFile(path.join(__dirname, '../../config/droplet.json'), JSON.stringify(dropletJSON), 'utf-8', function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("using " + dropletID + " to transcode " + username);
                        }
                    });
                    res.status(200).send("using " + dropletID + " to transcode " + username);
                } else {
                    res.status(500).send(dropletID + " or " + username + " already exists!");
                }
            } else {
                res.status(403).send('wrong key');
            }
        } else {
            res.status(403).send('no key');
        }
	};
};

/*
 * Remove droplet from list
 */
module.exports.deleteDroplet = function(app) {
	return function(req, res, next) {
        if(req.headers['authorization']) {
            const apiKey = req.headers.authorization.split(' ')[1];
            if (config.transcodeKey.includes(apiKey)) {
                const dropletJSON = require('../../config/droplet.json');
                const dropletID = req.body.dropletID;
                var exists = false;
                var stream;
                for(var i=0; i<dropletJSON.length; i++) {
                    const droplet = dropletJSON[i];
                    if(droplet.dropletID == dropletID) {
                        stream = droplet.username;
                        exists = true;
                        dropletJSON.splice(i,1);
                        break;
                    }
                }
                if(exists) {
                    fs.writeFile(path.join(__dirname, '../../config/droplet.json'), JSON.stringify(dropletJSON), 'utf-8', function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("removed " + dropletID);
                        }
                    });
                    res.status(200).send("removed " + dropletID + " from " + stream);
                } else {
                    res.status(404).send(dropletID + " does not exist!");
                }
            } else {
                res.status(403).send('wrong key');
            }
        } else {
            res.status(403).send('no key');
        }
	};
};

/*
 * Update droplet from list
 */
module.exports.updateDroplet = function(app) {
	return function(req, res, next) {
        if(req.headers['authorization']) {
            const apiKey = req.headers.authorization.split(' ')[1];
            if (config.transcodeKey.includes(apiKey)) {
                const dropletJSON = require('../../config/droplet.json');
                const dropletID = req.body.dropletID;
                const username = req.body.username;
                var exists = false;
                for(var i=0; i<dropletJSON.length; i++) {
                    const droplet = dropletJSON[i];
                    if(droplet.dropletID == dropletID) {
                        exists = true;
                        dropletJSON.splice(i,1,{dropletID: dropletID, username: username});
                        break;
                    }
                }
                if(exists) {
                    fs.writeFile(path.join(__dirname, '../../config/droplet.json'), JSON.stringify(dropletJSON), 'utf-8', function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("updated " + dropletID);
                        }
                    });
                    res.status(200).send("updated " + dropletID);
                } else {
                    res.status(404).send(dropletID + " does not exist!");
                }
            } else {
                res.status(403).send('wrong key');
            }
        } else {
            res.status(403).send('no key');
        }
	};
};

/*
 * Show a list of transcode droplets and their current job
 */
module.exports.listDroplets = function(app) {
	return function(req, res, next) {
        if(req.headers['authorization']) {
            const apiKey = req.headers.authorization.split(' ')[1];
            if (config.transcodeKey.includes(apiKey)) {
                const dropletJSON = require('../../config/droplet.json');
                res.json(dropletJSON);
            } else {
                res.status(403).send('wrong key');
            }
        } else {
            res.status(403).send('no key');
        }
	};
};