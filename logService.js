const fs = require('fs');

const Service = {
  stdTimeout:120000,
  taskMap:{},
  timer:0,
  reportPrefix:"",
  status:"",
  tryWakeup:0,
  result: 2,
  consoleNum:0,
  logMonitor(page,keepalive,reportPrefix,inService, browser, video, saveVideo){
    this.inService=inService;
    this.keepalive=keepalive;
    this.video=video;
    this.page=page;
    this.saveVideo = saveVideo;

    if (this.video && this.video != "none") {
      console.log("Running in video mode");
    }

    console.log("Initializing logMonitor");
   
    if (reportPrefix) {
      console.log("Override report prefix: " + reportPrefix);
      Service.reportPrefix=reportPrefix + "_";
    } 

    clearTimeout(Service.status)

    page.on('console', msg => {
      let timeout,t;

      msg = (!!msg && msg.text()) || "def";
      msg=trimPreMsg(msg)
      if(!msg){
        return
      }
      // Todo add noLog conditions
      // console.log(msg);
      
      if(Service.curTask){
        t=Service.curTask
        Service.curTask=0
      }else{
        for(let key in Service.taskMap){
          if(msg.includes(key)){
            if(!key.startsWith("coop-")){
              Service.reChkCoop(key)
            }
            t=Service.taskMap[key]           
            break
          }
        }
      }
      if (!t || !t.noLog){
        console.log((Service.consoleNum++)+": "+msg)
      }
      if(t){
        clearTimeout(Service.timer)
        if(!t.timeout){
          timeout=t.fun(msg)||Service.stdTimeout
          //console.log("Get timeout: "+timeout)
        }else{
          timeout=t.timeout
        }
        //console.log("set timeout: "+t.key+":"+timeout)
        Service.timer=setTimeout(()=>{
          if(Service.curProcess!="init"){
            Service.handleTimeout(timeout,"Timeout on: "+t.key+":"+timeout)
          }
        },timeout)
        let tryWakeup=Service.tryWakeup
        t.timeout&&t.fun(msg,Service.timer)
        if(tryWakeup==Service.tryWakeup){
          Service.tryWakeup=0
        }
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
      return msg
    }
  },
  setBeginningFun(fun){
    Service.beginningFun=fun
  },
  setPopup(popup){
    this.popup=popup
  },
  setPage(page){
    this.page=page
  },
  //task:{key,fun,onTime,timeout}
  addTask(task){
    this.taskMap[task.key]=task
  },
  removeTask(task){
    delete this.taskMap[task.key]
  },
  insertStdTask(p){
    Service.curProcess=p
    Service.taskMap={}
    Service.inChkCoop=0
    Service.coopAnswerList=[]
    clearTimeout(Service.coopAnswerTimer)
    Service.addTask({
      key:"I-AM-OK",
      fun:function(){
        clearTimeout(Service.wakeupTimer)
        Service.tryWakeup++
      },
      timeout:Service.stdTimeout
    })
    Service.addTask({
      key:"update-std-timeout:",
      fun(msg){
        Service.stdTimeout = (parseInt(msg.split(this.key)[1].trim())||120000);
        console.log("Setting std timeout to: " + Service.stdTimeout);
        return Service.stdTimeout;
      },
      msg:"Standard timeout"
    })

    Service.addTask({
      key:"coop-shutdown",
      fun(msg){
        Service.shutdown("As cooperator server request to shutdown!")
      },
      timeout:Service.stdTimeout
    })

    Service.addTask({
      key:"task-done",
      fun(msg){
        if(!Service.keepalive){
          Service.shutdown("One-Task Completed!")
        }
      },
      timeout:Service.stdTimeout
    })
    
    Service.addTask({
      key:"coop-reload",
      fun(msg){
        Service.cancelChkCoop()
        Service.init()
      },
      timeout:Service.stdTimeout
    })

    Service.addTask({
      key:"coop-answer",
      fun(msg){
        Service.coopAnswer&&Service.coopAnswer(msg)
      },
      timeout:Service.stdTimeout
    })
  },
  init(){
    Service.insertStdTask("init")
    
    this.status=setTimeout(()=>{
      if(Service.status!="ready"){
        Service.reload("Failed to load test")
      }
    },Service.stdTimeout)
    
    Service.addTask({
      key:"ready",
      fun(){
        Service.status="ready"
        console.log("Ready on logService")
        if(Service.beginningFun){
          Service.beginningFun()
        }else{
          Service.setRunTasks()
        }
        if(Service.video && Service.video != "none"){
          Service.page.evaluate((v)=>{
            console.log("Initializing video capture...");
            BZ.requestVideo()
          });
        }
      },
      oneTime:1,
      timeout:Service.stdTimeout
    })
  },
  setRunTasks(){
    Service.insertStdTask("run")
    
    Service.addTask({
      key:"ms:",
      fun(msg){
        let v= (parseInt(msg.split(this.key)[1].trim())||0) + Service.stdTimeout;
        return v;
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
        Service.page.evaluate(()=>{ msg;  });
      },
      timeout:Service.stdTimeout
    })

    Service.addTask({
      key:"videostart:",
      fun(msg){
        (async () => {
          let videoFile = msg.split("videostart:")[1].split(",")[0]+".mp4";
           console.log("Start recording video: ", videoFile);
           Service.capture = await Service.saveVideo(Service.popup||Service.page, Service.reportPrefix + videoFile, {followPopups:true, fps: 5});      
        })()
      },
      timeout:Service.stdTimeout
    })

    Service.addTask({
      key:"videostop:",
      fun(msg){
        (async () => {
          let success = msg.includes(",success");
          let videoFile = msg.split("videostop:")[1].split(",")[0]+".mp4";
          console.log("Stop recording video: ", videoFile);
          await Service.capture.stop();
          if (success && Service.video != "all"){
            console.log("Test success. Deleting video: " + videoFile);
            fs.unlinkSync(Service.reportPrefix + videoFile);
          }
          await (()=>{
            Service.page.evaluate((v)=>{
              BZ.savedVideo()
            });
          })()
        })()
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
    Service.insertStdTask("end")
    Service.addTask({
      key:"Result:",
      fun(msg){
        msg=msg.split("Result:")[1].trim()
        Service.result = msg == "Success" ? 0:2;
        console.log("Exit with status code: ", Service.result);
      },
      timeout:Service.stdTimeout
    })
    Service.addTask({
      key:"The Task Completed!",
      fun(msg){
        Service.setRunTasks()
      },
      timeout:Service.stdTimeout
    })
    this.insertFileTask()
  },
  insertFileTask(exFun){
    Service.addTask({
      key:"BZ-File output:",
      fun(msg){
        msg=msg.substring(this.key.length).trim()
        if(!this.name){
          this.name=Service.reportPrefix + msg.toLowerCase().replace(/\ /g,"_");
        }else if(msg=="end"){
          let name=this.name
          fs.writeFile(name, this.content, (err)=>{
            if (err) {
              Service.shutdown("Error: on output file: "+name+", "+ err.message)
            }
            console.log("Report "+name+" saved.")
            if(exFun){
              exFun()
            }
          })
          this.name=0
        }else{
          this.content=msg
        }
      },
      timeout:Service.stdTimeout,
      noLog:1
    })
  },
  chkIDE(){
    if(Service.inService){
      if(Service.inChkCoop){
        Service.inChkCoop++
        return
      }
      clearTimeout(Service.chkCoopTimer)
      Service.chkCoopTimer=setTimeout(()=>{
        Service.inChkCoop=1
        Service.coopAnswerList=[]
        Service.coopAnswer=function(v){
          clearTimeout(Service.coopAnswerTimer)
          v=JSON.parse(v)
          console.log("get coop status:")
          console.log(v)
          Service.addCoopAnswer(v)
        }
        Service.getCoopStatus()
      },5000)
    }
  },
  addCoopAnswer(v){
    Service.coopAnswerList.push(v)
    if(Service.coopAnswerList.length<2){
      Service.chkCoopTimer=setTimeout(()=>{
        Service.getCoopStatus()
      },60000)
    }else{
      console.log("Checking coop status")
      let v1=Service.coopAnswerList[0],
          v2=Service.coopAnswerList[1]
      console.log(JSON.stringify(v1,0,2))
      console.log(JSON.stringify(v2,0,2))
      if(v1.status.type!=v2.status.type){
        return
      }else if(v1.status.type=="report"){
        //TODO
      }
    }
  },
  reChkCoop(v){
    if(Service.inChkCoop){
      Service.cancelChkCoop()
      if(!Service.lastChkCoopTimer){
        Service.lastChkCoopTimer=Date.now()
        Service.chkIDE()
      }
    }
  },
  cancelChkCoop(){
    Service.inChkCoop=0
    clearTimeout(Service.chkCoopTimer)
    clearTimeout(Service.coopAnswerTimer)
    Service.coopAnswerList=[]
  },
  getCoopStatus(){
    Service.coopAnswerTimer=setTimeout(()=>{
      Service.reloadIDE("Coop Server stop work! reload IDE")
    },Service.stdTimeout)
    this.page.evaluate(()=>{
      $util.getCoopStatus()
    })
  },
  async reloadIDE(msg){
    console.log("Reload IDE for "+msg)
    Service.page.evaluate(()=>{  
      localStorage.setItem("bz-reboot",1)
    });
    
    await Service.page.reload();
    Service.init() 
  },
  shutdown(msg){
    msg && console.log(msg)
    process.exit(Service.result)
  },
  async handleTimeout(timeout,msg){
    console.log(getCurrentTimeString()+": "+msg)
    console.log("Try to wakeup IDE");
    Service.wakeupIDE(timeout)
  },
  wakeupIDE:function(timeout){
    if(Service.tryWakeup>=3){
      Service.page.evaluate(()=>{  
        BZ.e("Try wakeup 3 times. Test runner telling BZ to stop.");
      });
    }else{
      Service.page.evaluate((timeout)=>{
        BZ.wakeup(timeout)
      },timeout)
      Service.wakeupTimer=setTimeout(()=>{
        if(Service.keepalive){
          Service.reloadIDE("No response from IDE. Shutting down...")
        }else{
          Service.shutdown("No response from IDE. Shutting down...")
        }
      },10000)
    }
  }
}
Service.init()


function getCurrentTimeString(){
  let d=new Date()
  return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+'-'+d.getHours()+'-'+d.getMinutes()+"-"+d.getSeconds()
}
exports.Service = Service;
