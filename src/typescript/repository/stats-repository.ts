export class StatsRepository {

    public stats: any = {};

    private constructor() {
    }

    public static get instance(): StatsRepository {
        if (!(<any>overwolf.windows.getMainWindow()).pubgistics_stats_repository) {
            (<any>overwolf.windows.getMainWindow()).pubgistics_stats_repository = new StatsRepository;
        }
        return (<any>overwolf.windows.getMainWindow()).pubgistics_stats_repository;
    }
}
