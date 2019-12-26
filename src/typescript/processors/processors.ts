import request from "request";
import { EventBus } from "../services/event-bus";
import { Timings } from "../constants/timings";
import { EventNames } from "../constants/event-names";
import { TopicNames } from "../constants/topic-names";

export class Processors {

    private static readonly MAX_ATTEMPTS: number = 3;
    
    private readonly AWS_API_GATEWAY: string = 'https://7rgepz5fa8.execute-api.eu-west-1.amazonaws.com/pubg/';
    private readonly PUBG_API_PLATFORM: string = 'steam';
    private readonly HTTP_OPTIONS: object = {
        json: true
    };

    private getAPI(path: string, type: string, callback: any, attempts: number): void {
        let that = this;
        if (attempts < Processors.MAX_ATTEMPTS) {
            request.get(
                this.buildURL(path),
                this.HTTP_OPTIONS,
                (err: any, res: any, body: any) => {
                    if (err) {
                        setTimeout(
                            () => {
                                that.getAPI(path, type, callback, attempts+1);
                            },
                            Timings.TIMEOUT_SECOND
                        );
                    } else {
                        callback(err, res, body);
                    }
                }
            );
        } else {
            EventBus.instance.publish(TopicNames.Processor, type, {"path":path});
            setTimeout(
                () => {
                    that.getAPI(path, type, callback, attempts+1);
                },
                Timings.MINUTE * Timings.TIMEOUT_SECOND
            );
        }
    }

    private buildURL(path: string): string {
        return this.AWS_API_GATEWAY + this.PUBG_API_PLATFORM + path;
    }

    protected getRaw(path: string, callback: any): any {
        return request.get(
            path,
            this.HTTP_OPTIONS,
            callback
        );
    }

    protected getPlayerByName(name: string, callback: (err: any, res: any, body: any) => void): void {
        this.getAPI(
            '/players?filter[playerNames]=' + name,
            EventNames.ProcessorGetPlayerError,
            callback,
            0
        );
    }

    protected getPlayerLifetimeSeasonStats(accountId: string, callback: (err: any, res: any, body: any) => void): void {
        this.getAPI(
            '/players/' + accountId + '/seasons/lifetime',
            EventNames.ProcessorGetLifetimeError,
            callback,
            0
        );
    }

    protected getPlayerSeasonStats(accountId: string, season: string, callback: (err: any, res: any, body: any) => void): void {
        this.getAPI(
            '/players/' + accountId + '/seasons/' + season,
            EventNames.ProcessorGetSeasonStatsError,
            callback,
            0
        );
    }

    protected getMatch(matchId: string, callback: (err: any, res: any, body: any) => void): void {
        this.getAPI(
            '/matches/' + matchId,
            EventNames.ProcessorGetMatchError,
            callback,
            0
        );
    }

    protected getSeasons(callback: (err: any, res: any, body: any) => void): void {
        this.getAPI(
            '/seasons',
            EventNames.ProcessorGetSeasonsError,
            callback,
            0
        );
    }
}
