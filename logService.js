const fs = require('fs');
const killer = require('tree-kill');

const LogService = {
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
    if(LogService.testReset){
      LogService.nextResetTime=Date.now()+((parseInt(LogService.testReset)||1)*60000)
    }
  },
  setLogLevel(){
    let LogLevelArray = ["error","warning","info","debug","log"];
    let opts=LogService.opts
    console.log("Setting log levels: ", opts.logLevel);

    if (opts.logLevel === "error"){
      LogService.logLevel = ["error"]
    } else if (opts.logLevel === "warning"){
      LogService.logLevel = ["error","warning"]
    } else if (opts.logLevel === "info"){
      LogService.logLevel = ["error","warning","info"]
    }
  },
  logOpts(page,opts,reportPrefix){
    LogService.opts=opts

    LogService.setNextResetTime()
    LogService.setLogLevel()

    if (this.video && this.video != "none") {
      LogService.consoleMsg("Running in video mode");
    }

    LogService.consoleMsg("Initializing logMonitor");
   
    if (reportPrefix) {
      LogService.consoleMsg("Override report prefix: " + reportPrefix);
      LogService.reportPrefix=reportPrefix + "_";
    } 
  },
  setBeginningFun(fun){
    LogService.beginningFun=fun
  },
  setPopup(popup){
    this.popup=popup
  },
  setPage(page,browser){
    this.page=page
    this.browser=browser

    page.on('console', msg => {
      let timeout,t;
      let msgType=msg._type;

      msg = (!!msg && msg.text()) || "def";
      msg=trimPreMsg(msg)
      if(!msg){
        return
      }
      // Todo add noLog conditions
      // LogService.consoleMsg(msg);
      
      if(LogService.curTask){
        t=LogService.curTask
        LogService.curTask=0
      }else{
        for(let key in LogService.taskMap){
          if(msg.includes(key)){
            if(!key.startsWith("coop-")){
              LogService.reChkCoop(key)
            }
            t=LogService.taskMap[key]           
            break
          }
        }
      }
      //LogService.consoleMsg("Type: " + msgType);
      if ((!t || !t.noLog) && LogService.logLevel.includes(msgType)){
        LogService.consoleMsg(msg)
      }
      if(t){
        if(t.notimeout){
          return t.fun(msg)
        }
        clearTimeout(LogService.timer)
        if(!t.timeout){
          timeout=t.fun(msg)||LogService.stdTimeout
          //LogService.consoleMsg("Get timeout: "+timeout);
        }else{
          timeout=t.timeout
        }
        //LogService.consoleMsg("set timeout: "+t.key+":"+timeout)
        LogService.timer=setTimeout(()=>{
          if(LogService.curProcess!="init"){
            LogService.handleTimeout(timeout,"Timeout on: "+t.key+":"+timeout)
          }
        },timeout)
        let tryWakeup=LogService.tryWakeup
        t.timeout&&t.fun(msg,LogService.timer)
        if(tryWakeup==LogService.tryWakeup){
          LogService.tryWakeup=0
        }
        if(t.oneTime){
          LogService.removeTask(t)
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
  //task:{key,fun,onTime,timeout}
  addTask(task){
    this.taskMap[task.key]=task
  },
  removeTask(task){
    delete this.taskMap[task.key]
  },
  insertStdTask(p){
    LogService.consoleMsg("In "+p+" task processing")
    LogService.curProcess=p
    LogService.taskMap={}
    LogService.inChkCoop=0
    LogService.coopAnswerList=[]
    clearTimeout(LogService.coopAnswerTimer)
    LogService.addTask({
      key:"Coop-Status:",
      fun:function(v){
        v=v.split(":")[1].trim()
        if(v=="declare"){
          LogService.tryWakeup=0
        }
        
        LogService.curWorkerStatus=v
        LogService.consoleMsg("IDE Status: "+v)
      },
      timeout:LogService.stdTimeout
    })
    LogService.addTask({
      key:"I-AM-OK",
      fun:function(){
        clearTimeout(LogService.wakeupTimer)
        LogService.tryWakeup++
      },
      timeout:LogService.stdTimeout
    })
    LogService.addTask({
      key:"NO-TASK!",
      fun:function(){
        LogService.curProcess="init"
      },
      notimeout:1
    })
    LogService.addTask({
      key:"RUNNING!",
      fun:function(){
        LogService.setRunTasks()
      },
      timeout:LogService.stdTimeout
    })
    LogService.addTask({
      key:"update-std-timeout:",
      fun(msg){
        LogService.stdTimeout = (parseInt(msg.split(this.key)[1].trim())||120000);
        LogService.consoleMsg("Setting std timeout to: " + LogService.stdTimeout);
        return LogService.stdTimeout;
      },
      msg:"Standard timeout"
    })

    LogService.addTask({
      key:"coop-shutdown",
      fun(msg){
        LogService.shutdown("As cooperator server request to shutdown!")
      },
      timeout:LogService.stdTimeout
    })

    LogService.addTask({
      key:"task-done",
      fun(msg){
        if(!LogService.keepalive){
          LogService.shutdown("One-Task Completed!")
        }
      },
      timeout:LogService.stdTimeout
    })
    
    LogService.addTask({
      key:"coop-reload",
      fun(msg){
        LogService.cancelChkCoop()
        LogService.reset(1)
      },
      timeout:LogService.stdTimeout
    })

    LogService.addTask({
      key:"coop-issue-reset",
      fun(msg){
        LogService.issueResetCount++
        if(LogService.issueResetCount>2){
          LogService.shutdown(_formatTimestamp()+": Issue happened multiple times!")
        }else{
          LogService.cancelChkCoop()
          LogService.reset()
        }
      },
      timeout:LogService.stdTimeout
    })

    LogService.addTask({
      key:"coop-answer:",
      fun(msg){
        LogService.coopAnswer&&LogService.coopAnswer(msg.substring(12).trim())
      },
      timeout:LogService.stdTimeout
    })

    LogService.addTask({
      key:"center-exe:",
      fun(msg){
        msg=msg.substring(11)
        LogService.consoleMsg(msg)
        try{
          eval(msg);
        }catch(e){}
      },
      timeout:LogService.stdTimeout
    })

    LogService.addTask({
      key:"app-exe:",
      fun(msg){
        msg=msg.substring(8)
        LogService.consoleMsg(msg)
        LogService.popup.evaluate((msg)=>{ 
          eval(msg);  
        },msg);
      },
      timeout:LogService.stdTimeout
    })

    LogService.addTask({
      key:"ide-exe:",
      fun(msg){
        msg=msg.substring(8)
        LogService.consoleMsg(msg)
        LogService.page.evaluate((msg)=>{
          eval(msg);
        },msg);
      },
      timeout:LogService.stdTimeout
    })
  },
  idlingTimerValue:300000,
  insertHandleIdling(){
    if(!LogService.keepalive){
      clearTimeout(LogService.idlingTimer)
      LogService.idlingTimer=setTimeout(()=>{
        if(LogService.curWorkerStatus=="declare"){
          LogService.insertHandleIdling();
          LogService.wakeupIDE()
        }else{
          LogService.shutdown("Shutdown: No task to run")
        }
      },LogService.idlingTimerValue)
      LogService.idlingTimerValue=120000
    }
  },
  init(){
    LogService.insertStdTask("init")
    LogService.consoleMsg("init")
    LogService.setStatus(setTimeout(()=>{
      LogService.consoleMsg("checking status ready, status: "+LogService.status)
      if(!Number.isNaN(parseInt(LogService.status))){
        LogService.reset()
      }
    },120000))
    
    LogService.addTask({
      key:"ready",
      fun(){
        LogService.setStatus("ready")
        LogService.consoleMsg("Ready on logService")
        if(LogService.beginningFun){
          LogService.beginningFun()
        // }else{
          // LogService.setRunTasks()
        }
        
        LogService.insertHandleIdling();

        if(LogService.video && LogService.video != "none"){
          LogService.page.evaluate((v)=>{
            LogService.consoleMsg("Initializing video capture...");
            BZ.requestVideo()
          });
        }
      },
      oneTime:1,
      timeout:LogService.stdTimeout
    })
    
    LogService.addTask({
      key:"Tasks are not completed",
      fun(){
        LogService.insertHandleIdling();
      },
      oneTime:1,
      timeout:LogService.stdTimeout
    })
  },
  /*new*
  reset(forKeep){
    LogService.setNextResetTime()
    if(!forKeep){
      if(LogService.lastHardResetTimer){
        if(Date.now()-LogService.lastHardResetTimer<600000){
          return LogService.shutdown("Failed to load IDE!")
        }
      }
      LogService.lastHardResetTimer=Date.now()
    }
    LogService.consoleMsg("reset ...")
    LogService.browser._closed=1
    killer(LogService.browser.process().pid, 'SIGKILL');
    setTimeout(()=>{
      LogService.consoleMsg("restart ...")
      LogService.restartFun(forKeep)
      LogService.init()
    },forKeep?1000:15000)
  },
  /*old*/
  reset(forKeep){
    if(LogService.debugIDE){
      return
    }
    LogService.setNextResetTime()
    if(!forKeep){
      if(LogService.lastHardResetTimer){
        if(Date.now()-LogService.lastHardResetTimer<600000){
          return LogService.shutdown("Failed to load IDE!")
        }
      }
      LogService.lastHardResetTimer=Date.now()
    }
    LogService.consoleMsg("reset ...")
//        LogService.page.close()
    if(forKeep){
      LogService.page.close()
    }else{
      LogService.browser._closed=1
      LogService.browser.close()
    }
    setTimeout(()=>{
      LogService.consoleMsg("restart ...")
      LogService.restartFun(forKeep)
      LogService.init()
    },forKeep?1000:15000)
  },
  /**/
  setStatus(v){
    clearTimeout(LogService.status)
    LogService.status=v
  },
  setRunTasks(){
    LogService.consoleMsg("Set run tasks")
    clearTimeout(LogService.idlingTimer)
    if(LogService.status=="run"){
      return
    }
    LogService.insertStdTask("run")
    LogService.setStatus("run")

    LogService.addTask({
      key:"timeout in ms:",
      fun(msg){
        let v= (parseInt(msg.split(this.key)[1].trim())||0) + LogService.stdTimeout;
        return v;
      },
      msg:"Action timeout"
    })

    LogService.addTask({
      key:"videostart:",
      fun(msg){
        (async () => {
          let videoFile = msg.split("videostart:")[1].split(",")[0]+".mp4";
           LogService.consoleMsg("Start recording video: ", videoFile);
           LogService.capture = await LogService.saveVideo(LogService.popup||LogService.page, LogService.reportPrefix + videoFile, {followPopups:true, fps: 5});      
        })()
      },
      timeout:LogService.stdTimeout
    })

    LogService.addTask({
      key:"videostop:",
      fun(msg){
        (async () => {
          let success = msg.includes(",success");
          let videoFile = msg.split("videostop:")[1].split(",")[0]+".mp4";
          LogService.consoleMsg("Stop recording video: ", videoFile);
          await LogService.capture.stop();
          if (success && LogService.video != "all"){
            LogService.consoleMsg("Test success. Deleting video: " + videoFile);
            fs.unlinkSync(LogService.reportPrefix + videoFile);
          }
          await (()=>{
            LogService.page.evaluate((v)=>{
              BZ.savedVideo()
            });
          })()
        })()
      },
      timeout:LogService.stdTimeout
    })

    LogService.addTask({
      key:"screenshot:",
      fun(msg){
        let screenshotFile = msg.split("screenshot:")[1]+".png";
        LogService.popup.screenshot({path: screenshotFile});
      },
      timeout:LogService.stdTimeout
    })

    LogService.addTask({
      key:"Stop task!",
      fun(msg){
        LogService.setEndTasks()
      },
      timeout:LogService.stdTimeout
    })
  },
  setEndTasks(){
    LogService.insertStdTask("end")
    LogService.setStatus("end")
    LogService.addTask({
      key:"Result:",
      fun(msg){
        msg=msg.split("BZ-Result:")[1].trim()
        LogService.result = msg == "Success" ? 0:2;
        LogService.consoleMsg("Exit with status code: ", LogService.result);
      },
      timeout:LogService.stdTimeout
    })
    LogService.addTask({
      key:"The Task Completed!",
      fun(msg){
        LogService.lastHardResetTimer=0
        if(LogService.nextResetTime&&(Date.now()>=LogService.nextResetTime)){
          LogService.consoleMsg("Reset in schedule")
          LogService.reset(1)
        }else{
          LogService.setRunTasks()
        }
      },
      timeout:LogService.stdTimeout
    })
    this.insertFileTask()
  },
  insertFileTask(exFun){
    LogService.addTask({
      key:"BZ-File output:",
      fun(msg){
        msg=msg.substring(this.key.length).trim()
        if(!this.name){
          this.name=LogService.reportPrefix + msg.toLowerCase().replace(/\ /g,"_");
        }else if(msg=="end"){
          let name=this.name
          fs.writeFile(name, this.content, (err)=>{
            if (err) {
              LogService.shutdown("Error: on output file: "+name+", "+ err.message)
            }
            LogService.consoleMsg("Report "+name+" saved.")
            if(exFun){
              exFun()
            }
          })
          this.name=0
        }else{
          this.content=msg
        }
      },
      timeout:LogService.stdTimeout,
      noLog:1
    })
  },
  chkIDE(){
    if(LogService.inService&&(LogService.status=="run"||LogService.status=="end")){
      if(LogService.inChkCoop){
        LogService.inChkCoop++
        return
      }
      clearTimeout(LogService.chkCoopTimer)
      LogService.chkCoopTimer=setTimeout(()=>{
        LogService.inChkCoop=1
        LogService.coopAnswerList=[]
        LogService.coopAnswer=function(v){
          clearTimeout(LogService.coopAnswerTimer)
          v=JSON.parse(v)
          LogService.addCoopAnswer(v)
        }
        LogService.getCoopStatus()
      },5000)
    }
  },
  addCoopAnswer(v){
    LogService.coopAnswerList.push(v)
    if(LogService.coopAnswerList.length<2){
      LogService.chkCoopTimer=setTimeout(()=>{
        LogService.getCoopStatus()
      },60000)
    }else{
      LogService.consoleMsg("Checking coop status")
      let v1=LogService.coopAnswerList[0],
          v2=LogService.coopAnswerList[1]

      if(v1.status.type!=v2.status.type){
        return
      }else if(v1.status.type=="report"){
        //TODO
      }
    }
  },
  reChkCoop(v){
    if(LogService.inChkCoop){
      LogService.cancelChkCoop()
      if(!LogService.lastChkCoopTimer){
        LogService.lastChkCoopTimer=Date.now()
        LogService.chkIDE()
      }
    }
  },
  cancelChkCoop(){
    LogService.inChkCoop=0
    clearTimeout(LogService.chkCoopTimer)
    clearTimeout(LogService.coopAnswerTimer)
    LogService.coopAnswerList=[]
  },
  getCoopStatus(){
    LogService.coopAnswerTimer=setTimeout(()=>{
      LogService.reloadIDE("Coop Server stop work! reload IDE")
    },LogService.stdTimeout)
    this.page.evaluate(()=>{
      $util.getCoopStatus()
    })
  },
  async reloadIDE(msg){
    LogService.consoleMsg("Reload IDE for "+msg)
    LogService.page.evaluate(()=>{  
      localStorage.setItem("bz-reboot",1)
    });
    
    await LogService.page.reload();
    LogService.init() 
  },
  shutdown(msg){
    if(LogService.debugIDE){
      return
    }
    msg && LogService.consoleMsg(msg)
    killer(LogService.browser.process().pid, 'SIGKILL');
    process.exit(LogService.result)
  },
  async handleTimeout(timeout,msg){
    LogService.consoleMsg(getCurrentTimeString()+": "+msg)
    LogService.consoleMsg("Try to wakeup IDE");
    LogService.wakeupIDE(timeout)
  },
  wakeupIDE:function(timeout){
    if(LogService.tryWakeup>=1){
      LogService.page.evaluate(()=>{  
        BZ.e("BZ-LOG: Wake-up IDE failed. Test runner telling BZ to stop.");
      });
      setTimeout(()=>{
        LogService.shutdown("Shutdown on no reaction from IDE!")
      },120000)
    }else{
      LogService.page.evaluate((timeout)=>{
        BZ.wakeup(timeout)
      },timeout)
      LogService.wakeupTimer=setTimeout(()=>{
        LogService.reloadIDE("No response from IDE! going to reset...")
        LogService.reset(LogService.keepalive)
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
        LogService.consoleNum++;
        if(msg.trim().match(/^<<<</)){
          LogService.lanuchTest--
          msg=" ".repeat(LogService.lanuchTest*2)+msg
        }else if(msg.trim().match(/^>>>>/)){
          msg=" ".repeat(LogService.lanuchTest*2)+msg
          LogService.lanuchTest++
        }else if(Date.now()-LogService.lastTime>1000){
          let n=parseInt((Date.now()-LogService.lastTime)/1000)
          let w="+"
          let s=formatPeriod(Date.now()-LogService.startTime)
          if(LogService.lastTime){
            w=w.repeat(n)
            n=" ("+s+", "+n+"s) "
          }else{
            w=""
            n=""
          }
          console.log("\n     [ "+getCurrentTimeString()+n+w+" ]\n")
          LogService.lastTime=Date.now()
        }
        console.log(msg=LogService.consoleNum+": "+msg)
      }
    }
  }
}

LogService.init()

exports.LogService = LogService;
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
      if(LogService.page){
        LogService.reset(1)
      }else{
        console.log("wait to reset++++++++++++++++++")
      }
    }catch(ex){}
    testReset()
  },30000)
}