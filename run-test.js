const puppeteer = require('puppeteer');
var fs = require('fs');

if (process.argv.length < 4) {
  console.log('Usage: node test.js testurl reportfile [-d]');
  process.exit(-1);
}

var testUrl = process.argv[2];
var reportFile = process.argv[3];
console.log('Accessing url: ' + testUrl);

(async() => {

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(testUrl);
await page.screenshot({path: reportFile + ".png"});

page.on('console', (...args) => {
  for (let i =0; i < args.length; ++i) {
    
    var logString = args[i];
    console.log('Console output: ' + logString);
    
    if (logString.includes("<html>")) {
      fs.writeFile(reportFile+".html", logString, function(err) {
         if(err) {
           return console.log(err);
         }
         console.log("The report was saved.");
         }); 
     }

     if (logString.includes("All tests completed!")) { 
        console.log("Tests completed. Closing browser.");
        browser.close();
     }
  }
});

})();