#! /usr/bin/env node
// Device Descriptors https://github.com/GoogleChrome/puppeteer/blob/master/DeviceDescriptors.js


const puppeteer = require('puppeteer');
const options = require('node-options');
const fs = require('fs');


const opts = {
  "headfull": false,
  "verbose" : false,
  "file": "",
  "listscenarios":"",
  "device" : "",
  "screenshot": false,
  "token":"",
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
const width = opts.width;
const height = opts.height;
const gtimeout=opts.gtimeout;
const listscenarios=opts.listscenarios;
const notimeout=opts.notimeout;

if (result.errors) {
    if (opts.verbose) console.log('Unknown argument(s): "' + result.errors.join('", "') + '"');
    process.exit(2);
}

if (result.errors || !result.args || result.args.length !== 1) {
console.log('USAGE: boozang [--token] [--headfull] [--docker] [--gtimeout] [--notimeout] [--verbose] [--listscenarios] [--width] [--height] [--screenshot] [--file=report] [--device=default] [url]');
  process.exit(2);
}

const isURL = (str) => {
    const pattern = /^http(s|):\/\/.+$/i;
    return pattern.test(str)
}


let url = result.args[0]

if ((!opts.screenshot) && (!opts.listscenarios) && typeof (url) == 'string' && !url.endsWith("/run")) {
    if (!url.endsWith("/")) {
        url += "/"
    }
    url += "run"
}

if (!url || !isURL(url)) {
    console.error("Invalid URL: " + url)
    process.exit(2)
}
console.log("Running Boozang test runner...");

if (!opts.headfull)
  console.log('Running headless mode.');
if (opts.verbose)
  console.log("Verbose logging on");
if (opts.file)
  console.log("Using custom report file: " + opts.file);
if (opts.device)
  console.log("Using custom device: " + opts.device);
if (opts.notimeout)
  console.log("Surpressing timeouts");

const file = (docker ? "/var/boozang/" : "") + (opts.file || "results");
//const file = (opts.file || "results");

const RED = '\033[0;31m'
const GREEN = '\033[0;32m'
const BLANK = '\033[0m'

const parseReport = (json) => {
    report = ''
    report += json.details.map(detail =>
        (detail.test ?
            `\n\t${(detail.result == 4 || detail.result == 3)? GREEN + "✓" : RED + "✘"} ` +
            `[${detail.module.code}] ${detail.module.name} - [${detail.test.code}] ${detail.test.name} ` +
            `(${detail.test.actions} actions, ${detail.time}ms)` + BLANK
            :
            `\n\t\t${(detail.result == 4 || detail.result == 3)? GREEN + "✓" : RED + "✘"} ` +
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
      '--ignore-certificate-errors',
      '--no-sandbox',
      '--defaultViewport: null'
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
    headless: false,
    args: launchargs 
  });



  let pages = await browser.pages();
  browser.on('targetcreated', async () => {
        console.log('New window/tab event created');
        pages = await browser.pages();
        let popup = pages[pages.length-1]; 
        console.log("Setting viewport to: " + width + "x" + height);
        popup.setViewport({
          width: width,
          height: height
        });
        // console.log('global.pages.length', global.pages.length);
  });


function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


let globaltimer=0
function assignGlobalTimeout(msg, milliseconds){
  if (notimeout)
    return;
  clearTimeout(globaltimer)
  globaltimer=setTimeout(function(){
    console.error(msg)
    console.error("Timeout was set to: " + milliseconds)
    process.exit(2)
  },milliseconds)
}
  if (gtimeout){
    console.log("Assigning global timeout to " + gtimeout + " minutes");
    assignGlobalTimeout("Test execution taking too long. Global timeout kicked in.", gtimeout*1000*60);
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
  if (!opts.device) {
   
    //console.log('No device specified.');
  } else if (!devices[opts.device]) {
    console.log('Device ' + opts.device + ' not found. Ignoring');
  } else {
    console.log(opts.device, 'found. Viewport is set to ',devices[opts.device].viewport.width,'x',devices[opts.device].viewport.height);
    await page.emulate(devices[opts.device]);
  }

  console.log("Opening URL: " + testUrl);

  let timer=0
  function assignTimeout(msg, milliseconds){
    if (notimeout)
      return;
    clearTimeout(timer)
    timer=setTimeout(function(){
      let popup = pages[pages.length-1]; 
      let screenshotFile = (docker ? "/var/boozang/" : "") + Math.random().toString(36).substring(7) + ".png";
      console.error("Generating timeout screenshot: " + screenshotFile);
      popup.screenshot({path: screenshotFile});
      console.error(msg);
      console.error("Timeout was set to: " + milliseconds);
      // Wait 5 seconds for screenshot to finish before exiting
      setTimeout(function(){
        process.exit(2)
      },5000)   
      
    },milliseconds)
  }

  assignTimeout("Error: Timeout kicked in before loading the test. Verify access token and test URL.", 900000);

  try { 
    const response = await page.goto(testUrl);
    console.log("Status code: " + response.status());
    if (response.status() < 400){
      console.error("Good http response code.");
    } else {
      console.error("Bad http response code: Existing.");
      process.exit(2)
    }
  } catch (err) {
    console.error("Failed to open URL with error: " + err.message);
    process.exit(2)
  }

  await page.evaluate(() => {
    localStorage.setItem('ci', 'example-token');
  });

  if (opts.screenshot){
    console.log("Wait a second for screenshot.");
    await timeout(1000); 
    let screenshotFile = (docker ? "/var/boozang/" : "") + file + ".png";
    console.log("Making screenshot: " + screenshotFile); 
    page.screenshot({path: screenshotFile});
    
    await timeout(5000);                     
    console.log("Closing browser.");
    browser.close(); 
    process.exit(0);
  }

  let logIndex = 0;
  let popup = pages[pages.length-1]; 


  page.on('console', msg => {
    
    // Set logString
    let logString = (!!msg && msg.text()) || "def";
    
    // Handle verbose logging
    if (verbose) {
      console.log("DEBUG: " + logString);
    }

    // Set exit status
    if (logString.includes("Failed !")) {
          success = false
    } else if (logString.includes("Success !")) {
          success = true
    }
            
    // Report progress
    if (logString.includes("BZ-LOG")) {
      
      // Handle list tests
      if (logString.includes("list-scenarios")){
        let scenarios=logString.split("list-scenarios:")[1];
        let formattedScenarios = scenarios.split(",").join("\n")
        console.log("Found matching scenarios: " + scenarios);
        fs.writeFile(`${file}.list`, formattedScenarios, (err) => {
          if (err) {
            console.error("Error: ", err)
            process.exit(2)
          }
        console.log(`File list: "${file}.list" saved.`)
        })
      }

      // Re-assign app window reference
      let popup = pages[pages.length-1]; 

      // Handle set timeouts and action log
      if (logString.includes("action")){
        let timeout = parseInt(logString.split("ms:")[1]);
        assignTimeout("Error: Action taking too long. Timing out.", timeout+150000); 
        console.log(logString.replace("BZ-LOG: ","").replace("&check;","✓")); 
      } 
      // Handle screenshots
      else if (logString.includes("screenshot")){
        let screenshotFile = (docker ? "/var/boozang/" : "") + logString.split("screenshot:")[1]+".png";
        console.log("Making screenshot: " + screenshotFile); 
        popup.screenshot({path: screenshotFile});
      } 
      // Handle built-in scheduler timeouts
      else if (logString.includes("next schedule at")){
        let nextSchedule = Date.parse(logString.split("next schedule at: ")[1]);
        let timeout = nextSchedule - Date.now() + 30000;
        console.log(logString.replace("BZ-LOG: ","")); 
        assignTimeout("Next scheduled test not starting in time", timeout);
      } 
      // Handle execute Javascript for hanging app window
      else if (logString.includes("app-run")){
        let command = logString.split("app-run:")[1];
        console.log("Running app command: " + command); 
        popup.evaluate(()=>{ command;  });
      } 
     // Handle execute Javascript for hanging ide window
      else if (logString.includes("ide-run")){
        let command = logString.split("ide-run:")[1];
        console.log("Running ide command: " + command); 
        page.evaluate(()=>{ command;  });
      }
      // Log rest of log events
      else 
      {
        console.log(logString.replace("BZ-LOG: ",""));  
      } 
    }
    // Write the html reports
    else if (logString.includes("<html>")) {
      fs.writeFile(`${file}${logIndex++}.html`, logString, (err) => {
        if (err) {
          console.error("Error: ", err)
          process.exit(2)
        }
        console.log(`Report "${file}${logIndex}.html" saved.`)
      })
    } 
    // Write the json report
    else if (logString.includes('"result": {')) {
       assignTimeout("Report generation taking too long", 30000);
       fs.writeFile(`${file}.json`, logString, (err) => {
        if (err) {
          console.error("Error: ", err)
          process.exit(2)
        }
        console.log(`Report "${file}.json" saved.`)
      })
      const json = JSON.parse(logString);
      if (json[0] && json[0].keyword === "Feature"){
        //Cucumber report - do nothing
        console.log("Writing Cucumber report");
      } else {
        success = (json.result.type == 1);
        console.log(parseReport(json));
      } 
    } 
    // Set exit status
    else if (logString.includes("All tests completed!")) {
      if (success) {
        console.log(GREEN + "Tests success" + BLANK)
      } else {
        console.error(RED + "Tests failure" + BLANK)
      }
      process.exit(Number(!success))
    } 

    }) //end console
    
    popup.on("error", function(err) {  
      theTempValue = err.toString();
      console.log("App Error: " + theTempValue); 
    })
  
    popup.on("pageerror", function(err) {  
      theTempValue = err.toString();
      console.log("App page error: " + theTempValue); 
    })
  
    page.on("error", function(err) {  
      theTempValue = err.toString();
      console.log("Error: " + theTempValue); 
    })
  
    page.on("pageerror", function(err) {  
      theTempValue = err.toString();
      console.log("Page error: " + theTempValue); 
    })  


  if (listscenarios){
    await timeout(2000);  
    console.log("Listing scenarios: "+listscenarios)
    let tags=JSON.parse(listscenarios);
    let or=["tag1,tag2"];
    let and=["tag1","tag2"];
    console.log("test " + tags);
    await page.evaluate((tags)=>{ console.log("BZ-LOG: list-scenarios:"+$util.getScenariosByTag(tags).map(m=>{return m.path})) }, tags);
    await timeout(2000); 
    process.exit(0);
  }


  } // end if(url)
})().catch((e) => {
  console.log('an expection on page.evaluate ', e);
  console.error(e);
  process.exit(2)
})
