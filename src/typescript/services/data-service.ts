import { EventBus } from "./event-bus";
import { EventNames } from "../constants/event-names";
import { TopicNames } from "../constants/topic-names";

export class DataService {

    private inAGame: boolean = false;

    public kills: number = 0;

    public static readonly FILE = "overlay";

    static get instance(): DataService {
        if (!(<any>overwolf.windows.getMainWindow()).pubgistics_data_service) {
            (<any>overwolf.windows.getMainWindow()).pubgistics_data_service = new DataService;
        }
        return (<any>overwolf.windows.getMainWindow()).pubgistics_data_service;
    }

    public listen(): void {
        let topics = [
            TopicNames.Me,
            TopicNames.GameEvent,
            TopicNames.Data
        ];

        let events = [
            EventNames.MeName,
            EventNames.GameEventKill,
            EventNames.GameEventPhase,
            EventNames.DataUpdate
        ];

        EventBus.instance.subscribe('data-service', topics, events, this.eventListener.bind(this));
    }

    private eventListener(topic: string, event: string, data: any): void {
        switch (event) {
            case EventNames.MeName:
                this.setPlayer(data);
                break;
            case EventNames.GameEventKill:
                this.updateStats.bind(data);
                break;
            case EventNames.GameEventPhase:
                this.phaseChange(data);
                break;
            case EventNames.DataUpdate:
                EventBus.instance.publish(TopicNames.Data, EventNames.DataInGame, this.inAGame);
                EventBus.instance.publish(TopicNames.Data, EventNames.DataUpdateService, this.kills);
                break;
        }
    }

    private phaseChange(data: any): void {
        switch (data.game_info.phase) {
            case 'lobby':
                this.setInAGame(false);
                break;
            case 'aircraft':
            case 'loading_screen':
            case 'airfield':
                this.setInAGame(true);
                this.resetStats();
                break;
        }
        this.gameInfo();
    }

    private setInAGame(inAGame: boolean): void {
        if (inAGame != this.inAGame) {
            this.inAGame = inAGame;
            EventBus.instance.publish(TopicNames.Data, EventNames.DataInGame, this.inAGame);
        }
    }

    private resetStats(): void {
        this.kills = 0;
        EventBus.instance.publish(TopicNames.Data, EventNames.DataUpdateStats, this.kills);
    }

    private gameInfo(): void {
        overwolf.games.events.getInfo(this.parseGameInfo.bind(this));
    }

    private parseGameInfo(data: any): void {
        if (data.status == 'error') {
            setTimeout(this.gameInfo.bind(this), 1000);
        } else if (data.res && data.res.me && data.res.me.name) {
            this.setPlayer(data.res.me.name);
        }
    }

    private setPlayer(name: any): void {
        EventBus.instance.publish(TopicNames.Stats, EventNames.StatsSetName, name);
    }

    private updateStats(data: any): void {
        for (let type in data.match_info) {
            switch (type) {
                case 'kills':
                    this.kills = Math.round(data.match_info[type]);
                    break;
            }
        }
        EventBus.instance.publish(TopicNames.Data, EventNames.DataUpdateStats, this.kills);
    }
}