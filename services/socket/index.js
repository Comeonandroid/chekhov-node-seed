import socket from 'socket.io'
import filter from 'params'
var server = require('../http').server

// TODO: Move to the module
GLOBAL.io      = socket.listen(server);
GLOBAL.sockets = {}

import socketioJwt from 'socketio-jwt'
import config      from '../../config/index'

// TODO: Refactor

io.sockets
  .on('connection', socketioJwt.authorize({
    secret: config.get("jwtSecret"),
    timeout: 15000
  })).on('authenticated', function(socket) {
    const current_user = socket.decoded_token
    socket.join(current_user.notificationRoom)
  });


