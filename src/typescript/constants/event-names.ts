import { MappingString } from "./mappings";

export const EventNames: MappingString = {

    // All Events
    EventWildcard: '*',

    // Match Events
    MatchSetAll: 'match-set-all',
    MatchDownloadQueued: 'match-download-queued',
    MatchDownloading: 'match-downloading',
    MatchProcessQueued: 'match-process-queued',
    MatchProcessing: 'match-processing',
    MatchCompleted: 'match-completed',
    MatchUpdated: 'match-updated',
    MatchAdd: 'match-add',

    // Data Events
    DataInGame: 'data_in_game',
    DataUpdateService: 'update_data_service',
    DataUpdateStats: 'data_update_stats',
    DataUpdate: 'data_update',

    // Stats Events
    StatsSetName: 'stats-set-name',
    StatsPlayerNameSet: 'player_name_set',
    StatsSetAll: 'stats-set-all',
    StatsSave: 'stats_save',
    StatsWeaponUpdate: 'update-weapon-stats',
    StatsAllSet: 'stats-all-set',

    // Phase Events
    PhaseGameLength: 'phase_game_length',
    PhaseMaps: 'phase_maps',
    PhaseTicker: 'phase_ticker',
    PhaseUpdate: 'phase_update',

    // Settings Events
    SettingsSetAll: 'settings-set-all',
    SettingsUpdate: 'settings-update',
    SettingsToggle: 'settings-toggle',
    SettingsPublish: 'settings-publish',
    SettingsSet: 'setting-set',

    // Map Events
    MapChanged: 'map_changed',

    // Roster Events
    RosterUpdate: 'roster_update',

    // Optimiser Events
    OptimiserLayout: 'optimiser_layout',

    // API Events
    APISeasonsData: 'api_seasons_data',
    APIPlayerData: 'api_player_data',
    APICurrentSeason: 'api_current_season',
    APIPlayerStats: 'api_player_stats',

    // PUBGAPI Events
    PUBGAPIPlayerDataSet: 'player_data_set',

    // Processor Events
    ProcessorGetPlayerError: 'get_player_error',
    ProcessorGetLifetimeError: 'get_lifetime_error',
    ProcessorGetSeasonStatsError: 'get_season_stats_error',
    ProcessorGetMatchError: 'get_match_error',
    ProcessorGetSeasonsError: 'get_seasons_error',

    // Item Events
    InventoryItemCollected: 'item_collected',
    InventoryItemDropped: 'item_dropped',
    InventoryItemEquipped: 'item_equipped',
    InventoryItemUnequipped: 'item_unequipped',

    // Background Controller Events
    BackgroundControllerGameStarted: 'game_started',

    // Me Events
    MeAiming: 'me_aiming',
    MeStanceCrouched: 'me_stance_crouch',
    MeStanceProne: 'me_stance_prone',
    MeStanceNormal: 'me_stance_normal',
    MeBodyPosition: 'me_body_position',
    MeEnteredVehicle: 'me_entered_vehicle',
    MeLeftVehicle: 'me_left_vehicle',
    MeFreeView: 'me_free_view',
    MeMovementFast: 'me_movement_fast',
    MeMovementStealth: 'me_movement_stealth',
    MeMovementNormal: 'me_movement_normal',
    MeName: 'me_name',
    MeView: 'me_view',

    // Monitor Events
    UpdateMonitors: 'update_monitors',

    // Game Phase Events
    GamePhaseLobby: 'game_phase_lobby',
    GamePhaseLoadingScreen: 'game_phase_loading_screen',
    GamePhaseAircraft: 'game_phase_aircraft',
    GamePhaseAirfield: 'game_phase_airfield',

    // GEP Events
    GEPKill: 'event_kill',

    // Game Events
    GameEventKill: 'kill',
    GameEventRevived: 'revived',
    GameEventDeath: 'death',
    GameEventKiller: 'killer',
    GameEventMatch: 'match',
    GameEventRank: 'rank',
    GameEventLocation: 'location',
    GameEventMe: 'me',
    GameEventTeam: 'team',
    GameEventPhase: 'phase',
    GameEventMap: 'map',
    GameEventRoster: 'roster',
    GameEventInventory: 'inventory',
    GameEventMatchInfo: 'match_info',

    // Custom Game Events
    GameEventKnockedOut: 'knockedout',
    GameEventFire: 'fire',
    GameEventDamageTaken: 'damageTaken',
    GameEventPhaseFreeFly: 'game_phase_freefly',

    // Activity Events
    ActivityPhaseUpdate: 'activity_phase_update',
    ActivityUpdate: 'activity_update',

};