const feathers = require('@feathersjs/feathers')
const config = require('../../../config/default.json');
const path = require('path')

module.exports = function(app) {
    function getLink(type, hash) {
      var url
      var port = ":" + app.get('port')
      var host = app.get('host')
      var protocal = 'https'
      protocal += "://"
      //console.log(`${protocal}${host}${port}/management/${type}/${hash}`);
      return `${protocal}${host}/management/${type}/${hash}`
    }
function sendEmail(email) {
        return app.service('emails')
            .create(email)
            .then(function(result) {
                //console.log('Sent email', result)
            }).catch(err => {
                console.log('Error sending email', err)
            })
    }
return {
        notifier: function(type, user, notifierOptions) {
            //console.log(`-- Preparing email for ${type}`)
            var hashLink
            var email
            switch (type) {
              case 'resendVerifySignup':
                hashLink = getLink('verify', user.verifyToken)
                email = {
                        from: config.email,
                        to: user.email,
                        subject: 'Verify your email',
                        html: 'Thank you for signing up. Please verify your email by clicking the link below!' + '<br><br>' + hashLink + '<br><br>'
                         + 'If the link does not load, please copy and paste the link into the address bar of your browser.'
                    }
                return sendEmail(email)
                break
             case 'verifySignup':
                email = {
                        from: config.email,
                        to: user.email,
                        subject: 'Thank you, your email has been verified',
                        html: 'Your email has been verified. You have access to all of the site\'s functionality now!'
                    }
                return sendEmail(email)
                break
              case 'sendResetPwd':
                hashLink = getLink('reset', user.resetToken)
                email = {
                        from: config.email,
                        to: user.email,
                        subject: 'Reset Password',
                        html: 'Hi, ' + user.username + '<br><br>' + 'To reset your password, please click the link below.' + '<br><br>' + hashLink + '<br><br>' 
                        + 'Please ignore this email if you did not request a password change.'
                    }
                return sendEmail(email)
                break
              case 'resetPwd':
                email = {
                        from: config.email,
                        to: user.email,
                        subject: 'Your password has changed',
                        html: 'Hi, ' + user.username + '<br><br>' + 'Your password was just reset.'
                    }
                return sendEmail(email)
                break
              case 'passwordChange':
                email = {
                        from: config.email,
                        to: user.email,
                        subject: 'Your password was changed',
                        html: 'Hi, ' + user.username + '<br><br>' + 'Your password was just reset.'
                    }
                return sendEmail(email)
                break
              case 'identityChange':
                hashLink = getLink('verifyChanges', user.verifyToken)
                email = {
                        from: config.email,
                        to: user.email,
                        subject: 'Your email was changed. Please verify the changes',
                        html: 'Hi, ' + user.username + '<br><br>' + 'To change your email, please click the link below.' + '<br><br>' + hashLink + '<br><br>' 
                        + 'Please ignore this email if you did not request to change your email'
                    }
                return sendEmail(email)
                break
              default:
                break
            }
        }
    }
}