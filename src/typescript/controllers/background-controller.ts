import { Controller } from "./controller";
import { WindowNames } from "../constants/window-names";
import { ControllerWrapper } from "./controller-wrapper";

import { RunningGameService } from "../services/running-game-service";
import { PUBGAPIService } from "../services/pubgapi-service";
import { RosterService } from "../services/roster-service";
import { GamePhaseService } from "../services/game-phase-service";
import { GepService } from "../services/gep-service";
import { SystemService } from "../services/system-service";
import { SettingsService } from "../services/settings-service";
import { DataService } from "../services/data-service";
import { MapService } from "../services/map-service";
import { PhaseService } from "../services/phase-service";
import { OptimiserService } from "../services/optimiser-service";

import { EventBus } from "../services/event-bus";
import { ActivityService } from "../services/activity-service";
import { EventNames } from "../constants/event-names";
import { TopicNames } from "../constants/topic-names";
import { StatsService } from "../services/stats-service";
import { MatchService } from "../services/match-service";
import { MeService } from "../services/me-service";
import { InventoryService } from "../services/inventory-service";

import { FileUtils } from "../utils/file-utils";
import { HotkeysUtils } from "../utils/hotkeys-utils";

export class BackgroundController extends ControllerWrapper implements Controller {

    public static readonly FILE = "background";

    private settings: any = {};

    public run(): void {
        this.start();
    }

    private async start() {
        this._registerAppLaunchTriggerHandler();

        let startupWindow = await this.getStartupWindowName();
        await this.restore(startupWindow);

        let isGameRunning = await RunningGameService.instance.isGameRunning();

        if (isGameRunning) {
            await this.startOverlay();
            SystemService.instance.register(this.startDashboard.bind(this));
        } else {
            await this.restore(WindowNames.MAIN);
        }

        RunningGameService.instance.addGameRunningChangedListener(this.gameRunningChanged.bind(this));
        HotkeysUtils.instance.setToggleOverlay(this.toggleOverlay.bind(this));

        this.startServices();
        this.listen();
    }

    public listen(): void {
        EventBus.instance.subscribe('background-controller', TopicNames.Settings, EventNames.SettingsSet, this.eventListener.bind(this));
        EventBus.instance.publish(TopicNames.Settings, EventNames.SettingsPublish, {});
    }

    private eventListener(topic: string, event: string, data: any): void {
        switch (event) {
            case EventNames.SettingsSet:
            this.updateSettings(data.key, data.value);
            break;
        }
    }

    private updateSettings(key: any, value: any) {
        this.settings[key] = value;
        if ('setting-display-overlay' == key) {
            this.toggleOverlay();
        } else if ('setting-display-dashboard' == key) {
            this.toggleDashboard();
        }
    }

    // App change events

    private gameRunningChanged(isGameRunning: boolean): void {
        if (isGameRunning) {
            this.startServices();
            this.startOverlay();
            SystemService.instance.register(this.startDashboard.bind(this));
        } else {
            this.stopOverlay();
            this.stopDashboard();
        }
    }

    private _registerAppLaunchTriggerHandler() {
        overwolf.extensions.onAppLaunchTriggered.removeListener(this._onAppRelaunch.bind(this));
        overwolf.extensions.onAppLaunchTriggered.addListener(this._onAppRelaunch.bind(this));
    }

    private _onAppRelaunch() {
        this.restore(WindowNames.MAIN);
    }

    private startServices(): void {
        InventoryService.instance.listen();
        MeService.instance.listen();
        StatsService.instance.listen();
        SettingsService.instance.listen();
        MatchService.instance.listen();
        ActivityService.instance.listen();
        RosterService.instance.listen();
        GamePhaseService.instance.listen();
        MapService.instance.listen();
        OptimiserService.instance.listen();
        PhaseService.instance.listen();
        DataService.instance.listen();
        GepService.instance.listen();
        PUBGAPIService.instance.listen();
        FileUtils.instance.listen();
        EventBus.instance.publish(TopicNames.BackgroundController, EventNames.BackgroundControllerGameStarted, {});
    }

    // Dashboard

    private async toggleDashboard() {
        if (this.settings['setting-display-dashboard']) {
            this.startOverlay();
        } else {
            this.stopOverlay();
        }
    }

    private async startDashboard() {
        if (!this.settings['setting-display-dashboard']) {
            return;
        }

        let x, y = -1;

        for (let i in SystemService.instance.monitors) {
            let monitor = SystemService.instance.monitors[i];

            if (!monitor.is_primary) {
                x = monitor.x;
                y = monitor.y;
            }

            if (this.settings['setting-display-dashboard-monitor'] == monitor.id) {
                break;
            }
        }

        let windowState = await this.getWindowState(WindowNames.DASHBOARD);

        if ('minimized' == windowState.window_state || 'closed' == windowState.window_state) {
            await this.restore(WindowNames.DASHBOARD);
            await this.position(WindowNames.DASHBOARD, x, y);
            await this.maximize(WindowNames.DASHBOARD);
        }
    }

    private async stopDashboard() {
        await this.close(WindowNames.DASHBOARD);
    }

    // Overlay

    private async toggleOverlay() {
        if (this.settings['setting-display-overlay']) {
            this.startOverlay();
        } else {
            this.stopOverlay();
        }
    }

    private async startOverlay() {
        if (!this.settings['setting-display-overlay']) {
            return;
        }

        let windowState = await this.getWindowState(WindowNames.OVERLAY);

        if ('minimized' == windowState.window_state || 'closed' == windowState.window_state) {
            await this.restore(WindowNames.OVERLAY);
            await this.position(WindowNames.OVERLAY, 0, 0);
            await this.size(WindowNames.OVERLAY, 320, 240);
        }
    }

    private async stopOverlay() {
        await this.close(WindowNames.OVERLAY);
    }
}
