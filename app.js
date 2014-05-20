var habitat = require('habitat');
var express = require('express');
var nunjucks = require('nunjucks');
var path = require('path');
var i18n = require('webmaker-i18n');
var nunjucksEnv = new nunjucks.Environment( new nunjucks.FileSystemLoader(path.join(__dirname, 'views')));

habitat.load();

var app = express(),
    env = new habitat();

app.use(express.logger('dev'));
app.use(express.compress());
app.use(express.json());
app.use(express.urlencoded());

nunjucksEnv.express(app);
nunjucksEnv.addFilter('instantiate', function(input) {
  var tmpl = new nunjucks.Template(input);
  return tmpl.render(this.getVariables());
});

var healthcheck = {
  version: require('./package').version,
  http: 'okay'
};

// Setup locales with i18n
app.use( i18n.middleware({
  supported_languages: env.get("SUPPORTED_LANGS"),
  default_lang: 'en-US',
  mappings: require('webmaker-locale-mapping'),
  translation_directory: path.resolve(__dirname, 'locale')
}));

// Static files
app.use(express.static(path.resolve(__dirname, 'public')));

// Healthcheck
app.get('/healthcheck', function (req, res) {
  res.json(healthcheck);
});

app.get('/', function(req, res){
  res.render('home.html');
});

app.get('/partners', function(req, res){
  res.render('partners.html');
});

app.get('/resources', function(req, res){
  res.render('resources.html');
});

app.get('/history', function(req, res){
  res.render('history.html');
});

// Localized Strings
app.get('/strings/:lang?', i18n.stringsRoute('en-US'));

// Run server
app.listen(env.get('PORT'), function () {
  console.log('Now listening on %d', env.get('PORT'));
});
