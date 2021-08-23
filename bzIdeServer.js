'use strict';
const http = require('http');
const https = require('https');
const BZIDEServer={
  scriptList:[],
  urlObj:0,
  start(opts){
    BZIDEServer.opts=opts
    BZIDEServer.mySocketAddress=opts.socketServer.IP+":"+opts.socketServer.PORT
    
    BZIDEServer.loadIDE(function(){
      
    })
  },
  setPage(page,browser){
    console.log("set browser on ide")
    this.page=page
    this.browser=browser
  },
  loadIDE(fun){
    let url=BZIDEServer.opts.url
    let o=BZIDEServer.opts.urlObj
    
    let dockerUrl=o.protocol+"://"+o.host+"/docker?"+o.query
    if(o.master){
      url=url.replace(/(\&master=)([^&#]*)(&|#)/,"$1"+BZIDEServer.mySocketAddress+"$3");
      dockerUrl=dockerUrl.replace(/(\&master=)([^&#]*)(&|#)/,"$1"+BZIDEServer.mySocketAddress+"$3");
      console.log("master url: "+url)

      BZIDEServer.loadPage(url,function(s){
        s=s.match(/\<script [^\<]+\<\/script\>/ig);

        BZIDEServer.syncLoadFile(s,function(){
          BZIDEServer.lanuchIDE(dockerUrl)
        })
      })
    }else if(o.group){
      setTimeout(()=>{
        url=dockerUrl;
        BZIDEServer.loadPage(url,function(s){
          s=s.match(/\<body\>(.+)\<\/body\>/i);
          if(s&&s[0]){
            s=s[1].split(",")
            console.log("User id: "+s[0])
            BZIDEServer.opts.userId=s[0]
            BZIDEServer.opts.socketServer.connectionServerByClient(s[1])
          }else{
            BZIDEServer.loadIDE(fun)
          }
        })
        
      },3000)
    }else{
      BZIDEServer.lanuchIDE()
    }
    
  },
  addRun(url,reset){
    if (!url.endsWith("/run") && BZIDEServer.opts.urlObj.test) {
      if (!url.endsWith("/")) {
        url += "/"
      }
      url += "run"
    }
    if(reset){
      url=url.replace(/\/run$/,"/")
    }
    return url
  },
  setTaskList(opts){
    if(opts.listsuite||opts.listscenarios){
      logService.setBeginningFun(function(){
        logService.insertFileTask(function(){
          logService.result = 0;
          logService.shutdown()
        })
        if(opts.listsuite){
          browserHandler.curPage.evaluate((v)=>{
            $util.getTestsBySuite(v)
          }, opts.listsuite);
        }else if(opts.listscenarios){
          browserHandler.curPage.evaluate((v)=>{
            $util.getScenariosByTag(v)
          }, JSON.parse(opts.listscenarios));
        }
      })
    }
  },
  loadData(o){
    let u=`${o.protocol}://${o.host}/api/projects/${o.project}/?token=${o.token}`
    console.log(u)
    BZIDEServer.loadPage(u,function(x){
      console.log(x)
    })
  },
  syncLoadFile(fs,_fun){
    let x=fs.shift()
    if(x){
      x=x.replace(/[\r\n]/g,"")
        
      x=x.match(/\<script (.+)\<\/script\>/)[1].trim()

      if(x.startsWith("src=")){
        x=x.match(/[\"\'](.+)[\"\']/)[1]
        x=BZIDEServer.opts.urlObj.protocol+"://"+BZIDEServer.opts.urlObj.host+"/"+x.replace(/^[\/]/,"")

        BZIDEServer.loadPage(x,(v)=>{
          BZIDEServer.scriptList.push(v)
          BZIDEServer.syncLoadFile(fs,_fun)
        })
      }else{
        x=x.substring(x.indexOf(">")+1)
        let code=x.match(/"code":"([^"]+)"/)
        if(code){
          BZIDEServer.opts.userId=code[1]
        }
        BZIDEServer.scriptList.unshift(x)
        
        BZIDEServer.syncLoadFile(fs,_fun)
      }
    }else{
      _fun()
    }
  },
  loadPage(url,_fun){
    let httpTool;
    if(url.startsWith("http:")){
      httpTool=http
    }else{
      httpTool=https
    }
    console.log(url);
    httpTool.get(url, function(res) {
      var s = '';
      res.on('data', function (chunk) {
          s += chunk;
      });
      res.on('end', function () {
        console.log(`Finished download: ${url} (${s.length})`);
        _fun(s)
      });    
    });
  },
  async lanuchIDE(url,reset){
    if(!url){
      url=BZIDEServer.opts.urlObj.url
      
      if(reset){
        url=url.replace(/\/run$/,"/")
      }
    }
    let page=BZIDEServer.page;
    await page.goto(url)
    if(BZIDEServer.projectData){
      page.evaluate("preData="+JSON.stringify(BZIDEServer.projectData))
    }
    postScript(page)

    function postScript(page,_fun,i){
      i=i||0
      let x=BZIDEServer.scriptList[i]
      if(x){
        console.log("script-"+i+": "+x.substring(0,50))
        setTimeout(()=>{
          page.evaluate(x)
          postScript(page,_fun,i+1)
        },200)
      }else{
        _fun&&_fun()
      }
    }
  },
  retrieveScriptAndData(socket){
    if(!BZIDEServer.scriptList){
      BZIDEServer.opts.socketServer.sendMsg(socket,{
        method:"BZSocket.opts.ideServer.getScriptAndData"
      })
    }
  },
  getScriptAndData(d,socket){
    BZIDEServer.opts.socketServer.sendMsg(socket,{
      method:"BZSocket.opts.ideServer.setScriptAndData",
      data:{
        script:BZIDEServer.scriptList,
        data:BZIDEServer.projectData
      }
    })
  },
  setScriptAndData(d){
    BZIDEServer.scriptList=d.data.script
    BZIDEServer.projectData=d.data.data
  }
}
exports.BZIDEServer = BZIDEServer;
