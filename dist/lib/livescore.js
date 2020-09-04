"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const isEmpty = o => !Object.keys(o).length;
const goal = (a, b) => a.score === '? - ?' && b.score === '0 - 0' ? false : a.score != b.score;
const zip = (a, b) => a.map((x, i) => [x, b[i]]);
const parseResponseBody = (body) => {
    const stages = body["Stages"];
    return stages.map(function (stage) {
        const champ = `${stage["Cnm"]} ${stage["Snm"]}`, events = stage["Events"];
        const games = events.map(e => {
            const hostObj = e["T1"], visitorObj = e["T2"];
            const host = `${hostObj[0].Nm}`, visitor = `${visitorObj[0].Nm}`, gameId = `${host} - ${visitor}`, score = `${e["Tr1"] || '?'} - ${e["Tr2"] || '?'}`, time = e["Eps"] == 'NS' ? e["Esd"].toString().substring(8, 10) + ':' + e["Esd"].toString().substring(10, 12) : e["Eps"];
            return { "gameId": gameId, "host": host, "visitor": visitor, "score": score, "time": time };
        });
        return { champ, games };
    }).reduce((i, c) => (Object.assign(Object.assign({}, i), { [c.champ]: c.games })), {});
};
const diff = (source, target) => {
    if (isEmpty(source)) {
        return target;
    }
    return Object.keys(target).reduce((i, c) => {
        const prev = source[c], current = target[c];
        return Object.assign(Object.assign({}, i), { [c]: zip(prev, current).map(([a, b]) => (Object.assign(Object.assign({}, b), { hasGoal: goal(a, b) }))) });
    }, {});
};
class LivescoreApi {
    constructor() {
        this.old = {};
    }
    hit() {
        return LivescoreApi.livescore()
            .then(text => parseResponseBody(text))
            .catch(e => {
            return {};
        });
    }
    // diff with previous state
    diff(body) {
        return this.store(diff(this.old, body));
    }
    reset() {
        this.old = {};
    }
    store(data) {
        return this.old = Object.assign({}, data);
    }
    static livescore() {
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;
        return node_fetch_1.default(`https://prod-public-api.livescore.com/v1/api/react/date/soccer/${formattedDate}/2.00`, {
            headers: {
                "Accept": "text/plain",
                "Accept-Language": "en-US,en",
                "Content-Type": "application/text; charset=utf-8",
            }
        })
            .then(res => res.json());
    }
}
exports.default = new LivescoreApi();
