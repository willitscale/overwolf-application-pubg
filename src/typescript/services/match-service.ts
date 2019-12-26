import { EventBus } from "./event-bus";
import { EventNames } from "../constants/event-names";
import { MatchState } from "../constants/match-state";
import { MatchRepository } from "../repository/match-repository";

import { FileUtils } from "../utils/file-utils";
import { TopicNames } from "../constants/topic-names";

export class MatchService {

    public static readonly FILE_NAME = "matches.json";
    
    private constructor() {
    }

    public static get instance(): MatchService {
        if (!(<any>overwolf.windows.getMainWindow()).pubgistics_matches) {
            (<any>overwolf.windows.getMainWindow()).pubgistics_matches = new MatchService;
        }
        return (<any>overwolf.windows.getMainWindow()).pubgistics_matches;
    }

    public listen(): void {
        EventBus.instance.subscribe('matches-service', TopicNames.Match, EventNames.EventWildcard, this.eventListener.bind(this));
    }

    private eventListener(topic: string, event: string, data: any): void {
        switch (event) {
            case EventNames.MatchSetAll:
                this.setAll(data);
                break;
            case EventNames.MatchDownloadQueued:
                this.updateMatch(data, MatchState.QUEUED_FOR_DOWNLOADING);
                break;
            case EventNames.MatchDownloading:
                this.updateMatch(data, MatchState.DOWNLOADING);
                break;
            case EventNames.MatchProcessedQueued:
                this.updateMatch(data, MatchState.QUEUED_FOR_PROCESSING);
                break;
            case EventNames.MatchProcessing:
                this.updateMatch(data, MatchState.PROCESSING);
                break;
            case EventNames.MatchCompleted:
                this.updateMatch(data, MatchState.COMPLETED);
                break;
        }
    }

    private setAll(matches: any): void {
        MatchRepository.instance.matches = matches;
    }

    private addMatch(matchId: string, url: string, map: string): void {
        MatchRepository.instance.matches[matchId] = {
            matchId: matchId,
            download: 0,
            process: 0,
            state: MatchState.QUEUED_FOR_DOWNLOADING,
            url: url,
            map: map
        };

        this.save(() => {
            EventBus.instance.publish(TopicNames.Match, EventNames.MatchAdd, matchId);
        });
    }

    private updateMatch(matchId: string, state: string): void {
        if (MatchRepository.instance.matches[matchId]) {
            MatchRepository.instance.matches[matchId].state = state;

            this.save(() => {
                EventBus.instance.publish(TopicNames.Match, EventNames.MatchUpdated, matchId);
            });
        }
    }

    private save(callback: Function): void {
        FileUtils.instance.writeFile(
            MatchService.FILE_NAME,
            MatchRepository.instance.matches,
            callback
        );
    }
}
