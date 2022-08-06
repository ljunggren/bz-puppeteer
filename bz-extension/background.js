importScripts('/ecMap.js');
let list={},responseList={},appListenerMap={},resetTime
let ideId,appId,_ctrlWindowId,initAppScript=[],
    _status=newStatus=0,_lastExeActionReq,doingPopCtrl,_curTest,_data,_curAction,shareData={},_ctrlFrameId;
let lastErrPage=0,_loadPageInfo,assignfirmeCall,ignoreReqs="";
let _lastIframeRequest=0,_dblCheckTime=0,extendTopScript="",extendEndScript="";
let funMap={
  exeFun:function(c,t,bk){
    let ks=c[ecMap.s].split(".")
    let r=ks.shift(),idx=-1
    if(r=="funMap"){
      r=funMap
    }else if(r=="chrome"){
      r=chrome
    }
    ks.forEach(x=>{
      r=r[x]
    })
    let ar=c[ecMap.ar]||[],
        bf=c[ecMap.bf]
        
    if(bf){
      idx=ar.indexOf(bf);
      if(idx>=0){
        ar[idx]=function(){
          callback(...arguments,t,bk)
        }
      }
    }
    
    r=r[c[ecMap.f]](...ar,t,bk)
    if(idx==-1&&bf){
      callback(r,t,bk)
    }
    function callback(d,t,bk){
      if(c[ecMap.bf]){
        let v=funMap.buildBZRequestData(c.bktg,c[ecMap.bs]||"window",c[ecMap.bf],[d])
        trigger(v,c.fromId||t.tab.id,c.frameId)
      }
    }
  },
  setShareData:function(d){
    Object.assign(shareData,d)
  },
  getExtensions:function(callback){
    //try to find extension: Grammarly, it cause performance issue!
    chrome.management.getAll(vs=>{
      callback(vs.filter(x=>{
        return x.enabled
      }))
    })
  },
  openWindow:function(d){
    chrome.windows.create(d)
  },
  isRequestCompleted:function(rList,fun){
    rList.forEach((r,i)=>{
      var v=responseList[r]
      if(v){
        delete responseList[r]
        rList[i]=funMap.buildAjaxData(v)
      }else{
        rList[i]=null
      }
    })
    fun({result:!Object.keys(list).length,data:rList})
  },
  postRequestInfo:function(v,fun){
    if(["main_frame","xmlhttprequest"].includes(v.type)){
      v=funMap.buildAjaxData(v)
      if(fun=="addReq"){
        list[v.requestId]=v
      }else{
        delete list[v.requestId]
      }
      trigger(funMap.buildBZRequestData("ide","BZ",fun,[v]),ideId)
    }
  },
  buildAjaxData:function(v){
    return {
      requestId:v.requestId,
      url:v.url,
      timeStamp:v.timeStamp,
      statusCode:v.statusCode,
      type:v.type,
      method:v.method
    }
  },
  getAppId:async function(fun){
    if(!appId){
      let tabs = await chrome.tabs.query({})
      tabs.forEach(x=>{
        trigger({tg:"ext",c:"window.reportBZInfo&&window.reportBZInfo()"},x.id,undefined,function(d){
          appId=d.id
          fun(appId)
        })
      })
    }else{
      if(fun){
        fun(appId)
      }else{
        return appId
      }
    }
  },
  buildBZRequestData:function(tg,scope,fun,args,c,d,bkfun,bkscope){
    let dd={bz:1}
    dd[ecMap.s]=scope
    dd[ecMap.f]=fun
    dd[ecMap.ar]=args
    dd[ecMap.bf]=bkfun
    dd[ecMap.bs]=bkscope
    dd.c=c
    dd.d=d
    dd.tg=tg
    return dd
  },
  setAppInitScript:function(d){
    initAppScript=d
  },
  postRequestToElement:function(req,_element,fun,failFun,_retry){
    curReq=req
    let v=getIframePath(_element)
    // console.log(JSON.stringify(_element))
    if(v){
      let findFrameTimer=setTimeout(()=>{
        findFrameTimer=0
        failFun("Missing iframe")
      },1000)

      chrome.scripting.executeScript(
        {
          target:{
            tabId:appId||req.toId,
            allFrames:true
          },
          func:findFrameId,
          args:[v]
        },
        r => {
          if(findFrameTimer){
            clearTimeout(findFrameTimer)
            if(!r.find(x=>{
              if(x.result){
                _element[0]="BZ.TW.document";
                fun(x.result)
                return 1
              }
            })){
              fun({_type:1})
            }
          }
        }
      )
    }else{
      fun(0)
    }
    

    function findFrameId(v){
      return BZ.responseIFrameId(v)
    }

    function getIframePath(_element){
      if(_element&&_element[0]&&!_element[0].startsWith("$(BZ.TW.document.body)")&&_element[0][0]=="$"){
        var v=_element[0].match(/findIframe\((.+)\)/)
        if(v){
          v=v[1].trim()
          if(v.match(/^[0-9, ]+$/)){
            return v.replace(/ /g,"").split(",")
          }else{
            v=v.replace(/(^['"]|['"]$)/g,"")
            return [v]
          }
        }
      }
    }
  },  
  ajax:function(data,fun){
    let asFile=data.notDownloadAsFile
    delete data.notDownloadAsFile
    let hs={},d={
      data:{
        headers:hs
      }
    }
    if(data.contentType){
      data.headers=data.headers||{}
      data.headers["Content-Type"]=data.contentType
      delete data.contentType
    }
    delete data.cache
    data.body=data.body||data.data
    delete data.data
    fetch(data.url,data).then(r=>{
      for (var k of r.headers.entries()) {
        hs[k[0]]=k[1]
      }
      d.data.status=r.status
      if(data.responseType=="arraybuffer"&&!asFile){
        return r.blob()
      }else{
        return r.text()
      }
    }).then(dd=>{
      if(data.responseType=="arraybuffer"&&!asFile){
        return dd.arrayBuffer()
      }else{
        d.data.data=dd;
        if(data.responseType&&this.response){
          d.data.data=String.fromCharCode.apply(null, new Uint8Array(this.response));
        }
        fun(d.data)
      }
    }).then(dd=>{
      if(data.responseType=="arraybuffer"&&!asFile){
        let o=_handleBold(dd,data.url)
        fun(o)
      }
    })

    function _handleBold(blob,_url){
      var str=_handleCodePoints(new Uint8Array(blob));
      
      //var str = String.fromCharCode.apply(null, new Uint8Array(blob));
      //var str=new TextDecoder("utf-8").decode(new Uint8Array(blob));
      var v=_url.split("/");
      var n=v.pop()||v.pop()

      var t=n.split(".").pop()||"";
      if(["jpg","png","svg","bmp","gif","jpeg","ico"].includes(t)){
        t="image/"+t;
      }else if("txt"==t){
        t="plant/text"
      }else{
        t="application/"+t;
      }
      return [{
        size:str.length,
        name:n,
        base64Link:"data:"+t+";base64,"+_b64EncodeUnicode(str),
        lastModified:Date.now(),
        lastModifiedDate:new Date(),
        webkitRelativePath:"",
        type:t
      }];
    }
    function _handleCodePoints(array) {
      var CHUNK_SIZE = 0x8000; // arbitrary number here, not too small, not too big
      var index = 0;
      var length = array.length;
      var result = '';
      var slice;
      while (index < length) {
        slice = array.slice(index, Math.min(index + CHUNK_SIZE, length)); // `Math.min` is not really necessary here I think
        result += String.fromCharCode.apply(null, slice);
        index += CHUNK_SIZE;
      }
      return result;
    }

    function _b64EncodeUnicode(str) {
      try{
        return btoa(str)
      }catch(e){
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode('0x' + p1);
        }));
      }
    }
  },
  getScreenshot:function(fun,t){
    chrome.tabs.captureVisibleTab(t.tab.windowId,(img) => {
      fun({imgUrl:img})
    })
  },
  registerTab:function(_msg,t,_sendResponse){
    if(_msg.name.includes("bz-client")||appId==t.tab.id){
      let v
      if(t.url.includes("boozang.com")){
        return alert("Testing on Boozang sites not supported!");
      }

      // appListenerMap[t.frameId]=funMap.addListener()
      funMap.log("Register App ...")
      if(_msg.name.includes("bz-client")){
        appId=t.tab.id;
        _ctrlWindowId=t.tab.windowId;
        //to tell master the current client tab id
        v=funMap.buildBZRequestData("ide","bzTwComm","setAppInfo",[{appId:appId,appUrl:t.url}])
        trigger(v,ideId);
      }else{
        chrome.scripting.executeScript(
          {
            target:{
              tabId:appId,
              frameIds:[t.frameId]
            },
            func:toInsertAppCode,
            args:[t.frameId],
            world:"MAIN"
          },
          r => {}
        )
        chrome.scripting.executeScript(
          {
            target:{
              tabId:appId,
              frameIds:[t.frameId]
            },
            func:toInitExtCode,
            args:[t.frameId]
          },
          r => {}
        )
      }
      
      let d={appId:appId,frameId:t.frameId,ideId:ideId};

      _sendResponse(d)
      v=funMap.buildBZRequestData("app","bzTwComm","setAppInfo",[d])
      trigger(v,appId,t.frameId,0,1)
      funMap.postPreScriptToApp(appId,t.frameId)
      trigger(funMap.buildBZRequestData("ext","BZ",ecMap.sd,[shareData]),appId,t.frameId,0,1)
      initAppScript.forEach(x=>{
        trigger(funMap.buildBZRequestData(x.tg,x[ecMap.s],x[ecMap.f],x[ecMap.ar],x.c,x.d),appId,t.frameId,0,1)
      })
      trigger(funMap.buildBZRequestData("ext","BZ",ecMap.ss,[_status]),appId,t.frameId,0,1)
    }else{
      _sendResponse(1)
    }
  },
  postAppRequestInfoToIDE:function(d){
    trigger(funMap.buildBZRequestData("ide",ecMap.ec,ecMap.har,[d]))
  },
  postPreScriptToApp:function(id,fid){
    if(extendTopScript||extendEndScript){
      let s= (extendTopScript||"")+"\n"+(extendEndScript||"")
      trigger(funMap.buildBZRequestData("app",ecMap.u,ecMap.ev,[s]),id,fid)
    }
  },
  listener:function(req, sender, callback) {
    //_console("background (web page): ",req)
    //check whether the request from BZ pages. If not from BZ do nothing.
    let tg=req.tg||""
    if(req.mainPage){
      chrome.scripting.executeScript(
        {
          target:{
            tabId:sender.tab.id
          },
          files:["main_"+req.mainPage],
          world:"MAIN"
        },
        r => {}
      )
    }else if(req.status!==undefined){
      //master tab set status before start pop client win
      if(req.status=="popwin-start"){
        doingPopCtrl=1
      //master tab set status after end pop client win
      }else if(req.status=="popwin-end"){
        doingPopCtrl=0
      }else{
        newStatus=_status=req.status;
  
        trigger(req,req.toId);
        newStatus=0;
      }
    //Set BZ code mapping data to unecrypt code from https://ai.boozang.com
    }else if(req.extendTopScript){
      extendTopScript=req.extendTopScript
    }else if(req.extendEndScript){
      extendEndScript=req.extendEndScript
    }else if(tg.includes("bg")){
      if(req.bzCode){
        if(ideId&&ideId!=sender.tab.id){
          trigger(funMap.buildBZRequestData("ide","BZ","close"),ideId,0);
        }
        if(appId){
          trigger(funMap.buildBZRequestData("app","window","close"),appId,0);
        }
        
        ideId=sender.tab.id;
        _lastExeActionReq=0;
        ignoreReqs="";
        callback(ideId)
        return
        //Set CSS file path from BZ master page
      }else{
        funMap.exeFun(req,sender,callback)
      }
    }else if(tg.includes("ide")){
      trigger(req,req.toId||ideId)
    }else if(tg.match(/ext|app/)){
      if(req[ecMap.e]){
        funMap.postRequestToElement(req,req[ecMap.e],function(v){
          // console.log(JSON.stringify((req.toId||appId)+":"+v))
          trigger(req,req.toId||appId,v)
        },function(){
          callback({bzErr:1})
        })
      }else{
        if(req[ecMap.f]==ecMap.sd){
          funMap.setShareData(...req[ecMap.ar])
        }
        trigger(req,req.toId||appId)
      }
    }
    callback(1)
  },
  log:function(msg){
    console.log(msg)
    let v=funMap.buildBZRequestData("ide","console","log",["BZ-LOG: "+msg])
    trigger(v,ideId)
  }
}
chrome.runtime.onMessageExternal.addListener(funMap.listener);
chrome.action.setBadgeText({text:"AI"});
/*Get Message from IDE*/
/******************* call ide *************************************************** */


let pop={
  formatLog:function(tab) {
    chrome.scripting.executeScript({
      target:{tabId:tab.id}, 
      func:((d)=>{
        window.formatter&&window.formatter.exeFormag(d)
      }),
      args:[tab.data]
    },_=>{})
  },
  updateFormatLogSetting:function(tab){
    chrome.scripting.executeScript({
      target:{tabId:tab.id}, 
      func:((d)=>{
        window.formatter&&window.formatter.updateFormatLogSetting(d)
      }),
      args:[tab.data]
    },_=>{})
  }
}

/******************* call APP *************************************************** */
//get message from app extension content
chrome.runtime.onMessage.addListener(function(msg, t, sendResponse) {
  if(msg.pop){
    sendResponse(1)
    return pop[msg.fun](msg.data,function(d){
      sendResponse(d)
    })
  }else if(!msg.requestSendResponse){
    
  }else{
    msg.requestSendResponse=sendResponse
  }

  if(msg.registerTab){
    funMap.registerTab(msg,t,sendResponse)
  }else{
    funMap.listener(msg,t,sendResponse)
  }
});

chrome.tabs.onRemoved.addListener(function(t, info) {
  //_console("background: remove tab")
  //clear data when master tab close
  if(ideId==t){
    //_console("background: remove master")
    cleanMaster()
  //clear client info
  }else if(appId==t){
    //_console("background: remove ctrl")
    appId=0;
    let v=funMap.buildBZRequestData("ide","bzTwComm","setAppInfo",[{appId:0}])
    trigger(v,ideId);
  }
});

chrome.tabs.onCreated.addListener(function(t, info) {
  //_console("background add tab")
  //only register the poping up client win
  if(doingPopCtrl){
    //_console("background add ctrl tab")
    if(appId && appId!=t.id){
      let v=funMap.buildBZRequestData("app","window","close",[]), id=appId
      appId=0
      trigger(v,id)
    }
    appId=t.id;
    //to tell master the current client tab id
    v=funMap.buildBZRequestData("ide","bzTwComm","setAppInfo",[{appId:appId,appUrl:t.url}])
    trigger(v,ideId)
  }
});

function _isDownloading(rs){
  for(var i=0;rs && i<rs.length;i++){
    var r=rs[i];
    if(r.name=="Content-Disposition" && (r.value.includes("attachment")||r.value.includes("filename"))){
      return 1
    }else if((r.name||"").toLowerCase()=="content-type" && (r.value.includes("application")||r.value.includes("stream"))){
      return 1
    }
  }
}

function cleanMaster(){
  var tabId=appId
  if(appId){
    trigger(funMap.buildBZRequestData("app","window","close"),appId)
  }
  _status=""
  ideId=0;
  appId=0;
  shareData={}
  initAppScript=[]
  ignoreReqs=0
  newStatus=_status=0
}

chrome.webRequest.onBeforeRequest.addListener(function(a,b){
  if(a.tabId==appId&&appId){
    if(a.type=="main_frame"){
      list={}
      responseList={}
    }
    funMap.postRequestInfo(a,"addReq")
  }
},{urls: ["<all_urls>"]})


chrome.webRequest.onBeforeRedirect.addListener(function(a,b){
  if(a.tabId==appId&&appId){
    funMap.postRequestInfo(a,"addRep")
  }
},{urls: ["<all_urls>"]})

chrome.webRequest.onCompleted.addListener(function(v){
  if(v.tabId!=appId||!ideId){
    return
  }

  funMap.postRequestInfo(v,"addRep")
  
  trigger(funMap.buildBZRequestData("ide",ecMap.rc,ecMap.tu),ideId)
  var r={ctrlInfo:1,url:v.url,from:"complete"}
  if(v.statusCode>=400){
    r.failed=1;
    r.code=v.statusCode
  }
  if(v.type=="main_frame"){
    if(_isDownloading(v.responseHeaders)){
      r.download=1
    }else{
      r.ready=1;//mainPage
      lastErrPage=0
      r.tab="master"
      r.type=v.type
      funMap.postAppRequestInfoToIDE(r)
      return
    }
  }else if(v.type=="other"){
    /*****************************
    * NOT SURE, NEED CHECK AGAIN!!!
    *****************************/
    r.download=1
  }else if(r.failed){
    r.extraFile=1;
    r.initUrl=v.initiator
  }else{
    return;
  }
  funMap.postAppRequestInfoToIDE(r)
},{urls: ["<all_urls>"]},["responseHeaders"]);

chrome.webRequest.onErrorOccurred.addListener(function(v){
  if(v.tabId!=appId||!ideId){
    return
  }

  var r={url:v.url,error:v.error};
  funMap.postRequestInfo(v,"addRep")
  
  if(v.type=="main_frame"){
    if(_isDownloading(v.responseHeaders)){
      r.download=1
    }else{
      r.ready=1
    }
    if(lastErrPage && lastErrPage.url==r.url && Date.now()-lastErrPage.time<1000){
      lastErrPage.time=Date.now()
      return;
    }
    lastErrPage={url:r.url,time:Date.now(),type:v.type}
    console.log(lastErrPage)
  }else if(v.type=="other"){
    r.download=1
  }else{
    r.error=0
    r.extraFile=1;
    r.initUrl=v.initiator
  }
  funMap.postAppRequestInfoToIDE(r)

},{urls: ["<all_urls>"]});

chrome.webRequest.onActionIgnored.addListener(function(v){
  if(v.tabId!=appId){
    return
  }
  funMap.postRequestInfo(v,"addRep")
})


chrome.runtime.onInstalled.addListener(addPageScript);

async function addPageScript() {
  const scripts = [{
    id: 'override',
    js: ['override.js'],
    matches: ['<all_urls>'],
    runAt: 'document_start',
    world: 'MAIN',
    allFrames:true
  }];
  const ids = scripts.map(s => s.id);
  await chrome.scripting.unregisterContentScripts({ ids }).catch(() => {});
  await chrome.scripting.registerContentScripts(scripts);
}

function trigger(v,tabId,iframeId,fun,init){
  if(!tabId){
    return
  }
  let t={tabId: tabId}
  if(iframeId){
    t.frameIds=[iframeId]
  }else if(iframeId===undefined){
    t.allFrames=true
  }
  let d={
    target: t,
    func: triggerFun,
    args:[{v:v,i:init}],
  }
  if(v.tg!="ext"){
    d.world="MAIN"
  }
  chrome.scripting.executeScript(
    d,
    a => {
      fun&&fun(a)
    }
  )

  function triggerFun(v){
    return doIt()
    function doIt(){
      if(window.document.body.classList[0]=="BZIgnore"||location.href=="about:blank"){
        return
      }
      if(!v.i&&(!window.bzTwComm||!bzTwComm.appReady)){
        console.log("deloy on:")
        console.log(v.v)
        return setTimeout(()=>{
          return doIt()
        },10)
      }
      try{
        return bzTwComm.setRequest(v.v)
      }catch(e){
        console.log(e.stack)
      }
    }
  }
}

function toInsertAppCode(v){
  insertAppCode(v)
}

function toInitExtCode(v){
  initExtCode(v)
}
function resetApp(){
  if(!appId){
    return
  }
  debugger
  funMap.log("Reset app ...")
  clearTimeout(resetTime)
  resetTime=setTimeout(()=>{
    resetApp()
  },3000)
  chrome.scripting.executeScript(
    {
      target:{
        tabId:appId,
        allFrames:true
      },
      func:()=>{
        registerTab()
      },
      args:[]
    },
    r => {
      funMap.log("rigger app result: "+r.result)
      if(r.result){
        funMap.log("Get app response ...")
        clearTimeout(resetTime)
      }
    }
  )
}
(async ()=>{
  let tabs = await chrome.tabs.query({})
  tabs.forEach(x=>{
    if(x.url.includes("/extension?")){
      trigger({tg:"ide",c:"bzTwComm.touchIDE()"},x.id,undefined,function(d){
        d=d&&d[0]
        if(d){
          d=d.result
          if(d){
            ideId=d.ideId
            appId=d.appId
            resetApp()
          }
        }
      })
    }
  })
})()
console.clear()
