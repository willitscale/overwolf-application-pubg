import { EventBus } from "./event-bus";
import { EventNames } from "../constants/event-names";
import { TopicNames } from "../constants/topic-names";

export class MeService {

    // focusedAim|aimDownSight|aimDownSight_holding_breath|null
    private aiming: string | any = null;
    private stance: string | any = null;
    // leanLeft|leanRight|straight
    private bodyPosition: string = 'straight';
    private inVehicle: boolean = false;
    private freeView: boolean = false;
    private movement: string | any = null;
    private name: string = '';
    // FPP|TPP
    private view: string = 'TPP';

    static get instance(): MeService {
        if (!(<any>overwolf.windows.getMainWindow()).pubgistics_me_service) {
            (<any>overwolf.windows.getMainWindow()).pubgistics_me_service = new MeService;
        }
        return (<any>overwolf.windows.getMainWindow()).pubgistics_me_service;
    }

    public listen(): void {
        EventBus.instance.subscribe('me-service', TopicNames.Game, EventNames.GameEventMe, this.eventListener.bind(this));
    }

    private eventListener(topic: string, event: string, data: any): void {
        if (EventNames.GameEventMe == event && data.me) {
            this.parse(data.me);
        }
    }

    private parse(data: any): void {
        if (data.aiming) {
            this.aiming = data.aiming;
            EventBus.instance.publish(TopicNames.Me, EventNames.MeAiming, this.aiming);
        } else if (data.stance) {
            this.setStanceState(data.stance);
        } else if (data.bodyPosition) {
            this.bodyPosition = data.bodyPosition;
            EventBus.instance.publish(TopicNames.Me, EventNames.MeBodyPosition, this.bodyPosition);
        } else if (data.inVehicle) {
            this.setVehicleState(data.inVehicle);
        } else if (data.freeView) {
            this.freeView = ('true' === data.freeView);
            EventBus.instance.publish(TopicNames.Me, EventNames.MeFreeView, this.freeView);
        } else if (data.movement) {
            this.setMovementState(data.movement);
        } else if (data.name) {
            this.name = data.name;
            EventBus.instance.publish(TopicNames.Me, EventNames.MeName, this.name);
        } else if (data.view) {
            this.view = data.view;
            EventBus.instance.publish(TopicNames.Me, EventNames.MeView, this.view);
        }
    }

    private setMovementState(movement: string): void {
        this.movement = movement;
        switch (movement) {
            case 'stealth':
                EventBus.instance.publish(TopicNames.Me, EventNames.MeMovementStealth, {});
                break;
            case 'fast':
                EventBus.instance.publish(TopicNames.Me, EventNames.MeMovementFast, {});
                break;
            case 'normal':
            default:
                EventBus.instance.publish(TopicNames.Me, EventNames.MeMovementNormal, {});
                break;
        }
    }

    private setVehicleState(inVehicle: string): void {
        this.inVehicle = ('true' === inVehicle);
        if (this.inVehicle) {
            EventBus.instance.publish(TopicNames.Me, EventNames.MeEnteredVehicle, {});
        } else {
            EventBus.instance.publish(TopicNames.Me, EventNames.MeLeftVehicle, {});
        }
    }

    private setStanceState(stance: string): void {
        this.stance = stance;
        switch (stance) {
            case 'crouch':
                EventBus.instance.publish(TopicNames.Me, EventNames.MeStanceCrouched, {});
                break;
            case 'prone':
                EventBus.instance.publish(TopicNames.Me, EventNames.MeStanceProne, {});
                break;
            case 'stand':
            default:
                EventBus.instance.publish(TopicNames.Me, EventNames.MeStanceNormal, {});
                break;
        }
    }
}
