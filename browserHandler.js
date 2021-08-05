'use strict';
const puppeteer = require('puppeteer');
const BrowserHandler={
  browser,
  start(opts,logService){
    BrowserHandler.logService=logService
    (async () => {
      
      let file = (opts.docker ? "/var/boozang/" : "");
      if (opts.file){
        file += opts.file;
      }

      let userdatadir = "";
      if (opts.userdatadir){
        userdatadir = (opts.docker ? "/var/boozang/userdatadir" : "") + (opts.userdatadir || "");
        console.log("Setting userdatadir: " + userdatadir);
      }
      
      const launchargs = [
        '--disable-extensions-except=' + __dirname + '/bz-extension',
        '--load-extension=' + __dirname + '/bz-extension',
        '--ignore-certificate-errors',
        '--no-sandbox',
        `--window-size=${opts.width},${opts.height}`,
        '--defaultViewport: null'
      ];

      if(!BrowserHandler.browser||BrowserHandler.browser._closed){
        BrowserHandler.browser = await puppeteer.launch({
          headless: false,
          userDataDir: userdatadir,
          args: launchargs 
        });
      }

      // Setup popup
      let popup = null;
      function setupPopup() {
        popup = pages[pages.length-1]; 
        popup.setViewport({
          width: parseInt(width),
          height: parseInt(height)
        });

        popup.on("error", BrowserHandler.appPrintStackTrace);
        popup.on("pageerror", BrowserHandler.appPrintStackTrace);
        logService.setPopup(popup)
      }

      let pages = await BrowserHandler.browser.pages();
      BrowserHandler.browser.on('targetcreated', async () => {
            //console.log('New window/tab event created');
            pages = await BrowserHandler.browser.pages();
            //console.log("Pages length " + pages.length);
            setupPopup(); 
            logService.setPage(BrowserHandler.curPage,BrowserHandler.browser);  
      });

      BrowserHandler.curPage = await BrowserHandler.browser.newPage();
      await BrowserHandler.curPage.setDefaultNavigationTimeout(0);

      BrowserHandler.curPage.on("error", BrowserHandler.idePrintStackTrace);
      BrowserHandler.curPage.on("pageerror", BrowserHandler.idePrintStackTrace);

      // Assign all log listeners
      logService.logOpts(opts,file);

      const version = await BrowserHandler.curPage.browser().version();
      console.log("Running Chrome version: " + version);
    })()
  },
  appPrintStackTrace(err){
    BrowserHandler.logService.consoleMsg(err.message,"error","app");
  },
  idePrintStackTrace(err){
    BrowserHandler.logService.consoleMsg(err.message,"error","ide");
    BrowserHandler.logService.chkIDE()
  }
}
exports.BrowserHandler=BrowserHandler