const fs = require('fs');

const Service = {
  stdTimeout:120000,
  issueResetCount:0,
  taskMap:{},
  timer:0,
  reportPrefix:"",
  status:"",
  tryWakeup:0,
  lastHardResetTimer:0,
  result: 2,
  consoleNum:0,
  logLevel: ["info","warn","error"],
  setResetButton(restartFun){
    this.restartFun=restartFun
  },
  setNextResetTime:function(){
    if(Service.testReset){
      Service.nextResetTime=Date.now()+((parseInt(Service.testReset)||1)*60000)
    }
  },
  logMonitor(page,testReset,keepalive,reportPrefix,inService, logLevel, browser, video, saveVideo){
    this.inService=inService;
    this.testReset=testReset;
    Service.setNextResetTime()

    this.keepalive=keepalive;
    this.video=video;
    this.page=page;
    this.saveVideo = saveVideo;

    this.logLevel=logLevel;

    if (this.video && this.video != "none") {
      console.log("Running in video mode");
    }

    console.log("Initializing logMonitor");
   
    if (reportPrefix) {
      console.log("Override report prefix: " + reportPrefix);
      Service.reportPrefix=reportPrefix + "_";
    } 

   // page.on('console', (log) => console[log._type](log._text));


    page.on('console', msg => {
      let timeout,t;
      let msgType=msg._type;

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
      //console.log("Type: " + msgType);
      if ((!t || !t.noLog) && Service.logLevel.includes(msgType)){
        console.log((Service.consoleNum++)+": "+msg)
      }
      if(t){
        if(t.notimeout){
          return t.fun(msg)
        }
        clearTimeout(Service.timer)
        if(!t.timeout){
          timeout=t.fun(msg)||Service.stdTimeout
          //console.log("Get timeout: "+timeout);
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
  setPage(page,browser){
    this.page=page
    this.browser=browser
  },
  //task:{key,fun,onTime,timeout}
  addTask(task){
    this.taskMap[task.key]=task
  },
  removeTask(task){
    delete this.taskMap[task.key]
  },
  insertStdTask(p){
    console.log("In "+p+" task processing")
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
      key:"NO-TASK!",
      fun:function(){
        Service.curProcess="init"
      },
      notimeout:1
    })
    Service.addTask({
      key:"RUNNING!",
      fun:function(){
        Service.setRunTasks()
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
        Service.reset(1)
      },
      timeout:Service.stdTimeout
    })

    Service.addTask({
      key:"coop-issue-reset",
      fun(msg){
        Service.issueResetCount++
        if(Service.issueResetCount>2){
          Service.shutdown(_formatTimestamp()+": Issue happened multiple times!")
        }else{
          Service.cancelChkCoop()
          Service.reset()
        }
      },
      timeout:Service.stdTimeout
    })

    Service.addTask({
      key:"coop-answer:",
      fun(msg){
        Service.coopAnswer&&Service.coopAnswer(msg.substring(12).trim())
      },
      timeout:Service.stdTimeout
    })

    Service.addTask({
      key:"center-exe:",
      fun(msg){
        msg=msg.substring(11)
        console.log(msg)
        try{
          eval(msg);
        }catch(e){}
      },
      timeout:Service.stdTimeout
    })

    Service.addTask({
      key:"app-exe:",
      fun(msg){
        msg=msg.substring(8)
        console.log(msg)
        Service.popup.evaluate((msg)=>{ 
          eval(msg);  
        },msg);
      },
      timeout:Service.stdTimeout
    })

    Service.addTask({
      key:"ide-exe:",
      fun(msg){
        msg=msg.substring(8)
        console.log(msg)
        Service.page.evaluate((msg)=>{
          eval(msg);
        },msg);
      },
      timeout:Service.stdTimeout
    })
  },
  insertHandleIdling(){
    if(!Service.keepalive){
      clearTimeout(Service.idlingTimer)
      Service.idlingTimer=setTimeout(()=>{
        Service.shutdown("No task to run")
      },120000)
    }
  },
  init(){
    Service.insertStdTask("init")
    console.log(_formatTimestamp()+": init")
    Service.setStatus(setTimeout(()=>{
      console.log(_formatTimestamp()+": checking status ready, status: "+Service.status)
      if(!Number.isNaN(parseInt(Service.status))){
        Service.reset()
      }
    },120000))
    
    Service.addTask({
      key:"ready",
      fun(){
        Service.setStatus("ready")
        console.log("Ready on logService")
        if(Service.beginningFun){
          Service.beginningFun()
        // }else{
          // Service.setRunTasks()
        }
        
        Service.insertHandleIdling();

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
  reset(forKeep){
    Service.setNextResetTime()
    if(!forKeep){
      if(Service.lastHardResetTimer){
        if(Date.now()-Service.lastHardResetTimer<600000){
          return Service.shutdown(_formatTimestamp()+": Failed to load IDE!")
        }
      }
      Service.lastHardResetTimer=Date.now()
    }
    console.log("reset ...")
//        Service.page.close()
    if(forKeep){
      Service.page.close()
    }else{
      Service.browser._closed=1
      Service.browser.close()
    }
    setTimeout(()=>{
      console.log("restart ...")
      Service.restartFun(forKeep)
      Service.init()
    },forKeep?1000:15000)
  },
  setStatus(v){
    clearTimeout(Service.status)
    Service.status=v
  },
  setRunTasks(){
    console.log("Set run tasks")
    clearTimeout(Service.idlingTimer)
    if(Service.status=="run"){
      return
    }
    Service.insertStdTask("run")
    Service.setStatus("run")

    Service.addTask({
      key:"ms:",
      fun(msg){
        let v= (parseInt(msg.split(this.key)[1].trim())||0) + Service.stdTimeout;
        return v;
      },
      msg:"Action timeout"
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
    Service.setStatus("end")
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
        Service.lastHardResetTimer=0
        if(Service.nextResetTime&&(Date.now()>=Service.nextResetTime)){
          console.log("Reset in schedule")
          Service.reset(1)
        }else{
          Service.setRunTasks()
        }
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
    if(Service.inService&&(Service.status=="run"||Service.status=="end")){
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
    console.log(_formatTimestamp()+ " Try to wakeup IDE");
    Service.wakeupIDE(timeout)
  },
  wakeupIDE:function(timeout){
    if(Service.tryWakeup>=1){
      Service.page.evaluate(()=>{  
        BZ.e("BZ-LOG: Wake-up IDE failed. Test runner telling BZ to stop.");
      });
    }else{
      Service.page.evaluate((timeout)=>{
        BZ.wakeup(timeout)
      },timeout)
      Service.wakeupTimer=setTimeout(()=>{
        Service.reloadIDE("No response from IDE! going to reset...")
        Service.reset(Service.keepalive)
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

function _formatTimestamp(t,f){
  t=t||Date.now()
  if(t.constructor==String&&!$.isNumeric(t)){
    f=t
    t=Date.now()
  }
  t=parseInt(t)
  f=f||"hh:mm:ss";
  var d=new Date(t);
  var mp={
    y:d.getFullYear()+"",
    M:_formatNumberLength(d.getMonth()+1),
    d:_formatNumberLength(d.getDate()),
    h:_formatNumberLength(d.getHours()),
    m:_formatNumberLength(d.getMinutes()),
    s:_formatNumberLength(d.getSeconds())
  }
  for(var k in mp){
    var r= new RegExp("["+k+"]+"),
        v=mp[k]
    
    r=f.match(r)
    if(r){
      r=r[0]
      if(k=="y"){
        v=v.substring(v.length-r.length)
      }else if(r.length==1){
        v=parseInt(v)+""
      }
      f=f.replace(r,v)
    }
  }
  return f
}
function _formatNumberLength(v,l){
  l=l||2;
  v=v+"";
  while(v.length<l){
    v="0"+v;
  }
  return v;
}