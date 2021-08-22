'use strict';
const WS = require('ws');
const io = require('socket.io-client');

const BZSocket={
  IP:0,
  PORT:6969,
  socketStarted:0,
  userMap:{},
  getUserKey(code,token){
    return code+"-"+(token||"")
  },
  opts:0,
  start(opts,fun){
    BZSocket.opts=opts
    setIP()
    if(opts.master){
      BZSocket.buildServer()
    }
    fun()
    
    function setIP(){
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
        BZSocket.IP=BZSocket.IP.join(".")
        if(!opts.master){
          BZSocket.PORT+=parseInt(opts.key)||0
        }
      }
    }
    
  },
  buildServer(){
    try{
      BZSocket.socketStarted=1
      
      const wss = new WS.Server({
        port: BZSocket.PORT
      }, () => console.log(`bz-ws server live on ${BZSocket.PORT}`))

      const errHandle = (err) => {
        if(err) throw err
      }
      
      wss.on('connection', (socket) => {
        console.log("----Socket----------------------------------")
        console.log(socket.constructor)
        console.log("--------------------------------------------")
        BZSocket.setSocketReaction(socket)

      })
    }catch(e){}
  },
  registor(d,socket){
    let u=d.user
    u.token=u.token||""
    let k=BZSocket.getUserKey(u.code,u.token)
    let m=BZSocket.userMap
    let s=m[k]
    if(s){
      s.send("duplicate-account")
      s.close()
    }
    m[k]=socket
    socket.bzUser=u;
    if(u.master){
      BZSocket.opts.ideServer.retrieveScriptAndData(socket)
    }
  },
  sendMsg(d,msg){
    if(d&&d.constructor==Socket){
      d.send(msg)
    }else if(d&&d.to){
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
  },
  connectionServerByClient(v){
    console.log("Master socket server: "+v)
    var socket = io.connect(v, {reconnect: true});
    let o=BZSocket.opts

    // Add a connect listener
    socket.on('connect', function (socket) {
      console.log('Connected to: '+v);
      BZSocket.setSocketReaction(socket)

      socket.emit("message",{
        method:"registor",
        user:{
          code:o.userId,
          token:o.key,
          IP:BZSocket.IP,
          PORT:BZSocket.PORT,
          master:o.master
        }
      });
    });
  },
  setSocketReaction(socket){
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
  }
}
exports.BZSocket = BZSocket;
