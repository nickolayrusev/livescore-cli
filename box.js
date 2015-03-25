var blessed = require('blessed'),
    cheerio = require("cheerio"),
    Q = require('q'),
    request = require('request'),
    chalk = require('chalk');

function parseResponseBody(body) {
    $ = cheerio.load(body);
    var reduced = $("body .content > div")
        .toArray()
        .map(function(a, index) {
            var champ = $(a).find("div .left").text();
            var game = $(a).find("div").text();
            return {
                game: game,
                champ: champ
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
            if (current["game"]) {
                var lastIndex = initial.length - 1;
                if (lastIndex == -1)
                    return initial;
                var last = initial[lastIndex];
                //console.log('last',last);
                last["game"].push(current["game"])
                initial[lastIndex] = last;
            }
            return initial;
        }, []);
    return reduced;
};

function blessify(data) {
    return "{bold}last{/bold} updated " + new Date() + "\n" +
        data.reduce(function(initial, current) {
            var joinGames = current.game.map(function(a) {
                var game = a.trim().indexOf(' ');
                var gameName = a.substring(game+1, game.length);
                var time =  a.substring(0,game+1);
                return chalk.red(time) + chalk.green(gameName);
            }).join('\n');
            return initial + '\n' + '{bold}' + chalk.bgBlack(current.champ.trim()) + '{/bold}' + '\n' + joinGames
        }, '');
}

function hitLivescore() {
    var defer = Q.defer();
    request.get("http://livescore.com",
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
            // console.log('result is ', result);
            box.setContent(blessify(result));
        })
        // box.setContent('{center}Some different ' + new Date() + ' {red-fg}content{/red-fg}.{/center}');
    screen.render();
}, 20000);