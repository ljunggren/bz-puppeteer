// Invoke 'strict' JavaScript mode
'use strict';

var api = require('../controllers/api').api;
module.exports = function(app) {
  app.all(['/api','/api/'+'*'], api.route);
};

