interface IGame {
    gameId: string;
    game: string;
    host: string;
    visitor: string;
    time: string;
    score: string;
    hasGoal?: boolean;
}
export declare type IChampMap = {
    [index: string]: IGame[];
};
declare class LivescoreApi {
    private old;
    constructor();
    hit(): Promise<IChampMap | {}>;
    diff(body: IChampMap): IChampMap;
    reset(): void;
    private store;
    private static livescore;
}
declare const _default: LivescoreApi;
export default _default;
