const fs = require('fs');

const Service = {
  stdTimeout:60000,
  taskMap:{},
  timer:0,
  status:"",
  logMonitor(page,notimeout,gtimeout,stdTimeout){
    Service.stdTimeout=stdTimeout||60000;
    
    if(!notimeout&&gtimeout){
      setTimeout(()=>{
        Service.gracefulShutdown("Global timeout triggered - try to do graceful shutdown")
      },gtimeout*60000)
    }
    if(notimeout){
      clearTimeout(Service.status)
    }

    page.on('console', msg => {
      let timeout,t;

      msg = (!!msg && msg.text()) || "def";
      msg=trimPreMsg(msg)
      if(!msg){
        return
      }
      
      for(let key in Service.taskMap){
        if(msg.includes(key)){
          t=Service.taskMap[key]
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
          console.log("set timeout for shutdown: "+timeout)
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
  setPopup(popup){
    this.popup=popup
  },
  //task:{key,fun,onTime,timeout}
  addTask(task){
    this.taskMap[task.key]=task
  },
  removeTask(task){
    delete this.taskMap[task.key]
  },
  init(){
    this.status=setTimeout(()=>{
      if(Service.status!="ready"){
        Service.shutdown("Failed to load test")
      }
    },Service.stdTimeout)
    
    Service.addTask({
      key:"ready",
      fun(){
        Service.status="ready"
        console.log("Ready on logService")
        Service.setRunTasks()
      },
      oneTime:1,
      timeout:Service.stdTimeout
    })
  },
  setRunTasks(){
    Service.taskMap={}
    Service.addTask({
      key:"ms:",
      fun(msg){
        return (parseInt(msg.split(this.key)[1].trim())||0)+15000
      },
      msg:"Action timeout"
    })

    Service.addTask({
      key:"app-run:",
      fun(msg){
        Service.popup.evaluate(()=>{ msg;  });
      },
      timeout:Service.stdTimeout
    })

    Service.addTask({
      key:"ide-run:",
      fun(msg){
        page.evaluate(()=>{ msg;  });
      },
      timeout:Service.stdTimeout
    })

    Service.addTask({
      key:"screenshot:",
      fun(msg){
        let screenshotFile = msg.split("screenshot:")[1]+".png";
        Service.popup.screenshot({path: screenshotFile});
      },
      timeout:Service.stdTimeout
    })

    Service.addTask({
      key:"Stop task!",
      fun(msg){
        Service.setEndTasks()
      },
      timeout:Service.stdTimeout
    })
  },
  setEndTasks(){
    Service.taskMap={}
    Service.addTask({
      key:"BZ-File output:",
      fun(msg){
        msg=msg.substring(this.key.length).trim()
        console.log("Parse file: ...............")
        console.log(msg)
        if(!this.name){
          this.name=msg
        }else if(msg=="end"){
          let name=this.name
          fs.writeFile(name, this.content, (err)=>{
            if (err) {
              Service.shutdown("Error: on output file: "+name+", "+ err.message)
            }
            console.log("Report "+name+" saved.")
          })
          this.name=0
        }else{
          this.content=msg
        }
      },
      timeout:Service.stdTimeout,
      noLog:1
    })
    Service.addTask({
      key:"All tests completed!",
      fun(msg){
        Service.shutdown(this.key)
      }
    })
  },
  shutdown(msg){
    console.log(msg)
    process.exit(2)
  },
  gracefulShutdown(msg){
    console.error("Try to get Boozang to exit gracefully and write report");
    Service.popup.screenshot({path: "graceful_shutdown.png"});
    page.evaluate(()=>{  
      BZ.e();console.log("BZ-LOG: Timing out check IDE response"); 
    });
    // Wait 100 seconds for Boozang to finish before force kill
    setTimeout(function(){
      Service.shutdown(msg);
    },100000)   
  }
}
Service.init()
exports.Service = Service;
