module.exports = function (env) {
  var express = require('express');
  var nunjucks = require( "nunjucks" );
  var path = require('path');
  var i18n = require( "webmaker-i18n" );
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
  nunjucksEnv.addFilter( "instantiate", function( input ) {
    var tmpl = new nunjucks.Template( input );
    return tmpl.render( this.getVariables() );
  });

  var config = {
    version: appVersion
  };

  var healthcheck = {
    version: appVersion,
    http: 'okay'
  };

  // Setup locales with i18n
  app.use( i18n.middleware({
    supported_languages: [ "*" ], // TO FIX: config.SUPPORTED_LANGS ???
    default_lang: "en-US",
    mappings: require("webmaker-locale-mapping"),
    translation_directory: path.resolve( __dirname, "../locale" )
  }));

  // Localized Strings
  app.get("/strings/:lang?", i18n.stringsRoute("en-US"));

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

  app.get('/', function(req, res){
    res.render("views/home.html");
  });

  app.get('/partners', function(req, res){
    res.render("views/partners.html");
  });

  app.get('/resources', function(req, res){
    res.render("views/resources.html");
  });

  app.get('/history', function(req, res){
    res.render("views/history.html");
  });

  return app;
};
