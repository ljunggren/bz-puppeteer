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

console.log("Running with following args");
console.log(opts);
console.log("Example: Use --verbose for verbose logging (boolean example). Use --width=800 to override default width (value example.)");


BZSocket.start(function(){
  BrowserHandler.start(opts,BZIDEServer,logService,function(){
    BZIDEServer.start(opts,BZSocket)
  })
})

// LogService.setResetButton(function(s){
  // start(1)
// });


// console.log("Sleeping "+sleep+"s")
// setTimeout(()=>{
  // console.log("Finished sleep!")
  // start()
// },sleep*1000)