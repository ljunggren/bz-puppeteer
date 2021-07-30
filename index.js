#! /usr/bin/env node
// Device Descriptors https://github.com/GoogleChrome/puppeteer/blob/master/DeviceDescriptors.js


const puppeteer = require('puppeteer');
const options = require('node-options');
const Service = require('./logService').Service;
const http = require('http');
const https = require('https');

// Command defaults
const opts = {
  "verbose" : false,
  "file": "report",
  "listscenarios":"",
  "listsuite":"",
  "device" : "",
  "screenshot": false,
  "token":"",
  "userdatadir":"",
  "width":1280,
  "height":1024,
  "docker": false,
  "keepalive": false,
  "testreset":false,
  "loglevel": "debug"
}

// Remove the first two arguments, which are the 'node' binary and the name
// of your script.
const result = options.parse(process.argv.slice(2), opts);
const verbose = opts.verbose;
const token = opts.token;
const docker = opts.docker;
const userdatadir = opts.userdatadir;
const width = opts.width;
const height = opts.height;
const listscenarios=opts.listscenarios;
const listsuite=opts.listsuite;

let keepalive=opts.keepalive;
let testReset=opts.testreset;
let inService;
const file = opts.file;
const logLevel=opts.loglevel;
let url = result.args[0];

if (result.errors || !result.args || result.args.length !== 1) {
  console.log('USAGE: boozang [--token] [--docker] [--keepalive] [--testreset] [--verbose] [--userdatadir] [--listscenarios] [--listsuite] [--width] [--height] [--screenshot] [--file=report] [url]');
  process.exit(2);
}

console.log("Running with following args");
console.log(opts);
console.log("Example: Use --verbose for verbose logging (boolean example). Use --width=800 to override default width (value example.)");

let LogLevelArray = ["error","warning","info","debug","log"];

if (logLevel === "error"){
  LogLevelArray = ["error"]
} else if (logLevel === "warning"){
  LogLevelArray = ["error","warning"]
} else if (logLevel === "info"){
  LogLevelArray = ["error","warning","info"]
}

console.log("Setting log levels: ", LogLevelArray);

let browser,code=[],urlObj;

Service.setResetButton(function(s){
  start(1)
});

(()=>{
  loadIDE(url,()=>{
    start()
//    loadData(urlObj)
  })
})();

function loadIDE(url,_fun){
  urlObj=parseUrl(url)
  loadFile(url,function(s){
    s=s.match(/\<script [^\<]+\<\/script\>/ig);
    
    syncLoadFile(s,function(){
      _fun()
    })
  })
}

function loadData(o){
  let u=`${o.protocol}://${o.host}/api/projects/${o.project}/?token=${o.token}`
  loadFile(u,function(x){
    console.log(x)
  })
}

function syncLoadFile(fs,_fun){
  let x=fs.shift()
  if(x){
    x=x.replace(/[\r\n]/g,"")
      
    x=x.match(/\<script (.+)\<\/script\>/)[1].trim()

    if(x.startsWith("src=")){
      x=x.match(/[\"\'](.+)[\"\']/)[1]
      x=urlObj.protocol+"://"+urlObj.host+"/"+x.replace(/^[\/]/,"")

      loadFile(x,(v)=>{
        code.push(v)
        syncLoadFile(fs,_fun)
      })
    }else{
      code.unshift(x.substring(x.indexOf(">")+1))
      
      syncLoadFile(fs,_fun)
    }
  }else{
    _fun()
  }
}

function parseUrl(url){
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
  return o
}
function loadFile(url,_fun){
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
  
}
function start(reset){
  (async () => {
    
    let file = (docker ? "/var/boozang/" : "");
    if (opts.file){
      file += opts.file;
    }

    let userdatadir = "";
    if (opts.userdatadir){
      userdatadir = (docker ? "/var/boozang/userdatadir" : "") + (opts.userdatadir || "");
      console.log("Setting userdatadir: " + userdatadir);
    }
    
    const launchargs = [
      '--disable-extensions-except=' + __dirname + '/bz-extension',
      '--load-extension=' + __dirname + '/bz-extension',
      '--ignore-certificate-errors',
      '--no-sandbox',
      `--window-size=${width},${height}`,
      '--defaultViewport: null'
      ];

    if(!browser||browser._closed){
      browser = await puppeteer.launch({
        headless: false,
        userDataDir: userdatadir,
        args: launchargs 
      });
    }

    function appPrintStackTrace(err){
      Service.consoleMsg(err.message,"error","app");
    }

    function idePrintStackTrace(err){
      Service.consoleMsg(err.message,"error","ide");
      Service.chkIDE()
    }

    // Setup popup
    let popup = null;
    function setupPopup() {
      popup = pages[pages.length-1]; 
      popup.setViewport({
        width: parseInt(width),
        height: parseInt(height)
      });

      popup.on("error", appPrintStackTrace);
      popup.on("pageerror", appPrintStackTrace);
      Service.setPopup(popup)
    }

    let pages = await browser.pages();
    browser.on('targetcreated', async () => {
          //console.log('New window/tab event created');
          pages = await browser.pages();
          //console.log("Pages length " + pages.length);
          setupPopup(); 
          Service.setPage(page,browser);  
    });

    const page = await browser.newPage();
    
    if ((!opts.screenshot) && (!opts.listscenarios) && typeof (url) == 'string' && !url.endsWith("/run") && url.match(/\/m[0-9]+\/t[0-9]+/)) {
      if (!url.endsWith("/")) {
          url += "/"
      }
      url += "run"
    }
    if(reset){
      //TODO: take back
      //url=url.replace(/\/run$/,"/")
    }

    let inService=0;
    console.log("Browser URL: "+url)
    if(url.match(/(\?|\&)key=.+(\&|\#)/)){
      console.log("Running in cooperation!")
      inService=1
    }else{
      console.log("Running in stand alone!")
    }

    // Assign all log listeners
    Service.logMonitor(page,testReset,keepalive,file,inService,LogLevelArray);

    if(listsuite||listscenarios){
      Service.setBeginningFun(function(){
        Service.insertFileTask(function(){
          Service.result = 0;
          Service.shutdown()
        })
        if(listsuite){
          page.evaluate((v)=>{
            $util.getTestsBySuite(v)
          }, listsuite);
        }else if(listscenarios){
          page.evaluate((v)=>{
            $util.getScenariosByTag(v)
          }, JSON.parse(listscenarios));
        }
      })
    }

    const version = await page.browser().version();
    console.log("Running Chrome version: " + version);
    const response = await page.goto(urlObj.protocol+"://"+urlObj.host+"/docker?"+urlObj.query);

    page.on("error", idePrintStackTrace);
    page.on("pageerror", idePrintStackTrace);
    
    console.log(JSON.stringify(Service.projectData))
    
    page.evaluate("preData="+JSON.stringify(Service.projectData))
    postCode(page,code)
    
  })()
}

function postCode(page,cs,_fun,i){
  i=i||0
  let x=cs[i]
  if(x){
    page.evaluate(x)

    setTimeout(()=>{
      postCode(page,cs,_fun,i+1)
    },200)
  }else{
    _fun&&_fun()
  }
  
}