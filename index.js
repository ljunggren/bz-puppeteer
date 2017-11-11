#! /usr/bin/env node
// Device Descriptors https://github.com/GoogleChrome/puppeteer/blob/master/DeviceDescriptors.js

console.log("Running bz-run...")

const puppeteer = require('puppeteer');
var options = require('node-options');
var fs = require('fs');


var opts =  { 
  "headfull": false,
  "verbose" : false,
  "reportfile": "report",
  "device" : "default"
};

// Remove the first two arguments, which are the 'node' binary and the name
// of your script.
var result = options.parse(process.argv.slice(2), opts);

if (result.errors) {
  if (opts.verbose) {
    console.log("Unknown argument(s): " + result.errors);
  }
  console.log('USAGE: [--headfull] [--verbose] [--reportfile=report] [--device=default] [url]');
  process.exit(-1);
}

console.log('headfull=', opts.headfull);
console.log('verbose=', opts.verbose);
console.log('reportfile=', opts.reportfile);
console.log('device=', opts.device);


var testUrl = "";

if (result.args){
  if (result.args.length === 1) {
    testUrl = result.args.toString();      
    console.log('url=', testUrl)
  } else {
    console.log("Unknown argument(s): " + result.errors);
    process.exit(-2);
  }
}

var reportFile = opts.reportfile;
console.log('Opening url: ' + result.args);

(async() => {
  const devices = require('puppeteer/DeviceDescriptors');
  const browser = await puppeteer.launch({
    headless: !opts.headfull
  });

  const page = await browser.newPage();

  if (opts.device != "default"){
    await page.emulate(devices[opts.device]);
  }

  await page.goto(testUrl);
  await page.screenshot({path: reportFile + ".png"});


  page.on('console', msg => {
    var logString = msg.text;

    console.log('Console output: ' + logString);

    if (logString.includes("<html>")) {
      fs.writeFile(reportFile+".html", logString, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("The report was saved.");
      }); 
    }else if (logString.includes("All tests completed!")) { 
      console.log("Tests completed. Waiting a few seconds to close browser so report is being sent.");
      setTimeout(function(){
        console.log("Closing browser.");
        browser.close();
      },4000);
    }
  });

})();
