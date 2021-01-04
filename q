[1mdiff --git a/bz-extension/background b/bz-extension/background[m
[1mindex c623218..e10ed9c 100644[m
[1m--- a/bz-extension/background[m
[1m+++ b/bz-extension/background[m
[36m@@ -7,6 +7,18 @@[m [mlet funMap={[m
       // _lastExeActionReq[k]=data[k][m
     // }[m
   // },[m
[32m+[m[32m  getExtensions:function(bkScope,bkFun,v,_callback){[m
[32m+[m[32m    // let blockExtensions={[m
[32m+[m[32m      // "kbfnbcaeplbcioakkpcpgfkobkghlhen":"Grammarly"[m
[32m+[m[32m    // }[m
[32m+[m[32m    //try to find extension: Grammarly, it cause performance issue![m
[32m+[m[32m    chrome.management.getAll(vs=>{[m
[32m+[m[32m      vs.filter(x=>{[m
[32m+[m[32m        return x.enabled[m
[32m+[m[32m      })[m
[32m+[m[32m      _callback(vs)[m
[32m+[m[32m    })[m
[32m+[m[32m  },[m
   isRequestCompleted:function(bkScope,bkFun,_rList){[m
     _rList.forEach((r,i)=>{[m
       var v=_responseList[r][m
[36m@@ -390,13 +402,14 @@[m [mfunction isIgnoreFrame(v){[m
 }[m
 //get message from app extension content[m
 chrome.runtime.onMessage.addListener(function(_msg, t, _sendResponse) {[m
[32m+[m[32m  if(_msg.keep){[m
[32m+[m[32m    return;[m
[32m+[m[32m  }[m
   //_console("background (content): ",_msg)[m
   /*****************************************************************************************************[m
   //For REGISTER tab, it only work for new pop window. The new window must pop up from master window.[m
   *****************************************************************************************************/[m
[31m-  if(_msg.keep){[m
[31m-    return;[m
[31m-  }else if(_msg.bg){[m
[32m+[m[32m  if(_msg.bg){[m
     return funMap[_msg.fun](_msg.bkScope,_msg.bkFun,_msg.data,t)[m
   }else if(_msg._registerTab && (_msg.name=="bz-client"||_ctrlTabId==t.tab.id)){[m
     if(_msg.name=="bz-client"){[m
[36m@@ -686,3 +699,5 @@[m [mchrome.webRequest.onActionIgnored.addListener(function(v){[m
   }[m
   funMap.postRequest(v,"BZ","addRep")[m
 })[m
[41m+[m
[41m+[m
[1mdiff --git a/bz-extension/manifest.json b/bz-extension/manifest.json[m
[1mindex 3738fdc..67edfe1 100644[m
[1m--- a/bz-extension/manifest.json[m
[1m+++ b/bz-extension/manifest.json[m
[36m@@ -4,7 +4,7 @@[m
   "short_name": "Boozang AI",[m
   "description": "Boozang test automation is powered by AI. Tests can be recorded or written in clear text.",[m
   "version": "3.7.8",[m
[31m-  "permissions": ["webRequest", "tabs", "*://*/*","<all_urls>"],[m
[32m+[m[32m  "permissions": ["webRequest", "tabs","management","*://*/*","<all_urls>"],[m
   "background": {[m
     "scripts": ["background"][m
   },[m
