import livescore, {IChampMap} from '../../lib/livescore'

const game = {
  gameId: '1',
  host: 'Barcelona',
  visitor: 'Real Madrid',
  score: "? - ?",
  game: '',
  time: '21:45'
}

const mapHasGoal = (champ:IChampMap):boolean => champ['1']?.[0]?.hasGoal ?? false

beforeEach(() => {
  // Clear all instances and calls to constructor and all methods:
  jest.clearAllMocks()
  livescore.reset()
})

it('first time call', () => {
  const map: IChampMap = {
    '1': [{...game}]
  };
  jest.spyOn(livescore, 'hit').mockResolvedValueOnce(map)
  expect(livescore.hit()).resolves.toEqual(map)
})

it('testing has goal with multiple invocations', () => {
  const map: IChampMap = {
    '1': [{...game}]
  };

  const mapNext: IChampMap = {
    '1': [{...game, time: '1\'', score: '0 - 0'}]
  };

  const mapNextThird: IChampMap = {
    '1': [{...game, time: '24\'', score: '0 - 1'}]
  };

  const mapNextFourth: IChampMap = {
    '1': [{...game, time: 'HT', score: '1 - 1'}]
  };

  const mapNextFifth: IChampMap = {
    '1': [{...game, time: '67\'', score: '1 - 1'}]
  };

  const mapNextSixth: IChampMap = {
    '1': [{...game, time: 'FT', score: '2 - 1'}]
  };
  expect.assertions(6)
  jest.spyOn(livescore, 'hit')
    .mockResolvedValueOnce(map)
    .mockResolvedValueOnce(mapNext)
    .mockResolvedValueOnce(mapNextThird)
    .mockResolvedValueOnce(mapNextFourth)
    .mockResolvedValueOnce(mapNextFifth)
    .mockResolvedValueOnce(mapNextSixth)

  expect(livescore.hit().then(body => livescore.diff(body))).resolves.toEqual(map) //  ? - ?
  expect(livescore.hit().then(body => livescore.diff(body)).then(r => mapHasGoal(r))).resolves.toBeFalsy() // 0 - 0
  expect(livescore.hit().then(body => livescore.diff(body)).then( r => mapHasGoal(r))).resolves.toBeTruthy() // 0 - 1
  expect(livescore.hit().then(body => livescore.diff(body)).then( r => mapHasGoal(r))).resolves.toBeTruthy() // 1 - 1 ht
  expect(livescore.hit().then(body => livescore.diff(body)).then( r => mapHasGoal(r))).resolves.toBeFalsy() // 1 - 1 67'
  expect(livescore.hit().then(body => livescore.diff(body)).then( r => mapHasGoal(r))).resolves.toBeTruthy() // 2 - 1 ft
})

it('testing has goal with multiple corner invocations', () => {
  const map: IChampMap = {
    '1': [{...game}]
  };

  const mapNext: IChampMap = {
    '1': [{...game, time: '1\'', score: '1 - 1'}]
  };

  const mapNextThird: IChampMap = {
    '1': [{...game, time: '24\'', score: '1 - 1'}]
  };

  const mapNextFourth: IChampMap = {
    '1': [{...game, time: 'HT', score: '1 - 1'}]
  };

  const mapNextFifth: IChampMap = {
    '1': [{...game, time: '67\'', score: '1 - 1'}]
  };

  const mapNextSixth: IChampMap = {
    '1': [{...game, time: 'FT', score: '2 - 1'}]
  };
  expect.assertions(6)
  jest.spyOn(livescore, 'hit')
      .mockResolvedValueOnce(map)
      .mockResolvedValueOnce(mapNext)
      .mockResolvedValueOnce(mapNextThird)
      .mockResolvedValueOnce(mapNextFourth)
      .mockResolvedValueOnce(mapNextFifth)
      .mockResolvedValueOnce(mapNextSixth)


  expect(livescore.hit().then(body => livescore.diff(body))).resolves.toEqual(map) //  ? - ?
  expect(livescore.hit().then(body => livescore.diff(body)).then(r => mapHasGoal(r))).resolves.toBeTruthy() // 1 - 1
  expect(livescore.hit().then(body => livescore.diff(body)).then( r => mapHasGoal(r))).resolves.toBeFalsy() // 1 - 1
  expect(livescore.hit().then(body => livescore.diff(body)).then( r => mapHasGoal(r))).resolves.toBeFalsy() // 1 - 1 ht
  expect(livescore.hit().then(body => livescore.diff(body)).then( r => mapHasGoal(r))).resolves.toBeFalsy() // 1 - 1 67'
  expect(livescore.hit().then(body => livescore.diff(body)).then( r => mapHasGoal(r))).resolves.toBeTruthy() // 2 - 1 ft
})
