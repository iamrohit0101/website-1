'use strict';

/** TODO: BESIDES GEOIP, RETURN BY AVAILABLITY (LOAD IS IMPORTANT) */

const geolite2 = require('geolite2');
const maxmind = require('maxmind');
const requestIp = require('request-ip');
const lookup = maxmind.openSync(geolite2.paths.city);
const rp = require('request-promise');

module.exports = function(app) {
    return function(req, res, next) {
        const requested_username = req.params.username;
        app.service('users').find({
            query: { username: requested_username }
        })
        .then((users) => {
            if (users.total > 0) {
                const referer = req.header('Referer') || '/';
                if(referer.includes("t.co") || referer.includes("reddit.com") || referer.includes('facebook.com')) {
                    console.log('redirecting ' + referer);
                    res.redirect('https://www.youtube.com/watch?v=xwU43wHaixU');
                } else {
                    const user = users.data[0];
                    if(user.banned) {
                        res.render('errors.ejs', {code: 401, message: "User is banned"});
                    } else {
                        if(user.passwordProtected) {
                            if(req.query.password == null) {
                                res.redirect('https://angelthump.com/checkPassword?streamname=' + requested_username.toLowerCase());
                            } else {
                                if(req.query.password == user.streamPassword) {
                                    const ip = requestIp.getClientIp(req); 
                                    const data = lookup.get(ip);
                                    const continent = data.continent.code;
                                    var servers = [];

                                    if(continent == 'NA') {
                                        servers = ["https://nyc1.angelthump.com/", "https://sfo1.angelthump.com/", "https://tor1.angelthump.com/"]
                                    } else if (continent == 'SA') {
                                        servers = ["https://nyc1.angelthump.com/", "https://sfo1.angelthump.com/", "https://tor1.angelthump.com/"]
                                    } else if (continent == 'EU') { //frankfurt london amsterdam 
                                        servers = ["https://fra1.angelthump.com/", "https://lon1.angelthump.com/", "https://ams1.angelthump.com/"]
                                    } else if (continent == 'AS') { //singapore, bangalore
                                        servers = ["https://sgp1.angelthump.com/", "https://blr1.angelthump.com/"]
                                    } else if (continent == 'OC') { //singapore
                                        servers = ["https://sgp1.angelthump.com/"]
                                    } else if (continent == 'AF') { //none
                                        servers = ["https://fra1.angelthump.com/", "https://lon1.angelthump.com/", "https://ams1.angelthump.com/", "https://blr1.angelthump.com/"]
                                    } else if (continent == 'AN') { //none
                                        console.log("?????? where " + data.city.names[0]);
                                    } else {
                                        console.log(continent + " help");
                                    }

                                    res.render('embed', {username: req.params.username, poster: user.poster, servers: servers});
                                } else {
                                    res.redirect('https://angelthump.com/checkPassword?streamname=' + requested_username.toLowerCase());
                                }
                            }
                        } else {
                            const ip = requestIp.getClientIp(req); 
                            const data = lookup.get(ip);
                            const continent = data.continent.code;
                            var servers = [];

                            if(continent == 'NA') {
                                servers = ["https://nyc1.angelthump.com/", "https://sfo1.angelthump.com/", "https://tor1.angelthump.com/"]
                            } else if (continent == 'SA') {
                                servers = ["https://nyc1.angelthump.com/", "https://sfo1.angelthump.com/", "https://tor1.angelthump.com/"]
                            } else if (continent == 'EU') { //frankfurt london amsterdam 
                                servers = ["https://fra1.angelthump.com/", "https://lon1.angelthump.com/", "https://ams1.angelthump.com/"]
                            } else if (continent == 'AS') { //singapore, bangalore
                                servers = ["https://sgp1.angelthump.com/", "https://blr1.angelthump.com/"]
                            } else if (continent == 'OC') { //singapore
                                servers = ["https://sgp1.angelthump.com/"]
                            } else if (continent == 'AF') { //none
                                servers = ["https://fra1.angelthump.com/", "https://lon1.angelthump.com/", "https://ams1.angelthump.com/", "https://blr1.angelthump.com/"]
                            } else if (continent == 'AN') { //none
                                console.log("?????? where " + data.city.names[0]);
                            } else {
                                console.log(continent + " help");
                            }

                            res.render('embed', {username: req.params.username, poster: user.poster, servers: servers});
                        }
                    }
                }
            } else {
                res.render('errors.ejs', {code: 404, message: `there is no stream named: ${requested_username}`});
            }
        }).catch((e) => {
            res.render('errors.ejs', {code: 400, message: `wtf did u do? ` + e});
        });
    };
};