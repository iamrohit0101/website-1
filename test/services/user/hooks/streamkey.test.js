'use strict';

const assert = require('assert');
const streamkey = require('../../../../src/services/user/hooks/streamkey.js');

describe('user streamkey hook', function() {
  it('hook can be used', function() {
    const mockHook = {
      type: 'before',
      app: {},
      params: {},
      result: {},
      data: {}
    };

    streamkey()(mockHook);

    assert.ok(mockHook.streamkey);
  });
});
