import chalk from 'chalk'
import {IChampMap} from "./livescore"

function colorTime(time) {
  const isPlaying = time.indexOf("\'") != -1;
  if (isPlaying)
    return chalk.cyan.inverse(time);
  const isHalfTime = time.indexOf("HT") != -1;
  if (isHalfTime)
    return chalk.bgGreen.black(time);
  return chalk.inverse(time);
}

export function blessify(data: IChampMap) {
  const header = `{bold}Last{/bold} updated from {bold}www.livescore.com{/bold} ${new Date()}\n`
  const body = Object.keys(data).reduce((i, c) => {
    const joinGames = data[c].map(a => {
      const time = a.time,
          host = a.host,
          visitor = a.visitor,
          score = a.score,
          hasGoal = a.hasGoal,
          goal = hasGoal ? chalk.bold.yellow.bgBlue('GOAL') : '';
      return `${colorTime(time)} ${chalk.green(host)} ${chalk.yellow(score)} ${chalk.green(visitor)} ${goal}`
    }).join('\n');
    return `${i}\n{bold}${chalk.bgBlack(c)}{/bold}\n${joinGames}`
  }, '')
  return `${header}${body}}`
}

