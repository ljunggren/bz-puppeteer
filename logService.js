const fs = require('fs');
const killer = require('tree-kill');

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
      Service.consoleMsg("Running in video mode");
    }

    Service.consoleMsg("Initializing logMonitor");
   
    if (reportPrefix) {
      Service.consoleMsg("Override report prefix: " + reportPrefix);
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
      // Service.consoleMsg(msg);
      if(msg.includes("##Action")){
        Service.tryWakeup=0
      }
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
      //Service.consoleMsg("Type: " + msgType);
      if ((!t || !t.noLog) && Service.logLevel.includes(msgType)){
        Service.consoleMsg(msg)
      }
      if(t){
        if(t.notimeout){
          return t.fun(msg)
        }
        clearTimeout(Service.timer)
        if(!t.timeout){
          timeout=t.fun(msg)||Service.stdTimeout
          //Service.consoleMsg("Get timeout: "+timeout);
        }else{
          timeout=t.timeout
        }
        //Service.consoleMsg("set timeout: "+t.key+":"+timeout)
        Service.timer=setTimeout(()=>{
          if(Service.curProcess!="init"){
            Service.handleTimeout(timeout,"Timeout on: "+t.key+":"+timeout)
          }
        },timeout)
        let tryWakeup=Service.tryWakeup
        t.timeout&&t.fun(msg,Service.timer)
        
        if(Service.tryWakeup&&t.fun&&tryWakeup==Service.tryWakeup){
          Service.consoleMsg("Reset wakeup to 0 by "+t.key)
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
    Service.consoleMsg("In "+p+" task processing")
    Service.curProcess=p
    Service.taskMap={}
    Service.inChkCoop=0
    Service.coopAnswerList=[]
    clearTimeout(Service.coopAnswerTimer)
    Service.addTask({
      key:"Coop-Status:",
      fun:function(v){
        v=v.split(":")[1].trim()
        if(v=="declare"&&Service.tryWakeup){
          Service.consoleMsg("Reset wakeup to 0 on declare")
          Service.tryWakeup=0
        }else if(Service.tryWakeup){
          Service.tryWakeup++
        }
        
        Service.curWorkerStatus=v
      },
      timeout:Service.stdTimeout
    })
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
        Service.consoleMsg("Setting std timeout to: " + Service.stdTimeout);
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
        Service.consoleMsg(msg)
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
        Service.consoleMsg(msg)
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
        Service.consoleMsg(msg)
        Service.page.evaluate((msg)=>{
          eval(msg);
        },msg);
      },
      timeout:Service.stdTimeout
    })
  },
  idlingTimerValue:300000,
  insertHandleIdling(){
    if(!Service.keepalive){
      clearTimeout(Service.idlingTimer)
      Service.idlingTimer=setTimeout(()=>{
        if(Service.curWorkerStatus=="declare"){
          Service.insertHandleIdling();
          Service.wakeupIDE()
        }else{
          Service.shutdown("Shutdown: No task to run")
        }
      },Service.idlingTimerValue)
      Service.idlingTimerValue=120000
    }
  },
  init(){
    Service.insertStdTask("init")
    Service.consoleMsg("init")
    Service.setStatus(setTimeout(()=>{
      Service.consoleMsg("checking status ready, status: "+Service.status)
      if(!Number.isNaN(parseInt(Service.status))){
        Service.reset()
      }
    },120000))
    
    Service.addTask({
      key:"ready",
      fun(){
        Service.setStatus("ready")
        Service.consoleMsg("Ready on logService")
        if(Service.beginningFun){
          Service.beginningFun()
        // }else{
          // Service.setRunTasks()
        }
        
        Service.insertHandleIdling();

        if(Service.video && Service.video != "none"){
          Service.page.evaluate((v)=>{
            Service.consoleMsg("Initializing video capture...");
            BZ.requestVideo()
          });
        }
      },
      oneTime:1,
      timeout:Service.stdTimeout
    })
    
    Service.addTask({
      key:"Tasks are not completed",
      fun(){
        Service.insertHandleIdling();
      },
      oneTime:1,
      timeout:Service.stdTimeout
    })
  },
  /*new*
  reset(forKeep){
    Service.setNextResetTime()
    if(!forKeep){
      if(Service.lastHardResetTimer){
        if(Date.now()-Service.lastHardResetTimer<600000){
          return Service.shutdown("Failed to load IDE!")
        }
      }
      Service.lastHardResetTimer=Date.now()
    }
    Service.consoleMsg("reset ...")
    Service.browser._closed=1
    killer(Service.browser.process().pid, 'SIGKILL');
    setTimeout(()=>{
      Service.consoleMsg("restart ...")
      Service.restartFun(forKeep)
      Service.init()
    },forKeep?1000:15000)
  },
  /*old*/
  reset(forKeep){
    if(Service.debugIDE){
      return
    }
    Service.setNextResetTime()
    if(!forKeep){
      if(Service.lastHardResetTimer){
        if(Date.now()-Service.lastHardResetTimer<600000){
          return Service.shutdown("Failed to load IDE!")
        }
      }
      Service.lastHardResetTimer=Date.now()
    }
    Service.consoleMsg("reset ...");
    (async () => {
      await Service.page.close()
      if(forKeep){
        
      }else{
        Service.browser._closed=1
        await Service.browser.close()
      }
      setTimeout(()=>{
        Service.consoleMsg("restart ...")
        Service.restartFun(forKeep)
        Service.init()
      },forKeep?1000:15000)
    })()
  },
  /**/
  setStatus(v){
    clearTimeout(Service.status)
    Service.status=v
  },
  setRunTasks(){
    Service.consoleMsg("Set run tasks")
    clearTimeout(Service.idlingTimer)
    if(Service.status=="run"){
      return
    }
    Service.insertStdTask("run")
    Service.setStatus("run")

    Service.addTask({
      key:"timeout in ms:",
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
           Service.consoleMsg("Start recording video: ", videoFile);
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
          Service.consoleMsg("Stop recording video: ", videoFile);
          await Service.capture.stop();
          if (success && Service.video != "all"){
            Service.consoleMsg("Test success. Deleting video: " + videoFile);
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
        msg=msg.split("screenshot: ")[1]
        msg=msg.split("\n")
        console.log(msg[0])
        let screenshotFile = "/var/boozang/" + msg[0]+".png";

        let _base64Data = msg[1].replace(/^data:image\/([^;]+);base64,/, "");

        fs.writeFile(screenshotFile,_base64Data,'base64', (err)=>{
          if (err) {
            Service.shutdown("Error: on output file: "+screenshotFile+", "+ err.message)
          }
          Service.consoleMsg("Report "+screenshotFile+" saved.")
        })
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
        msg=msg.split("BZ-Result:")[1].trim()
        Service.result = msg == "Success" ? 0:2;
        Service.consoleMsg("Exit with status code: ", Service.result);
      },
      timeout:Service.stdTimeout
    })
    Service.addTask({
      key:"The Task Completed!",
      fun(msg){
        Service.lastHardResetTimer=0
        if(Service.nextResetTime&&(Date.now()>=Service.nextResetTime)){
          Service.consoleMsg("Reset in schedule")
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
            Service.consoleMsg("Report "+name+" saved.")
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
      Service.consoleMsg("Checking coop status")
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
    Service.consoleMsg("Reload IDE for "+msg)
    Service.page.evaluate(()=>{  
      localStorage.setItem("bz-reboot",1)
    });
    
    await Service.page.reload();
    Service.init() 
  },
  shutdown(msg){
    if(Service.debugIDE){
      return
    }
    msg && Service.consoleMsg(msg);
    (async () => {
      await Service.page.close()
      await Service.browser.close()
      setTimeout(()=>{
        killer(Service.browser.process().pid, 'SIGKILL');
        setTimeout(()=>{
          process.exit(Service.result)
        },1000)
      },1000)
    })()
  },
  async handleTimeout(timeout,msg){
    Service.consoleMsg(getCurrentTimeString()+": "+msg)
    Service.consoleMsg("Try to wakeup IDE");
    Service.wakeupIDE(timeout)
  },
  wakeupIDE:function(timeout){
    if(Service.tryWakeup>=1){
      Service.consoleMsg("Going to stop test");
      Service.page.evaluate(()=>{  
        BZ.e("BZ-LOG: Wake-up IDE failed. Test runner telling BZ to stop.");
      });
      setTimeout(()=>{
        if(Service.tryWakeup){
          Service.shutdown("Shutdown on no reaction from IDE!")
        }
      },120000)
    }else{
      Service.page.evaluate((timeout)=>{
        BZ.wakeup(timeout)
      },timeout)
      Service.wakeupTimer=setTimeout(()=>{
        Service.reloadIDE("No response from IDE! going to reset...")
        Service.reset(Service.keepalive)
      },10000)
    }
  },
  lastMsg:{},
  lastTime:0,
  lanuchTest:0,
  startTime:Date.now(),
  consoleMsg:function(msg,type,scope){
    lastMsg=this.lastMsg
    if(lastMsg.msg==msg&&lastMsg.type==type&&lastMsg.scope==scope){
      lastMsg.count++
    }else{
      if(lastMsg.count){
        if(lastMsg.scope){
          console.error(
            "\n####"+getCurrentTimeString()+"####\n"
            + lastMsg.scope + " repeat: " + (".".repeat(lastMsg.count))
            + "\n################\n"
          )
        }else{
          console.log("repeat: "+(".".repeat(lastMsg.count)))
        }
      }
      this.lastMsg=lastMsg={
        msg:msg,
        type:type,
        scope:scope,
        count:0
      }
      if(lastMsg.scope){
        console.error(
          "\n####"+getCurrentTimeString()+"####\n"
          + lastMsg.scope + " error: " + msg
          + "\n################\n"
        )
      }else{
        Service.consoleNum++;
        if(msg.trim().match(/^<<<</)){
          Service.lanuchTest--
          if(Service.lanuchTest<0){
            Service.lanuchTest=0
          }
          msg=" ".repeat(Service.lanuchTest*2)+msg.replace(/\] [0-9:]+ /,"] "+getSpendTime()+" ")
        }else if(msg.trim().match(/^>>>>/)){
          if(msg.includes(">>>> Loading Scenario")){
            if(Service.lanuchTest>1){
              Service.lanuchTest=1
              console.log(`${Service.consoleNum++}:   <<<< Stopped Feature - Scenario [${Service.lastScenario}] ${getSpendTime()} XXXX Task: 0 / 0 <<<<`)
            }
            Service.lastScenario=(msg.match(/\[([^\]]+)\]/)||[])[1]
          }
          msg=" ".repeat(Service.lanuchTest*2)+msg.replace(/\([0-9:]+\) >>>>$/,"("+getSpendTime()+") >>>>")
          Service.lanuchTest++
        }else if(Date.now()-Service.lastTime>1000){
          let n=parseInt((Date.now()-Service.lastTime)/1000)
          let w="+"
          if(Service.lastTime){
            w=w.repeat(n)
            n=" ("+getSpendTime()+", "+n+"s) "
          }else{
            w=""
            n=""
          }
          console.log("\n     [ "+getCurrentTimeString()+n+w+" ]\n")
          Service.lastTime=Date.now()
        }
        console.log(msg=Service.consoleNum+": "+msg)
      }
    }
  }
}

function getSpendTime(){
  return formatPeriod(Date.now()-Service.startTime)
}

Service.init()

exports.Service = Service;
function formatPeriod(v){
  v=v/1000
  let m=parseInt(v%3600/60),
      s=parseInt(v%60),
      h=parseInt(v/3600)
  if(h){
    h=_formatNumberLength(h)+":"
  }else{
    h=""
  }
  return h+_formatNumberLength(m)+":"+_formatNumberLength(s)
}

function getCurrentTimeString(){
  let d=new Date()
  return _formatNumberLength(d.getHours())+':'+_formatNumberLength(d.getMinutes())+":"+_formatNumberLength(d.getSeconds())
}

function _formatNumberLength(v,l){
  l=l||2;
  v=v+"";
  while(v.length<l){
    v="0"+v;
  }
  return v;
}

//testReset()
function testReset(){
  setTimeout(()=>{
    try{
      console.log("Do reset ---------------------------------------------------------------------------")
      if(Service.page){
        Service.reset(1)
      }else{
        console.log("wait to reset++++++++++++++++++")
      }
    }catch(ex){}
    testReset()
  },30000)
}