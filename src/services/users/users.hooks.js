const insensitive = require('./insensitive');

const streamkey = require('./streamkey');

const { authenticate } = require('@feathersjs/authentication').hooks;
const commonHooks = require('feathers-hooks-common');
const { restrictToOwner } = require('feathers-authentication-hooks');
const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks;
const verifyHooks = require('feathers-authentication-management').hooks;
const accountService = require('../auth-management/notifier');

const restrict = [
  authenticate('jwt'),
  restrictToOwner({
    idField: '_id',
    ownerField: '_id'
  })
];

module.exports = {
  before: {
    all: [],
    find: [ authenticate('jwt'), insensitive() ],
    get: [ ...restrict ],
    create: [ hashPassword(), streamkey.initialize(), commonHooks.lowerCase('email','username'), verifyHooks.addVerification() ],
    update: [ ...restrict, commonHooks.disallow('external'), commonHooks.lowerCase('email','username') ],
    patch: [ ...restrict, streamkey.considerReset(), commonHooks.lowerCase('email','username'), 
    commonHooks.iff(
      commonHooks.isProvider('external'),
        commonHooks.preventChanges(true,
          'email',
          'isVerified',
          'verifyToken',
          'verifyShortToken',
          'verifyExpires',
          'verifyChanges',
          'resetToken',
          'resetShortToken',
          'resetExpires',
        ),
        hashPassword(),
        authenticate('jwt')
      )],
    remove: [ ...restrict ]
  },

  after: {
    all: [
      protect('password')
    ],
    find: [],
    get: [],
    create: [
      context => {
        accountService(context.app).notifier('resendVerifySignup', context.result)
      },
      verifyHooks.removeVerification()],
    update: [
    commonHooks.when(
        hook => hook.params.provider,
        commonHooks.discard('streamkey')
      )],
    patch: [],
    remove: [
    commonHooks.when(
        hook => hook.params.provider,
        commonHooks.discard('streamkey')
      )]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
