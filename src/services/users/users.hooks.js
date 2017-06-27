const insensitive = require('./insensitive');

const streamkey = require('./streamkey');

const { authenticate } = require('feathers-authentication').hooks;
const commonHooks = require('feathers-hooks-common');
const { restrictToOwner } = require('feathers-authentication-hooks');

const { hashPassword } = require('feathers-authentication-local').hooks;
const verifyHooks = require('feathers-authentication-management').hooks;
const emailHook = require('../../hooks/emailHook');

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
    update: [ ...restrict, commonHooks.lowerCase('email','username') ],
    patch: [ ...restrict, streamkey.considerReset(), commonHooks.lowerCase('email','username') ],
    remove: [ ...restrict ]
  },

  after: {
    all: [
      commonHooks.when(
        hook => hook.params.provider,
        commonHooks.discard('password')
      )
    ],
    find: [],
    get: [],
    create: [emailHook.sendVerificationEmail(), verifyHooks.removeVerification()],
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
