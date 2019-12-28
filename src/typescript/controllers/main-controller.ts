import { Controller } from "./controller";
import { WindowsUtils } from "../utils/windows-utils";
import { TabsUtils } from "../utils/tabs-utils";

import { HomeTab } from "../tabs/home-tab";
import { StatsTab } from "../tabs/stats-tab";
import { DataTab } from "../tabs/data-tab";
import { SettingsTab } from "../tabs/settings-tab";

import App from "../app";

import $ from "jquery";
import { EventBus } from "../services/event-bus";
import { EventNames } from "../constants/event-names";
import { StatsRepository } from "../repository/stats-repository";
import { DragUtils } from "../utils/drag-utils";
import { TopicNames } from "../constants/topic-names";

export class MainController implements Controller {

    public static readonly FILE = "main";

    private readonly header: HTMLElement | any = document.getElementById('main-page');

    private messages = [
        `The old saying goes What doesn't kill you only makes you stronger\", so remember to finish your enemy off after you knock them.`,
        `Somedays PUBG can be testing and luck may not be on your side, but just remember to stay hydrated.`,
        `Exercise is great for helping improve some medical conditions apart from broken bones so remember not to run with a broken leg.`,
        `Five pieces of fruit and vegetables a day is good for you unless you fall out of a coconut tree.`,
        `While driving you cannot change the radio station by pressing "F" unless you have the car radio DLC.`,
        `PUBG has a DIY deathmatch mode, all you have to do is repeatedly land in bootcamp.`,
        `The best way to get a chicken dinner is to kill all of the other players.`
    ];

    constructor() {
        let that = this;
        overwolf.windows.getCurrentWindow(result => {
            let windowsUtils = new WindowsUtils(result.window);
            new DragUtils(windowsUtils, result.window, that.header);
        });
        this.setVersion();
    }

    public run(): void {
        new TabsUtils(this.tabConfig());

        let topics = [
            TopicNames.Processor,
            TopicNames.Stats,
            TopicNames.PUBG
        ];

        let events = [
            EventNames.ProcessorGetPlayerError,
            EventNames.StatsAllSet,
            EventNames.StatsPlayerNameSet,
            EventNames.PUBGAPIPlayerDataSet
        ];
        EventBus.instance.subscribe('main-controller', topics, events, this.eventListener.bind(this));
        this.setupUser();
        this.setMessageOfTheDay();
    }

    private setMessageOfTheDay(): void {
        let dayOfTheWeek = new Date().getDay();
        $('#motd').html(this.messages[dayOfTheWeek]);
    }

    private setupUser(): void {
        if (StatsRepository.instance.stats && StatsRepository.instance.stats.name) {
            this.playerLoggedIn();
        } else {
            this.playerPendingLogin();
        }
    }

    private eventListener(topic: string, event: string, data: any): void {
        switch (event) {
            case EventNames.ProcessorGetPlayerError:
                this.connectionFailure();
                break;
            case EventNames.StatsAllSet:
            case EventNames.StatsPlayerNameSet:
            case EventNames.PUBGAPIPlayerDataSet:
                this.playerLoggedIn();
                break;
        }
    }

    private playerLoggedIn(): void {
        $('#logged-in-as')
            .removeClass()
            .attr('class', 'logged-in logged-in-success')
            .html('<i class="far fa-check-circle"></i> Tracking player <span>' + StatsRepository.instance.stats.name + '</span>');
    }

    private connectionFailure(): void {
        $('#logged-in-as')
            .removeClass()
            .attr('class', 'logged-in logged-in-failure')
            .html('<i class="fas fa-exclamation-triangle"></i> Connection failure, will retry again in a moment.');
    }

    private playerPendingLogin(): void {
        $('#logged-in-as')
            .removeClass()
            .attr('class', 'logged-in logged-in-pending')
            .html('<i class="fas fa-exclamation-triangle"></i> You need to play a game before your stats can be analyzed.');
    }

    private tabConfig() {
        return {
            "home": {
                tab: '#tab-home',
                contents: '#tabs-home-content',
                instance: new HomeTab,
                selected: true
            },
            "stats": {
                tab: '#tab-stats',
                contents: '#tabs-stats-content',
                instance: new StatsTab,
                selected: false
            },
            "game": {
                tab: '#tab-data',
                contents: '#tabs-data-content',
                instance: new DataTab,
                selected: false
            },
            "settings": {
                tab: '#tab-settings',
                contents: '#tabs-settings-content',
                instance: new SettingsTab,
                selected: false
            }
        };
    }

    private setVersion() {
        $('#app-version small').html(App.VERSION);
    }
}