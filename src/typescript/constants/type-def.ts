export interface MatchData {
    matchId: string,
    download: number,
    process: number,
    state: string,
    map: string,
    url: string
}

export interface MatchMap {
    [key: string]: MatchData
}
