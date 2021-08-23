'use strict';
//const WS = require('ws');
const http = require('http')

const WS = require("socket.io");
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
    console.log("--Start Socket --------------------------------")
    BZSocket.opts=opts
    setIP()
    console.log("--Option: "+opts.urlObj.master+" --------------------------------")
    if(opts.urlObj.master){
      console.log("--Start Socket 2--------------------------------")
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
        if(!opts.urlObj.master){
          BZSocket.PORT+=parseInt(opts.urlObj.key)||0
        }
      }
    }
    
  },
  buildServer(){
    try{
      console.log("--Building Socket --------------------------------")
      BZSocket.socketStarted=1

      var server = http.createServer(function(req, res)
      {
        // Send HTML headers and message
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end('<h1>Aw, snap! 404</h1>');
      });
      server.listen(BZSocket.PORT);
      const wss= WS.listen(server);

      // Add a connect listener
      wss.sockets.on('connection', function(socket)
      {
        console.log("--get Socket--------------------------------")
        console.log(socket.constructor)
        console.log("--------------------------------------------")
        BZSocket.setSocketReaction(socket)
      });
      
      // const wss = new WS.listen(BZSocket.PORT);
      
      // // const wss = new WS.Server({
        // // port: BZSocket.PORT
      // // }, () => console.log(`bz-ws server live on ${BZSocket.PORT}`))

      // // const errHandle = (err) => {
        // // if(err) throw err
      // // }


      // // var wss = new io.Socket(BZSocket.IP, {port: BZSocket.PORT});
      // // wss.connect();

      // wss.on("connect_error", (err) => {
        // console.log(`connect_error due to ${err.message}`);
      // });

      // wss.on("error", (err) => {
        // console.log(`connect_error due to ${err.message}`);
      // });

      // wss.on('connection', (socket) => {
        // console.log("--get Socket--------------------------------")
        // console.log(socket.constructor)
        // console.log("--------------------------------------------")
        // BZSocket.setSocketReaction(socket)
      // })
      
      console.log("--Builded Socket Server --------------------------------")
    }catch(e){
      console.log("--Socket Server Error--------------------------------")
      console.log(e.message)
      console.log("--Socket Server Error--------------------------------")
    }
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
    console.log("Connect Master socket server: "+v)
    let o=BZSocket.opts
    let s=io.connect("ws://"+v, {transports: ["websocket"],allowEIO3: true});
    
    // const s= io("ws://192.168.1.7:6969", {
      // reconnectionDelayMax: 10000,
      // auth: {
        // token: "123"
      // },
      // query: {
        // "my-key": "my-value"
      // }
    // });
//    const s = io.connect("http://"+v, {reconnect: true});
//    const s = new io.Socket('localhost', {port: 6767});

    s.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });

    s.on('connect', function (socket) {
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

    console.log("complete connect Master")
  },
  setSocketReaction(socket){
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
    socket.on('message', (data) => {
      console.log("Socket get message: "+data)
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
