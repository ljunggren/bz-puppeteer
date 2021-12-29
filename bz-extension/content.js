window.bzIframeId=null
let curContentExeAction=0,topFrame=0,initEnv=0;
 
//Register
window.extensionContent=1;

function initCode(t,tt){
  if(name!=="bz-master"){
    if(parent==window){
      registerTab()
    }else if(window.innerWidth>10&&window.innerHeight>5){
      setTimeout(()=>{
        registerTab()
      },1)
    }else if(tt<10){
      setTimeout(function(){
        initCode(100,tt+1)
      },t);
    }
  }else{
    document.body.setAttribute("bz-id",chrome.runtime.id)
    window.postMessage({bz:1,bzExtensionId:chrome.runtime.id}, "*");
  }
}
initCode(10,0)
function registerTab(){
  //_console("content register")
  console.log("Do register from:"+bzIframeId)
  chrome.runtime.sendMessage({_registerTab: location.href,BZ:Boolean(window.BZ),name:window.name},function(_msg){
    if(_msg && _msg._ignore){
      chrome.runtime.onMessage.removeListener()
    }
  });
}
chrome.runtime.onMessage.addListener(handleMsg);
let waitCodeTimer
function handleMsg(_event, _, sendResponse, codeTime) {  
  //_console("content get message: ",_event)
  if(window.name!="bz-master"&&(!window.ecMap||!window[ecMap.i]||!window[ecMap.u])){
    if(bzIframeId===null||bzIframeId===undefined){
      return
    }
    codeTime=codeTime||0
    if(codeTime%20==9){
    //console.log("Waiting app code: "+bzIframeId)
      if(window.innerWidth<10||window.innerHeight<5){
        return
      }
      if(codeTime>100){
        return
      }else{
        registerTab()
      }
    }

    clearTimeout(waitCodeTimer)

    waitCodeTimer=setTimeout(()=>{
      handleMsg(_event,_,sendResponse,codeTime+1)
    },100)
  }else if(_event.scope=="formatter"){
    formatter[_event.fun](_event.data,sendResponse)
    return
  }
  if(_event.findFrameId){
    return responseIFrameId(_event.findFrameId,sendResponse,_event.element,_event.retry)
  }else if(_event.findOffset){
    return responseIframeOffset(_event.findOffset,sendResponse)
  }
  if(!window.SERVER_HOST && window.name!="bz-master"){
    return
  }
  if(name=="bz-master"&&_event.tab!="master"){
    return
  }else if(name!="bz-master"&&_event.tab=="master"&&!_event.twPage){
    return
  }
  if(_event.twPage||_event.twPage2){
    _event.twPage=0
    _event.twPage2=1
    if(_event.tab=="master"){
      if(name=="bz-master"){
        window.postMessage(_event,"*");
      }else{
        try{
          chrome.runtime.sendMessage(_event)
        }catch(e){}
        return;
      }
    }else if(window.BZ){
      window[_event[ecMap.s]][_event[ecMap.f]](_event[ecMap.d]);
    }
  }else if(_event.fun && _event.scope){
    return _doIt3();
    function _doIt3(){
      if(name=="bz-master"){
        let script=document.getElementById("transefer-script")
        if(script){
          script.remove()
        }
        script=document.createElement("script")
        script.id="transefer-script"
        script.innerHTML=_event.scope+"."+_event.fun+"("+JSON.stringify(_event.data)+")"
        document.body.append(script)
        
        
//        location.href="javascript:"+_event.scope+"."+_event.fun+"("+JSON.stringify(_event.data)+")"
      }else if(window.BZ){
        if(window.BZ&&_event.frameId){
          if(!_event.frameId.includes(bzIframeId)){
            return
          }
        }
        window.BZ.exeFun(_event.fun,_event.scope,_event.data,_event.fromBg&&sendResponse);
      }else{
        setTimeout(function(){_doIt3()},1)
      }
    }
  }else if(_event._newStatus!==undefined){
    BZ[ecMap.ss](_event._newStatus,_event.data);
  //set execute action
  }else if(_event.exeAction){
    if(window.BZ && _event.frameId.includes(bzIframeId)){
      afterDocReady(function(){
        if(curContentExeAction&&curContentExeAction.exeTime==_event.exeAction.exeTime){
          return
        }
        curContentExeAction=_event.exeAction
        window[ecMap.dat][ecMap.ea](_event.exeAction,_event.setting,function(r){
          var d={$newElement:window.$newElement};
          //d["_tmpTaskDataMap"]=_ideDataManagement._tmpTaskDataMap
          d[ecMap.ttmd]=window[ecMap.idm][ecMap.ttmd]
          chrome.runtime.sendMessage({bz:1,result:r,data:d})
        });
      })
    }else{
      curContentExeAction=0
    }
  }else if(_event.isActive){
    sendResponse(1);
  }else if(_event.close){
    window.close();
  }else if(_event.ctrlInfo){
    _event.bz=1;
    window.postMessage(_event, "*");
  }else if(_event.tw!==undefined){
    window.postMessage({bz:1,tw:_event.tw}, "*");
  }else if(_event.twUpdate){
    window.postMessage({bz:1,twUpdate:1}, "*");
  }else if(_event.status!==undefined){
    window.postMessage({bz:1,status:_event.status}, "*");
  //set selected element
  }else if(_event.curAction!==undefined){
    //_IDE._data._curTest=_event.curTest
    var o=_event.curTest;
    if(o){
      //o=o?_CtrlDriver._buildProxy(_event.curTest):o;
      o=o?window[ecMap.cd][ecMap.bp](o):o;
      window[ecMap.i][ecMap.d][ecMap.ct]=o;
      
      //o=o._data.actions[_event.curAction]
      o=o[ecMap.d].actions[_event.curAction];
      if(o){
        if(_event.frameId===undefined || _event.frameId.includes(bzIframeId)){
          o.element=_event.element;
          window[ecMap.iam][ecMap.sca](o);
        }
        window[ecMap.i][ecMap.inn][ecMap.r]()
      }
    }else{
      window[ecMap.i][ecMap.d][ecMap.ct]=o;
    }
  }else if(_event.curTest!==undefined){
    //_IDE._data._curTest=_event.curTest
    var o=_event.curTest;
    //o=o?_CtrlDriver._buildProxy(_event.curTest):o;
    
    _doIt()
    function _doIt(){
      if(window.ecMap){
        o=o?window[ecMap.cd][ecMap.bp](o):o;
        window[ecMap.i][ecMap.d][ecMap.ct]=o;
        window[ecMap.i][ecMap.inn][ecMap.r]()
      }else{
        setTimeout(function(){_doIt()},1);
      }
    }
  }else if(_event.shareData!==undefined){
    _doIt1();
    function _doIt1(){
      if(window.BZ){
        BZ[ecMap.sd](_event.shareData);
      }else{
        setTimeout(function(){_doIt1()},1)
      }
    }
  }else if(_event.element){
    if(_event.frameId.includes(bzIframeId)){
      //_bzDomPicker._flashTmpCover(_event.element)
      if(window[ecMap.dp]){
        window[ecMap.dp][ecMap.ftc](_event.element);
      }
    }
  }else if(_event.exePickElement){
//    _IDE._data._curAction=_event.exePickElement;
    window[ecMap.i][ecMap.d][ecMap.ca]=_event.exePickElement;
    //_ideActionManagement._pickElement()
    window[ecMap.iam][ecMap.pe]()
  }else if(_event.updateExpection){
    if(_event.frameId.includes(bzIframeId)){
    //_IDE._data._curAction=_event.updateExpection
      window[ecMap.i][ecMap.d][ecMap.ca]=_event.updateExpection;
  //    _ideActionManagement._quickUpdateExpection(_event.updateExpection)
      window[ecMap.iam][ecMap.que](_event.updateExpection)
    }
  }else if(_event.getFramePath){
    _doIt2();
    function _doIt2(){
      if(window.BZ){
        if(topFrame){
          sendResponse(BZ.refreshFramePath(_event.getFramePath));
        }
      }else{
        setTimeout(function(){_doIt2()},1)
      }
    }

  }
  sendResponse&&sendResponse("ok")
}
function afterDocReady(_fun,_time){
  _time=_time||Date.now()
  if(initEnv&&window.onunload&&window[ecMap.dat][ecMap.ea]){
    _fun()
  }else{
    setTimeout(function(){
      afterDocReady(_fun,_time)
    },10)
  }
}

function _insertCssAndClientCode(_msg,_time){
  _time=_time||Date.now()
  if(document && document.body && document.body.innerHTML && (["complete","interactive"].includes(document.readyState) || Date.now()-_time>100000)){
    var o=document.createElement("style");
    o.innerHTML=_msg._css;
    document.body.parentNode.append(o);
    
    o=document.createElement("script");
    var _html="";
    /**/
    //_html+="_Util="+_Util._toString(_Util);
    _html+=ecMap.u+"="+window[ecMap.u][ecMap.ts](window[ecMap.u]);
    //_html+="_TWHandler="+_Util._toString(_TWHandler);
    _html+=ecMap.tw+"="+window[ecMap.u][ecMap.ts](window[ecMap.tw]);
    var w=window[ecMap.dat].TW
    //_html+="_domActionTask="+_Util._toString(_domActionTask);
    delete window[ecMap.dat].TW;
    _html+=ecMap.dat+"="+window[ecMap.u][ecMap.ts](window[ecMap.dat]);
    window[ecMap.dat].TW=w
    //_html+="_domRecorder="+_Util._toString(_domRecorder);
    _html+=ecMap.dr+"="+window[ecMap.u][ecMap.ts](window[ecMap.dr]);
    //_html+="_uploadHandler="+_Util._toString(_uploadHandler);
    _html+=ecMap.uh+"="+window[ecMap.u][ecMap.ts](window[ecMap.uh]);

    _html+="bzUtil="+window[ecMap.u][ecMap.ts]($util);
    
    _html+="bzTwComm="+window[ecMap.u][ecMap.ts](bzTwComm);
    /**/
    _html+="bzTwComm."+ecMap.init+"('"+chrome.runtime.id+"');"

    o.innerHTML=_html;
    document.body.parentNode.append(o);
    
    BZ[ecMap.ss](_msg._newStatus,_msg.data);
    window[ecMap.u][ecMap.k]()
    initEnv=1
  }else{
    setTimeout(function(){
      _insertCssAndClientCode(_msg,_time)
    },0)
  }
}
function noCrash(){
  return 1;
}
var _console=function(msg,o){
  console.log(msg)
  if(o){
    console.log(o)
  }
}

function showCode(v){
  var o=$("<b id='BZ-Info' style='cursor:pointer;z-index:1000000000000000;position:fixed;background:red;color:#FFF;padding:5px;top:0;left:0;'>"+v+"</b>").insertAfter(document.body).click(function(){
    this.remove();
    window.noMsg=1
  });
}

function responseIFrameId(vs,_sendResponse,element,retry){
  var p=parent,w=window;
  var r=w.document.body.getBoundingClientRect()
  
  while(vs.length){
    var v=parseInt(vs.pop());_found=0
    
    if(p.frames[v]!=w){
      for(var i=0;retry&&i<p.frames.length;i++){
        if(w==p.frames[i]){
          if(i>v&&r.width&&r.height){
            _found=1
          }
        }
      }
      if(!_found){
        return
      }
    }
    if(vs.length){
      w=p
      p=p.parent
    }else if(r.width&&r.height){
      _sendResponse(bzIframeId)
    }
  }
}

function responseIframeOffset(vs,_sendResponse){
  let p=parent,w=window;
  let r=w.document.body.getBoundingClientRect()
  let idx=vs.pop()
  let k=vs.join(",")
  if(!vs.length){
    if(p==w){
      r=document.getElementsByTagName("IFRAME")[idx].getBoundingClientRect()
      _sendResponse(r)
    }
  }else{
    while(vs.length){
      var v=parseInt(vs.pop());_found=0
      
      if(p.frames[v]!=w){
        for(var i=0;retry&&i<p.frames.length;i++){
          if(w==p.frames[i]){
            if(i>v&&r.width&&r.height){
              _found=1
            }
          }
        }
        if(!_found){
          return
        }
      }
      if(vs.length){
        w=p
        p=p.parent
      }else if(r.width&&r.height){
        r=document.getElementsByTagName("IFRAME")[idx].getBoundingClientRect()
        _sendResponse(r)
      }
    }
  }
}