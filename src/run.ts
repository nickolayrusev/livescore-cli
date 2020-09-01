import livescore from './lib/livescore'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const live = () => {
  return livescore.hit().then(data => console.log(data))
}

const ask = () => {
  rl.question("What is your name ? ", function (name) {
    if (name === 'y' || name === 'Y') {
      live().then(() => ask())
    } else {
      rl.close();
    }
  });
}

rl.on("close", function () {
  console.log("\nBYE BYE !!!");
  process.exit(0);
});

ask();
