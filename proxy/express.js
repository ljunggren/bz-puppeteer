// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var  http = require('http'),
  express = require('express'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  flash = require('connect-flash');
global.ioHttp=null;
// Create a new error handling controller method

// Define the Express configuration method
module.exports = function(port) {
  // Create a new Express application instance
  var app = express();

  app.use(bodyParser.json({limit:'25mb', extended: true}))
  app.use(bodyParser.urlencoded({limit:'25mb', extended: true, parameterLimit: 1000000}))

  app.use(methodOverride());

  // Set the application view engine and 'views' folder
  app.set('views', './proxy/serverApp/views');
  app.set('view engine', 'ejs');

  // Configure the flash messages middleware
  app.use(flash());


  //Access-Control-Allow, this is a key part for the access issue.
  app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods","GET");
    next();
  });

  // Load the routing files
  require('./serverApp/routes/apiRoutes.js')(app);
  // require('./serverApp/routes/oracleRoutes.js')(app);
  require('./serverApp/routes/indexRoutes.js')(app);
  app.use(express.static('./public'));

  initHttp(app,port)
};

function initHttp(app,port){
  var httpServer = http.createServer(app);
  httpServer.listen(port)
}