import { EventBus } from "./event-bus";
import { EventNames } from "../constants/event-names";

import { FileUtils } from "../utils/file-utils";
import { TopicNames } from "../constants/topic-names";

type Settings = { [s: string]: {}; } | ArrayLike<{}>;

export class SettingsService {

    public static readonly FILE_NAME = "config.json";
    
    public settings: any;
    
    public static readonly DEFAULT_VALUES = {
        'setting-download-asynchronous': false,
        'setting-download-in-game': false,
        'setting-processing-multi-threaded': false,
        'setting-processing-in-game': false,
        'setting-display-overlay': true,
        'setting-display-dashboard': false,
        'setting-display-dashboard-monitor': ''
    };

    private constructor() {
    }

    public static get instance(): SettingsService {
        if (!(<any>overwolf.windows.getMainWindow()).pubgistics_settings_service) {
            (<any>overwolf.windows.getMainWindow()).pubgistics_settings_service = new SettingsService;
        }
        return (<any>overwolf.windows.getMainWindow()).pubgistics_settings_service;
    }

    public listen(): void {
        EventBus.instance.subscribe('settings-service', TopicNames.Settings, EventNames.EventWildcard, this.eventListener.bind(this));
    }

    private eventListener(topic: string, event: string, data: any): void {
        switch (event) {
            case EventNames.SettingsSetAll:
                this.setAll(data);
                break
            case EventNames.SettingsUpdate:
                this.setValue(data.key, data.value);
            break;
            case EventNames.SettingsToggle:
                this.toggle(data);
            break
            case EventNames.SettingsPublish:
                this.publish();
            break;
        }
    }
    
    private setAll(settings: Settings): void {
        if (!settings || Object.entries(settings).length == 0) {
            this.settings = SettingsService.DEFAULT_VALUES;
        } else {
            this.settings = settings;
        }

        for(let i in this.settings) {
            EventBus.instance.publish(TopicNames.Settings, EventNames.SettingsSet, {key: i, value: this.settings[i]});
        }
    }

    private setValue(key: string, value: any): void {
        this.settings[key] = value;
        this.save();
        EventBus.instance.publish(TopicNames.Settings, EventNames.SettingsSet, {key: key, value: value});
    }

    private publish(): void {
        for(let i in this.settings) {
            EventBus.instance.publish(TopicNames.Settings, EventNames.SettingsSet, {key: i, value: this.settings[i]});
        }
    }

    private toggle(key: string): boolean {
        if (undefined == typeof this.settings[key]) {
            this.settings[key] = false;
        }
        this.settings[key] = !this.settings[key];
        this.save();
        return this.settings[key];
    }

    private save(callback?: () => {}): void {
        FileUtils.instance.writeFile(
            SettingsService.FILE_NAME,
            this.settings,
            callback
        );
    }
}
