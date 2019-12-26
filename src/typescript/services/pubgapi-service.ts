import { TelemetryProcessor } from "../processors/telemetry-processor";
import { Processors } from "../processors/processors";
import { EventBus } from "./event-bus";
import { Timings } from "../constants/timings";
import { EventNames } from "../constants/event-names";
import { StatsRepository } from "../repository/stats-repository";
import { TopicNames } from "../constants/topic-names";

export class PUBGAPIService extends Processors {

    private telemetryProcessor: TelemetryProcessor = new TelemetryProcessor();

    private constructor() {
        super();
    }

    public static get instance(): PUBGAPIService {
        if (!(<any>window).pubgistics_api) {
            (<any>window).pubgistics_api = new PUBGAPIService;
        }
        return (<any>window).pubgistics_api;
    }

    public listen(): void {
        let topics = [
            TopicNames.BackgroundController,
            TopicNames.Stats
        ];

        let events = [
            EventNames.BackgroundControllerGameStarted,
            EventNames.StatsPlayerNameSet
        ];

        EventBus.instance.subscribe('pubgapi-service', topics, events, this.eventListener.bind(this));
    }

    private eventListener(topic: string, event: string, data: any): void {
        switch (event) {
            case EventNames.BackgroundControllerGameStarted:
            case EventNames.StatsPlayerNameSet:
            this.getPlayerData();
            break;
        }
    }

    /**
     * Player Data
     */

    public getPlayerData(): void {
        if (!StatsRepository.instance.stats || !StatsRepository.instance.stats.name) {
            return;
        }

        let timeDiff = (new Date().getTime() - StatsRepository.instance.stats.lastUpdated) / 1000;
        
        if (timeDiff >= Timings.MINUTE * 20 || !StatsRepository.instance.stats.id) {
            this.getPlayerByName(
                StatsRepository.instance.stats.name,
                this.updatePlayerData.bind(this)
            );
        }
    }

    private updatePlayerData(err: any, res: any, body: any): void {
        if (body.data && body.data.length == 1) {
            EventBus.instance.publish(TopicNames.PUBG, EventNames.PUBGAPIPlayerDataSet, {});
            let playerData = body.data[0];
            StatsRepository.instance.stats.id = playerData.id;
            if (playerData.relationships && playerData.relationships.matches) {
                let matches = playerData.relationships.matches.data;
                if (!StatsRepository.instance.stats.matches) {
                    StatsRepository.instance.stats.matches = [];
                }
                for (let i in matches) {
                    let match = matches[i].id;
                    if (-1 == StatsRepository.instance.stats.matches.indexOf(match)) {
                        StatsRepository.instance.stats.matches.push(match);
                    }
                }

            }
            EventBus.instance.publish(TopicNames.PUBG, EventNames.APIPlayerData, {});
            EventBus.instance.publish(TopicNames.PUBG, EventNames.StatsSave, {});
            this.getSeasonsData();
        }
    }

    /**
     * Season Data
     */

    public getSeasonsData(): void {
        this.getSeasons(
            this.updateSeasons.bind(this)
        );
    }

    private updateSeasons(err: any, res: any, body: any): void {
        StatsRepository.instance.stats.seasons = body.data;
        for (let i in body.data) {
            let season = body.data[i];
            if (season.attributes.isCurrentSeason || season.attributes.isOffseason) {
                StatsRepository.instance.stats.currentSeasonId = season.id;
            }
        }

        EventBus.instance.publish(TopicNames.PUBG, EventNames.APISeasonsData, {});
        EventBus.instance.publish(TopicNames.PUBG, EventNames.StatsSave, {});
        this.getCurrentSeason();
    }

    /**
     * Current Season
     */

    public getCurrentSeason(): void {
        if (undefined != typeof StatsRepository.instance.stats.currentSeasonId) {
            this.getPlayerSeasonStats(
                StatsRepository.instance.stats.id,
                StatsRepository.instance.stats.currentSeasonId,
                this.updateCurrentSeason.bind(this)
            );
        } else {
            this.getPlayerStats();
        }
    }

    private updateCurrentSeason(err: any, res: any, body: any): void {
        StatsRepository.instance.stats.currentAttributes = body.data.attributes.gameModeStats;
        
        EventBus.instance.publish(TopicNames.PUBG, EventNames.APICurrentSeason, {});
        EventBus.instance.publish(TopicNames.PUBG, EventNames.StatsSave, {});

        this.getPlayerStats();
    }

    /**
     * Player Stats
     */

    public getPlayerStats(): void {
        this.getPlayerLifetimeSeasonStats(
            StatsRepository.instance.stats.id,
            this.updatePlayerStats.bind(this)
        );
    }

    private updatePlayerStats(err: any, res: any, body: any): void {
        StatsRepository.instance.stats.attributes = body.data.attributes.gameModeStats;
        
        EventBus.instance.publish(TopicNames.PUBG, EventNames.APIPlayerStats, {});
        EventBus.instance.publish(TopicNames.PUBG, EventNames.StatsSave, {});
        
        this.getMatchesData();
    }

    /**
     * Match Data
     */

    public getMatchesData(): void {
        if (!StatsRepository.instance.stats.matches) {
            return;
        }

        for (let i in StatsRepository.instance.stats.matches) {
            let matchId = StatsRepository.instance.stats.matches[i];

            if (!StatsRepository.instance.stats.matchHistory) {
                StatsRepository.instance.stats.matchHistory = {};
            }

            if (!StatsRepository.instance.stats.mapGameMapping) {
                StatsRepository.instance.stats.mapGameMapping = {};
            }

            if (!StatsRepository.instance.stats.matchHistory[matchId]) {
                this.getMatch(
                    matchId,
                    this.updateMatchData.bind(this, matchId)
                );
            }
        }
    }

    private updateMatchData(matchId: string, err: any, res: any, body: any): void {
        if (err || !body || body.errors) {
            StatsRepository.instance.stats.matchHistory[matchId] = {};
            EventBus.instance.publish(TopicNames.PUBG, EventNames.StatsSave, {});
            return;
        }

        let game = {
            id: matchId,
            created: body.data.attributes.createdAt,
            mode: body.data.attributes.gameMode,
            map: body.data.attributes.mapName,
            telemetry: '',
            damage: 0,
            kills: 0
        };

        for (let i in body.included) {
            let element = body.included[i];
            if ('asset' == element.type) {
                game.telemetry = element.attributes.URL;
            } else if ('participant' == element.type &&
                StatsRepository.instance.stats.id == element.attributes.playerId) {
                game.damage = element.attributes.damageDealt;
                game.kills = element.attributes.kills;
            }
        }

        if (!StatsRepository.instance.stats.mapGameMapping[game.map]) {
            StatsRepository.instance.stats.mapGameMapping[game.map] = [];
        }

        body = null;

        EventBus.instance.publish(TopicNames.PUBG, EventNames.MatchAdd, matchId);
        
        StatsRepository.instance.stats.mapGameMapping[game.map].push(matchId);
        StatsRepository.instance.stats.matchHistory[matchId] = game;
        
        EventBus.instance.publish(TopicNames.PUBG, EventNames.StatsSave, {});

        this.telemetryProcessor.getTelemetry(matchId, game.telemetry, game.map);
    }
}
