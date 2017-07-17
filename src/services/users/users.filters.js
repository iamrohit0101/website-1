module.exports = function (data, connection, hook) {
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
