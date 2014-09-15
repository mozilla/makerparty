var habitat = require('habitat');
var express = require('express');
var nunjucks = require('nunjucks');
var path = require('path');
var fs = require('fs');
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
  res.render('live-updates.html');
});

// Run event stats generation every 5 minutes
var eventStatsObject = {};
var eventStatsBuffer = new Buffer("{}");
var refreshEventStatsBuffer = function() {
  getEventStats({
    url: env.get('EVENTS_SERVICE'),
    start_date: env.get('EVENTS_START_DATE'),
    end_date: env.get('EVENTS_END_DATE')
  }, function(error, event_stats) {
    if (error) {
      return console.log(error);
    }

    eventStatsObject = event_stats;
    eventStatsBuffer = new Buffer(JSON.stringify(event_stats));
  });
};
setInterval(refreshEventStatsBuffer, 300000);
refreshEventStatsBuffer();

// Maker Party Event Stats
app.get( '/event-stats', function( req, res ) {
  res.type('application/json');
  res.send(eventStatsBuffer);
});

app.get('/heatmap.svg', function(req, res) {
  res.type('image/svg+xml');
  res.send( heatmap.generateHeatmap( eventStatsObject.byCountry ) );
});

app.get('/heatmap.base.svg', function(req, res) {
  res.send( heatmap.baseFile );
});

// get the latest 10 photos from Maker Party 2014 Flickr album
app.get('/flickr-photos', function(req, res) {
  var output = '';
  var options = {
    host: 'api.flickr.com',
    path: '/services/rest/?' +
          'method=flickr.photosets.getPhotos' +
          '&photoset_id=72157644395497439' +
          '&privacy_filter=1' + // public photos only
          '&per_page=10' +
          '&page=1' +
          '&format=json' +
          '&nojsoncallback=1' +
          '&api_key=' + env.get('FLICKR_API_KEY'),
    method: 'GET'
  };
  // Calling Flickr API can only be made via SSL
  https.request(options, function(response) {
    response.on('data', function (chunk) {
      output += chunk;
    });
    response.on('end',function() {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.parse(output));
    });
  }).end();
});


// Localized Strings
app.get('/strings/:lang?', i18n.stringsRoute('en-US'));

// Run server
app.listen(env.get('PORT'), function () {
  console.log('Now listening on %d', env.get('PORT'));
});
