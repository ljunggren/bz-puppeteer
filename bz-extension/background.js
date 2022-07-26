importScripts('/ecMap.js');

let _appUrl="https:/"+"/ai.boozang.com",
    ideId,appId,_ctrlWindowId,
    _bzEnvCode,_css,_status=_newStatus=0,_lastExeActionReq,_doingPopCtrl,_curTest,_data,_curAction,_shareData={},_ctrlFrameId;
let _lastErrPage=0,_loadPageInfo,assignfirmeCall,ignoreReqs="",_topFrameId=0;
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
      let idx=ar.includes(bf);
      if(idx>=0){
        ar[idx]=function(){
          callback(...arguments)
        }
      }
    }
    r=r[ecMap.f](...ar,t,bk)
    if(idx==-1&&bf){
      callback(r)
    }

    function callback(){
      if(c[ecMap.bf]){
        let v=funMap.buildAjaxData(c.bktg,c[ecMap.bs]||"window",c[ecMap.bf],[...arguments])
        trigger(v,c.fromId,c.fromFrameId)
      }
    }
  },
  setData:function(d){
    Object.assign(_shareData,d)
    let sent=0;
    exeFun.getAppId((v)=>{
      if(v&&!sent){
        sent=1
        let dd={bz:1}
        dd[ecMap.s]="BZ"
        dd[ecMap.f]=c[ecMap.sd]
        dd[ecMap.ar]=[d]
        trigger(dd,v.id)
      }
    })
  },
  getExtensions:function(_callback){
    //try to find extension: Grammarly, it cause performance issue!
    chrome.management.getAll(vs=>{
      _callback(vs.filter(x=>{
        return x.enabled
      }))
    })
  },
  openWindow:function(s,f,d){
    chrome.windows.create(d)
  },
  isRequestCompleted:function(_rList,fun){
    _rList.forEach((r,i)=>{
      var v=_responseList[r]
      if(v){
        delete _responseList[r]
        _rList[i]=funMap.buildAjaxData(v)
      }else{
        _rList[i]=null
      }
    })
    fun({result:!Object.keys(_list).length,data:_rList})
  },
  postRequestInfo:function(v){
    if(["main_frame","xmlhttprequest"].includes(v.type)){
      v=funMap.buildAjaxData(v)
      var id=v.requestId
      if(fun=="addReq"){
        _list[id]=v
      }else{
        delete _list[id]
        _responseList[id]=v
      }
      trigger(funMap.buildBZRequestData("ide","BZ","addReq",[v]))
    }
  },
  postToIDE:function(r){
    r.tg="ide"
    trigger(r,ideId)
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
          if(d.frameId){
            frameIds.push(d.frameId)
          }
          fun(d)
        })
      })
    }else{
      v={
        id:appId,
        frames:frameIds
      }
      if(fun){
        fun(v)
      }else{
        return v
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
  postRequestToElement:function(req,_element,fun,failFun){
    curReq=req
    let v=getIframePath(_element)
    if(v){
      v=funMap.buildBZRequestData("ext","BZ","findFrameId",[v])
      findFrame(v,req.toId,req)
    }
    

    function findFrame(v,id){
      let findFrameTimer=setTimeout(()=>{
        findFrameTimer=0
        failFun("Missing iframe")
      },1000)
      triggerApp(v,id,undefined,r=>{
        if(r&&findFrameTimer){
          clearTimeout(findFrameTimer)
          findFrameTimer=0
          _element[0]="BZ.TW.document";
          return fun(r)
        }
      })
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
  getScreenshot:function(bkScope,bkFun,d,t,element){
    chrome.tabs.captureVisibleTab(_ctrlWindowId,(img) => {
      fun({imgUrl:img})
    })
  },
  registerTab:function(_msg,t,_sendResponse){
    if(_msg.name=="bz-client"||appId==t.tab.id){
      let v
      if(t.url.includes("boozang.com")){
        return alert("Testing on Boozang sites not supported!");
      }

      if(_msg.name=="bz-client"){
        appId=t.tab.id;
        _ctrlWindowId=t.tab.windowId;
        //to tell master the current client tab id
        v=funMap.buildBZRequestData("ide","bzTwComm","setAppInfo",[{appId:appId,appUrl:t.url}])
        trigger(v,ideId);
      }else{
        v=funMap.buildBZRequestData("app","window","insertAppCode",[t.frameId])
        trigger(v,appId,t.frameId)
        v=funMap.buildBZRequestData("ext","window","initExtCode",[t.frameId])
        trigger(v,appId,t.frameId)
      }
      
      let d={appId:appId,frameId:t.frameId,ideId:ideId};

      _sendResponse(d)
      v=funMap.buildBZRequestData("app","bzTwComm","setAppInfo",[d])
      trigger(v,appId,t.frameId)
    }
  }
}
let _list={},_responseList={}
chrome.action.setBadgeText({text:"AI"});
/*Get Message from IDE*/
/******************* call ide *************************************************** */
chrome.runtime.onMessageExternal.addListener(function(_req, _sender, _callback) {
  //_console("background (web page): ",_req)
  //check whether the request from BZ pages. If not from BZ do nothing.
  if(!_req.bz){
    return;
  }
  let tg=_req.tg
  if(tg.includes("bg")){
    funMap.exeFun(_req,_sender,_callback)
  }else if(tg.includes("ide")){
    trigger(_req,ideId)
  }else if(tg.match(/ext|app/)){
    if(_req[ecMap.e]){
      funMap.postRequestToElement(_req,_req[ecMap.e],function(v){
        trigger(_req,_req.toId,v)
      },function(){
        _callback({bzErr:1})
      })
    }else{
      trigger(_req,appId)
    }
  }else if(_req.status!==undefined){
    //master tab set status before start pop client win
    if(_req.status=="popwin-start"){
      _doingPopCtrl=1
    //master tab set status after end pop client win
    }else if(_req.status=="popwin-end"){
      _doingPopCtrl=0
    }else{
      _newStatus=_status=_req.status;
      if(appId){
        if(_req.data){
          _data=_req.data;
        }
        chrome.tabs.sendMessage(appId, {_newStatus:_newStatus,data:_req.data},r=>{});
        _newStatus=0;
      }
    }
  //Set BZ code mapping data to unecrypt code from https://ai.boozang.com
  }else if(_req.extendTopScript){
    extendTopScript=_req.extendTopScript
    return
  }else if(_req.extendEndScript){
    extendEndScript=_req.extendEndScript
    return
  //Dynamic code from BZ master page
  }else if(_req.bzCode){
    if(ideId&&ideId!=_sender.tab.id){
      trigger({tab:"master",scope:"BZ",fun:"close"},ideId,0);
    }
    if(appId){
      trigger({tab:"master",scope:"window",fun:"close"},appId);
    }
    
    ideId=_sender.tab.id;
    _lastExeActionReq=0;
    ignoreReqs="";
    _callback(1)
  //Set CSS file path from BZ master page
  }else if(_req.bzCss){
    _css=_req.bzCss;
  //Dynamic data from BZ master page
  }else if(_req.bzEnvCode){
    _bzEnvCode=_req.bzEnvCode;
  }
});

let pop={
  formatLog:function(tab) {
    chrome.tabs.executeScript(tab.id, {code: `window.formatter&&window.formatter.exeFormag(${JSON.stringify(tab.data)})`,matchAboutBlank:true,allFrames:true},_=>{})
  },
  updateFormatLogSetting:function(tab){
    chrome.tabs.executeScript(tab.id, {code: `window.formatter&&window.formatter.updateFormatLogSetting(${JSON.stringify(tab.data)})`,matchAboutBlank:true,allFrames:true},_=>{})
  },
  getPageInfo:function(tab,_fun){
    chrome.tabs.sendMessage(tab, {scope:"formatter",fun:"getPageInfo"},d=>{
      _fun(d)
    });
  }
}

/******************* call APP *************************************************** */
//get message from app extension content
chrome.runtime.onMessage.addListener(function(_msg, t, _sendResponse) {
  if(_msg.pop){
    _sendResponse(1)
    return pop[_msg.fun](_msg.data,function(d){
      _sendResponse(d)
    })
  }else if(!_msg.requestSendResponse){
    
  }else{
    _msg.requestSendResponse=_sendResponse
  }

  //_console("background (content): ",_msg)
  /*****************************************************************************************************
  //For REGISTER tab, it only work for new pop window. The new window must pop up from master window.
  *****************************************************************************************************/
  if(_msg.registerTab){
    funMap.registerTab(_msg,t,_sendResponse)
  }
});

chrome.tabs.onRemoved.addListener(function(_tab, info) {
  //_console("background: remove tab")
  //clear data when master tab close
  if(ideId==_tab){
    //_console("background: remove master")
    cleanMaster()
  //clear client info
  }else if(appId==_tab){
    //_console("background: remove ctrl")
    appId=0;
    let v=funMap.buildBZRequestData("ide","bzTwComm","setAppInfo",[{appId:0}])
    trigger(v,ideId);
  }
});

chrome.tabs.onCreated.addListener(function(t, info) {
  //_console("background add tab")
  //only register the poping up client win
  if(_doingPopCtrl){
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
  _shareData={}
  ignoreReqs=0
  _newStatus=_status=_topFrameId=0
}

chrome.webRequest.onBeforeRequest.addListener(function(a,b){
  if(a.tabId==appId&&appId){
    if(a.type=="main_frame"){
      _list={}
      _responseList={}
    }
    funMap.postRequestInfo(a)
  }
},{urls: ["<all_urls>"]})


chrome.webRequest.onBeforeRedirect.addListener(function(a,b){
  if(a.tabId==appId&&appId){
    funMap.postRequestInfo(a)
  }
},{urls: ["<all_urls>"]})

chrome.webRequest.onCompleted.addListener(function(v){
  if(v.tabId!=appId||!ideId){
    return
  }

  funMap.postRequestInfo(v)
  
  funMap.postToIDE({c:"_ideRecorder._twUpdate()"})
  var r={ctrlInfo:1,url:v.url,from:"complete"}
  if(v.statusCode>=400){
    r.failed=1;
    r.code=v.statusCode
  }
  if(v.type=="main_frame"||(v.type=="sub_frame"&&v.frameId==_topFrameId)){
    if(_isDownloading(v.responseHeaders)){
      r.download=1
    }else{
      r.ready=1;//mainPage
      _lastErrPage=0
      r.tab="master"
      r.type=v.type
      funMap._postToIDE(r)
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
  funMap._postToIDE(r)
},{urls: ["<all_urls>"]},["responseHeaders"]);

chrome.webRequest.onErrorOccurred.addListener(function(v){
  if(v.tabId!=appId||!ideId){
    return
  }

  var r={url:v.url,error:v.error};
  funMap.postRequestInfo(v)
  
  if(v.type=="main_frame"||(v.type=="sub_frame"&&((_masterFrameId&&!appId)||v.frameId==_topFrameId))){
    if(_isDownloading(v.responseHeaders)){
      r.download=1
    }else{
      r.ready=1
    }
    if(_lastErrPage && _lastErrPage.url==r.url && Date.now()-_lastErrPage.time<1000){
      _lastErrPage.time=Date.now()
      return;
    }
    _lastErrPage={url:r.url,time:Date.now(),type:v.type}
    console.log(_lastErrPage)
  }else if(v.type=="other"){
    r.download=1
  }else{
    r.error=0
    r.extraFile=1;
    r.initUrl=v.initiator
  }
  funMap._postToIDE(r)

},{urls: ["<all_urls>"]});

chrome.webRequest.onActionIgnored.addListener(function(v){
  if(v.tabId!=appId){
    return
  }
  funMap.postRequestInfo(v)
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
  },{
    id: 'content',
    js: ['plug.js',"content"],
    matches: ['<all_urls>'],
    runAt: 'document_start',
    allFrames:true
  }];
  const ids = scripts.map(s => s.id);
  await chrome.scripting.unregisterContentScripts({ ids }).catch(() => {});
  await chrome.scripting.registerContentScripts(scripts);
}

function trigger(v,tabId,iframeId,page){
  let t={tabId: tabId}
  if(iframeId){
    t.frameIds=[iframeId]
  }else if(iframeId===undefined){
    t.allFrames=true
  }
  let d={
    target: t,
    func: triggerFun,
    args:v[ecMap.ar],
  }
  if(v.tg!="ext"){
    d.world="MAIN"
  }
  chrome.scripting.executeScript(
    d,
    () => {}
  )

  function triggerFun(v){
    bzTwComm.setRequest(v)
  }
}


console.clear()
