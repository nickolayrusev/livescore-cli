"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const crypt_util_1 = __importDefault(require("./crypt-util"));
const parseResponseBody = (body) => {
    var result = JSON.parse(body), stages = result["Stages"];
    return stages.map(function (stage) {
        var champ = stage["Cnm"] + " " + stage["Snm"], events = stage["Events"];
        var transformedEvents = events.map(function (e) {
            var hostObj = e["T1"], visitorObj = e["T2"];
            var host = ' ' + hostObj[0].Nm + ' ', visitor = ' ' + visitorObj[0].Nm, gameId = host + ' - ' + visitor, score = (e["Tr1"] || '?') + ' - ' + (e["Tr2"] || '?'), time = e["Eps"];
            time = time == 'NS' ? e["Esd"].toString().substring(8, 10) + ':' + e["Esd"].toString().substring(10, 12) : time;
            return { "gameId": gameId, "host": host, "visitor": visitor, "score": score, "time": time };
        });
        return { champ: champ, games: transformedEvents };
    }).reduce((i, c) => (Object.assign(Object.assign({}, i), { [c.champ]: c.games })), {});
};
const isEmpty = (o) => !Object.keys(o).length;
const goal = (a, b) => {
    return a.score === ' ? - ? ' && b.score === ' 0 - 0 ' ? false : a.score != b.score;
};
const zip = (a, b) => a.map((x, i) => [x, b[i]]);
const diff = (source, target) => {
    if (isEmpty(source)) {
        return target;
    }
    return Object.keys(target).reduce((i, c) => {
        const prev = source[c], current = target[c];
        const games = zip(prev, current).map(([a, b]) => (Object.assign(Object.assign({}, b), { hasGoal: goal(a, b) })));
        return Object.assign(Object.assign({}, i), { [c]: games });
    }, {});
};
class LivescoreApi {
    constructor() {
        this.old = {};
    }
    hit() {
        return LivescoreApi.livescore()
            .then(text => parseResponseBody(crypt_util_1.default.decrypt(text)))
            .catch(e => {
            return {};
        });
    }
    diff(body) {
        return this.store(diff(this.old, body));
    }
    store(data) {
        return this.old = Object.assign({}, data);
    }
    static livescore() {
        const tz = new Date().getTimezoneOffset() / 60 * -1;
        return node_fetch_1.default(`http://m.livescore.com/~~/app1-home/soccer/?tz=${tz}&tzout=${tz}`, {
            headers: {
                "Accept": "text/plain",
                "Accept-Language": "en-US,en",
                "Content-Type": "application/text; charset=utf-8",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36"
            }
        })
            .then(res => res.text());
    }
}
exports.default = new LivescoreApi();
