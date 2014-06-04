var habitat = require('habitat');
var express = require('express');
var nunjucks = require('nunjucks');
var path = require('path');
var i18n = require('webmaker-i18n');
var request = require('request');
var event_stats_cache = {};
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

function debug() {
  if( env.get( 'DEBUG' ) ) {
    return console.log.apply( null, arguments );
  }

  return;
}

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

// Maker Party Event Stats
app.get( '/event-stats', function( req, res ) {
  res.json( event_stats_cache );
});

function generateEventStats() {
  debug('Stats: (re)generating event statistics');
  request.get( env.get( 'EVENTS_SERVICE' ) + '/events?after=' + env.get( 'EVENTS_START_DATE' ), function( error, response, events ) {
    if( !error && response.statusCode === 200 ) {
      events = JSON.parse( events );
      // arrays to dedupe things w/
      var event_hosts = [];
      var countries = [];

      // init stats object
      var event_stats = {
        hosts: 0,
        attendees: 0,
        events: 0,
        byCountry: {}
      };

      // aleady know number of events :)
      event_stats.events = events.length;

      // make access to other stats easier to figure
      events.forEach( function( event, idx ) {
        var new_host = 0; // little trick to count hosts per country

        /*
          get people stats
         */

        // get attendee stats
        event_stats.attendees += event.attendees;

        // get host stats
        if(event_hosts.indexOf( event.organizerId ) === -1){
          event_hosts.push( event.organizerId );

          new_host = 1; // this is a new host, add to country host count ;)
        }

        /*
          get country level stats
         */
        if( event.country === null ) {
          event.country = 'UNKNOWN';
        }

        if( countries.indexOf( event.country ) === -1 ) {
          event_stats.byCountry[ event.country ] = {
            name: event.country,
            events: 0,
            hosts: 0,
            attendees: 0
          };
          countries.push( event.country );
        }

        var country = event_stats.byCountry[ event.country ];

        country = {
          name: country.name,
          events: country.events + 1,
          hosts: country.hosts + new_host,
          attendees: country.attendees + event.attendees
        };

        event_stats.byCountry[ event.country ] = country;
      });

      // now we can count number organizers  (deduped)
      event_stats.hosts = event_hosts.length;

      // sort the country based data using keys
      var country_keys = Object.keys(event_stats.byCountry);
      var new_byCountry = {};

      country_keys.sort();

      for ( var i = 0; i < country_keys.length; i++ ) {
        var key = country_keys[ i ];
        new_byCountry[ country_keys[ i ] ] = event_stats.byCountry[ key ];
      }

      event_stats.byCountry = new_byCountry;

      event_stats_cache = event_stats;
    }
    else if( error ) {
      return console.error( 'ERROR: %s', error );
    }
  });
}
generateEventStats();
setInterval(generateEventStats, 10000)
