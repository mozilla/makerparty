# makerparty

Makerparty 2014 is happening and we need to [spread the word](http://party.webmaker.org).

## Installation

To successfully install and run makerparty you must have the following prerequisites installed:

- [nodejs v0.10](http://nodejs.org/download/]

Once you have installed these prerequisites, you can install makerparty by running the following commands:

- `git clone https://github.com/mozilla/makerparty.git`
- `cd makerparty`
- `npm install`
- `cp env.dist .env`

## Running the Server

To run the server locally, run `grunt`. To run the server in production you must run `grunt heroku` to compile assets and then `node app.js` to run the server

## Configuration

You can configure the server by modifying the `.env` file or setting environment variables. The settings you can change are:

- `PORT` - The port the server binds to. Defaults to `5000`.
- `SUPPORTED_LANGS` - An array of languages the server supports. Defaults to `[ '*' ]` which means any languages in the `locale/` directory.
