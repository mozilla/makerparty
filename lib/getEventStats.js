'use strict';

var async = require('async');
var country_data = require('country-data');
var request = require('request');

module.exports = function(options, callback) {
  options = options || {};

  if (!options.url) {
    return process.nextTick(function() {
      callback(new Error("Required parameter 'url' missing"));
    });
  }

  if (!options.start_date) {
    return process.nextTick(function() {
      callback(new Error("Required parameter 'start_date' missing"));
    });
  }

  if (!options.end_date) {
    return process.nextTick(function() {
      callback(new Error("Required parameter 'end_date' missing"));
    });
  }

  var events = [];
  var event_index = 0;
  var MAX_EVENTS = 100;
  var total_events = 0;

  async.doUntil(
    function(done) {
      var req_opts = {
        gzip: true,
        headers: {
          'Range': event_index + '-' + (event_index + MAX_EVENTS - 1),
          'Range-Unit': 'items'
        },
        json: true,
        method: 'GET',
        uri: options.url + '/events?after=' + encodeURIComponent(options.start_date) + '&before=' + encodeURIComponent(options.end_date)
      };

      request(req_opts, function(events_fetch_error, response, body) {
        if (events_fetch_error) {
          return done(events_fetch_error);
        }

        if (response.statusCode !== 200) {
          return callback(new Error("GET /events returned HTTP " + response.statusCode));
        }

        event_index = parseInt(response.headers['content-range'].split('/')[0].split('-')[1], 10) + 1;
        total_events = parseInt(response.headers['content-range'].split('/')[1], 10);
        events = events.concat(body);

        done();
      });
    },
    function() {
      return event_index > total_events;
    },
    function(async_error) {
      if (async_error) {
        return callback(async_error);
      }

      calculate_stats(events, callback);
    }
  );

  var calculate_stats = function(events, callback) {
    // arrays to dedupe things w/
    var event_hosts = [];
    var countries = [];
    var cities = [];
    var mentors = [];
    var coorganizers = [];

    // init stats object
    var event_stats = {
      hosts: 0,
      estimatedAttendees: 0,
      events: 0,
      countries:0,
      cities:0,
      mentors: 0,
      coorganizers: 0,
      byCountry: {}
    };

    // make access to other stats easier to figure
    events.forEach( function( event, idx ) {
      // up the number of events by one each time we have an event in out timeframe
      event_stats.events += 1;

      // little trick to count hosts/mentors/coorganizers per country
      var new_host = 0;
      var new_mentors = 0;
      var new_coorganizers = 0;
      var new_city = 0;

      /*
        get people stats
       */

      // get attendee stats
      event_stats.estimatedAttendees += event.estimatedAttendees;

      // get host stats
      if(event_hosts.indexOf( event.organizerId ) === -1){
        event_hosts.push( event.organizerId );

        new_host = 1; // this is a new host, add to country host count ;)
      }

      // get mentor stats
      if ( event.mentors && (event.mentors.length > 0) ) {
        event.mentors.forEach( function( mentor, idx ) {
          if ( mentor.userId ) {
            if( mentors.indexOf( mentor.userId ) === -1){
              mentors.push( mentor.userId );

              new_mentors += 1;  // this is a new mentor, add to country mentor count
            }
          }
        });
      }

      // get coorganizers stats
      if ( event.coorganizers && (event.coorganizers.length > 0) ) {
        event.coorganizers.forEach( function( coorganizer, idx ) {
          if ( coorganizer.userId ) {
            if( coorganizers.indexOf( coorganizer.userId ) === -1){
              coorganizers.push( coorganizer.userId );

              new_coorganizers += 1;  // this is a new mentor, add to country mentor count
            }
          }
        });
      }

      /*
        Get city stats
       */
      if( event.city ) {
        if(cities.indexOf( event.city ) === -1){
          cities.push( event.city );

          new_city = 1;
        }
      }

      /*
        get country level stats
       */
      var origCountry = event.country;
      // if null make unknown (we still want any other info we can extract)
      if( event.country === null || event.country === '') {
        event.country = 'UNKNOWN';
      }
      // else force country code not name
      else if( event.country.length !== 2 ) {
        // lookup country data based on its name
        event.country = country_data.lookup.countries( { name: event.country } )[ 0 ];

        // we don't always get a match :( so lets check we did get one
        if( event.country ) {
          // we did \o/ lets grab its ISO code :D
          event.country = event.country.alpha2;
        }
        else {
          // we didn't  :( add the event to the unknown locations.
          event.country = origCountry;
        }
      }

      // time to check if we've encountered this country before.
      if( countries.indexOf( event.country ) === -1 ) {
        // if we havent then add it to our output object w/ some defaults
        event_stats.byCountry[ event.country ] = {
          country: origCountry,
          events: 0,
          hosts: 0,
          mentors: 0,
          coorganizers: 0,
          estimatedAttendees: 0,
          cities: 0
        };
        countries.push( event.country );
      }

      // make things a little easier to read below
      var country = event_stats.byCountry[ event.country ];

      // take new data on this country into account
      country = {
        country: origCountry,
        events: country.events + 1,
        hosts: country.hosts + new_host,
        mentors: country.mentors + new_mentors,
        coorganizers: country.coorganizers + new_coorganizers,
        estimatedAttendees: country.estimatedAttendees + event.estimatedAttendees,
        cities: country.cities + new_city
      };

      // not sure this line is even needed.
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

    // include theses counts for quick reading by humans
    event_stats.countries = countries.length;
    event_stats.cities = cities.length;
    event_stats.mentors = mentors.length;
    event_stats.coorganizers = coorganizers.length;

    callback(null, event_stats);
  };
};
