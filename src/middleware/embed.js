'use strict';

const geolite2 = require('geolite2');
const maxmind = require('maxmind');
const requestIp = require('request-ip');
const lookup = maxmind.openSync(geolite2.paths.city);

module.exports = function(app) {
    return function(req, res, next) {
        if (req.hostname.includes('www')) {
            res.redirect('https://angelthump.com' + req.url);
            return;
        }
        const requested_username = req.params.username;
        app.service('users').find({
            query: { username: requested_username }
        })
        .then((users) => {
            if (users.total > 0) {
                const referer = req.header('Referer') || '/';
                if(/*referer.includes("t.co") || referer.includes("reddit.com") ||*/ referer.includes('facebook.com')) {
                    console.log('redirecting ' + referer);
                    res.redirect('https://www.youtube.com/watch?v=z-zxaKQfW6s');
                } else {
                    const user = users.data[0];
                    if(user.banned) {
                        res.status(401).render('errors.ejs', {code: 401, message: "User is banned"});
                    } else {
                        if(user.passwordProtected) {
                            if(req.query.password == null) {
                                res.redirect('https://angelthump.com/checkPassword?streamname=' + requested_username.toLowerCase());
                            } else {
                                if(req.query.password == user.streamPassword) {
                                    render(req, res, user, false);
                                } else {
                                    res.redirect('https://angelthump.com/checkPassword?streamname=' + requested_username.toLowerCase());
                                }
                            }
                        } else {
                            render(req, res, user, false);
                        }
                    }
                }
            } else {
                res.status(404).render('errors.ejs', {code: 404, message: `there is no stream named: ${requested_username}`});
            }
        }).catch((e) => {
            res.status(400).render('errors.ejs', {code: 400, message: `wtf did u do? ` + e});
        });
    };
};

/** 
 * Test-Bed
*/
module.exports.test = function(app) {
    return function(req, res, next) {
        if (req.hostname.includes('www')) {
            res.redirect('https://angelthump.com' + req.url);
            return;
        }
        const requested_username = req.params.username;
        app.service('users').find({
            query: { username: requested_username }
        })
        .then((users) => {
            if (users.total > 0) {
                const referer = req.header('Referer') || '/';
                if(referer.includes("t.co") || referer.includes("reddit.com") || referer.includes('facebook.com')) {
                    console.log('redirecting ' + referer);
                    res.redirect('https://www.youtube.com/watch?v=z-zxaKQfW6s');
                } else {
                    const user = users.data[0];
                    if(user.banned) {
                        res.status(401).render('errors.ejs', {code: 401, message: "User is banned"});
                    } else {
                        if(user.passwordProtected) {
                            if(req.query.password == null) {
                                res.redirect('https://angelthump.com/checkPassword?streamname=' + requested_username.toLowerCase());
                            } else {
                                if(req.query.password == user.streamPassword) {
                                    render(req, res, user, true);
                                } else {
                                    res.redirect('https://angelthump.com/checkPassword?streamname=' + requested_username.toLowerCase());
                                }
                            }
                        } else {
                            render(req, res, user, true);
                        }
                    }
                }
            } else {
                res.status(404).render('errors.ejs', {code: 404, message: `there is no stream named: ${requested_username}`});
            }
        }).catch((e) => {
            res.status(400).render('errors.ejs', {code: 400, message: `wtf did u do? ` + e});
        });
    };
};

function render(req, res, user, test) {
    const ip = requestIp.getClientIp(req);
    const data = lookup.get(ip);
    var continent = null;
    if(data !== null) {
        continent = data.continent.code;
    }
    var formatHost = function(sub) { return 'https://' + sub + '.angelthump.com/'; };
    var allPoPs = ['nyc', 'sfo', 'tor', 'fra1', 'lon', 'ams', 'sgp', 'blr'];
    var servers;
    var continentPoPs = {
        'NA': ['nyc', 'sfo', 'tor'],
        'SA': ['nyc', 'sfo', 'tor'],
        'EU': ['fra', 'lon', 'ams'],
        'AS': ['sgp', 'sfo', 'blr'],
        'OC': ['sgp', 'blr', 'sfo'],
        'AF': ['fra', 'ams'],
        'AN': ['ams', 'sgp'],
    };
    servers = (continentPoPs[continent] || allPoPs).map(formatHost);
    var poster = user.poster;
    if(poster) {
        poster = "https://angelthump.sfo2.cdn.digitaloceanspaces.com/offline-screens/uploads/" + user.poster;
    } else {
        poster = "https://angelthump.sfo2.cdn.digitaloceanspaces.com/offline-screens/default_offline.jpg";
    }

    if(!test) {
        res.render('embed', {username: user.username, live: user.live, poster: poster, servers: servers, transcode: user.playerTranscodeReady});
    } else {
        res.render('embed-test', {username: user.username, live: user.live, poster: poster, servers: servers, transcode: user.playerTranscodeReady});
    }
}