#! /usr/bin/env node
console.log("Running...")

const puppeteer = require('puppeteer');
var fs = require('fs');

if (process.argv.length < 4) {
  console.log('Usage: node ex1 [url] [result]');
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
await page.pdf({path: reportFile + ".pdf", format: 'A4'});

//document.documentElement.getElementsByClassName('markdown-body')
 // Get the "viewport" of the page, as reported by the page.
  const dimensions = await page.evaluate(() => {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      banana: document.documentElement.getElementsByClassName('markdown-body'),
      deviceScaleFactor: window.devicePixelRatio
    };
  });

 console.log('Dimensions:', dimensions);

browser.close();

})();
