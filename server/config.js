module.exports = function (env) {
  var express = require('express');
  var nunjucks = require( "nunjucks" );
  var path = require('path');
  var i18n = require( "../lib/i18n.js" );
  console.log(i18n);
  var app = express();
  var nunjucksEnv = new nunjucks.Environment( new nunjucks.FileSystemLoader( "./public"));
  var defaultLang = 'en-US';
  var appVersion = require('../package').version;

  app.use(express.logger('dev'));
  app.use(express.compress());
  app.use(express.json());
  app.use(express.urlencoded());

  nunjucksEnv.express( app );

  var config = {
    version: appVersion
  };

  var healthcheck = {
    version: appVersion,
    http: 'okay'
  };

  // Setup locales with i18n
  // app.use( i18n.abide({
  //   supported_languages: [
  //     "en_US"
  //   ],
  //   default_lang: "en_US",
  //   translation_directory: "locale",
  //   localeOnUrl: true
  // }));

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

  app.get('/hello', function(req, res){
    res.render( "index.html", { helloworld: "Hello World"});
  });


  return app;
};
