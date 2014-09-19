var habitat = require('habitat');
var express = require('express');
var nunjucks = require('nunjucks');
var path = require('path');
var https = require('https');
var heatmap = require('makerparty-heatmap');
var fork = require( 'child_process' ).fork;
var i18n = require('webmaker-i18n');
var nunjucksEnv = new nunjucks.Environment( new nunjucks.FileSystemLoader(path.join(__dirname, 'views')));
var getEventStats = require('./lib/getEventStats');

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

app.use(app.router);
// We've run out of known routes, 404
app.use(function (req, res, next) {
  res.status(404);
  res.render('error.html', {
    code: 404
  });
});

app.locals({
  languages: i18n.getSupportLanguages()
});


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

app.get('/resources/getting-started', function(req, res){
  res.render('resources-getting-started.html');
});

app.get('/resources/getting-started-resources', function(req, res){
  res.render('resources-getting-started-resources.html');
});

app.get('/resources/planning-your-event', function(req, res){
  res.render('resources-planning-your-event.html');
});

app.get('/resources', function(req, res){
  res.render('resources.html');
});

app.get('/resources/running-your-event', function(req, res){
  res.render('resources-running-your-event.html');
});

app.get('/resources/post-event', function(req, res){
  res.render('resources-post-event.html');
});

app.get('/history', function(req, res){
  res.render('history.html');
});

app.get('/live-updates', function(req, res){
  res.redirect("/");
});

// Run event stats generation every 1 hour
var stats_cache = require("./stats_cache/makerparty2014-2014-09-16");
var eventStatsBuffer = new Buffer(JSON.stringify(stats_cache));
var heatmapBuffer = new Buffer(heatmap.generateHeatmap(stats_cache.byCountry));
var refreshEventStatsBuffer = function() {
  getEventStats({
    url: env.get('EVENTS_SERVICE'),
    start_date: env.get('EVENTS_START_DATE'),
    end_date: env.get('EVENTS_END_DATE')
  }, function(error, event_stats) {
    if (error) {
      return console.log(error);
    }

    eventStatsBuffer = new Buffer(JSON.stringify(event_stats));
    heatmapBuffer = new Buffer(heatmap.generateHeatmap(event_stats.byCountry));
  });
};
setInterval(refreshEventStatsBuffer, 3600000);
refreshEventStatsBuffer();

// Maker Party Event Stats
app.get( '/event-stats', function( req, res ) {
  res.type('application/json; charset=utf-8');
  res.send(eventStatsBuffer);
});

app.get('/heatmap.svg', function(req, res) {
  res.type('image/svg+xml; charset=utf-8');
  res.send(heatmapBuffer);
});

app.get('/heatmap.base.svg', function(req, res) {
  res.send( heatmap.baseFile );
});

// Localized Strings
app.get('/strings/:lang?', i18n.stringsRoute('en-US'));

// Run server
app.listen(env.get('PORT'), function () {
  console.log('Now listening on %d', env.get('PORT'));
});
