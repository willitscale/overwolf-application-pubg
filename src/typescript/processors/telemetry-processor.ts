import { Processors } from "./processors";
import { EventBus } from "../services/event-bus";
import { EventNames } from "../constants/event-names";
import { StatsRepository } from "../repository/stats-repository";
import { MatchRepository } from "../repository/match-repository";
import { MatchState } from "../constants/match-state";
import { TopicNames } from "../constants/topic-names";

export class QueuedItem {
    public matchId: string;
    public url: string;
    public map: string;
    public data: any;

    public constructor(matchId: string, url: string, map: string, data?: any) {
        this.matchId = matchId;
        this.url = url;
        this.map = map;
        this.data = data;
    }
}

export class TelemetryProcessor extends Processors {

    public static readonly IGNORE_MAP = 'Range_Main';

    private static readonly LISTENER_DELAY = 1000;

    private static readonly MAX_PROCESSING = 5;
    private static readonly MAX_DOWNLOADING = 5;

    static getRollup(): {} {
        return {
            shotCount: 0,
            hitCount: 0,
            knockCount: 0,
            killCount: 0,
            hitCountByLocation: {
                ArmShot: 0,
                HeadShot: 0,
                TorsoShot: 0,
                PelvisShot: 0,
                LegShot: 0,
                None: 0,
                NonSpecific: 0
            }
        };
    }

    private downloadQueue: Array<QueuedItem> = [];
    private processQueue: Array<QueuedItem> = [];

    private downloading: number = 0;
    private processing: number = 0;

    private downloadInGame: boolean = false;
    private downloadAsynchronous: boolean = false;

    private processInGame: boolean = false;
    private processThreaded: boolean = false;

    private inAGame: boolean = false;

    public constructor() {
        super();
        this.loadMatches();
    }

    public listen(): void {
        EventBus.instance.subscribe('telemetry-service', TopicNames.Data, EventNames.DataInGame, this.eventListener.bind(this));
    }

    public eventListener(topic: string, event: string, data: any): void {
        switch (event) {
            case EventNames.DataInGame:
                this.inAGame = data;
                break;
        }
    }

    private loadMatches() {
        for (let i in MatchRepository.instance.matches) {
            let matchData = MatchRepository.instance.matches[i];
            if (matchData.state != MatchState.COMPLETED) {
                this.addToDownloadQueue(matchData.matchId, matchData.url, matchData.map);
            }
        }
        this.downloadListener();
        this.processListener();
    }

    public getTelemetry(matchId: string, url: string, map: string): () => void {
        if (TelemetryProcessor.IGNORE_MAP == map) {
            return () => { };
        }

        let that = this;
        return () => {
            that.addToDownloadQueue(matchId, url, map);
        };
    }

    private addToDownloadQueue(matchId: string, url: string, map: string): void {
        EventBus.instance.publish(TopicNames.Match, EventNames.MatchDownloadQueued, matchId);
        this.downloadQueue.push(new QueuedItem(matchId, url, map));
    }

    private downloadListener(): void {
        let that = this;
        let listener = () => {
            // Don't allow downloads in game
            if (!this.downloadInGame && this.inAGame) {
                setTimeout(listener, TelemetryProcessor.LISTENER_DELAY);
                return;
            }

            // Are there any queued downloads?
            if (0 >= that.downloadQueue.length) {
                setTimeout(listener, TelemetryProcessor.LISTENER_DELAY);
                return;
            }

            let maxDownloads = this.downloadAsynchronous ? TelemetryProcessor.MAX_DOWNLOADING : 1;


            // Don't exceed maximum simultaneous downloads
            if (that.downloading >= maxDownloads) {
                setTimeout(listener, TelemetryProcessor.LISTENER_DELAY);
                return;
            }

            that.downloading++;
            that.download(that.downloadQueue.shift());
            listener();
        };

        listener();
    }

    private download(queuedItem?: QueuedItem): void {
        if (!queuedItem) {
            return;
        }

        EventBus.instance.publish(TopicNames.Match, EventNames.MatchDownloading, queuedItem.matchId);

        this.getRaw(
            queuedItem.url,
            this.addToProcessingQueue(queuedItem)
        );
    }

    private addToProcessingQueue(queuedItem: QueuedItem): (err: any, res: any, body: any) => void {
        let that = this;
        return (err: any, res: any, body: any) => {
            if (err || !body) {
                return;
            }
            that.downloading--;
            queuedItem.data = body;
            that.processQueue.push(queuedItem);
            EventBus.instance.publish(TopicNames.Match, EventNames.MatchDownloading, queuedItem.matchId);
        };
    }

    private processListener(): void {
        let that = this;
        let listener = () => {
            // Don't process data in game
            if (!this.processInGame && this.inAGame) {
                setTimeout(listener, TelemetryProcessor.LISTENER_DELAY);
                return;
            }

            // Are there any queued processes?
            if (0 >= that.processQueue.length) {
                setTimeout(listener, TelemetryProcessor.LISTENER_DELAY);
                return;
            }

            let maxThreads = this.processThreaded ? TelemetryProcessor.MAX_PROCESSING : 1;

            // Don't exceed maximum simultaneous threads
            if (that.processing >= maxThreads) {
                setTimeout(listener, TelemetryProcessor.LISTENER_DELAY);
                return;
            }

            that.processing++;
            that.process(that.processQueue.shift());
            listener();
        };

        listener();
    }

    private process(queuedItem?: QueuedItem): void {
        if (!queuedItem) {
            return;
        }

        EventBus.instance.publish(TopicNames.Match, EventNames.MatchProcessing, queuedItem.matchId);

        if (!StatsRepository.instance.stats.optimiser) {
            StatsRepository.instance.stats.optimiser = {};
        }

        if (TelemetryProcessor.IGNORE_MAP == queuedItem.map) {
            delete queuedItem.data;
            EventBus.instance.publish(TopicNames.Match, EventNames.MatchCompleted, queuedItem.matchId);
            this.processing--;
            return;
        }

        this.setMap(queuedItem.map);

        let character: string = StatsRepository.instance.stats.name;
        let itemsEquiped: any = [];
        let weaponAttachmentsEquiped: any = {};
        let dbno: any = {};
        let started = true;
        let currentPhase = -1;

        for (let i in queuedItem.data) {

            let event = queuedItem.data[i];
            let phase = 'phase_' + currentPhase;

            if ('LogGameStatePeriodic' == event._T) {
                let tmpPhase = (event.common.isGame < 1) ? "0" : event.common.isGame
                if (tmpPhase != currentPhase) {
                    currentPhase = tmpPhase;
                    phase = 'phase_' + currentPhase;
                    this.setPhase(queuedItem.map, phase);
                    for (let i in itemsEquiped) {
                        let weapon = itemsEquiped[i];
                        this.setWeapon(queuedItem.map, phase, weapon);
                        for (let j in weaponAttachmentsEquiped[weapon]) {
                            let attachment = weaponAttachmentsEquiped[weapon][j];
                            this.setAttachment(queuedItem.map, phase, weapon, attachment);
                        }
                    }
                }
            }

            if ('LogMatchStart' == event._T) {
                started = true;
            }

            if (!started) {
                continue;
            }

            if ('LogItemAttach' == event._T && character == event.character.name) {
                let weapon = event.parentItem.itemId;
                let attachment = event.childItem.itemId;
                this.setAttachment(queuedItem.map, phase, weapon, attachment);
                weaponAttachmentsEquiped[weapon].push(attachment);
            }

            if ('LogItemDetach' == event._T && character == event.character.name) {
                let weapon = event.parentItem.itemId;
                let attachment = event.childItem.itemId;
                weaponAttachmentsEquiped[weapon].splice(weaponAttachmentsEquiped[weapon].indexOf(attachment), 1);
            }

            if ('LogPlayerMakeGroggy' == event._T && event.attacker.name == character) {
                dbno['_' + event.dBNOId] = {
                    damageReason: event.damageReason,
                    damageTypeCategory: event.damageTypeCategory,
                    damageCauserName: event.damageCauserName,
                    damageCauserAdditionalInfo: event.damageCauserAdditionalInfo
                };
            }

            if ('LogPlayerKill' == event._T && event.killer.name == character) {

                let dbnoData: any;

                // Use the DBNO item if required

                if (event.dBNOId == -1 || !dbno['_' + event.dBNOId]) {
                    dbnoData = {
                        damageReason: event.damageReason,
                        damageTypeCategory: event.damageTypeCategory,
                        damageCauserName: event.damageCauserName,
                        damageCauserAdditionalInfo: event.damageCauserAdditionalInfo
                    };
                    // This also contains attachment info!
                } else {
                    dbnoData = dbno['_' + event.dBNOId];
                }

                let weapon = this.damageCauserToItem(dbnoData.damageCauserName);

                StatsRepository.instance.stats.optimiser.playerStats.killCount++;
                StatsRepository.instance.stats.optimiser.playerStatsByMap[queuedItem.map].killCount++;
                StatsRepository.instance.stats.optimiser.playerStatsByPhase[phase].killCount++;
                StatsRepository.instance.stats.optimiser.playerStatsByPhaseByMap[queuedItem.map][phase].killCount++;

                if (StatsRepository.instance.stats.optimiser.weaponStats[weapon]) {

                    StatsRepository.instance.stats.optimiser.weaponStats[weapon].killCount++;
                    StatsRepository.instance.stats.optimiser.weaponStatsByMap[queuedItem.map][weapon].killCount++;
                    StatsRepository.instance.stats.optimiser.weaponStatsByPhase[phase][weapon].killCount++;
                    StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap[queuedItem.map][phase][weapon].killCount++;

                    for (let i in weaponAttachmentsEquiped[weapon]) {
                        let attachment = weaponAttachmentsEquiped[weapon][i];

                        StatsRepository.instance.stats.optimiser.weaponByAttachmentStats[weapon][attachment].killCount++;
                        StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByMap[queuedItem.map][weapon][attachment].killCount++;
                        StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhase[phase][weapon][attachment].killCount++;
                        StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap[queuedItem.map][phase][weapon][attachment].killCount++;
                    }
                }
            }

            if ('LogPlayerTakeDamage' == event._T && event.attacker && event.attacker.name == character && event.victim.name != character && 'Damage_Gun' == event.damageTypeCategory) {
                let weapon = this.damageCauserToItem(event.damageCauserName);

                StatsRepository.instance.stats.optimiser.playerStats.hitCount++;
                StatsRepository.instance.stats.optimiser.playerStats.hitCountByLocation[event.damageReason]++;

                StatsRepository.instance.stats.optimiser.playerStatsByMap[queuedItem.map].hitCount++;
                StatsRepository.instance.stats.optimiser.playerStatsByMap[queuedItem.map].hitCountByLocation[event.damageReason]++;

                StatsRepository.instance.stats.optimiser.playerStatsByPhase[phase].hitCount++;
                StatsRepository.instance.stats.optimiser.playerStatsByPhase[phase].hitCountByLocation[event.damageReason]++;

                StatsRepository.instance.stats.optimiser.playerStatsByPhaseByMap[queuedItem.map][phase].hitCount++;
                StatsRepository.instance.stats.optimiser.playerStatsByPhaseByMap[queuedItem.map][phase].hitCountByLocation[event.damageReason]++;

                StatsRepository.instance.stats.optimiser.weaponStats[weapon].hitCount++;
                StatsRepository.instance.stats.optimiser.weaponStats[weapon].hitCountByLocation[event.damageReason]++;

                StatsRepository.instance.stats.optimiser.weaponStatsByMap[queuedItem.map][weapon].hitCount++;
                StatsRepository.instance.stats.optimiser.weaponStatsByMap[queuedItem.map][weapon].hitCountByLocation[event.damageReason]++;

                StatsRepository.instance.stats.optimiser.weaponStatsByPhase[phase][weapon].hitCount++;
                StatsRepository.instance.stats.optimiser.weaponStatsByPhase[phase][weapon].hitCountByLocation[event.damageReason]++;

                StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap[queuedItem.map][phase][weapon].hitCount++;
                StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap[queuedItem.map][phase][weapon].hitCountByLocation[event.damageReason]++;

                for (let i in weaponAttachmentsEquiped[weapon]) {
                    let attachment = weaponAttachmentsEquiped[weapon][i];

                    StatsRepository.instance.stats.optimiser.weaponByAttachmentStats[weapon][attachment].hitCount++;
                    StatsRepository.instance.stats.optimiser.weaponByAttachmentStats[weapon][attachment].hitCountByLocation[event.damageReason]++;

                    StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByMap[queuedItem.map][weapon][attachment].hitCount++;
                    StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByMap[queuedItem.map][weapon][attachment].hitCountByLocation[event.damageReason]++;

                    StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhase[phase][weapon][attachment].hitCount++;
                    StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhase[phase][weapon][attachment].hitCountByLocation[event.damageReason]++;

                    StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap[queuedItem.map][phase][weapon][attachment].hitCount++;
                    StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap[queuedItem.map][phase][weapon][attachment].hitCountByLocation[event.damageReason]++;
                }
            }

            if ('LogPlayerAttack' == event._T && event.attacker.name == character && event.weapon.category == 'Weapon') {
                let weapon = event.weapon.itemId;

                StatsRepository.instance.stats.optimiser.playerStats.shotCount++;
                StatsRepository.instance.stats.optimiser.playerStatsByMap[queuedItem.map].shotCount++;

                StatsRepository.instance.stats.optimiser.playerStatsByPhase[phase].shotCount++;
                StatsRepository.instance.stats.optimiser.playerStatsByPhaseByMap[queuedItem.map][phase].shotCount++;

                StatsRepository.instance.stats.optimiser.weaponStats[weapon].shotCount++;
                StatsRepository.instance.stats.optimiser.weaponStatsByMap[queuedItem.map][weapon].shotCount++;

                StatsRepository.instance.stats.optimiser.weaponStatsByPhase[phase][weapon].shotCount++;
                StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap[queuedItem.map][phase][weapon].shotCount++;

                for (let i in weaponAttachmentsEquiped[weapon]) {
                    let attachment = weaponAttachmentsEquiped[weapon][i];

                    StatsRepository.instance.stats.optimiser.weaponByAttachmentStats[weapon][attachment].shotCount++;
                    StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByMap[queuedItem.map][weapon][attachment].shotCount++;

                    StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhase[phase][weapon][attachment].shotCount++;
                    StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap[queuedItem.map][phase][weapon][attachment].shotCount++;
                }
            }

            if ('LogItemEquip' == event._T && character == event.character.name && 'Weapon' == event.item.category) {

                let weapon = event.item.itemId;
                itemsEquiped.push(weapon);

                this.setWeapon(queuedItem.map, phase, weapon);

                if (!weaponAttachmentsEquiped[weapon]) {
                    weaponAttachmentsEquiped[weapon] = [];
                }

                // Attach attachments
                if (event.item.attachedItems) {
                    for (let i = 0; i < event.item.attachedItems.length; i++) {
                        let attachment = event.item.attachedItems[i];
                        this.setAttachment(queuedItem.map, phase, weapon, attachment);
                        weaponAttachmentsEquiped[weapon].push(attachment);
                    }
                }
            }

            if ('LogItemUnequip' == event._T && character == event.character.name && 'Weapon' == event.item.category) {
                let weapon = event.item.itemId;
                itemsEquiped.splice(itemsEquiped.indexOf(weapon), 1);
            }
        }

        delete queuedItem.data;
        EventBus.instance.publish(TopicNames.Match, EventNames.MatchCompleted, queuedItem.matchId);
        this.processing--;
        EventBus.instance.publish(TopicNames.Match, EventNames.StatsSave, {});
    }

    private setMap(map: string): void {
        // Player Stats

        if (!StatsRepository.instance.stats.optimiser.playerStats) {
            StatsRepository.instance.stats.optimiser.playerStats = TelemetryProcessor.getRollup();
        }

        if (!StatsRepository.instance.stats.optimiser.playerStatsByMap) {
            StatsRepository.instance.stats.optimiser.playerStatsByMap = {};
        }

        if (!StatsRepository.instance.stats.optimiser.playerStatsByMap[map]) {
            StatsRepository.instance.stats.optimiser.playerStatsByMap[map] = TelemetryProcessor.getRollup();
        }

        // Weapon Stats

        if (!StatsRepository.instance.stats.optimiser.weaponStats) {
            StatsRepository.instance.stats.optimiser.weaponStats = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponStatsByMap) {
            StatsRepository.instance.stats.optimiser.weaponStatsByMap = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponStatsByMap[map]) {
            StatsRepository.instance.stats.optimiser.weaponStatsByMap[map] = {};
        }

        // Weapons Attachement

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStats) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStats = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByMap) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByMap = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByMap[map]) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByMap[map] = {};
        }

        // Weapons Attachement Phase

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhase) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhase = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap[map]) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap[map] = {};
        }

        // Player Stats Phase

        if (!StatsRepository.instance.stats.optimiser.playerStatsByPhase) {
            StatsRepository.instance.stats.optimiser.playerStatsByPhase = {};
        }

        if (!StatsRepository.instance.stats.optimiser.playerStatsByPhaseByMap) {
            StatsRepository.instance.stats.optimiser.playerStatsByPhaseByMap = {};
        }

        if (!StatsRepository.instance.stats.optimiser.playerStatsByPhaseByMap[map]) {
            StatsRepository.instance.stats.optimiser.playerStatsByPhaseByMap[map] = {};
        }

        // Weapon Stats Phase

        if (!StatsRepository.instance.stats.optimiser.weaponStatsByPhase) {
            StatsRepository.instance.stats.optimiser.weaponStatsByPhase = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap) {
            StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap[map]) {
            StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap[map] = {};
        }

        // Player Stats

        if (!StatsRepository.instance.stats.optimiser.playerStats) {
            StatsRepository.instance.stats.optimiser.playerStats = TelemetryProcessor.getRollup();
        }

        if (!StatsRepository.instance.stats.optimiser.playerStatsByMap) {
            StatsRepository.instance.stats.optimiser.playerStatsByMap = {};
        }

        if (!StatsRepository.instance.stats.optimiser.playerStatsByMap[map]) {
            StatsRepository.instance.stats.optimiser.playerStatsByMap[map] = TelemetryProcessor.getRollup();
        }

        // Weapon Stats

        if (!StatsRepository.instance.stats.optimiser.weaponStats) {
            StatsRepository.instance.stats.optimiser.weaponStats = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponStatsByMap) {
            StatsRepository.instance.stats.optimiser.weaponStatsByMap = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponStatsByMap[map]) {
            StatsRepository.instance.stats.optimiser.weaponStatsByMap[map] = {};
        }

        // Weapons Attachement

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStats) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStats = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByMap) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByMap = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByMap[map]) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByMap[map] = {};
        }

        // Weapons Attachement Phase

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhase) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhase = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap[map]) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap[map] = {};
        }

        // Player Stats Phase

        if (!StatsRepository.instance.stats.optimiser.playerStatsByPhase) {
            StatsRepository.instance.stats.optimiser.playerStatsByPhase = {};
        }

        if (!StatsRepository.instance.stats.optimiser.playerStatsByPhaseByMap) {
            StatsRepository.instance.stats.optimiser.playerStatsByPhaseByMap = {};
        }

        if (!StatsRepository.instance.stats.optimiser.playerStatsByPhaseByMap[map]) {
            StatsRepository.instance.stats.optimiser.playerStatsByPhaseByMap[map] = {};
        }

        // Weapon Stats Phase

        if (!StatsRepository.instance.stats.optimiser.weaponStatsByPhase) {
            StatsRepository.instance.stats.optimiser.weaponStatsByPhase = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap) {
            StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap[map]) {
            StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap[map] = {};
        }

    }

    private setPhase(map: string, phase: string): void {
        if (!StatsRepository.instance.stats.optimiser.playerStatsByPhase[phase]) {
            StatsRepository.instance.stats.optimiser.playerStatsByPhase[phase] = TelemetryProcessor.getRollup();
        }

        if (!StatsRepository.instance.stats.optimiser.playerStatsByPhaseByMap[map][phase]) {
            StatsRepository.instance.stats.optimiser.playerStatsByPhaseByMap[map][phase] = TelemetryProcessor.getRollup();
        }

        if (!StatsRepository.instance.stats.optimiser.weaponStatsByPhase[phase]) {
            StatsRepository.instance.stats.optimiser.weaponStatsByPhase[phase] = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap[map][phase]) {
            StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap[map][phase] = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhase[phase]) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhase[phase] = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap[map][phase]) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap[map][phase] = {};
        }

    }

    private setWeapon(map: string, phase: string, weapon: string): void {
        if (!StatsRepository.instance.stats.optimiser.weaponStats[weapon]) {
            StatsRepository.instance.stats.optimiser.weaponStats[weapon] = TelemetryProcessor.getRollup();
        }

        if (!StatsRepository.instance.stats.optimiser.weaponStatsByMap[map][weapon]) {
            StatsRepository.instance.stats.optimiser.weaponStatsByMap[map][weapon] = TelemetryProcessor.getRollup();
        }

        if (!StatsRepository.instance.stats.optimiser.weaponStatsByPhase[phase][weapon]) {
            StatsRepository.instance.stats.optimiser.weaponStatsByPhase[phase][weapon] = TelemetryProcessor.getRollup();
        }

        if (!StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap[map][phase][weapon]) {
            StatsRepository.instance.stats.optimiser.weaponStatsByPhaseByMap[map][phase][weapon] = TelemetryProcessor.getRollup();
        }

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStats[weapon]) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStats[weapon] = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByMap[map][weapon]) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByMap[map][weapon] = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhase[phase][weapon]) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhase[phase][weapon] = {};
        }

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap[map][phase][weapon]) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap[map][phase][weapon] = {};
        }
    }

    private setAttachment(map: string, phase: string, weapon: string, attachment: string): void {

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStats[weapon][attachment]) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStats[weapon][attachment] = TelemetryProcessor.getRollup();
        }

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByMap[map][weapon][attachment]) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByMap[map][weapon][attachment] = TelemetryProcessor.getRollup();
        }

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhase[phase][weapon][attachment]) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhase[phase][weapon][attachment] = TelemetryProcessor.getRollup();
        }

        if (!StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap[map][phase][weapon][attachment]) {
            StatsRepository.instance.stats.optimiser.weaponByAttachmentStatsByPhaseByMap[map][phase][weapon][attachment] = TelemetryProcessor.getRollup();
        }
    }

    private damageCauserToItem(damageCauser: string): string {
        if ('WeapCrossbow_1_C' == damageCauser) {
            return 'Item_Weapon_Crossbow_C';
        } else if ('WeapWin94_C' == damageCauser) {
            return 'Item_Weapon_Win1894_C';
        }
        return damageCauser.replace('Weap', 'Item_Weapon_');
    }
}