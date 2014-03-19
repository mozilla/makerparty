var Habitat = require('habitat');

Habitat.load();

// Configuration
var env = new Habitat();

// App
var app = require('./config')(env);

// Run server
app.listen(env.get('PORT'), function () {
  console.log('Now listening on %d', env.get('PORT'));
});
