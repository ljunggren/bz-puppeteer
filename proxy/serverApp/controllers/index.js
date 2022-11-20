// Invoke 'strict' JavaScript mode
'use strict';
// Create a new 'render' controller method
exports.render = function(_req, _res) {
  _res.render('index', {});
};