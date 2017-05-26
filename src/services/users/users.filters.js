/* eslint no-console: 1 */
console.warn('You are using the default filter for the users service. For more information about event filters see https://docs.feathersjs.com/api/events.html#event-filtering'); // eslint-disable-line no-console

module.exports = function (data, connection, hook) { // eslint-disable-line no-unused-vars
  userService.filter('streamkey', function(data, connection, hook) {
    // The id of the user that created the todo
    const modifiedUserId = hook.params.user._id;
    // The a list of ids of the connection's user friends
    const currentUserId = connection.user._id;

    if(modifiedUserId !== currentUserId) {
      return false;
    }

    return data;
  });
};
