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