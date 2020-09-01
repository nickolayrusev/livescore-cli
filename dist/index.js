#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const blessed_1 = __importDefault(require("blessed"));
const livescore_1 = __importDefault(require("./lib/livescore"));
const helper = __importStar(require("./lib/livescore-helpers"));
const program = commander_1.default.program;
program
    .version('0.0.1')
    .usage('[options]')
    .option('-r, --refresh [seconds]', 'Refresh interval in seconds. Default is 30 seconds.  Should be > 30')
    .option('-d, --debugging', 'debugging')
    .parse(process.argv);
if (program.args.length)
    program.help();
let timer;
// Create a screen object.
const screen = blessed_1.default.screen({
    autoPadding: true,
    smartCSR: true
});
screen.title = 'livescore command line';
// Create a box perfectly centered horizontally and vertically.
var box = blessed_1.default.box({
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
        ch: '|'
    }
});
// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    clearTimeout(timer);
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
    setTimeout(function kick() {
        livescore_1.default.hit()
            .then((body) => {
            box.setContent(helper.blessify(livescore_1.default.diff(body)));
            screen.render();
            timer = setTimeout(kick, program.refresh ? program.refresh * 1000 : 30000);
        });
    }, 0);
})();
