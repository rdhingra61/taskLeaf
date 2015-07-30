module.exports = function (socket, io) {


  userNames = []; 
  userNames = ['rdhingra61','raju@61','john!2'];
  var name = userNames[Math.floor(Math.random()*userNames.length)];   
  // send the new user their name and a list of users
  /*socket.emit('init', {
    name: name,
    //users: userNames.get()
    users: userNames
  });*/
  socket.on('chatRoom', function (data) {
    console.log(data);
  });
  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    name: name
  });
  // broadcast a user's message to other users
  socket.on('send:message', function (data) {
    socket.broadcast.emit('send:message', {
      user: name,
      text: data.message
    });
  });
/*
  // validate a user's name change, and broadcast it on success
  socket.on('change:name', function (data, fn) {
    if (userNames.claim(data.name)) {
      var oldName = name;
      userNames.free(oldName);

      name = data.name;

      socket.broadcast.emit('change:name', {
        oldName: oldName,
        newName: name
      });

      fn(true);
    } else {
      fn(false);
    }
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    socket.broadcast.emit('user:left', {
      name: name
    });
    userNames.free(name);
  });*/
};