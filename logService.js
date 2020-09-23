const Service = {
  initMap:{},
  taskMap:{
    "All tests completed":{
      key:"All tests completed",
      fun(){
        Service.taskMap={}
      },
      timeout:60000
    }
  },
  timer:0,
  status:"",
  logMonitor(page,notimeout,gtimeout){
    if(!notimeout&&gtimeout){
      setTimeout(()=>{
        Service.shutdown("Globle timeout trigger shutdown")
      },gtimeout*60000)
    }
    if(!notimeout){
      setTimeout(()=>{
        if(Object.keys(Service.initMap).length){
          Service.shutdown("Initial timeout")
        }
      },60000)
    }

    page.on('console', msg => {
      let timeout,t,map;

      msg = (!!msg && msg.text()) || "def";
      msg=trimPreMsg(msg)
      if(!msg){
        return
      }
      
      if(Object.keys(Service.initMap).length){
        map=Service.initMap
      }else{
        map=Service.taskMap
      }
      
      
      for(let key in map){
        if(msg.includes(key)){
          t=map[key]
          break
        }
      }
      
      if(t){
        clearTimeout(Service.timer)
        if(!t.timeout){
          timeout=t.fun(msg)
          console.log("Get timeout: "+timeout)
        }else{
          timeout=t.timeout
        }
        
        if(!notimeout){
          console.log("set timeout for showdown: "+timeout)
          Service.timer=setTimeout(()=>{
            Service.shutdown(t.msg)
          },timeout)
        }
        
        t.timeout&&t.fun(msg,Service.timer)
        if(t.oneTime){
          Service.removeTask(t)
        }
      }
    })
    
    function trimPreMsg(msg){
      if(msg&&msg.startsWith("BZ-LOG:")){
        msg=msg.substring(7).trim()
      }else{
        return
      }
      console.log(msg)
      return msg
    }
  },
  //task:{key,fun,onTime,timeout}
  addTask(task){
    this.taskMap[task.key]=task
  },
  removeTask(task){
    delete this.taskMap[task.key]
  },
  init(){
    Service.initMap.ready={
      key:"ready",
      fun(){
        delete Service.initMap.ready
        console.log("Ready on logService")
      },
      oneTime:1,
      timeout:60000
    }
  },
  shutdown(msg){
    console.log(msg)
    process.exit(2)
  }
}
Service.init()
exports.Service = Service;
