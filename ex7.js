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

const browser = await puppeteer.launch({headless: false, slowMo: 500, devtools: true});
const page = await browser.newPage();

const devices = require('puppeteer/DeviceDescriptors');

await page.emulate(devices['iPhone 6']);

await page.goto(testUrl);
await page.screenshot({path: reportFile + ".png"});

browser.close();

})();
