import { EventBus } from "./event-bus";
import { EventNames } from "../constants/event-names";
import { TopicNames } from "../constants/topic-names";

export class GamePhaseService {

    private inAGame: boolean = false;
    private gamePhase: string = '';

    private constructor() {
    }

    static get instance(): GamePhaseService {
        if (!(<any>overwolf.windows.getMainWindow()).pubgistics_game_phase_service) {
            (<any>overwolf.windows.getMainWindow()).pubgistics_game_phase_service = new GamePhaseService;
        }
        return (<any>overwolf.windows.getMainWindow()).pubgistics_game_phase_service;
    }

    public listen() {
        let topics = [
            TopicNames.Data,
            TopicNames.GameEvent
        ];

        let events = [
            EventNames.DataUpdate,
            EventNames.GameEventPhase
        ];

        EventBus.instance.subscribe('game-phase-service', topics, events, this.eventListener.bind(this));
    }

    private eventListener(topic: string, event: string, data: any): void {
        switch (event) {
            case EventNames.DataUpdate:
                EventBus.instance.publish(TopicNames.GamePhase, 'game_phase_' + this.gamePhase, this.gamePhase);
                break;
            case EventNames.GameEventPhase:
                this.phaseChange(data);
                break;
        }
    }

    private phaseChange(data: any): void {
        if (!data || !data.game_info || !data.game_info.phase) {
            return;
        }
        this.gamePhase = data.game_info.phase;
        // lobby | loading_screen | aircraft | airfield
        EventBus.instance.publish(TopicNames.GamePhase, 'game_phase_' + this.gamePhase, this.gamePhase);
    }
}
