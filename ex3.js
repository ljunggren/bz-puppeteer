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
await page.setViewport({
	width: 200, // 320, 768, 1024, 1280
	height: 600
});
await page.screenshot({path: reportFile + ".png"});
browser.close();

})();
