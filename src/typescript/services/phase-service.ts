import { EventBus } from "./event-bus";
import { EventNames } from "../constants/event-names";
import { PHASE_BY_SECOND, PHASE_BY_KEY } from "../constants/phase-definitions";
import { TopicNames } from "../constants/topic-names";

export interface ObjectWithStringKeysAndNumericalValues {
    [key: string]: number;
}

export class PhaseService {

    private setPhase: number = 0;
    private currentPhase: number = 0;
    private currentPhaseTime: number = 0;
    private running: boolean = false;
    private map: string = '';
    private ticker: number = 0;

    private static readonly DELAY_1_SECOND = 1000;

    private constructor() {
    }

    static get instance(): PhaseService {
        if (!(<any>overwolf.windows.getMainWindow()).pubgistics_phaseService) {
            (<any>overwolf.windows.getMainWindow()).pubgistics_phaseService = new PhaseService;
        }
        return (<any>overwolf.windows.getMainWindow()).pubgistics_phaseService;
    }

    public listen(): void {
        let topics = [
            TopicNames.Data,
            TopicNames.Map,
            TopicNames.GamePhase
        ];

        let events = [
            EventNames.DataUpdate,
            EventNames.MapChanged,
            EventNames.GamePhaseLobby,
            EventNames.GamePhaseAirfield,
            EventNames.GamePhaseAircraft
        ];

        EventBus.instance.subscribe('phase-service', topics, events, this.eventListener.bind(this));
    }

    private eventListener(topic: string, event: string, data: any): void {
        switch (event) {
            case EventNames.DataUpdate:
                this.updateData();
                break;
            case EventNames.MapChanged:
                this.setupPhase(data);
                break
            case EventNames.GamePhaseLobby:
                this.stop();
                break;
            case EventNames.GamePhaseAirfield:
                this.reset();
                break;
            case EventNames.GamePhaseAircraft:
                this.start();
                break;
        }
    }

    private updateData(): void {
        EventBus.instance.publish(TopicNames.Phase, EventNames.PhaseGameLength, this.getGameLength());
        EventBus.instance.publish(TopicNames.Phase, EventNames.PhaseMaps, this.getPhaseMaps());
        EventBus.instance.publish(TopicNames.Phase, EventNames.PhaseTicker, this.ticker);
        EventBus.instance.publish(TopicNames.Phase, EventNames.PhaseUpdate, this.setPhase);
    }

    private setupPhase(map: string): void {
        this.map = map;
        if (!PHASE_BY_SECOND[map]) {
            return;
        }
        this.reset();
    }

    private reset(): void {
        this.currentPhase = 0;
        this.currentPhaseTime = 0;
        this.updateData();
    }

    private start(): void {
        this.running = true;
        this.setPhase = this.currentPhase;
        EventBus.instance.publish(TopicNames.Phase, EventNames.PhaseUpdate, this.currentPhase);
        this.run();
    }

    private run(): void {
        let that = this;
        that.ticker = 0;

        let callback = () => {
            if (!that.running || !PHASE_BY_SECOND[that.map]) {
                return;
            }

            console.log(that.ticker, that.currentPhase, that.currentPhaseTime);

            if (that.ticker >= that.currentPhaseTime && that.currentPhase < PHASE_BY_KEY.length) {
                that.setPhase = PHASE_BY_KEY[that.currentPhase];
                that.currentPhaseTime += PHASE_BY_SECOND[that.map][that.currentPhase++];
                EventBus.instance.publish(TopicNames.Phase, EventNames.PhaseUpdate, PHASE_BY_KEY[that.currentPhase]);
            }

            EventBus.instance.publish(TopicNames.Phase, EventNames.PhaseTicker, that.ticker++);
            window.setTimeout(callback, PhaseService.DELAY_1_SECOND);
        };

        callback();
    }

    private stop(): void {
        this.running = false;
        this.reset();
    }

    private getGameLength(): number {
        if (!PHASE_BY_SECOND[this.map]) {
            return 0;
        }

        let length = 0;
        let phases = PHASE_BY_SECOND[this.map];

        for (let i in phases) {
            length += phases[i];
        }

        return length;
    }

    private getPhaseMaps() {
        if (!PHASE_BY_SECOND[this.map]) {
            return [];
        }

        let phaseMap: ObjectWithStringKeysAndNumericalValues = {};
        let phases = PHASE_BY_SECOND[this.map];
        let phaseKeys = PHASE_BY_KEY;

        let length = 0;

        for (let i in phases) {
            length += phases[i];
            phaseMap['phase-' + phaseKeys[i]] = length;
        }

        return phaseMap;
    }
}
