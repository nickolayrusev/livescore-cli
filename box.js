#!/usr/bin/env node

var blessed = require('blessed'),
    program = require('commander'),
    _ = require('lodash'),
    helper = require('./lib/livescore-helpers.js'); 


//global variables
var _cached = {};

program
    .version('0.0.1')
    .usage('[options]')
    .option('-r, --refresh [seconds]', 'Refresh interval in seconds. Default is 30 seconds.  Should be > 30')
    .option('-d, --debugging','debugging')
    .parse(process.argv);

if (program.args.length)
    program.help();

// Create a screen object.
var screen = blessed.screen({
    autoPadding: true,
    smartCSR: true
});


screen.title = 'my window title';
// Create a box perfectly centered horizontally and vertically.
var box = blessed.box({
    content: 'loading livescore ...',
    tags: true,
    scrollable: true,
    alwaysScroll: true,
    mouse: true,
    keys: true,
    vi: true,
    border: {
        type: 'line',
    },
    style: {
        border: {
            fg: 'blue'
        }
    },
    scrollbar: {
        fg: 'red',
        ch: '|'
    }
});

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

// Append our box to the screen.
screen.append(box);

// Focus our element.
// box.focus();

// Render the screen.
screen.render();
//init function
(function init() {
    box.setContent('fetching scores...');
    screen.render();
    helper.hitLivescore()
        .then(function(body) {
            var result = helper.parseResponseBody(body);
            _cached = _.clone(result, true);
            box.setContent(helper.blessify(result));
            screen.render();
        })
})()

setInterval(function() {
    helper.hitLivescore()
        .then(function(body) {
            var result = helper.parseResponseBody(body);
            var incomingFlattenGames = helper.flatGames(result);
            var cachedFlattenGames = helper.flatGames(_cached);
            var resultWithGoals = helper.checkForGoals(cachedFlattenGames, incomingFlattenGames);
            _cached = _.clone(result, true);

            var finalFlattenChamps = helper.joinGames(result, resultWithGoals);
            box.setContent(helper.blessify(finalFlattenChamps));
            screen.render();
        })
}, program.refresh ? program.refresh * 1000 : 10000);

