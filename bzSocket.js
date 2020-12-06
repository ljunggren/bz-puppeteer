'use strict';
// const io = require('socket.io')();
const WS = require('ws')
const PORT=6969
const BZSocket = {
  IP:0,
  socketStarted:0,
  userMap:{},
  getIP:function(){
    if(!BZSocket.IP){
      const { networkInterfaces } = require('os');

      const nets = networkInterfaces();
      BZSocket.IP = []

      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
          if (net.family === 'IPv4' && !net.internal) {
            BZSocket.IP.push(net.address);
          }
        }
      }
    }
    return {ips:BZSocket.IP,port:PORT}
  },
  startSocketServer(userList,fun){
    // Listen to connections on port 3000
    try {
      if(!BZSocket.socketStarted){
        BZSocket.socketStarted=1
        
        const wss = new WS.Server({
          port: PORT
        }, () => console.log(`ws server live on ${PORT}`))

        const errHandle = (err) => {
          if(err) throw err
        }

        wss.on('connection', (socket) => {
          console.log('something connected')

          socket.send('you are connected', errHandle)

          socket.on('message', (data) => {
            console.log(data)
            console.log(`socket sent ${data}`)

            socket.send('message received', errHandle)
          })
        })
      }
      fun(BZSocket.getIP())
    }catch (e){
      console.log("Duplicate")
    }
  }
}
exports.BZSocket = BZSocket;
