// Invoke 'strict' JavaScript mode
'use strict';

var api = require('../controllers/oracle').api;
module.exports = function(app) {
  app.all(['/oracle','/oracle/'+'*'], api.route);
};

