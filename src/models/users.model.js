'use strict';

// users-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient'),
  validate = require('mongoose-validator');

  var usernameValidator = [
	  validate({
	    validator: 'isLength',
	    arguments: [3, 30],
	    message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
	  }),
	  validate({
	    validator: 'isAlphanumeric',
	    passIfEmpty: true,
	    message: 'Name should contain alpha-numeric characters only'
	  })
  ];
  
  const users = new mongooseClient.Schema({
    email: { type: String, required: true, unique: true, uniqueCaseInsensitive: true, validate: [validate({ validator: 'isEmail', msg: '{VALUE} is not a valid email!' })]},
    username: { type: String, required: true, unique: true, uniqueCaseInsensitive: true, validate: usernameValidator},
    password: { type: String, required: true },
    streamkey: { type: String, unique: true},
    isVerified: { type: Boolean, default: false },
    verifyToken: { type: String },
    verifyExpires: { type: Date },
    verifyChanges: { type: Object },
    resetToken: { type: String },
    resetExpires: { type: Date },
    banned:    {type: Boolean, 'default': false},
    partner: {type: Boolean, 'default': false},
    transcode: {type: Boolean, 'default': false},
    playerTranscodeReady: {type:Boolean, 'default': false},
    streamPassword: {type: String},
    passwordProtected: {type: Boolean, 'default': false},
    title: {type: String},
    live: {type: Boolean, 'default': false},
    poster: {type: String, 'default': ""},
    streamCreatedAt: {type: Date, 'default': new Date(null) },
    streamUpdatedAt: {type: Date, 'default': new Date(null) },
    createdAt: { type: Date, 'default': Date.now },
    updatedAt: { type: Date, 'default': Date.now },
    isPatron: {type: Boolean, 'default': false},
    ingestServer: {type: String},
    ip_address: {type: String}
  });

  return mongooseClient.model('users', users);
};
