#!/usr/bin/env node

var blessed = require('blessed'),
    program = require('commander'),
    cheerio = require("cheerio"),
    Q = require('q'),
    request = require('request'),
    chalk = require('chalk'),
    _ = require('lodash');

var exports = module.exports = {};

//global variables
var _cached = {};
var _time = {};

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
                    gameId : current["host"] + '-' + current["visitor"],
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
//flat all games into one array
function flatGames(result) {
    return result.map(function(el) {
        return el.game;
    }).reduce(function(initial, current) {
        return initial.concat(current)
    }, []);
};
/**
compare cached and incoming games if they have change in the score .
 returns flat array of games with new field - hasGoal
*/
function checkForGoals(cachedGames,incomingGames) {
    return incomingGames.map(function(a) {
        var currentInd = cachedGames.map(function(c) {
            return c.gameId;
        }).indexOf(a.gameId);

        var existingObject = cachedGames[currentInd];

        var obj = _.clone(a, true);
        obj.hasGoal = false;

        if (currentInd != -1) {
            if (a.score != existingObject.score) {
                obj.hasGoal = true;
            } 
        }
        return obj;
    });
};
//convert back to original structure
function joinGames(champ,games){
     var g =  champ.map(function(ch){
        var chGames = ch.game;
        games.map(function(n){
            var ind = chGames.map(function(g) { return g.gameId}).indexOf(n.gameId);
            if(ind!=-1){
                chGames[ind] = n;
                return n;
            }
        });
        return ch;
    });
    return g;
};
function blessify(data) {
    return "{bold}Last{/bold} updated " + new Date() + "\n" +
        data.reduce(function(initial, current) {
            var joinGames = current.game.map(function(a) {
                var time = a.time,
                    host = a.host,
                    visitor = a.visitor,
                    score = a.score;
                    hasGoal = a.hasGoal;
                    var goal = hasGoal ? chalk.bold.yellow.bgBlue('GOAL') : '';
                    var coloredTime = (time.indexOf("\'") != -1) ? chalk.cyan.inverse(time) : chalk.inverse(time);

                return coloredTime + chalk.green(host) + chalk.yellow(score) + chalk.green(visitor) + goal;
            }).join('\n');
            return initial + '\n' + '{bold}' + chalk.bgBlack(current.champ.trim()) + '{/bold}' + '\n' + joinGames
        }, '');
}

function hitLivescore() {
    var defer = Q.defer();
    request.get({
            uri: "http://www.livescore.com",
            // uri:"http://localhost/livescore",
            headers: {
                "Accept": "text/html",
                "Accept-Language":"en-US,en",
                "Cookie":"tz="+ new Date().getTimezoneOffset() / -60
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
//init function
(function init() {
    box.setContent('fetching scores...');
    screen.render();
    hitLivescore()
        .then(function(body) {
            var result = parseResponseBody(body);
            _cached = _.clone(result,true);
            _time = new Date()
            box.setContent(blessify(result));
            screen.render();
        })
})()

setInterval(function() {

    hitLivescore()
        .then(function(body) {
            var result = parseResponseBody(body);
            var incomingFlattenGames = flatGames(result);
            var cachedFlattenGames = flatGames(_cached);

            var resultWithGoals = checkForGoals(cachedFlattenGames,incomingFlattenGames);
            _cached = _.clone(result,true);
            var finalFlattenChamps = joinGames(result,resultWithGoals);
            box.setContent(blessify(finalFlattenChamps));
            screen.render();
        })
}, program.refresh ? program.refresh * 1000 : 30000);

module.exports = {
    hitLivescore : hitLivescore
}
