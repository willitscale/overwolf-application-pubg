import { Controller } from "./controller";
import { TelemetryMap } from "../constants/telemetry-map";

import { EventBus } from "../services/event-bus";
import { MapSizes } from "../constants/map-sizes";
import { ControllerWrapper } from "./controller-wrapper";

import { StatsRepository } from "../repository/stats-repository";

import { DragUtils } from "../utils/drag-utils";
import { WindowsUtils } from "../utils/windows-utils";
import { RunningGameUtils } from "../utils/running-game-utils";


import Chartist from "chartist";
import App from "../app";

import $ from "jquery";
import { EventNames } from "../constants/event-names";
import { PHASE_BY_KEY } from "../constants/phase-definitions";
import { TopicNames } from "../constants/topic-names";

export class DashboardController extends ControllerWrapper implements Controller {

    public static readonly FILE = "dashboard";
    
    private static readonly LEGENDS = [
        'normal',
        'combat',
        'running',
        'driving',
        'prone',
        'crouching',
        'looting',
        'stealth'
    ];

    private readonly header: HTMLElement | any = document.getElementById('dashboard-page');

    private map: string | any = null;
    private gameLength: number = 0;
    private phases: any = null;
    private currentPhase: number = 0;

    private inAGame: boolean = false;

    private dashboardActivityChart: any = null;
    private dashboardActivityData: any = null;
    private dashboardActivityOptions: any = null;

    constructor() {
        super();
        let that = this;
        overwolf.windows.getCurrentWindow(result => {
            let windowsUtils = new WindowsUtils(result.window);
            new DragUtils(windowsUtils, result.window, that.header);
        });
    }

    public run(): void {
        EventBus.instance.subscribe('dashboard-controller', TopicNames.TopicWildcard, EventNames.EventWildcard, this.eventListener.bind(this));
        EventBus.instance.publish(TopicNames.Data, EventNames.DataUpdate, {});
        RunningGameUtils.instance.addGameRunningChangedListener(this.closeListener.bind(this));

        this.drawActivityChart();
        this.setVersion();
        this.setupUser();
        this.resetPhaseLayout();
        this.reset();
    }

    private setupUser(): void {
        if (StatsRepository.instance.stats && StatsRepository.instance.stats.name) {
            this.playerLoggedIn();
        } else {
            this.playerPendingLogin();
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

    private eventListener(topic: string, event: string, data: any): void {
        //console.log(event, JSON.stringify(data));
        switch (event) {
            case EventNames.DataInGame:
                this.inAGame = data;
                break;
            case EventNames.MapChanged:
                this.roundStart(data);
                break;
            case EventNames.RosterUpdate:
                this.updateRoster(data);
                break;
            case EventNames.GameEventKill:
                this.updateStats(data);
                break;
            case EventNames.PhaseTicker:
                this.updateGameTicker(data);
                break;
            case EventNames.PhaseUpdate:
                this.updatePhase(data);
                break;
            case EventNames.PhaseMaps:
                this.updatePhaseLayout(data);
                break;
            case EventNames.PhaseGameLength:
                this.gameLength = data;
                break;
            case EventNames.GameEventLocation:
                this.showPlayer(data);
                break;
            case EventNames.ProcessorGetPlayerError:
                this.connectionFailure();
                break;
            case EventNames.StatsPlayerNameSet:
            case EventNames.PUBGAPIPlayerDataSet:
                this.playerLoggedIn();
                break;
            case EventNames.GamePhaseLobby:
                //this.roundEnd();
                break;
            case EventNames.OptimiserLayout:
                this.setOptimisedLoadout(data);
                break;
            case EventNames.ActivityPhaseUpdate:
                this.updateChart(data);
                break;
            case EventNames.ActivityUpdate:
                this.updateLegends(data);
                break;
        }
    }

    // Loadout

    private setOptimisedLoadout(data: any): void {
        console.log(data);
    }

    // Stats

    private updateStats(data: any): void {
        for (let type in data.match_info) {
            switch (type) {
                case 'kills':
                    $('#stats-kills').html(data.match_info[type]);
                    break;
            }
        }
    }

    // Roster

    private updateRoster(roster: number): void {
        $('#roster-count').html('' + roster);
    }

    // Phase

    private updatePhase(phase: number): void {
        if (!this.inAGame) {
            $('#current-phase').html('--');
            return;
        }

        this.currentPhase = Math.floor(phase);

        $('#current-phase').html('' + ((0 == this.currentPhase) ? '0' : this.currentPhase));
        if ($('#phase-' + this.currentPhase).hasClass('progress-spot')) {
            $('#phase-' + this.currentPhase).addClass('progress-spot-filled');
        }
    }

    private resetPhaseLayout(): void {
        $('#progress-game-ticker').css('width', '0%');
        $('#progress-game-ticker').attr('aria-valuenow', '0');

        for (let i in PHASE_BY_KEY) {
            let element = ('' + PHASE_BY_KEY[i]).replace('.', '');
            let offset = $('#phase-' + element).attr('attr-offset');
            if (element && offset) {
                $('#phase-' + element).css('left', offset + '%');
            }
        }
    }

    private updatePhaseLayout(phases: any): void {
        if (!this.inAGame) {
            return this.resetPhaseLayout();
        }
        this.phases = phases;

        $('.progress-spot').removeClass('progress-spot-filled');
        $('#progress-game-ticker').css('width', '0%');

        for (let phase in this.phases) {
            let offset = Math.round(this.phases[phase] / this.gameLength * 10000) / 100;
            let element = phase.replace('.', '');
            $('#' + element).css('left', offset + '%');
        }
    }

    private updateGameTicker(tick: number): void {
        if (!this.inAGame) {
            return this.resetPhaseLayout();
        }

        let progress = Math.round(tick / this.gameLength * 10000) / 100;

        $('#progress-game-ticker').css('width', progress + '%');
        $('#progress-game-ticker').attr('aria-valuenow', progress);
    }

    // Map

    private showPlayer(data: any): void {
        if (data && data.game_info && data.game_info.location) {
            let location = JSON.parse(data.game_info.location);
            let x = Math.round(location.x / MapSizes[this.map] * 100);
            let y = Math.round(location.y / MapSizes[this.map] * 100);
            $('#map-icon').show().css('left', x + '%').css('top', y + '%');
        }
    }

    // Game

    private roundStart(map: string): void {
        this.reset();
        this.map = map;

        if (!this.inAGame) {
            return;
        }

        $('#stats-kills').html('--');

        $('#map-name').html(TelemetryMap[this.map]);
        $('#map-image').attr('src', '../img/maps/' + this.map + '.png');
    }

    private reset(): void {
        this.resetCharts();

        $('#map-icon').hide();
        $('#map-name').html('--');
        $('#map-image').attr('src', '../img/maps/Placeholder_Main.png');

        $('#stats-kills').html('--');

        $('#roster-count').html('--');
        $('#current-phase').html('--');

        $('#optimal-message').html('Loadouts will only be shown during games');
    }

    // Charts

    private updateChart(data: any): void {
        if (!this.dashboardActivityData) {
            return;
        }

        console.log(data);

        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                this.dashboardActivityData.series[j][i] = data[i][j];
            }
        }

        this.dashboardActivityChart.update(
            this.dashboardActivityData,
            this.dashboardActivityOptions
        );
    }

    private updateLegends(data: any): void {
        for(let index in data) {
            $('#legend-' + index).html(data[index]);
        }
    }

    private resetCharts(): void {
        if (!this.dashboardActivityData) {
            return;
        }

        this.dashboardActivityData.series = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];

        this.dashboardActivityChart.update(
            this.dashboardActivityData,
            this.dashboardActivityOptions
        );

        for(let i = 0; i < DashboardController.LEGENDS.length; i++) {
            $('#legend-' + DashboardController.LEGENDS[i]).html('--');
        }
    }

    private drawActivityChart(): void {
        this.dashboardActivityData = {
            labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8'],
            series: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        };

        this.dashboardActivityOptions = {
            chartPadding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
        };

        this.dashboardActivityChart = new Chartist.Line(
            '#dashboard-activity-chart',
            this.dashboardActivityData,
            this.dashboardActivityOptions
        );
    }

    // App version

    private setVersion(): void {
        $('#app-version small').html(App.VERSION);
    }
}
