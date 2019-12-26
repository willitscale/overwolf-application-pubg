import { EventNames } from "../constants/event-names";
import { EventBus } from "./event-bus";

import { FileUtils } from "../utils/file-utils";

import App from "../app";
import { StatsRepository } from "../repository/stats-repository";
import { TopicNames } from "../constants/topic-names";

export class StatsService {

    public static readonly FILE_NAME = "stats.json";

    private constructor() {
    }

    public static get instance(): StatsService {
        if (!(<any>overwolf.windows.getMainWindow()).pubgistics_stats) {
            (<any>overwolf.windows.getMainWindow()).pubgistics_stats = new StatsService;
        }
        return (<any>overwolf.windows.getMainWindow()).pubgistics_stats;
    }

    public listen(): void {
        EventBus.instance.subscribe('stats-service', TopicNames.Stats, EventNames.EventWildcard, this.eventListener.bind(this));
    }

    private eventListener(topic: string, event: string, data: any): void {
        switch (event) {
            case EventNames.StatsSetAll:
                this.setAll(data);
                break;
            case EventNames.StatsSave:
                this.save();
                break;
            case EventNames.StatsSetName:
                this.setName(data);
                break;
        }
    }

    private setAll(stats: any): void {
        StatsRepository.instance.stats = stats;
        EventBus.instance.publish(TopicNames.Stats, EventNames.StatsAllSet, name);
    }

    private save(): void {
        StatsRepository.instance.stats.lastUpdated = new Date().getTime();
        StatsRepository.instance.stats.version = App.VERSION;
        FileUtils.instance.writeFile(
            StatsService.FILE_NAME,
            StatsRepository.instance.stats,
            () => {}
        );
        
        EventBus.instance.publish(TopicNames.Stats, EventNames.StatsWeaponUpdate, {});
    }

    private setName(name: string): void {
        if (!name) {
            return;
        }

        if (!StatsRepository.instance.stats.name || StatsRepository.instance.stats.name != name) {
            StatsRepository.instance.stats = {
                "name": name
            };
            this.save();
        }
        
        EventBus.instance.publish(TopicNames.Stats, EventNames.StatsPlayerNameSet, name);
    }
}
