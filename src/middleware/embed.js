'use strict';

module.exports = function(app) {
    return function(req, res, next) {
        const requested_username = req.params.username;
        app.service('users').find({
            query: { username: requested_username }
        })
        .then((users) => {
            if (users.total > 0) {
                const referer = req.header('Referer') || '/';
                if(referer.includes("t.co") || referer.includes("reddit.com") || referer.includes('facebook.com') || referer.includes('twitch.tv')) {
                    console.log('redirecting ' + referer);
                    res.redirect('https://www.youtube.com/watch?v=mj-v6zCnEaw');
                } else {
                    res.render('embed', {username: req.params.username});
                }
            } else {
                res.render('errors.ejs', {code: 404, message: `there is no stream named: ${requested_username}`});
            }
        }).catch((e) => {
            res.render('errors.ejs', {code: 400, message: `wtf did u do? ` + e});
        });
    };
};