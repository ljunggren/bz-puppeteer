#! /usr/bin/env node
// Device Descriptors https://github.com/GoogleChrome/puppeteer/blob/master/DeviceDescriptors.js


const puppeteer = require('puppeteer');
var options = require('node-options');
var fs = require('fs');


var opts =  { 
  "headfull": false,
  "verbose" : false,
  "reportfile": "report",
  "device" : "default",
  "height": 1200,
  "width": 800
};

// Remove the first two arguments, which are the 'node' binary and the name
// of your script.
var result = options.parse(process.argv.slice(2), opts);

if (result.errors) {
  if (opts.verbose) {
    console.log("Unknown argument(s): " + result.errors);
  }
  console.log('USAGE: [--headfull] [--verbose] [--reportfile=report] [--device=default] [--width=1200] [--height=800] [url]');
  process.exit(-1);
}

console.log('Running with options: headfull=', opts.headfull, ', verbose=', opts.verbose, ', reportfile=', opts.reportfile, ', device=', opts.device, ', width=', opts.width, ', height=', opts.height);



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
  const browser = await puppeteer.launch({
    headless: !opts.headfull
  });

  const page = await browser.newPage();
  const devices = require('puppeteer/DeviceDescriptors');

  var width = parseInt(opts.width);
  var height = parseInt(opts.height);

  if (opts.device === "default") {
    console.log('No device specified. Viewport is set to ',opts.width,'x',opts.height);
    await page.setViewport({
      width: width,
      height: height
    });
  } else if (!devices[opts.device]) {
    console.log('Device not found. Viewport is set to ',opts.width,'x',opts.height);
    await page.setViewport({
      width: width,
      height: height
    });
  } else {
    console.log('Viewport setting is set to ',opts.device);
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
