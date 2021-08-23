#! /usr/bin/env node
// Device Descriptors https://github.com/GoogleChrome/puppeteer/blob/master/DeviceDescriptors.js


const options = require('node-options');
const LogService = require('./logService').LogService;
const BZSocket = require('./bzSocket').BZSocket;
const BZIDEServer = require('./bzIdeServer').BZIDEServer;
const BrowserHandler = require('./browserHandler').BrowserHandler;

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
  "sleep":0,
  "keepalive": false,
  "testreset":false,
  "loglevel": "debug",
  "debugIDE":false
}

// Remove the first two arguments, which are the 'node' binary and the name
// of your script.
const result = options.parse(process.argv.slice(2), opts);


if (result.errors || !result.args || result.args.length !== 1) {
  console.log('USAGE: boozang [--token] [--docker] [--keepalive] [--testreset] [--verbose] [--userdatadir] [--listscenarios] [--listsuite] [--width] [--height] [--screenshot] [--file=report] [url]');
  process.exit(2);
}

opts.url=result.args[0]
opts.urlObj=parseUrl(opts.url)
console.log(result)

console.log("Running with following args");
console.log(opts);
console.log("Example: Use --verbose for verbose logging (boolean example). Use --width=800 to override default width (value example.)");

opts.ideServer=BZIDEServer;
opts.logService=LogService;
opts.socketServer=BZSocket;
BZSocket.start(opts,function(){
  BrowserHandler.start(opts,function(){
    BZIDEServer.start(opts)
  })
})

function parseUrl(url){
  let s=url.split("/");
  let o={
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
  
  
  if(o.key){
    console.log("Running in cooperation!")
  }else{
    console.log("Running in stand alone!")
  }

  return o
}