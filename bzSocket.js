'use strict';
// const io = require('socket.io')();
const WS = require('ws')
const PORT=6969
const BZSocket={
  IP:0,
  socketStarted:0,
  userMap:{},
  getIP(){
    if(!BZSocket.IP){
      const { networkInterfaces } = require('os');

      const nets = networkInterfaces();
      BZSocket.IP = []

      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
          if (net.family === 'IPv4' && !net.internal) {
            console.log(net)
            BZSocket.IP.push(net.address);
          }
        }
      }
    }
    return {ips:BZSocket.IP,port:PORT}
  },
  startSocketServer(userList,fun){
    // Listen to connections on port 3000;
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
          socket.on('message', (data) => {
            try{
              let d=JSON.parse(data)
              if(d.method=="registor"){
                BZSocket.registor(d.user,socket)
              }else{
                d.centerSocket=1
                BZSocket.sendMsg(d,data);
              }
            }catch(e){
              console.log(data)
            }
          })

          socket.on("close",()=>{
            console.log("close ...")
            let u=socket.bzUser
            if(u){
              let s=BZSocket.userMap[u.code][u.token]
              if(s==socket){
                delete BZSocket.userMap[u.code][u.token]
              }
            }
          })
        })
        
      }
      fun(BZSocket.getIP())
    }catch (e){
      console.log("Duplicate")
    }
  },
  registor(u,socket){
    let m=BZSocket.userMap[u.code]=BZSocket.userMap[u.code]||{}
    u.token=u.token||""
    let s=m[u.token]
    if(s){
      s.send("duplicate-account")
      s.close()
    }
    m[u.token]=socket
    socket.bzUser=u;
  },
  sendMsg(d,msg){
    if(d.to){
      let m=BZSocket.userMap[d.to]
      if(m){
        m=m[d.token||""]
        if(m){
          m.send(msg)
        }
      }
    }else{
      for(var k in BZSocket.userMap){
        let o=BZSocket.userMap[k]
        for(var kk in o){
          o[kk].send(msg)
        }
      }
    }
  }
}
exports.BZSocket = BZSocket;
