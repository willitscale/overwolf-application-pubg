type GameRunningChangedListener = {
  (payload?: any): void;
};

type GameInformation = {
  gameWidth: number;
  gameHeight: number;
  screenWidth: number;
  screenHeight: number;
};

type GameInfoUpdatedEvent = {
  gameInfo: {
    isRunning: any;
  };
  resolutionChanged: any;
  runningChanged: any;
  gameChanged: any;
};

type DimensionChangeEvent = {
  isRunning?: any;
  width?: any;
  height?: any;
  logicalWidth?: any;
  logicalHeight?: any;
};

export class RunningGameService {

  public gameInfo: GameInformation = {
    gameWidth: 0,
    gameHeight: 0,
    screenWidth: 0,
    screenHeight: 0
  };

  private readonly _gameRunningChangedListeners: GameRunningChangedListener[] = [];

  protected constructor() {
    overwolf.games.onGameInfoUpdated.removeListener(this._onGameInfoUpdated.bind(this));
    overwolf.games.onGameInfoUpdated.addListener(this._onGameInfoUpdated.bind(this));
  }

  static get instance(): RunningGameService {
    if (!(<any>overwolf.windows.getMainWindow()).pubgistics_runningGameService) {
      (<any>overwolf.windows.getMainWindow()).pubgistics_runningGameService = new RunningGameService;
    }
    return (<any>overwolf.windows.getMainWindow()).pubgistics_runningGameService;
  }

  private _onGameInfoUpdated(event: GameInfoUpdatedEvent) {
    let gameRunning;
    this.setDimensions(event.gameInfo);
    if (event && (event.resolutionChanged || event.runningChanged || event.gameChanged)) {
      gameRunning = (event.gameInfo && event.gameInfo.isRunning);
      for (let listener of this._gameRunningChangedListeners) {
        listener(gameRunning);
      }
    }
  }

  public async isGameRunning() {
    let gameRunning = await this._isGameRunning();
    return gameRunning;
  }

  private _isGameRunning() {
    let that = this;
    return new Promise((resolve => {
      overwolf.games.getRunningGameInfo(function (event) {
        let isRunning = event && event.isRunning;
        that.setDimensions(event);
        resolve(isRunning);
      });
    }));
  }

  public addGameRunningChangedListener(callback: GameRunningChangedListener) {
    this._gameRunningChangedListeners.push(callback);
  }

  private setDimensions(event: DimensionChangeEvent) {
    if (event) {
      this.gameInfo.gameWidth = event.width;
      this.gameInfo.gameHeight = event.height;
      this.gameInfo.screenWidth = event.logicalWidth;
      this.gameInfo.screenHeight = event.logicalHeight;
    }
  }

  public actualWidth(width: any) {
    return Math.round(this.gameInfo.screenWidth / this.gameInfo.gameWidth * width);
  }

  public actualHeight(height: any) {
    return Math.round(this.gameInfo.screenHeight / this.gameInfo.gameHeight * height);
  }
}