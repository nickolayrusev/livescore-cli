#!/usr/bin/env node

var blessed = require('blessed'),
    program = require('commander'),
    cheerio = require("cheerio"),
    Q = require('q'),
    request = require('request'),
    chalk = require('chalk');

program
    .version('0.0.1')
    .usage('[options]')
    .option('-r, --refresh [seconds]', 'Refresh interval in seconds. Default is 30 seconds.  Should be > 30')
    .parse(process.argv);

if (program.args.length)
    program.help();

function parseResponseBody(body) {
    $ = cheerio.load(body);
        var reduced = $("body .content > div")
        .toArray()
        .map(function(a, index) {
            var champ = $(a).find("div .left").text(),
                game = $(a).find("div").text(),
                host = $(a).find(".ply.tright.name").text(),
                visitor = $(a).find(".ply.name:not(.tright)").text(),
                time = $(a).find(".min").text(),
                score = $(a).find(".sco").text();
            // console.log('host is', host, 'visitor is', visitor, "score", score);
            return {
                game: game,
                host: host,
                visitor: visitor,
                champ: champ,
                time: time,
                score: score
            }
        })
        .reduce(function(initial, current) {
            if (current["champ"]) {
                initial.push({
                    champ: current["champ"],
                    game: []
                });
                return initial;
            }
            //console.log(current);
            if (current["game"]) {
                var lastIndex = initial.length - 1;
                if (lastIndex == -1) return initial;
                var last = initial[lastIndex];
                //console.log('last',last);
                last["game"].push({
                    game: current["game"],
                    host: current["host"],
                    visitor: current["visitor"],
                    time: current["time"],
                    score: current["score"]
                })
                initial[lastIndex] = last;
            }
            return initial;
        }, []);
    return reduced;
};

function blessify(data) {
    return "{bold}Last{/bold} updated " + new Date() + "\n" +
        data.reduce(function(initial, current) {
            var joinGames = current.game.map(function(a) {
                var time = a.time,
                    host = a.host,
                    visitor = a.visitor,
                    score = a.score;
                return chalk.inverse(time) + chalk.green(host) + chalk.yellow(score) + chalk.green(visitor);
            }).join('\n');
            return initial + '\n' + '{bold}' + chalk.bgBlack(current.champ.trim()) + '{/bold}' + '\n' + joinGames
        }, '');
}

function hitLivescore() {
    var defer = Q.defer();
    request.get({
            uri: "http://www.livescore.com",
            headers: {
                "Accept": "text/html",
            }
        },
        function(err, httpResponse, body) {
            defer.resolve(body);
        })
    return defer.promise;
}

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

(function init() {
    box.setContent('fetching scores...');
    screen.render();
    hitLivescore()
        .then(function(body) {
            var result = parseResponseBody(body);
            box.setContent(blessify(result));
            screen.render();
        })
})()

setInterval(function() {
    hitLivescore()
        .then(function(body) {
            var result = parseResponseBody(body);
            box.setContent(blessify(result));
        })
    screen.render();
}, program.refresh ? program.refresh * 1000 : 30000);