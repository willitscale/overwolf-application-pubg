import { EventBus } from "./event-bus";
import { EventNames } from "../constants/event-names";
import { TopicNames } from "../constants/topic-names";

interface Roster {
    [key: string]: any
}

export class RosterService {

    private roster: Roster = {};
    private inAGame: boolean = false;

    private constructor() {
    }

    static get instance(): RosterService {
        if (!(<any>overwolf.windows.getMainWindow()).pubgistics_roster_service) {
            (<any>overwolf.windows.getMainWindow()).pubgistics_roster_service = new RosterService;
        }
        return (<any>overwolf.windows.getMainWindow()).pubgistics_roster_service;
    }

    public listen() {
        let topics = [
            TopicNames.Data,
            TopicNames.GameEvent
        ];

        let events = [
            EventNames.DataUpdate,
            EventNames.DataInGame,
            EventNames.GameEventRoster,
            EventNames.GamePhaseLobby
        ];

        EventBus.instance.subscribe('roster-service', topics, events, this.eventListener.bind(this));
    }

    private eventListener(topic: string, event: string, data: any): void {
        switch (event) {
            case EventNames.DataUpdate:
                this.update();
                break;
            case EventNames.DataInGame:
                this.inAGame = data;
                break;
            case EventNames.GameEventRoster:
                this.updateRoster(data);
                break;
            case EventNames.GamePhaseLobby:
                this.reset();
                break;
        }
    }

    private reset(): void {
        this.roster = {};
        this.update();
    }

    private updateRoster(roster: any): void {
        if (!this.inAGame) {
            return;
        }

        let matchInfo = roster.match_info;
        for (let rosterId in matchInfo) {
            let rosterInfo = JSON.parse(matchInfo[rosterId]);
            if (false === rosterInfo.out && rosterInfo.player) {
                this.roster[rosterId] = rosterInfo;
            } else {
                if (this.roster[rosterId]) {
                    delete this.roster[rosterId];
                }
            }
        }
        this.update();
    }

    private update(): void {
        EventBus.instance.publish(TopicNames.Roster, EventNames.RosterUpdate, Object.keys(this.roster).length);
    }
}