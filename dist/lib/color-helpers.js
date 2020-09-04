"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blessify = void 0;
const chalk_1 = __importDefault(require("chalk"));
function colorTime(time) {
    const isPlaying = time.indexOf("\'") != -1;
    if (isPlaying)
        return chalk_1.default.cyan.inverse(time);
    const isHalfTime = time.indexOf("HT") != -1;
    if (isHalfTime)
        return chalk_1.default.bgGreen.black(time);
    return chalk_1.default.inverse(time);
}
function blessify(data) {
    const header = `{bold}Last{/bold} updated from {bold}www.livescore.com{/bold} ${new Date()}\n`;
    const body = Object.keys(data).reduce((i, c) => {
        const joinGames = data[c].map(a => {
            const time = a.time, host = a.host, visitor = a.visitor, score = a.score, hasGoal = a.hasGoal, goal = hasGoal ? chalk_1.default.bold.yellow.bgBlue('GOAL') : '';
            return `${colorTime(time)} ${chalk_1.default.green(host)} ${chalk_1.default.yellow(score)} ${chalk_1.default.green(visitor)} ${goal}`;
        }).join('\n');
        return `${i}\n{bold}${chalk_1.default.bgBlack(c)}{/bold}\n${joinGames}`;
    }, '');
    return `${header}${body}}`;
}
exports.blessify = blessify;
