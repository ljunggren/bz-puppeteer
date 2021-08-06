'use strict';
const BZIDEServer={
  scriptList:[],
  urlObj,
  start(opts,BZSocket){
    BZIDEServer.opts=opts
    BZIDEServer.mySocketAddress=BZSocket.IP+":"+BZSocket.PORT
    
    BZIDEServer.loadIDE(function(){
      
    })
  },
  setPage(page,browser){
    this.page=page
    this.browser=browser
  },
  loadIDE(fun){
    let url=BZIDEServer.opts.url
    let o=BZIDEServer.urlObj=BZIDEServer.parseUrl(url)
    let dockerUrl=o.protocol+"://"+o.host+"/docker?"+o.query
    if(o.master){
      url=url.replace(/\&master=([^&#]*)(&|#)/,"$1",BZIDEServer.mySocketAddress);
      console.log("master url: "+url)

      BZIDEServer.loadFile(url,function(s){
        s=s.match(/\<script [^\<]+\<\/script\>/ig);
        
        BZIDEServer.syncLoadFile(s,function(){
          BZIDEServer.lanuchPage(url)
        })
      })
    }else if(o.group){
      setTimeout(()=>{
        url=dockerUrl;
        console.log("worker url: "+url)
        BZIDEServer.loadFile(url,function(s){
          s=s.match(/\<body\>(.+)\<\/body\>/ig);
          if(s){
            BZIDEServer.getScriptAndDataFromMaster(s,function(){
              _fun()
            })
          }else{
            BZIDEServer.loadIDE(fun)
          }
        })
        
      },5000)
    }else{
      BZIDEServer.lanuchPage(BZIDEServer.addRun(url))
    }
    
  },
  addRun(url,reset){
    if (!url.endsWith("/run") && BZIDEServer.urlObj.test) {
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
    BZIDEServer.loadFile(u,function(x){
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
        x=BZIDEServer.urlObj.protocol+"://"+BZIDEServer.urlObj.host+"/"+x.replace(/^[\/]/,"")

        BZIDEServer.loadFile(x,(v)=>{
          BZIDEServer.scriptList.push(v)
          BZIDEServer.syncLoadFile(fs,_fun)
        })
      }else{
        BZIDEServer.scriptList.unshift(x.substring(x.indexOf(">")+1))
        
        BZIDEServer.syncLoadFile(fs,_fun)
      }
    }else{
      _fun()
    }
  },
  parseUrl(url){
    let s=url.split("/");
    let o={
      url:url,
      protocol:s[0].replace(":",""),
      host:s[2],
      hash:url.split("#")[1],
      query:url.split("?")[1]
    }
    s=o.hash.split("/")
    o.project=s[0]
    o.version=s[1]
    o.module=s[2]
    o.test=s[3]
    s=o.query.split("#")[0].split("&")
    s.forEach(x=>{
      x=x.split("=")
      o[x[0]]=x[1]
    })
    console.log(o)
    
    
    if(url.key){
      console.log("Running in cooperation!")
    }else{
      console.log("Running in stand alone!")
    }
    
    
    return o
  },
  loadFile(url,_fun){
    let httpTool;
    if(url.startsWith("http:")){
      httpTool=http
    }else{
      httpTool=https
    }
    
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
  postScript(page,_fun,i){
    i=i||0
    let x=BZIDEServer.scriptList[i]
    if(x){
      setTimeout(()=>{
        page.evaluate(x)
        BZIDEServer.postScript(page,_fun,i+1)
      },200)
    }else{
      _fun&&_fun()
    }
  },
  lanuchPage(url,page,idePrintStackTrace,reset){
    BrowserHandler.lanuchPage(url,function(page){
      logService.setPage(BrowserHandler.curPage,BrowserHandler.browser)
    })
    
    
    let urlObj=BZIDEServer.urlObj
    let url=urlObj.url
    
    if(reset){
      url=url.replace(/\/run$/,"/")
    }
    
    
    
    const response = await page.goto(url);

    page.on("error", idePrintStackTrace);
    page.on("pageerror", idePrintStackTrace);
    
    page.evaluate("preData="+JSON.stringify(BZIDEServer.projectData))
    BZIDEServer.postScript(page)
  }
}
exports.BZIDEServer = BZIDEServer;
