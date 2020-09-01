import fetch from 'node-fetch';
import crypto from './crypt-util';

interface IGame {
  gameId: string
  game: string
  host: string
  visitor: string
  time: string
  score: string
  hasGoal?: boolean
}

export type IChampMap = { [index: string]: IGame[] }

const parseResponseBody = (body: string): IChampMap => {
  var result = JSON.parse(body),
    stages = result["Stages"];

  return stages.map(function (stage) {
    var champ = stage["Cnm"] + " " + stage["Snm"],
      events = stage["Events"];

    var transformedEvents: IGame[] = events.map(function (e) {
      var hostObj = e["T1"],
        visitorObj = e["T2"];

      var host = ' ' + hostObj[0].Nm + ' ',
        visitor = ' ' + visitorObj[0].Nm,
        gameId = host + ' - ' + visitor,
        score = (e["Tr1"] || '?') + ' - ' + (e["Tr2"] || '?'),
        time = e["Eps"];

      time = time == 'NS' ? e["Esd"].toString().substring(8, 10) + ':' + e["Esd"].toString().substring(10, 12) : time;
      return {"gameId": gameId, "host": host, "visitor": visitor, "score": score, "time": time};
    });
    return {champ: champ, games: transformedEvents};
  }).reduce((i, c) => ({...i, [c.champ]: c.games}), {})
}

const isEmpty = (o) => !Object.keys(o).length

const goal = (a: IGame, b: IGame) => {
  return a.score === ' ? - ? ' && b.score === ' 0 - 0 ' ?  false : a.score != b.score
}

const zip = (a, b): any[] => a.map((x, i) => [x, b[i]])

const diff = (source: IChampMap, target: IChampMap): IChampMap => {
  if (isEmpty(source)) {
    return target
  }
  return Object.keys(target).reduce((i: any, c) => {
    const prev = source[c],
      current = target[c]
    const games = zip(prev, current).map(([a, b]) => ({...b, hasGoal: goal(a, b)}))
    return {...i, [c]: games}
  }, {});
}

class LivescoreApi {
  private old: IChampMap;

  constructor() {
    this.old = {};
  }

  public hit() {
    return LivescoreApi.livescore()
      .then(text => parseResponseBody(crypto.decrypt(text)))
      .catch(e => {
        return {}
      })
  }

  // diff with previous state
  public diff(body:IChampMap): IChampMap{
    return this.store(diff(this.old, body))
  }

  private store(data: IChampMap): IChampMap {
    return this.old = {...data}
  }

  private static livescore() {
    const tz = new Date().getTimezoneOffset() / 60 * -1
    return fetch(`http://m.livescore.com/~~/app1-home/soccer/?tz=${tz}&tzout=${tz}`,
      {
        headers: {
          "Accept": "text/plain",
          "Accept-Language": "en-US,en",
          "Content-Type": "application/text; charset=utf-8",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36"
        }
      })
      .then(res => res.text())
  }
}

export default new LivescoreApi()
