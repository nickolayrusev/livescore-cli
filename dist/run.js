"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const livescore_1 = __importDefault(require("./lib/livescore"));
const readline_1 = __importDefault(require("readline"));
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
const live = () => {
    return livescore_1.default.hit().then(data => console.log(data));
};
const ask = () => {
    rl.question("What is your name ? ", function (name) {
        if (name === 'y' || name === 'Y') {
            live().then(() => ask());
        }
        else {
            rl.close();
        }
    });
};
rl.on("close", function () {
    console.log("\nBYE BYE !!!");
    process.exit(0);
});
ask();
