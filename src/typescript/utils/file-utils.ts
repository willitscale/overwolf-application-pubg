import { EventBus } from "../services/event-bus";
import { EventNames } from "../constants/event-names";

import { PluginUtils } from "./plugin-utils";
import { TopicNames } from "../constants/topic-names";

export interface EventTriggers {
    [key: string]: {
        topic: string,
        event: string
    }
};

export class FileUtils {

    public eventTriggers: EventTriggers = {};

    private pluginUtils: PluginUtils;

    private readonly LOCAL_PATH: string = "\\pubglistics\\";

    private constructor() {
        this.pluginUtils = new PluginUtils("simple-io-plugin", true);
        this.pluginUtils.initialize(this.fileSystemReady());
    }

    public static get instance() {
        if (!(<any>overwolf.windows.getMainWindow()).pubgistics_file_utils) {
            (<any>overwolf.windows.getMainWindow()).pubgistics_file_utils = new FileUtils();
        }
        return (<any>overwolf.windows.getMainWindow()).pubgistics_file_utils;
    }

    public listen() {
        //EventBus.instance.subscribe('file-service', TopicNames.TopicWildcard, EventNames.EventWildcard, this.eventListener.bind(this));
    }

    private eventListener(topic: string, event: string, data: any): void {
    }

    private fileSystemReady() {
        let that = this;
        let loadSequenceCallback = this.loadSequence();
        this.eventTriggers = {
            'config.json': {
                topic: TopicNames.Settings,
                event: EventNames.SettingsSetAll
            },
            'stats.json': {
                topic: TopicNames.Settings,
                event: EventNames.StatsSetAll
            },
            'matches.json': {
                topic: TopicNames.Settings,
                event: EventNames.MatchSetAll
            }
        };
        return () => {
            for (let i in that.eventTriggers) {
                that.readFile(i, loadSequenceCallback(i));
            }
        };
    }

    private loadSequence() {
        let that = this;
        let returned = (file: string) => {
            return (status: any) => {
                if ('error' == status.status && "File doesn't exists" != status.reason) {
                    that.readFile(file, returned(file));
                } else {
                    EventBus.instance.publish(
                        that.eventTriggers[file].topic, 
                        that.eventTriggers[file].event, 
                        JSON.parse(status.content || "{}")
                    );
                    delete that.eventTriggers[file];
                }
            };
        };
        return returned;
    }

    public writeFile(file: string, contents: any, callback?: any) {
        overwolf.io.writeFileContents(
            this.pluginUtils.get().LOCALAPPDATA + this.LOCAL_PATH + file,
            JSON.stringify(contents),
            'UTF8',
            true,
            callback
        );
    }

    public readFile(file: string, callback?: any) {
        overwolf.io.readFileContents(
            this.pluginUtils.get().LOCALAPPDATA + this.LOCAL_PATH + file,
            'UTF8',
            callback
        );
    }
}