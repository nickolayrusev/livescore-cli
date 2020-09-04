#!/usr/bin/env node

import commander from 'commander';
import blessed from 'blessed'
import livescore from "./lib/livescore";
import * as helper from './lib/color-helpers'

const program = commander.program

program
  .version('0.0.1')
  .usage('[options]')
  .option('-r, --refresh [seconds]', 'Refresh interval in seconds. Default is 30 seconds.  Should be > 30')
  .option('-d, --debugging', 'debugging')
  .parse(process.argv);

if (program.args.length)
  program.help();

let timer
// Create a screen object.
const screen = blessed.screen({
  autoPadding: true,
  smartCSR: true
});


screen.title = 'livescore command line';
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
    ch: '|'
  }
});

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function (ch, key) {
  clearTimeout(timer)
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
    livescore.hit()
      .then((body ) => {
        box.setContent(helper.blessify(livescore.diff(body)))
        screen.render()
        timer = setTimeout(kick,  program.refresh ? program.refresh * 1000 : 30000)
      })
  }, 0)
})()
