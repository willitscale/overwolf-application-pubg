import { MatchMap } from "../constants/type-def";

export class MatchRepository {

    public matches: MatchMap = {};

    private constructor() {
    }

    public static get instance(): MatchRepository {
        if (!(<any>overwolf.windows.getMainWindow()).pubgistics_match_repository) {
            (<any>overwolf.windows.getMainWindow()).pubgistics_match_repository = new MatchRepository;
        }
        return (<any>overwolf.windows.getMainWindow()).pubgistics_match_repository;
    }
}
