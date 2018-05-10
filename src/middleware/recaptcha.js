'use strict';

const config = require('../../config/default.json');
const request = require('request');

exports.verify = function() {
    return function(req, res, next) {
        const recaptchaResponse = req.body['g-recaptcha-response'];
        if(recaptchaResponse === undefined || recaptchaResponse === '' || recaptchaResponse === null) {
            req.recaptchaResponse = null;
            next();
        } else {
            const secretKey = config.recaptchaSecret;
            const verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + recaptchaResponse + "&remoteip=" + req.connection.remoteAddress;
            request(verificationUrl,function(error,response,body) {
                body = JSON.parse(body);
                if(!body.success) {
                    req.recaptchaResponse = false;
                } else {
                    req.recaptchaResponse = true;
                }
                next();
            });
        }
    }
}