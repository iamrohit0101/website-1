'use strict';

const config = require('../../config/default.json');
const patreon = require('patreon');
const fs = require('fs');
const path = require('path');

module.exports = function(app) {
  return function(req, res, next) {

    const patreonAPI = patreon.default;
    const patreonOAUTH = patreon.oauth;

    var patreonConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config/patreon.json'), 'utf8'));

    var accessToken = patreonConfig.access_token;
    var refreshToken = patreonConfig.refresh_token;
    const client_id = config.authentication.patreon.clientID;
    const client_secret = config.authentication.patreon.clientSecret;
    const campaignID = config.authentication.patreon.campaignID;

    var patreonAPIClient = patreonAPI(accessToken);
    const patreonOAUTHClient = patreonOAUTH(client_id, client_secret);
    var result = [];

    patreonAPIClient(`/current_user/campaigns`, function (currentUserError, apiResponse) {
        if (currentUserError) {
            console.error(currentUserError)
            patreonOAUTHClient.refreshToken(refreshToken, function (error, response) {
                if(error) {
                    console.error(error);
                } else {
                    console.log(response);
                    accessToken = response.access_token;
                    refreshToken = response.refresh_token;
                    fs.writeFile(path.join(__dirname, '../../config/patreon.json'), JSON.stringify(response), 'utf-8', function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("new tokens!");
                        }
                    });
                    patreonAPIClient = patreonAPI(accessToken);
                    getPledges();
                }
            });
        }
        getPledges();
    });

    function getPledges() {
        var cursor = "";

        function api(callback) {
            const sort = "?page%5Bcount%5D=100&sort=created";

            patreonAPIClient('/campaigns/' + campaignID + '/pledges' + sort + cursor, function (currentUserError, apiResponse) {
                if (currentUserError) {
                    console.error(currentUserError);
                }
                var nextLink = apiResponse.links.next;
                if(nextLink == null) {
                    cursor = null;
                } else {
                    cursor = nextLink.substring(nextLink.indexOf('&page'), nextLink.length - 1);
                }

                var array = [];

                for(var i = 0; i < apiResponse.data.length; i++) {
                    const attributes = apiResponse.data[i].attributes;
                    if(attributes.amount_cents >= 500 && attributes.declined_since == null) {
                        const patronID = apiResponse.data[i].relationships.patron.data.id;
                        var includedInfo;
                        var includedAttributes;
                        var newJSON = {};

                        includedLoop:
                        for(var x = 0; x < apiResponse.included.length; x++) {
                            if(apiResponse.included[x].id == patronID) {
                                includedInfo = apiResponse.included[x];
                                includedAttributes = includedInfo.attributes;
                                break includedLoop;
                            }
                        }

                        if(includedInfo.id == patronID) {
                            for(var key in apiResponse.data[i].relationships.patron) newJSON[key] = apiResponse.data[i].relationships.patron[key];
                            for(var key in includedAttributes) newJSON[key] = includedAttributes[key];
                        }

                        array.push(newJSON);
                    }
                }
                callback(array);
            });
        }

        function getMorePledges() {
            if(cursor != null) {
                api(function(data) {
                    result = result.concat(data);
                    return getMorePledges();
                });
            } else {
                checkIfPatreon(req.body.email);
            }
        }
        getMorePledges();
    }

    function checkIfPatreon(email) {
        var found = false;
        for(var x = 0; x < result.length; x++) {
            if(result[x].email.toLowerCase() == email.toLowerCase()) {
                becomePatreon(email.toLowerCase());
                found = true;
            }
        }
        if(!found) {
            res.render('errors.ejs', {code: 403, message: "Not a patron!"});
        }
    }

    function becomePatreon(email) {
        app.service('users').find({
          query: { email: email }
        })
        .then((users) => {
            const user = users.data[0];
            if (users.total > 0 && !user.banned && user.isVerified) {
                if(user.ifPatreon) {
                    res.render('success.ejs', {message: "You are a patron already!"});
                } else {
                    app.service('users').patch(user._id, {
                        ifPatreon: true
                    }).then(() => {
                        console.log(user.email + " is now a patreon!");
                        res.render('success.ejs', {message: "You are now a patron!"});
                    });
                }
            } else{
                res.render('errors.ejs', {code: 500, message: "You are either banned, your email is not verified, or your angelthump email does not match patreon email!"});
            }
        })
        .catch(function(error){
            res.render('errors.ejs', {code: error.code, message: error.message});
        });
    }
  };
};
