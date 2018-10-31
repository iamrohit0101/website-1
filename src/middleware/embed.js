'use strict';

const geolite2 = require('geolite2');
const maxmind = require('maxmind');
const requestIp = require('request-ip');
const lookup = maxmind.openSync(geolite2.paths.city);
const rp = require('request-promise');

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
                                    render(req, res, user, false, user.transcode);
                                } else {
                                    res.redirect('https://angelthump.com/checkPassword?streamname=' + requested_username.toLowerCase());
                                }
                            }
                        } else {
                            render(req, res, user, false, user.transcode);
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
                                    render(req, res, user, true, user.transcode);
                                } else {
                                    res.redirect('https://angelthump.com/checkPassword?streamname=' + requested_username.toLowerCase());
                                }
                            }
                        } else {
                            render(req, res, user, true, user.transcode);
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

function render(req, res, user, test, transcoding) {
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
        'NA': ['nyc', 'sfo', 'tor', 'ams'],
        'SA': ['nyc', 'sfo', 'tor'],
        'EU': ['fra', 'lon', 'ams', 'tor'],
        'AS': ['sgp', 'blr', 'fra', 'ams'],
        'OC': ['sgp', 'blr', 'sfo'],
        'AF': ['fra', 'ams', 'lon', 'nyc'],
        'AN': ['sgp', 'blr', 'ams'],
    };
    servers = (continentPoPs[continent] || allPoPs).map(formatHost);

    if(!test) {
        res.render('embed', {username: req.params.username, poster: user.poster, servers: servers, transcode: transcoding});
    } else {
        res.render('embed-test', {username: req.params.username, poster: user.poster, servers: servers});
    }
}