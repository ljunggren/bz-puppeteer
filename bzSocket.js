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
  getUserKey(code,token){
    return code+"-"+(token||"")
  },
  startSocketServer(fun){
    // Listen to connections on port 3000;
    try {
      if(!BZSocket.socketStarted){
        BZSocket.socketStarted=1
        
        const wss = new WS.Server({
          port: PORT
        }, () => console.log(`bz-ws server live on ${PORT}`))

        const errHandle = (err) => {
          if(err) throw err
        }

        wss.on('connection', (socket) => {
          socket.on('message', (data) => {
            try{
              let d=JSON.parse(data)
              BZSocket[d.method](d,socket);
            }catch(e){
              console.log(data)
            }
          })

          socket.on("close",()=>{
            console.log("close bz-ws ...")
            let u=socket.bzUser
            
            if(u){
              let k=BZSocket.getUserKey(u.code,u.token)
              let s=BZSocket.userMap[k]
              if(s==socket){
                delete BZSocket.userMap[k]
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
  registor(d,socket){
    let u=d.user
    u.token=u.token||""
    let k=u.code+"-"+u.token
    let m=BZSocket.userMap
    let s=m[k]
    if(s){
      s.send("duplicate-account")
      s.close()
    }
    m[k]=socket
    socket.bzUser=u;
  },
  registorOwner(u,socket){
    BZSocket.registor(d,socket)
    BZSocket.owner=socket
  },
  sendMsg(d,msg){
    if(d.to){
      let k=BZSocket.getUserKey(d.to,d.token)
      
      let m=BZSocket.userMap[k]
      if(m){
        m.send(msg)
      }
    }else{
      for(var k in BZSocket.userMap){
        BZSocket.userMap[k].send(msg)
      }
    }
  }
}
exports.BZSocket = BZSocket;