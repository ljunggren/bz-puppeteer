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
  "token":"",
}

// Remove the first two arguments, which are the 'node' binary and the name
// of your script.
const result = options.parse(process.argv.slice(2), opts);
const verbose = opts.verbose;
const token = opts.token;

if (result.errors) {
    if (opts.verbose) console.log('Unknown argument(s): "' + result.errors.join('", "') + '"');
    process.exit(2);
}

if (result.errors || !result.args || result.args.length !== 1) {
  console.log('USAGE: boozang [--token] [--headfull] [--verbose] [--screenshot] [--file=report] [--device=default] [url]');
  process.exit(2);
}

const isURL = (str) => {
    const pattern = /^http(s|):\/\/.+$/i;
  /*
    const pattern = new RegExp('^(https?:\\/\\/)' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[.-a-z\\d_/]*)/run$', 'i') // mandatory fragment locator (. and / are allowed even if they are normally invalid)
  */
    return pattern.test(str)
}


let url = result.args[0]

if ((!opts.screenshot) && typeof (url) == 'string' && !url.endsWith("/run")) {
    if (!url.endsWith("/")) {
        url += "/"
    }
    url += "run"
}

if (!url || !isURL(url)) {
    console.error("Invalid URL: " + url)
    process.exit(2)
}

console.log('Opening URL: '+ url);
console.log('Running with options: headfull=', opts.headfull, ', verbose=', opts.verbose, ', reportfile=', opts.file, ', device=', opts.device);
const file = "/var/boozang/" + (opts.file || "results");

const RED = '\033[0;31m'
const GREEN = '\033[0;32m'
const BLANK = '\033[0m'

const parseReport = (json) => {
    report = ''
    report += json.details.map(detail =>
        (detail.test ?
            `\n\t${detail.result == 4 ? GREEN + "✓" : RED + "✘"} ` +
            `[${detail.module.code}] ${detail.module.name} - [${detail.test.code}] ${detail.test.name} ` +
            `(${detail.test.actions} actions, ${detail.time}ms)` + BLANK
            :
            `\n\t\t${detail.result == 4 ? GREEN + "✓" : RED + "✘"} ` +
            `${detail.description} (${detail.time}ms)` + BLANK
        )).join('')
    report += `\n\n\tStatus: ${json.result.type == 1 ? GREEN + "success" + BLANK : RED + "failure" + BLANK}`
    report += `    Passing tests: ${json.result.summary.test - json.result.summary.failedTest}/${json.result.summary.test}`
    report += `    Passing actions: ${json.result.summary.action - json.result.summary.failedAction}/${json.result.summary.action}\n`

    return report
}

(async () => {
  if (url) {
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


function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


  let testUrl = url;

  // Insert token if found in parameter.
  if (token) {  
    const position = url.indexOf('#');
    testUrl = [url.slice(0, position), "&token=" + token, url.slice(position)].join('');
    
  } 

  const page = await browser.newPage();
  const devices = require('puppeteer/DeviceDescriptors');

  await page._client.send('Emulation.clearDeviceMetricsOverride');
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
    let logString = msg.text();

    if (verbose) {
      console.log("DEBUG: " + logString);
    }

    if (logString.includes("Failed !")) {
          success = false
    } else if (logString.includes("Success !")) {
          success = true
    }
            
    // Report progress
    if (logString.includes("BZ-LOG")) {
      console.log(logString.replace("BZ-LOG:",""));
    }
    else if (logString.includes("<html>")) {
      fs.writeFile(`${file}.html`, logString, (err) => {
        if (err) {
          console.error("Error: ", err)
          process.exit(2)
        }
        console.log(`Report "${file}.html" saved.`)
      })
    } else if (logString.includes('"result": {')) {
      fs.writeFile(`${file}.json`, logString, (err) => {
        if (err) {
          console.error("Error: ", err)
          process.exit(2)
        }
        console.log(`Report "${file}.json" saved.`)
      })
      const json = JSON.parse(logString)
      success = (json.result.type == 1)
      console.log(parseReport(json))
    } else if (logString.includes("All tests completed!")) {
      if (success) {
        console.log(GREEN + "Tests success" + BLANK)
      } else {
        console.error(RED + "Tests failure" + BLANK)
      }
      process.exit(Number(!success))
    } 

    }) //end console
  } // end if(url)
})().catch((e) => {
  console.error(e);
  process.exit(2)
})
