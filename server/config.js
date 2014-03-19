module.exports = function (env) {
  var express = require('express');
  var path = require('path');
  var app = express();
  var defaultLang = 'en-US';

  app.use(express.logger('dev'));
  app.use(express.compress());
  app.use(express.json());
  app.use(express.urlencoded());

  var config = {
    version: require('../package').version
  };

  var healthcheck = {
    version: require('../package').version,
    http: 'okay'
  };

  // Static files
  app.use(express.static('./public'));

  // Healthcheck
  app.get('/healthcheck', function (req, res) {
    res.json(healthcheck);
  });

  // Serve up virtual configuration "file"
  app.get('/config.js', function (req, res) {
    res.setHeader('Content-type', 'text/javascript');
    res.send('window.eventsConfig = ' + JSON.stringify(config));
  });

  return app;
};
