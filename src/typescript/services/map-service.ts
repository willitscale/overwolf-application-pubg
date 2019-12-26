import { EventBus } from "./event-bus";
import { EventNames } from "../constants/event-names";
import { TopicNames } from "../constants/topic-names";

export class MapService {

    private map: string = '';
    private inAGame: boolean = false;

    private constructor() {
    }

    static get instance(): MapService {
        if (!(<any>overwolf.windows.getMainWindow()).pubgistics_map_service) {
            (<any>overwolf.windows.getMainWindow()).pubgistics_map_service = new MapService;
        }
        return (<any>overwolf.windows.getMainWindow()).pubgistics_map_service;
    }

    public listen(): void {
        let topics = [
            TopicNames.Data,
            TopicNames.GameEvent
        ];

        let events = [
            EventNames.DataUpdate,
            EventNames.DataInGame,
            EventNames.GameEventMap,
            EventNames.GameEventPhase
        ];

        EventBus.instance.subscribe('map-service', topics, events, this.eventListener.bind(this));
    }

    private eventListener(topic: string, event: string, data: any): void {
        switch (event) {
            case EventNames.DataUpdate:
                EventBus.instance.publish(TopicNames.Map, EventNames.MapChanged, this.map);
                break;
            case EventNames.DataInGame:
                this.inAGame = data;
                break;
            case EventNames.GameEventMap:
                this.mapChange(data);
                break;
            case EventNames.GameEventPhase:
                this.phaseChange(data);
                break;
        }
    }

    private phaseChange(data: any): void {
        if ('loading_screen' == data.game_info.phase) {
            this.gameInfo();
        }
    }

    private gameInfo(): void {
        overwolf.games.events.getInfo(this.parseGameInfo.bind(this));
    }

    private parseGameInfo(data: any): void {
        if (data.status == 'error') {
            setTimeout(this.gameInfo.bind(this), 1000);
        } else if (data.res) {
            if (data.res.match_info) {
                this.mapChange(data.res.match_info.map);
            }
        }
    }

    private mapChange(map: any): void {
        // Not in a game
        if (!this.inAGame || !map) {
            return;
        }

        if (map.match_info && map.match_info.map) {
            this.map = map.match_info.map;
        } else {
            this.map = map;
        }

        EventBus.instance.publish(TopicNames.Map, EventNames.MapChanged, this.map);
    }
}