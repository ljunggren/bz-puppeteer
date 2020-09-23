#! /usr/bin/env node
// Device Descriptors https://github.com/GoogleChrome/puppeteer/blob/master/DeviceDescriptors.js


const puppeteer = require('puppeteer');
const options = require('node-options');
const Service = require('./logService').Service;
const fs = require('fs');

// Command defaults
const opts = {
  "headfull": false,
  "verbose" : false,
  "file": "result",
  "listscenarios":"",
  "listsuite":"",
  "device" : "",
  "screenshot": false,
  "token":"",
  "userdatadir":"",
  "width":1280,
  "height":1024,
  "docker": false,
  "gtimeout": 120,
  "notimeout": false
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
const gtimeout=opts.gtimeout;
const listscenarios=opts.listscenarios;
const listsuite=opts.listsuite;
const notimeout=opts.notimeout;

if (result.errors || !result.args || result.args.length !== 1) {
  console.log('USAGE: boozang [--token] [--headfull] [--docker] [--gtimeout] [--notimeout] [--verbose] [--userdatadir] [--listscenarios] [--listsuite] [--width] [--height] [--screenshot] [--file=report] [--device=default] [url]');
  process.exit(2);
}

console.log("Running with " + opts.toString());

(async () => {

  let userdatadir = "";
  if (opts.userdatadir){
    userdatadir = (docker ? "/var/boozang/" : "") + (opts.userdatadir || "");
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

  const browser = await puppeteer.launch({
    headless: false,
    userdatadir: userdatadir,
    args: launchargs 
  });

  function printStackTrace(app,err){
    console.error(
      "\n#######################################\n"
    + app + " error: " + err.message
    + "\n#######################################\n"
    );   
  }

  function appPrintStackTrace(err){
    printStackTrace("app",err);
  }

  function idePrintStackTrace(err){
    printStackTrace("ide",err);
  }


  // Setup popup
  let popup = null;
  function setupPopup() {
        popup = pages[pages.length-1]; 
        popup.setViewport({
          width: parseInt(width,10),
          height: parseInt(height,10)
        });

        popup.on("error", appPrintStackTrace);
        popup.on("pageerror", appPrintStackTrace);
        
  }

  let pages = await browser.pages();
  browser.on('targetcreated', async () => {
        //console.log('New window/tab event created');
        pages = await browser.pages();
        //console.log("Pages length " + pages.length);
        setupPopup();   
  });

  const page = await browser.newPage();

  // Assign all log listeners
  Service.logMonitor(page,notimeout,gtimeout)
  
  let url = result.args[0]
  const response = await page.goto(url);

  page.on("error", idePrintStackTrace(err));
  page.on("pageerror", idePrintStackTrace(err));

})()
// end async


Service.addTask({
  key:"ms:",
  fun(msg){
    return (parseInt(msg.split(this.key)[1].trim())||0)+15000
  },
  msg:"Action timeout"
})

Service.addTask({
  key:"app-run:",
  fun(msg){
    popup.evaluate(()=>{ msg;  });
  }
})

Service.addTask({
  key:"ide-run:",
  fun(msg){
    page.evaluate(()=>{ msg;  });
  }
})

Service.addTask({
  key:"screenshot:",
  fun(msg){
    let screenshotFile = msg.split("screenshot:")[1]+".png";
    popup.screenshot({path: screenshotFile});
  }
})

Service.addTask({
  key:"BZ-File output:",
  fun(msg){
    msg=msg.substring(this.key.length).trim()
    console.log("Parse file: ...............")
    console.log(msg)
    if(!this.name){
      this.name=msg
    }else if(msg=="end"){
      let name=this.name
      fs.writeFile(name, this.content, (err)=>{
        if (err) {
          Service.shutdown("Error: on output file: "+name+", "+ err.message)
        }
        console.log("Report "+name+" saved.")
      })
      this.name=0
    }else{
      this.content=msg
    }
  },
  timeout:60000,
  noLog:1
})