process.env.NODE_ENV = process.env.NODE_ENV || 'development';
global.config = require('./config/config')
config.PORT=config.PORT||80
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require("fs");
const https=require("https")
const httpsServer=https.createServer({
  key:fs.readFileSync('config/certs/server.key'),
  cert:fs.readFileSync('config/certs/server.crt')
},app)
httpsServer.listen(443)

const httpsIO = require('socket.io')(httpsServer)
const workerMap={}
const taskDone={}

app.get("/",(req,res)=>{
  res.sendFile(__dirname+"/index.html")
})
app.use(function(req,res,next){
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Methods","GET");
  next();
});

io.on('connection', o=>{
  console.log("connect http")
  o.io=io
  socketFun(o,"http: ")
});
httpsIO.on('connection',  o=>{
  console.log("connect https: ")
  o.io=httpsIO
  socketFun(o,"https: ")
});

function socketFun(socket,tab){
  socket.on("char",msg=>{
    console.log(tab+msg)
    socket.io.emit("char",tab+msg)
  })
  socket.on('work', msg => {
    if(msg.path=="/api/coop/"){
      let bd=msg.body;
      registerData(socket,msg)
      delete msg.noresponse
      bd.fromToken=socket.token
      bd.fromUser=socket.user
      if(bd.method=="taskDone"){
        taskDone[bd.taskId]=taskDone[bd.taskId]||Date.now()
      }else if(bd.method=="getWorkers"){
        if(taskDone[bd.taskId]){
          bd.method="taskDone"
          bd.info="center"
          console.log("send to project: "+msg.projectId)
          socket.io.to(socket.projectId).emit("work",msg)
          return
        }else{
          bd.method="setWorkers"
          bd.data=getLiveWorkers(socket)
          bd.to=bd.fromUser
          bd.token=bd.fromToken
          delete bd.fromUser
          delete bd.fromToken
        }
      }
      if(bd.to){
        console.log("Send coop-data to: "+bd.to+"-"+bd.token)
        postMsgInPrivate(socket,bd.to,bd.token,msg)
      }else{
        console.log("send to project: "+msg.projectId)
        socket.io.to(msg.projectId).emit("work",msg);
      }
      
    }
  });

  socket.on('disconnect', function() {
    if(this.projectId){
      this.io.to(this.projectId).emit("work",{
        user:this.user,
        token:this.token,
        callback:"BZ.infoLogout"
      });
      this.leave(this.projectId);
      delete workerMap[this.bzKey]
    }
  });

  function postMsgInPrivate(socket,user,token,msg){
    var o=workerMap[user+","+token]
    if(o){
      msg.body.status="success";
      o.emit("work",msg);
    }else{
      msg.body.status="off-line";
      socket.emit("work",msg)
    }
  }
  
  function getLiveWorkers(socket){
    return Object.values(workerMap).filter(x=>x.projectId==socket.projectId).map(x=>{
      return {
        code:x.user,
        token:x.token
      }
    })
  }
  
  function registerData(socket,msg){
    msg.token=msg.token||0
    if(!socket.bzKey){
      socket.bzKey=msg.user+","+msg.token
      socket.user=msg.user
      socket.token=msg.token
      socket.projectId=msg.projectId
      workerMap[socket.bzKey]=socket
      socket.join(socket.projectId);
    }
  }
}
http.listen(config.PORT, () => {
  console.log(`Socket.IO server running at http://localhost:${config.PORT}/`);
});

