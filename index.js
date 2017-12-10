#! /usr/bin/env node
// Device Descriptors https://github.com/GoogleChrome/puppeteer/blob/master/DeviceDescriptors.js


const puppeteer = require('puppeteer');
const options = require('node-options');
const fs = require('fs');


const opts = {
  "headfull": false,
  "verbose" : false,
  "file": "result",
  "device" : "default",
  "screenshot": false,
  "token":""
};

// Remove the first two arguments, which are the 'node' binary and the name
// of your script.
const result = options.parse(process.argv.slice(2), opts);
const verbose = opts.verbose;
const token = opts.token;

if (result.errors) {
  console.log('USAGE: boozang [--token] [--headfull] [--verbose] [--screenshot] [--file=report] [--device=default] [url]');
  process.exit(-1);
}

if (!result.args || result.args.length != 1 ){
  console.log('USAGE: boozang [--token] [--headfull] [--verbose] [--screenshot] [--file=report] [--device=default] [url]');
  process.exit(-2);
}

const url = result.args.toString(); 

console.log('Opening URL: '+ url);
console.log('Running with options: headfull=', opts.headfull, ', verbose=', opts.verbose, ', reportfile=', opts.reportfile, ', device=', opts.device);
const file = opts.file;


(async() => {

  // Load extension if URL contains the word extension
  const launchargs = getLaunchargs(url);

  function getLaunchargs(url){
     if (url.includes('extension')) {
      return [
      '--disable-extensions-except=' + __dirname + '/bz-extension',
      '--load-extension=' + __dirname + '/bz-extension',
        ];
     } else {
      return [];
     }
  }

  if (launchargs.length > 0 && !opts.headfull) {
    console.log("Url needs extension to run. Forcing headless mode to false.");
  }

  const headlessMode = ! (opts.headfull || launchargs.length > 0)
  
  const browser = await puppeteer.launch({
    headless: headlessMode,
    args: launchargs 
  });


  let testUrl = url;

  // Insert token if found in parameter. Append run if not screenshot
  if (token) {  
    const position = url.indexOf('?')+1;
    testUrl = [url.slice(0, position), "token=" + token + "&", url.slice(position)].join('');
    
  } 

  // Append run if not screenshot and non-existing
  if (!opts.screenshot && !testUrl.endsWith("run")) {
    testUrl += "run";
  }

  const page = await browser.newPage();
  const devices = require('puppeteer/DeviceDescriptors');

 
  if (opts.device === "default") {
    console.log('No device specified.');
  } else if (!devices[opts.device]) {
    console.log('Device ' + opts.device + ' not found. Ignoring');
  } else {
    console.log(opts.device, 'found. Viewport is set to ',devices[opts.device].viewport.width,'x',devices[opts.device].viewport.height);
    await page.emulate(devices[opts.device]);
  }

  console.log("Opening URL: " + testUrl);

  await page.goto(testUrl);

  if (opts.screenshot){
    console.log("Wait a second for screenshot.");
    await timeout(1000);
    await page.screenshot({path: file + ".png"});
    console.log("Closing browser.");
    browser.close(); 
  }

  page.on('console', msg => {
    const logString = msg.text;

    if (verbose) console.log('Console output: ' + logString);

    if (logString.includes("<html>")) {
      fs.writeFile(file+".html", logString, function(err) {
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
      },6000);
    }
  });

  //browser.close();

})();


function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isURL(str) {
  const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return pattern.test(str);
}
