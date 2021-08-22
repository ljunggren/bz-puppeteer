'use strict';
const puppeteer = require('puppeteer');
const BrowserHandler={
  browser:0,
  start(opts,ideServer,logService,fun){
    BrowserHandler.logService=logService;
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
          width: parseInt(opts.width),
          height: parseInt(opts.height)
        });

        popup.on("error", BrowserHandler.appPrintStackTrace);
        popup.on("pageerror", BrowserHandler.appPrintStackTrace);
        logService.setPopup(popup)
      }

      let pages = await BrowserHandler.browser.pages();
      BrowserHandler.browser.on('targetcreated', async () => {
        //console.log('New window/tab event created');
        pages = await BrowserHandler.browser.pages();

        setupPopup();

        ideServer.setPage(BrowserHandler.curPage,BrowserHandler.browser);
        logService.setPage(BrowserHandler.curPage,BrowserHandler.browser);
            
      });
      
      // Assign all log listeners
      logService.logOpts(opts,file);

      await BrowserHandler.lanuchPage(0,fun)
    })()
  },
  async lanuchPage(url,fun){
    BrowserHandler.curPage = await BrowserHandler.browser.newPage();

    await BrowserHandler.curPage.setDefaultNavigationTimeout(0);
    
    const version = await BrowserHandler.curPage.browser().version();

    console.log("Running Chrome version: " + version);
    
    BrowserHandler.curPage.on("error", BrowserHandler.idePrintStackTrace);
    BrowserHandler.curPage.on("pageerror", BrowserHandler.idePrintStackTrace);
    
    if(url){
      await BrowserHandler.curPage.goto(url);
    }
    fun&&fun()
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