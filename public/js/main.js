console.log("reading main.js starts");

requirejs.config({
  baseDir: '/js',
  paths: {
    'jquery': '/bower_components/jquery/dist/jquery.min',
    'tabzilla': 'https://mozorg.cdn.mozilla.net/tabzilla/tabzilla',
    // localization related
    'selectize': "/bower_components/selectize/dist/js/standalone/selectize.min",
    'localized': '/bower_components/webmaker-i18n/localized',
    'list': '/bower_components/listjs/dist/list.min',
    'fuzzySearch': '/bower_components/list.fuzzysearch.js/dist/list.fuzzysearch.min',
    'analytics': '/bower_components/webmaker-analytics/analytics',
    'localized': '/bower_components/webmaker-i18n/localized',
    'languages': '/bower_components/webmaker-language-picker/js/languages',
    //makerparty ones
    'masonry': '/bower_components/masonry/dist/masonry.pkgd.min', // live-updates
    'makeapi': '/bower_components/makeapi-client/src/make-api', // live-updates
    'quilt': '/bower_components/supportopen-quilt/dist/quilt', // live-updates
    // other UI stuff
    'jquery-colorbox': '/bower_components/jquery-colorbox/jquery.colorbox-min',
    'bootstrap-affix': '/bower_components/bootstrap/js/affix',
    'bootstrap-collapse': '/bower_components/bootstrap/js/collapse',
    'bootstrap-scrollspy': '/bower_components/bootstrap/js/scrollspy',
    'elastislide.modernizr': '/lib/elastislide/js/modernizr.custom.17475',
    'elastislide.jquerypp': '/lib/elastislide/js/jquerypp.custom',
    'elastislide': '/lib/elastislide/js/jquery.elastislide',
    'makerparty-ui': '/js/ui'
  },
  shim: {
    'tabzilla': ['jquery'],
    'jquery-colorbox': ['jquery'],
    'bootstrap-affix': ['jquery'],
    'bootstrap-collapse': ['jquery'],
    'bootstrap-scrollspy': ['jquery'],
    'elastislide.modernizr': ['jquery'],
    'elastislide.jquerypp': ['jquery', 'elastislide.modernizr'],
    'elastislide': ['jquery', 'elastislide.modernizr', 'elastislide.jquerypp'],
    'quilt': ['jquery', 'makeapi', 'masonry'],
    'makerparty-ui': [
      'jquery',
      'jquery-colorbox',
      'bootstrap-affix',
      'bootstrap-collapse',
      'bootstrap-scrollspy',
      'elastislide.modernizr',
      'elastislide.jquerypp'
    ]
  }
});

require([
  'jquery',
  'analytics',
  'quilt',
  'languages',
  'selectize',
  'elastislide',
  'makerparty-ui',
  'tabzilla'
], function ($, analytics, quilt, languages) {
  'use strict';

  // Call this when the element is ready
  languages.ready({
    position: "top",
    arrow: "left"
  });

  //initialized language selectize
  $('select[name=supportedLocales]').selectize();

  // we display Quilt on /live-updates page, so only initiate it on that page
  if ($("body").hasClass("live-updates")) {
    var quiltConfig = {
      tags: ['makerparty', 'maker party', '#makerparty'],
      execution: 'or',
      limit: 50,
      duration: 7000,
      $preview: $('#makePreview')
    };
    quilt(quiltConfig);
  }

  // Check for email sign-up success from welcome.webmaker.org
  var thanks_re = /thanks=(\w+)/;
  var $body = $('body');
  var $thanksModal = $('#thanks-modal');
  var $backdrop;
  var TRANSITION_TIME = 150;
  var PAUSE_TIME = 1500;
  if (thanks_re.test(window.location.search)) {
    $backdrop = $('<div class="modal-backdrop fade" />')
      .appendTo($body)
      .addClass('in');
    $thanksModal
      .css({
        display: 'block'
      })
      .addClass('in');
    window.setTimeout(function () {
      $backdrop.removeClass('in');
      $thanksModal.removeClass('in');
      window.setTimeout(function () {
        $thanksModal
          .css({
            display: 'none'
          });
        $backdrop.remove();
      }, TRANSITION_TIME);
    }, PAUSE_TIME)
    console.log("Visitor signed up on welcome.webmaker.org");
    analytics.event("Email Sign Up", {
      label: "Learn More About Webmaker"
    });
    analytics.conversionGoal("WebmakerEmailSignUp");
  }

});

console.log("reading main.js ends");
