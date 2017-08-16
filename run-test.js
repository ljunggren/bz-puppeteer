const puppeteer = require('puppeteer');
var fs = require('fs');

if (process.argv.length < 4) {
  console.log('Usage: node test.js testurl reportfile [-d]');
  process.exit(-1);
}

var testurl = process.argv[2];
var reportfile = process.argv[3];
console.log('Test url :' + testurl);

(async() => {

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(testurl);
await page.screenshot({path: reportfile + ".png"});

page.on('console', (...args) => {
  for (let i =0; i < args.length; ++i) {
    
    var logstring = args[i];
    console.log('logstring: ' + logstring);
    
    if (logstring.includes("<html>")) {
      fs.writeFile(reportfile+".html", logstring, function(err) {
         if(err) {
           return console.log(err);
         }
         console.log("The report was saved and screenshot made!");
         }); 
     }

     if (logstring.includes("All tests completed!")) { 
          browser.close();
     }
  }
});

})();
 



/**
 * Launches a debugging instance of Chrome.
 * @param {boolean=} headless True (default) launches Chrome in headless mode.
 *     False launches a full version of Chrome.
 * @return {Promise<ChromeLauncher>}
 */
// function launchChrome(headless=true) {
//   return chromeLauncher.launch({
//     // port: 9222, // Uncomment to force a specific port of your choice.
//     chromeFlags: [
//       '--disable-gpu',
//       headless ? '--headless' : ''
//     ]
//   });
// }

// (async function() {

// const chrome = await launchChrome(true);
// const protocol = await CDP({port: chrome.port});

// // Extract the DevTools protocol domains we need and enable them.
// // See API docs: https://chromedevtools.github.io/devtools-protocol/
// const {Page, Runtime} = protocol;
// await Page.enable();
// await Runtime.enable();

// Page.navigate({url: testurl});

// // Wait for window.onload before doing stuff.
// Page.loadEventFired(async () => {
//   console.log('Page loading');
// });


// var fs = require('fs');

// Runtime.consoleAPICalled(function(params) {
//     // Not working when I open Chrome devtools.
//     var logstring = params.args[0].value;
//     console.log('Runtime.consoleAPICalled', logstring);

//     if (logstring.includes("<html>")) {
//     	fs.writeFile(reportfile, logstring, function(err) {
//         if(err) {
//           return console.log(err);
//         }
//           console.log("The report was saved!");
//         }); 
//     }

//     if (logstring.includes("All tests completed!")) { 
//        protocol.close();
//        chrome.kill(); // Kill Chrome.
//     }
   
// });



// })();
