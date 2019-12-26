import { Controller } from "./controller";
import { ControllerWrapper } from "./controller-wrapper";
import { EventBus } from "../services/event-bus";
import $ from "jquery";
import { RunningGameService } from "../services/running-game-service";
import { EventNames } from "../constants/event-names";
import { TopicNames } from "../constants/topic-names";

export class OverlayController extends ControllerWrapper implements Controller {

    public static readonly FILE = "overlay";
    private inAGame: boolean = false;
    public kills: number = 0;

    public run(): void {
        this.updateOverlay();
        this.register();
        RunningGameService.instance.addGameRunningChangedListener(this.closeListener.bind(this));
    }

    public register(): void {
        let events = [
            EventNames.DataInGame,
            EventNames.DataUpdateStats
        ];

        EventBus.instance.subscribe('overlay-controller', TopicNames.Data, events, this.eventListener.bind(this));
        EventBus.instance.publish(TopicNames.Data, EventNames.DataUpdate, {});
    }

    public eventListener(topic: string, event: string, data: any): void {
        switch (event) {
            case EventNames.DataInGame:
                this.inAGame = data;
                this.updateOverlay();
            case EventNames.DataUpdateStats:
                this.kills = data;
                this.updateOverlay();
                break;
        }
    }

    private updateOverlay(): void {
        if (this.inAGame) {
            $('body').show();
            $('#stats-kills').html(this.kills + '');
        } else {
            $('body').hide();
        }
    }
}