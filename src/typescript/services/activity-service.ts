import { EventBus } from "./event-bus";
import { EventNames } from "../constants/event-names";
import { TopicNames } from "../constants/topic-names";

class Activity {
    public normal: number = 0;
    public combat: number = 0;
    public running: number = 0;
    public driving: number = 0;
    public prone: number = 0;
    public crouching: number = 0;
    public looting: number = 0;
    public stealth: number = 0;
}

export class ActivityService {

    private static readonly DELAY: number = 8000;

    private currentActivity: NodeJS.Timeout | any = null;

    private activityStart: number = 0;
    private activityType: string = '';

    private activity: any = {};
    private phaseActivity: any = {};
    private active: boolean = false;
    private currentPhase: number = 0;

    private constructor() {
    }

    static get instance(): ActivityService {
        if (!(<any>overwolf.windows.getMainWindow()).pubgistics_activity_service) {
            (<any>overwolf.windows.getMainWindow()).pubgistics_activity_service = new ActivityService;
        }
        return (<any>overwolf.windows.getMainWindow()).pubgistics_activity_service;
    }

    public listen() {
        let topics = [
            TopicNames.Phase,
            TopicNames.GamePhase,
            TopicNames.GameEvent,
            TopicNames.Inventory,
            TopicNames.Me
        ];

        EventBus.instance.subscribe('activity-service', topics, EventNames.EventWildcard, this.eventListener.bind(this));
    }

    private eventListener(topic: string, event: string, data: any): void {
        switch (event) {
            case EventNames.PhaseUpdate:
                this.updatePhase(data);
                break;
            case EventNames.GamePhaseAircraft:
                this.start();
                break;
            case EventNames.GamePhaseLobby:
            case EventNames.GameEventDeath:
                this.stop();
                break;
            case EventNames.GameEventKnockedOut:
            case EventNames.GameEventFire:
            case EventNames.GameEventDamageTaken:
                this.startTimedActivity('combat');
                break;
            case EventNames.InventoryItemEquipped:
            case EventNames.InventoryItemCollected:
                this.startTimedActivity('looting');
                break;
            case EventNames.MeEnteredVehicle:
                this.startActivity('driving');
                break;
            case EventNames.MeStanceCrouched:
                this.startActivity('crouching');
                break;
            case EventNames.MeStanceProne:
                this.startActivity('prone');
                break;
            case EventNames.MeMovementFast:
                this.startActivity('running');
                break;
            case EventNames.MeMovementStealth:
                this.startActivity('stealth');
                break;
            case EventNames.MeMovementNormal:
            case EventNames.MeStanceNormal:
            case EventNames.MeLeftVehicle:
                this.startActivity('normal');
                break;
        }
    }

    private start(): void {
        //console.log('start activity recording');
        this.activity = new Activity;
        this.phaseActivity = {};
        this.updatePhase(0);
        this.active = true;
        this.startActivity('driving');
    }

    private updatePhase(phase: number) {
        if (this.currentPhase != phase) {
            this.currentPhase = phase;
            this.phaseActivity['phase_' + phase] = new Activity;
        }
    }

    private stop(): void {
        //console.log('stopping activity recording');
        if (!this.active) {
            return;
        }
        this.stopActivity('normal'),
            this.active = false;
    }

    private startActivity(activity: string): void {
        if (!this.active || this.currentActivity) {
            return;
        }

        this.stopActivity(activity);
    }

    private startTimedActivity(activity: string): void {
        if (!this.active) {
            return;
        }

        this.stopActivity(activity);

        this.currentActivity = setTimeout(
            this.stopActivity.bind(this, 'normal'),
            ActivityService.DELAY
        );
    }

    private stopActivity(activity: string): void {
        if (this.currentActivity) {
            clearTimeout(this.currentActivity);
        }

        if (this.activityType) {
            let timer = this.getTime();
            this.activity[this.activityType] += timer;
            this.updateActivitySummary();
            this.phaseActivity['phase_' + this.currentPhase][this.activityType] += (1 * timer);
            this.updatePhaseActivitySummary();
        }

        this.currentActivity = null;
        this.activityType = activity;
        this.activityStart = Math.round(new Date().getTime() / 1000);
    }

    private getTime(): number {
        let now = Math.round(new Date().getTime() / 1000);
        let time = now - this.activityStart;
        this.activityStart = now;
        return time;
    }

    private updateActivitySummary(): void {
        let totalTime = 0;
        let activity: any = {};

        for (let type in this.activity) {
            totalTime += this.activity[type];
        }

        for (let type in this.activity) {
            if (totalTime > 0) {
                activity[type] = Math.round((this.activity[type] / totalTime) * 10000) / 100;
            } else {
                activity[type] = 0;
            }
        }

        EventBus.instance.publish(TopicNames.Activity, EventNames.ActivityUpdate, activity);
    }

    private updatePhaseActivitySummary(): void {
        let totalTime = 0;
        let phaseActivity: any = [];

        for (let phase in this.phaseActivity) {

            let currentPhaseActivity = this.phaseActivity[phase];

            for (let type in currentPhaseActivity) {
                totalTime += currentPhaseActivity[type];
            }

            let activity = [];

            for (let type in currentPhaseActivity) {
                if (totalTime > 0) {
                    activity.push(Math.round((currentPhaseActivity[type] / totalTime) * 10000) / 100);
                } else {
                    activity.push(0);
                }
            }

            phaseActivity.push(activity);
        }

        EventBus.instance.publish(TopicNames.Activity, EventNames.ActivityPhaseUpdate, phaseActivity);
    }
}
