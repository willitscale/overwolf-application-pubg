import { TelemetryItem } from "../constants/telemetry-item";
import { EventBus } from "./event-bus";
import { EventNames } from "../constants/event-names";
import { StatsRepository } from "../repository/stats-repository";
import { TopicNames } from "../constants/topic-names";

export class OptimiserService {

    private map: string = '';
    private phase: number = 0;
    private inAGame: boolean = false;

    private constructor() {
    }

    static get instance(): OptimiserService {
        if (!(<any>overwolf.windows.getMainWindow()).pubgistics_optimiser_service) {
            (<any>overwolf.windows.getMainWindow()).pubgistics_optimiser_service = new OptimiserService;
        }
        return (<any>overwolf.windows.getMainWindow()).pubgistics_optimiser_service;
    }

    public listen(): void {
        let topics = [
            TopicNames.Game,
            TopicNames.Map,
            TopicNames.Phase,
            TopicNames.Stats
        ];

        let events = [
            EventNames.GameEventPhase,
            EventNames.MapChanged,
            EventNames.PhaseUpdate,
            EventNames.StatsWeaponUpdate
        ];

        EventBus.instance.subscribe('optimiser-service', topics, events, this.eventListener.bind(this));
    }

    private eventListener(topic: string, event: string, data: any): void {
        switch (event) {
            case EventNames.GameEventPhase:
                this.phaseChange(data);
                break;
            case EventNames.MapChanged:
                this.map = data;
                break;
            case EventNames.PhaseUpdate:
                this.phase = data;
            case EventNames.StatsWeaponUpdate:
                this.updateOptimalLoadout();
                break;
        }
    }

    private phaseChange(data: any): void {
        console.log('phaseChange');
        if ('airfield' == data.game_info.phase) {
            this.updateOptimalLoadout();
        }
    }

    private updateOptimalLoadout(): void {
        console.log('updateOptimalLoadout');
        // Not in a game
        if (!this.inAGame) {
            return;
        }

        // No data
        if (!StatsRepository.instance.stats.optimiser) {
            return;
        }

        // No weapon data
        if (!StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap[this.map]) {
            return;
        }

        // No attachment data
        if (!StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap[this.map]['phase_' + this.phase]) {
            return;
        }

        let weapons = StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap[this.map]['phase_' + this.phase];
        let attachments = StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap[this.map]['phase_' + this.phase];
        this.updateOptimalLoadoutByMap(weapons, attachments);
    }

    private updateOptimalLoadoutByMap(weapons: any, attachments: any): void {
        console.log('updateOptimalLoadoutByMap');

        let loadout: any[] = [];

        for (let i in weapons) {
            let weapon = weapons[i];

            let accuracy = 0;

            if (weapon.shotCount > 0) {
                accuracy = Math.round(weapon.hitCount / weapon.shotCount * 10000) / 100;
                if (accuracy > 100) {
                    accuracy = 100;
                }
            }

            if (weapon.shotCount > 0) {
                loadout.push({
                    icon: i,
                    item: TelemetryItem[i],
                    accuracy: accuracy,
                    fired: weapon.shotCount,
                    kill: weapon.killCount,
                    priority: weapon.shotCount * weapon.killCount,
                    layout: {},
                    attachments: []
                });
            }
        }

        loadout = loadout.sort((a: any, b: any) => {
            return b.priority - a.priority;
        });

        for (let i = 0; i < loadout.length; i++) {

            for (let j in attachments[loadout[i].icon]) {
                let attachment = attachments[loadout[i].icon][j];

                let accuracy = 0;

                if (attachment.shotCount > 0) {
                    accuracy = Math.round(attachment.hitCount / attachment.shotCount * 10000) / 100;
                    if (accuracy > 100) {
                        accuracy = 100;
                    }
                }

                if (attachment.shotCount > 0) {
                    loadout[i].attachment.push({
                        icon: j,
                        item: TelemetryItem[j],
                        accuracy: accuracy,
                        fired: attachment.shotCount,
                        kill: attachment.killCount,
                        priority: attachment.shotCount * attachment.killCount
                    });
                }
            }

            loadout[i].attachment = loadout[i].attachment.sort((a: any, b: any) => {
                return b.priority - a.priority;
            });

            for(let j = 0; j < loadout[i].attachment.length; j++) {
                let attachment = loadout[i].attachment[j];
                let type = this.extractAttachmentType(attachment.icon);
                
                if (type == '') {
                    continue;
                }

                if (!loadout[i].layout[type]) {
                    loadout[i].layout[type] = attachment;
                }
            }
        }

        console.log(loadout);

        EventBus.instance.publish(TopicNames.Optimiser, EventNames.OptimiserLayout, loadout);
    }

    private extractAttachmentType(attachment: string) : string {
        if (attachment.indexOf('_Lower_') !== -1) {
            return 'lower';
        } else if (attachment.indexOf('_Magazine_') !== -1) {
            return 'magazine';
        } else if (attachment.indexOf('_Muzzle_') !== -1) {
            return 'muzzle';
        } else if (attachment.indexOf('_SideRail_') !== -1) {
            return 'siderail';
        } else if (attachment.indexOf('_Stock_') !== -1) {
            return 'stock';
        } else if (attachment.indexOf('_Upper_') !== -1) {
            return 'upper';
        }
        return '';
    }
}