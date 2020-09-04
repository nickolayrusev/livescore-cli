import fetch from 'node-fetch';

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

const isEmpty = o => !Object.keys(o).length

const goal = (a: IGame, b: IGame) => a.score === '? - ?' && b.score === '0 - 0' ? false : a.score !== b.score

const zip = (a, b): any[] => a.map((x, i) => [x, b[i]])

const parseResponseBody = (body: any): IChampMap => {
  const stages = body["Stages"]

  return stages.map(function (stage) {
    const champ = `${stage["Cnm"]} ${stage["Snm"]}`,
        events = stage["Events"]

    const games: IGame[] = events.map(e => {
      const hostObj = e["T1"],
          visitorObj = e["T2"]

      const host = `${hostObj[0].Nm}`,
          visitor = `${visitorObj[0].Nm}`,
          gameId = `${host} - ${visitor}`,
          score = `${e["Tr1"] || '?'} - ${e["Tr2"] || '?'}`,
          time = e["Eps"] == 'NS' ? e["Esd"].toString().substring(8, 10) + ':' + e["Esd"].toString().substring(10, 12) : e["Eps"]

      return {"gameId": gameId, "host": host, "visitor": visitor, "score": score, "time": time}
    });
    return {champ, games}
  }).reduce((i, c) => ({...i, [c.champ]: c.games}), {})
}


const diff = (source: IChampMap, target: IChampMap): IChampMap => {
  if (isEmpty(source)) {
    return target
  }
  return Object.keys(target).reduce((i: any, c) => {
    const prev = source[c],
      current = target[c]
    return {...i, [c]: zip(prev, current).map(([a, b]) => ({...b, hasGoal: goal(a, b)}))}
  }, {});
}

class LivescoreApi {
  private old: IChampMap;

  constructor() {
    this.old = {}
  }

  public hit() {
    return LivescoreApi.livescore()
      .then(text => parseResponseBody(text))
      .catch(e => {
        return {}
      })
  }

  // diff with previous state
  public diff(body:IChampMap): IChampMap{
    return this.store(diff(this.old, body))
  }

  public reset(){
    this.old = {}
  }

  private store(data: IChampMap): IChampMap {
    return this.old = {...data}
  }

  private static livescore() {
    const date = new Date()
    const formattedDate = `${date.getFullYear()}${date.getMonth()+1}${date.getDate()}`
    return fetch(`https://prod-public-api.livescore.com/v1/api/react/date/soccer/${formattedDate}/2.00`,
      {
        headers: {
          "Accept": "text/plain",
          "Accept-Language": "en-US,en",
          "Content-Type": "application/text; charset=utf-8",
        }
      })
      .then(res => res.json())
  }
}

export default new LivescoreApi()
