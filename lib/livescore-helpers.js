var Q = require('q'),
    request = require('request'),
    chalk = require('chalk'),
    _ = require('lodash'),
    fs = require('fs');

var exports = module.exports = {};

function parseResponseBody(body) {
    var result = JSON.parse(body),
        stages = result["Stages"];

    return stages.map(function(stage) {
        var champ = stage["Cnm"] + " " + stage["Snm"],
            events = stage["Events"];

        var transformedEvents = events.map(function(e) {
            var hostObj = e["T1"],
                visitorObj = e["T2"];

            var host = hostObj[0].Nm + ' ',
                visitor = ' ' + visitorObj[0].Nm,
                gameId = host + ' - ' + visitor,
                score =  ( e["Tr1"] || '?' ) + ' - ' +  (e["Tr2"] || '?') ,
                time = e["Eps"];

            return { "gameId": gameId, "host": host, "visitor": visitor, "score": score, "time": time };
        });

        return { champ: champ, games: transformedEvents };
    });
};
//flat all games into one array
function flatGames(result) {
    return result.map(function(el) {
        return el.games;
    }).reduce(function(initial, current) {
        return initial.concat(current)
    }, []);
};
/**
compare cached and incoming games if they have change in the score .
 returns flat array of games with new field - hasGoal
*/
function checkForGoals(cachedGames, incomingGames) {
    return incomingGames.map(function(a) {
        var currentInd = cachedGames.map(function(c) {
            return c.gameId;
        }).indexOf(a.gameId);

        var existingObject = cachedGames[currentInd];

        var obj = _.clone(a, true);
        obj.hasGoal = false;

        if (currentInd != -1) {
            if ((a.score != existingObject.score) && (a.score.indexOf('0 - 0') !== 1)) {
                obj.hasGoal = true;
            }
        }
        return obj;
    });
};
//convert back to original structure
function joinGames(champ, games) {
    var g = champ.map(function(ch) {
        var chGames = ch.games;
        games.map(function(n) {
            var ind = chGames.map(function(g) {
                return g.gameId
            }).indexOf(n.gameId);
            if (ind != -1) {
                chGames[ind] = n;
                return n;
            }
        });
        return ch;
    });
    return g;
};

function blessify(data) {
    return "{bold}Last{/bold} updated from {bold}www.livescore.com{/bold} " + new Date() + "\n" +
        data.reduce(function(initial, current) {
            var joinGames = current.games.map(function(a) {
                var time = a.time,
                    host = a.host,
                    visitor = a.visitor,
                    score = a.score;
                hasGoal = a.hasGoal;
                var goal = hasGoal ? chalk.bold.yellow.bgBlue('GOAL') : '';
                var coloredTime = colorTime(time);

                return coloredTime + chalk.green(host) + chalk.yellow(score) + chalk.green(visitor) + goal;
            }).join('\n');
            return initial + '\n' + '{bold}' + chalk.bgBlack(current.champ.trim()) + '{/bold}' + '\n' + joinGames
        }, '');
};

function colorTime(time) {
    var isPlaying = time.indexOf("\'") != -1;
    if (isPlaying)
        return chalk.cyan.inverse(time);
    var isHalfTime = time.indexOf("HT") != -1;
    if (isHalfTime)
        return chalk.bgGreen.black(time);
    return chalk.inverse(time);
};

function hitLivescore() {
    var tz = new Date().getTimezoneOffset() / 60 * -1;
    var defer = Q.defer();
    request.get({
            uri: 'http://m.livescore.com/~~/app1-home/soccer/?tz='+ tz +'&tzout=' + tz,
            headers: {
                "Accept": "text/plain",
                "Accept-Language": "en-US,en",
                "Content-Type":"application/text; charset=utf-8",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36"
            }
        },
        function(err, httpResponse, body) {
            if (!err && httpResponse.statusCode == 200) {
                defer.resolve(body);
            } else {
                defer.reject(err);
            }
        })
    return defer.promise;
};

exports.parseResponseBody = parseResponseBody
exports.hitLivescore = hitLivescore
exports.blessify = blessify
exports.joinGames = joinGames
exports.checkForGoals = checkForGoals
exports.flatGames = flatGames
