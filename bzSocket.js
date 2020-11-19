'use strict';
const io = require('socket.io')();

const BZSocket = {
  IP:0,
  socketStarted:0,
  userMap:{},
  getIP:function(){
    if(!BZSocket.IP){
      const { networkInterfaces } = require('os');

      const nets = networkInterfaces();
      BZSocket.IP = Object.create(null); // or just '{}', an empty object

      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
          if (net.family === 'IPv4' && !net.internal) {
            if (!BZSocket.IP[name]) {
              BZSocket.IP[name] = [];
            }

            BZSocket.IP[name].push(net.address);
          }
        }
      }
    }
    console.log(BZSocket.IP)
  },
  startSocketServer(userList,fun){
    // Listen to connections on port 3000
    try {
      if(!BZSocket.socketStarted){
        io.listen(3000);

        console.log('SERVER STARTED. Listening to port 3000...');
        io.sockets.on('connection', function (socket) {
          BZSocket.handleSocket(io,socket)
        })
      }
      fun(BZSocket.getIP())
    }catch (e){
      console.log("Duplicate")
    }
  },
  handleSocket(io,socket){
    
  }
}
exports.BZSocket = BZSocket;
