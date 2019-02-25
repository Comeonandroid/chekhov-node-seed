import socket from 'socket.io'
var server = require('../services/http').server
var io = socket.listen(server);

console.log('#####SOCKET MODULE######')

export default io