import { Tab } from "./tab";
import { SettingsService } from "../services/settings-service";

import $ from "jquery";
import { EventBus } from "../services/event-bus";
import { EventNames } from "../constants/event-names";
import { TopicNames } from "../constants/topic-names";

export class SettingsTab implements Tab {

    public settings: any;

    private started: boolean = false;

    public start(): void {
        if (this.started) {
            this.resume();
        }
        this.started = true;
        this.listen();
        this.bindListeners();
    }

    public stop(): void {

    }

    public pause(): void {

    }

    public resume(): void {
    }

    private listen(): void {
        EventBus.instance.subscribe('settings-tab', TopicNames.Settings, EventNames.SettingsSet, this.eventListener.bind(this));
        EventBus.instance.publish(TopicNames.Settings, EventNames.SettingsPublish, {});
    }

    private eventListener(topic: string, event: string, data: any): void {
        switch (event) {
            case EventNames.SettingsSet:
                this.setValue(data.key, data.value);
                break;
        }
    }

    private setValue(key: any, value: any): void {
        $('#' + key).attr('checked', value);
    }

    private bindListeners(): void {
        $('.tab-settings').click((event) => {
            let setting = $(event.currentTarget).prop('id');
            EventBus.instance.publish(TopicNames.Settings, EventNames.SettingsToggle, setting);
        });
    }
}
