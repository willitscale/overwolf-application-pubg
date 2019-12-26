import { EventBus } from "./event-bus";
import { EventNames } from "../constants/event-names";
import { TopicNames } from "../constants/topic-names";

export class GepService {

    private static readonly REGISTER_RETRY_TIMEOUT: number = 10000;

    private static readonly REQUIRED_FEATURES: string[] = [
        EventNames.GameEventKill,
        EventNames.GameEventRevived,
        EventNames.GameEventDeath,
        EventNames.GameEventKiller,
        EventNames.GameEventMatch,
        EventNames.GameEventRank,
        EventNames.GameEventLocation,
        EventNames.GameEventMe,
        EventNames.GameEventTeam,
        EventNames.GameEventPhase,
        EventNames.GameEventMap,
        EventNames.GameEventRoster,
        EventNames.GameEventInventory,
        EventNames.GameEventMatchInfo
    ];

    protected constructor() {
    }

    static get instance(): GepService {
        if (!(<any>overwolf.windows.getMainWindow()).pubgistics_gameEventProvider) {
            (<any>overwolf.windows.getMainWindow()).pubgistics_gameEventProvider = new GepService;
        }
        return (<any>overwolf.windows.getMainWindow()).pubgistics_gameEventProvider;
    }

    public listen() {
        overwolf.games.events.setRequiredFeatures(
            GepService.REQUIRED_FEATURES,
            this.listener.bind(this)
        );
    }

    private listener(response: any) {
        if (response.status === 'error') {
            setTimeout(this.listen.bind(this), GepService.REGISTER_RETRY_TIMEOUT);
        } else if (response.status === 'success') {
            overwolf.games.events.onNewEvents.removeListener(GepService._handleGameEvent);
            overwolf.games.events.onNewEvents.addListener(GepService._handleGameEvent);

            overwolf.games.events.onInfoUpdates2.removeListener(GepService._handleInfoUpdate);
            overwolf.games.events.onInfoUpdates2.addListener(GepService._handleInfoUpdate);
        }
    }

    private static _handleGameEvent(eventsInfo: any) {
        for (let i = 0; i < eventsInfo.events.length; i++) {
            //console.log(i, JSON.stringify(eventsInfo.events[i]));
            switch (eventsInfo.events[i].name) {
                case EventNames.GameEventKill:
                    EventBus.instance.publish(TopicNames.GameEvent, EventNames.GameEventKill, eventsInfo.events[i].data);
                    break;
                case EventNames.GameEventDamageTaken:
                    EventBus.instance.publish(TopicNames.GameEvent, EventNames.GameEventDamageTaken, eventsInfo.events[i].data);
                    break;
                case EventNames.GameEventFire:
                    EventBus.instance.publish(TopicNames.GameEvent, EventNames.GameEventFire, eventsInfo.events[i].data);
                    break;
                case EventNames.GameEventKnockedOut:
                    EventBus.instance.publish(TopicNames.GameEvent, EventNames.GameEventKnockedOut, eventsInfo.events[i].data);
                    break;
                case EventNames.GameEventDeath:
                    EventBus.instance.publish(TopicNames.GameEvent, EventNames.GameEventDeath, eventsInfo.events[i].data);
                    break;
            }
        }
    }

    private static _handleInfoUpdate(eventsInfo: any) {
        //console.log(eventsInfo.feature, JSON.stringify(eventsInfo.info));
        EventBus.instance.publish(TopicNames.GameEvent, eventsInfo.feature, eventsInfo.info);
    }
}
