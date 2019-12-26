import { Tab } from "./tab";
import { EventBus } from "../services/event-bus";

import $ from "jquery";
import { EventNames } from "../constants/event-names";
import { MatchState } from "../constants/match-state";
import { MatchRepository } from "../repository/match-repository";
import { MatchData } from "../constants/type-def";
import { TopicNames } from "../constants/topic-names";

export class DataTab implements Tab {

    private started: boolean = false;
    private completed: number = 0;

    public start(): void {
        if (!this.started) {
            this.loadMatches();
            this.started = true;
            EventBus.instance.subscribe('data-tab', TopicNames.Match, EventNames.EventWildcard, this.registerMatchListener.bind(this));
        } else {
            this.resume();
        }
    }

    public stop(): void {

    }

    public pause(): void {

    }

    public resume(): void {

    }

    private registerMatchListener(event: string, data: any): void {
        switch (event) {
            case EventNames.MatchAdd:
                this.addMatch(data);
                break;
            case EventNames.MatchUpdated:
                this.updateMatch(data);
                break;
            case EventNames.MatchSetAll:
                this.setAll(data);
                break;
        }
    }

    private setAll(matches: any): void {
        MatchRepository.instance.matches = matches;
    }

    private loadMatches(): void {
        for (let matchId in MatchRepository.instance.matches) {
            let match: MatchData = MatchRepository.instance.matches[matchId];
            if (MatchState.COMPLETED != match.state) {
                this.addMatch(match);
            }
        }

        for (let matchId in MatchRepository.instance.matches) {
            let match: MatchData = MatchRepository.instance.matches[matchId];
            if (MatchState.COMPLETED == match.state) {
                this.completed++;
                this.addMatch(match);
            }
        }
    }

    private addMatch(match: MatchData): void {
        $('#download-panel').append(this.renderMatch(match));
        let matchSets = Object.keys(MatchRepository.instance.matches).length;

        if (this.completed > matchSets) {
            this.completed = matchSets;
        }
        
        $('#match-count').html(`(${this.completed}/${matchSets})`);
    }

    private updateMatch(matchId: string): void {
        let match: MatchData = MatchRepository.instance.matches[matchId];
        if (match.state == MatchState.COMPLETED) {
            $(`#match_${match.matchId}`).remove();
            this.completed++;
            this.addMatch(match);
        } else {
            $(`#match_${matchId}_state`).removeClass().addClass(`match-state ${match.state.toLocaleLowerCase()}`);
            $(`#match_${matchId}_state`).html(`${match.state}`);
        }
    }

    private renderMatch(match: MatchData): string {
        return `<div class="match" id="match_${match.matchId}">
            <div class="match-id">Match ID: <small>${match.matchId}</small></div>
            <div class="match-state ${match.state.toLocaleLowerCase()}" id="match_${match.matchId}_state">${match.state}</div>
        </div>`;
    }
}
