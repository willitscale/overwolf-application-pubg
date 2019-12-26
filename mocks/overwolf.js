class SimpleIOPlugin_Mock {
    get LOCALAPPDATA() {
        return '';
    }
}

class EventListener_Mock {
    publishEvent(event) {
        for (let i in this.callbacks) {
            this.callbacks[i](event);
        }
    }

    addListener(callback) {
        if (!this.callbacks) {
            this.callbacks = {};
        }
        if (typeof callback === "function") {
            this.callbacks[callback.toString()] = callback;
        }
    }

    removeListener(callback) {
        if (!this.callbacks) {
            this.callbacks = {};
        }

        if (typeof callback === "function") {
            delete this.callbacks[callback.toString()];
        }
    }
}

class IO_Mock {
    readFileContents(file, encoding, callback) {
        file = file.replace('\\', '');
        let status = {
            status: "success",
            content: files[file] ? files[file] : "{}"
        };

        if (typeof callback === "function") {
            console.log(status);
            callback(status);
        }
    }

    writeFileContents(file, content, encoding, trigger, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    fileExists(filePath, callback) {
        let status = {
            status: "success",
            found: true
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    copyFile(src, dst, overrideFile, reserved, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }
}

class Media_Mock {
    takeScreenshot(targetFolder, callback) {
        let status = {
            status: "success",
            url: "overwolf://media/screenshots/Streamer%20Alerts/Desktop%20Capture-05-02-2016%2013-50-43.jpg",
            path: "E:/Desktop Capture-07-15-2018 14-15-22-793.jpg"
        };

        if (typeof callback === "function") {
            callback(status);
        } else if (typeof targetFolder === "function") {
            targetFolder(status);
        }
    }

    takeWindowsScreenshotByHandle(windowHandle, postMediaEvent, targetFolder, callback) {
        let status = {
            status: "success",
            url: "overwolf://media/screenshots/Streamer%20Alerts/Desktop%20Capture-05-02-2016%2013-50-43.jpg",
            path: "E:/Desktop Capture-07-15-2018 14-15-22-793.jpg"
        };

        if (typeof callback === "function") {
            callback(status);
        } else if (typeof targetFolder === "function") {
            targetFolder(status);
        }
    }

    takeWindowsScreenshotByName(windowName, postMediaEvent, targetFolder, callback) {
        let status = {
            status: "success",
            url: "overwolf://media/screenshots/Streamer%20Alerts/Desktop%20Capture-05-02-2016%2013-50-43.jpg",
            path: "E:/Desktop Capture-07-15-2018 14-15-22-793.jpg"
        };

        if (typeof callback === "function") {
            callback(status);
        } else if (typeof targetFolder === "function") {
            targetFolder(status);
        }
    }

    getScreenshotUrl(screenshotParams, callback) {
        let status = {
            status: "success",
            url: "overwolf://media/screenshots/Streamer%20Alerts/Desktop%20Capture-05-02-2016%2013-50-43.jpg"
        };

        if (typeof callback === "function") {
            callback(status);
        } else if (typeof targetFolder === "function") {
            targetFolder(status);
        }
    }

    shareImage(image, description, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    postMediaEvent(mediaType, jsonInfo, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    deleteOldGifs(keepNewestXGbs, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    getGifsSize(callback) {
        let status = {
            status: "success",
            size: 123
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    getAppVideoCaptureFolderSize(callback) {
        let status = {
            status: "success",
            size: 123
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    getAppScreenCaptureFolderSize(callback) {
        let status = {
            status: "success",
            size: 123
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    get onMediaEvent() {
        if (!this.onMediaEvent_mock) {
            this.onMediaEvent_mock = new EventListener_Mock;
        }
        return this.onMediaEvent_mock;
    }

    get onScreenshotTaken() {
        if (!this.onScreenshotTaken_mock) {
            this.onScreenshotTaken_mock = new EventListener_Mock;
        }
        return this.onScreenshotTaken_mock;
    }

    get onGifGenerationError() {
        if (!this.onGifGenerationError_mock) {
            this.onGifGenerationError_mock = new EventListener_Mock;
        }
        return this.onGifGenerationError_mock;
    }

    get audio() {
        if (!this.audio_mock) {
            this.audio_mock = new Audio_Mock;
        }
        return this.audio_mock;
    }

    get videos() {
        if (!this.videos_mock) {
            this.videos_mock = new Videos_Mock;
        }
        return this.videos_mock;
    }

    get replays() {
        if (!this.replays_mock) {
            this.replays_mock = new Replays_Mock;
        }
        return this.replays_mock;
    }
}

class Replays_Mock {

    turnOff(callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    turnOn(settings, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    getState(replayType, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        } else if (typeof replayType === "function") {
            replayType(status);
        }
    }

    capture(replayType, pastDuration, futureDuration, captureFinishedCallback, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        } else if (typeof captureFinishedCallback === "function") {
            captureFinishedCallback(status);
        }
    }

    startCapture(replayType, pastDuration, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        } else if (typeof pastDuration === "function") {
            pastDuration(status);
        }
    }

    stopCapture(replayType, replayId, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        } else if (typeof replayId === "function") {
            replayId(status);
        }
    }

    setReplaysSubFolder(replayType, subFolderName, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    updateTobiiSetting(param, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    get onCaptureError() {
        if (!this.onCaptureError_mock) {
            this.onCaptureError_mock = new EventListener_Mock;
        }
        return this.onCaptureError_mock;
    }

    get onCaptureStopped() {
        if (!this.onCaptureStopped_mock) {
            this.onCaptureStopped_mock = new EventListener_Mock;
        }
        return this.onCaptureStopped_mock;
    }

    get onCaptureWarning() {
        if (!this.onCaptureWarning_mock) {
            this.onCaptureWarning_mock = new EventListener_Mock;
        }
        return this.onCaptureWarning_mock;
    }

    get onReplayServicesStarted() {
        if (!this.onReplayServicesStarted_mock) {
            this.onReplayServicesStarted_mock = new EventListener_Mock;
        }
        return this.onReplayServicesStarted_mock;
    }
}

class Videos_Mock {

    createVideoComposition(sourceVideoUrl, segments, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    createVideoCompositionFiles(files, outputFile, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    getVideos(callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    getVideosSize(callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    deleteOldVideos(keepNewestXGbs, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    deleteVideo(videoUrl, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }
}

class Audio_Mock {

    create(url, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    play(id, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    stop(callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    stopById(id, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    pause(callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    pauseById(id, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    resume(callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    resumeById(id, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    setVolume(volume, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    setVolumeById(id, volume, callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    get onPlayStateChanged() {
        if (!this.onPlayStateChanged_mock) {
            this.onPlayStateChanged_mock = new EventListener_Mock;
        }
        return this.onPlayStateChanged_mock;
    }
}

class Profile_Mock {
    
    getCurrentUser(callback) {
        let status = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    openLoginDialog() {

    }

    get onLoginStateChanged() {
        if (!this.onLoginStateChanged_mock) {
            this.onLoginStateChanged_mock = new EventListener_Mock;
        }
        return this.onLoginStateChanged_mock;
    }
}

class Windows_Mock {
    getMainWindow() {
        return globals;
    }

    getCurrentWindow(callback){
        let status = {
            status: 'success',
            window: {
                name: 'window-name',
                stateEx: 'normal'
            }
        };
        if (typeof callback === "function") {
            callback(status);
        }
    }

    obtainDeclaredWindow(windowName, callback) {
        let status = {
            status: 'success'
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    dragMove(windowId, callback){}
    dragResize(windowId, edge){}
    dragResize(windowId, edge, contentRect){}
    changeSize(windowId, width, height, callback) {
        let status = {
            status: 'success'
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    changePosition(windowId, left, top, callback){}
    close(windowId, callback){}

    minimize(windowId, callback) {
        let status = {
            status: 'success'
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    hide(windowId, callback) {
        let status = {
            status: 'success'
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    maximize(windowId, callback){
        let status = {
            status: 'success'
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }

    restore(windowId, callback) {
        let status = {
            status: 'success'
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }
    
    getWindowState(windowId, callback){}
    getWindowsStates(callback){}
    sendMessage(windowId, messageId, messageContent, callback){}
    getOpenWindows(callback){}
    openOptionsPage(callback){}
    setWindowStyle(windowId, style, callback){}
    removeWindowStyle(windowId, style, callback){}
    setDesktopOnly(windowId, shouldBeDesktopOnly, callback){}
    setRestoreAnimationsEnabled(windowId, shouldEnableAnimations, callback){}
    setTopmost(windowId, shouldBeTopmost, callback){}
    sendToBack(windowId, callback){}
    bringToFront(windowId, callback){}
    bringToFront(callback){}
    displayMessageBox(messageParams, callback){}
    setMute(mute, callback){}
    muteAll(callback){}
    isMuted(callback){}
    isWindowVisibleToUser(callback){}
    getWindowDPI(callback){}

    get onMainWindowRestored() {
        if (!this.onMainWindowRestored_mock) {
            this.onMainWindowRestored_mock = new EventListener_Mock;
        }
        return this.onMainWindowRestored_mock;
    }

    get onStateChanged() {
        if (!this.onStateChanged_mock) {
            this.onStateChanged_mock = new EventListener_Mock;
        }
        return this.onStateChanged_mock;
    }

    get onMessageReceived() {
        if (!this.onMessageReceived_mock) {
            this.onMessageReceived_mock = new EventListener_Mock;
        }
        return this.onMessageReceived_mock;
    }

    get onIsolatedIframeProcessCrashed() {
        if (!this.onIsolatedIframeProcessCrashed_mock) {
            this.onIsolatedIframeProcessCrashed_mock = new EventListener_Mock;
        }
        return this.onIsolatedIframeProcessCrashed_mock;
    }

    get onAltF4Blocked() {
        if (!this.onAltF4Blocked_mock) {
            this.onAltF4Blocked_mock = new EventListener_Mock;
        }
        return this.onAltF4Blocked_mock;
    }
    
    get realSense() {
        if (!this.realSense_mock) {
            this.realSense_mock = new RealSense_Mock;
        }
        return this.realSense_mock;
    }
    
    get mediaPlayerElement() {
        if (!this.mediaPlayerElement_mock) {
            this.mediaPlayerElement_mock = new MediaPlayerElement_Mock;
        }
        return this.mediaPlayerElement_mock;
    }
}

class RealSense_Mock {
    getDcmVersions(callback){}
    hasRequiredSdkAndHardware(callback){}
    isSupported(callback){}
    init(callback){}
    stop(){}
}

class MediaPlayerElement_Mock {
    create(x, y, width, height, callback){}
    removeAllPlayers(){}
    setBounds(id, x, y, width, height, callback){}
    setVideo(id, videoUrl, callback){}
    play(id, callback){}
    setTobiiLayer(id, param, callback){}
    setTobiiLayer(param, callback){}
    pause(id, callback){}
    resume(id, callback){}
    setVolume(id, volume, callback){}
    stop(id, callback){}
    seek(id, seconds, callback){}
    getProgress(id, callback){}
    setPlaybackSpeed(id, speedRatio, callback){}
    toFront(id, callback){}
    toBack(id, callback){}
    setStretchMode(id, stretchMode, callback){}
    
    get onPlaybackStarted() {
        if (!this.onPlaybackStarted_mock) {
            this.onPlaybackStarted_mock = new EventListener_Mock;
        }
        return this.onPlaybackStarted_mock;
    }

    get onPlaybackPaused() {
        if (!this.onPlaybackPaused_mock) {
            this.onPlaybackPaused_mock = new EventListener_Mock;
        }
        return this.onPlaybackPaused_mock;
    }

    get onPlaybackStopped() {
        if (!this.onPlaybackStopped_mock) {
            this.onPlaybackStopped_mock = new EventListener_Mock;
        }
        return this.onPlaybackStopped_mock;
    }

    get onPlaybackEnded() {
        if (!this.onPlaybackEnded_mock) {
            this.onPlaybackEnded_mock = new EventListener_Mock;
        }
        return this.onPlaybackEnded_mock;
    }

    get onPlaybackError() {
        if (!this.onPlaybackError_mock) {
            this.onPlaybackError_mock = new EventListener_Mock;
        }
        return this.onPlaybackError_mock;
    }
}

class Utils_Mock {

    placeOnClipboard(clipboardData) {
        this.clipboardData = data;
    }
    
    getFromClipboard(callback) {
        if (typeof callback === "function") {
            callback(this.clipboardData);
        }
    }
    
    getMonitorsList(callback) {
        let data = {
            displays: []
        };
        
        if (typeof callback === "function") {
            callback(data);
        }
    }
    
    sendKeyStroke(keyString) {
        this.keyString = keyString;
    }
    
    openFilePicker(filter, callback) {
        let data = {
            status: "success",
            url: "overwolf-fs://E/Video"
        };

        if (typeof callback === "function") {
            callback(data);
        }
    }

    openFolderPicker(initialPath, callback) {
        let data = {
            status: "success", 
            path: "E:/Downloads"
        };

        if (typeof callback === "function") {
            callback(data);
        }
    }
    
    openWindowsExplorer(url, callback) {
        let data = {
            status: "success"
        };

        if (typeof callback === "function") {
            callback(data);
        }
    }
    
    isTouchDevice(callback) {
        let data = {
            result: "success",
            isTouch: false
        };

        if (typeof callback === "function") {
            callback(data);
        }
    }
    
    openUrlInDefaultBrowser(url) {

    }
    
    openUrlInOverwolfBrowser(url) {

    }
    
    getSystemInformation(callback) {
        let data = {  
            status:"success",
            systemInfo:{  
               OS:"10.0 64Bit",
               NetFramework:"4.6.1 or later (394802), v2.0.50727 SP2, v3.0 SP2, v3.5 SP1, v4 Client, v4 Full",
               Monitors:[  
                  {  
                     IsMain:true,
                     Name:"DELL U2412M",
                     Resolution:"1920, 1200",
                     Location:"0, 0",
                     Dpix:96,
                     Dpiy:96
                  },
                  {  
                     IsMain:false,
                     Name:"DELL U2412M",
                     Resolution:"1920, 1200",
                     Location:"1920, 0",
                     Dpix:96,
                     Dpiy:96
                  }
               ],
               CPU:"Intel(R) Core(TM) i5-4590 CPU @ 3.30GHz",
               LogicalCPUCount:4,
               PhysicalCPUCount:4,
               GPUs:[  
                  {  
                     "Name":"AMD Radeon HD 7900 Series",
                     "Manufacturer":"Advanced Micro Devices, Inc.",
                     "ChipType":"AMD Radeon Graphics Processor (0x679A)"
                  }
               ],
               MemorySize:"8531234816",
               NumberOfScreens:2,
               HardDisks:[  
                  {  
                     "Caption":"Samsung SSD 840 EVO 120GB",
                     "Size":120031511040,
                     "IsSsd":true
                  },
                  {  
                     "Caption":"ST1000DM003-1ER162",
                     "Size":1000202273280,
                     "IsSsd":false
                  }
               ],
               Manufacturer:"MSI",
               Model:"MS-7817",
               IsLaptop:false,
               Motherboard:"MSI H81M-P33 (MS-7817)",
               AudioDevices:[  
                  "AMD High Definition Audio Device",
                  "Realtek High Definition Audio",
                  "Logitech G933 Gaming Headset"
               ],
               InputDevices:[  
                  {  
                     vendor:1133,
                     id:49970,
                     type:"MOUSE"
                  },
                  {  
                     vendor:1133,
                     id:49714,
                     type:"KEYBOARD"
                  },
                  {  
                     vendor:1133,
                     id:49963,
                     type:"KEYBOARD"
                  },
                  {  
                     vendor:1133,
                     id:49713,
                     type:"MOUSE"
                  }
               ]
            }
         };

         if (typeof callback === "function") {
             callback(data);
         }
    }
    
    sendLogs(description, callback) {}
    
    uploadClientLogs(callback) {}
    
    getPeripherals(callback) {}
    
    openStoreOneAppPage(appId) {}
    
    simulateMouseClick(callback) {}
    
    simulateMouseClick(x, y, callback) {}
    
    isMouseLeftButtonPressed(callback) {}
    
}

class SettingsGames_Mock {
    getOverlayEnabled(gameClassId) {}
    getAutoLaunchEnabled(gameClassId) {}
}

class Settings_Mock {
    
    getHotKey(featureId, callback) {}
    registerHotKey(actionId, callback) {
        let status = {
            status: 'success'
        };

        if (typeof callback === "function") {
            callback(status);
        }
    }
    getCurrentOverwolfLanguage(callback) {}
    getOverwolfScreenshotsFolder(callback) {}
    setOverwolfScreenshotsFolder(path) {}
    getOverwolfVideosFolder(callback) {}
    setOverwolfVideosFolder(path) {}
    getVideoCaptureSettings(callback) {}
    setVideoCaptureSettings(resolutionSettings, fps) {}
    getAudioCaptureSettings(callback) {}
    setAudioCaptureSettings(enableSound, enableMicrophone) {}
    setFpsSettings(settings) {}
    getFpsSettings(callback) {}
    

    get onFpsSettingsChanged() {
        if (!this.onFpsSettingsChanged_mock) {
            this.onFpsSettingsChanged_mock = new EventListener_Mock;
        }
        return this.onFpsSettingsChanged_mock;
    }

    get OnVideoCaptureSettingsChanged() {
        if (!this.OnVideoCaptureSettingsChanged_mock) {
            this.OnVideoCaptureSettingsChanged_mock = new EventListener_Mock;
        }
        return this.OnVideoCaptureSettingsChanged_mock;
    }

    get OnAudioCaptureSettingsChanged() {
        if (!this.OnAudioCaptureSettingsChanged_mock) {
            this.OnAudioCaptureSettingsChanged_mock = new EventListener_Mock;
        }
        return this.OnAudioCaptureSettingsChanged_mock;
    }

    get OnHotKeyChanged() {
        if (!this.OnHotKeyChanged_mock) {
            this.OnHotKeyChanged_mock = new EventListener_Mock;
        }
        return this.OnHotKeyChanged_mock;
    }

    get games() {
        if (!this.games_mock) {
            this.games_mock = new SettingsGames_Mock;
        }
        return this.games_mock;
    }
}

class Social_Mock {

}

class Logitech_Mock {

}

class Egs_Mock {

}

class Log_Mock {

}

class Web_Mock {

}

class Benchmarking_Mock {

}

class Streaming_Mock {

}

class CurrentExtension_Mock {

    getExtraObject(name, callback) {
        let result = {
            status: 'success',
            object: plugins[name]
        };
        
        if (typeof callback === "function") {
            callback(result);
        }
    }
    
    getManifest(callback) {
        let manifest = {};

        if (typeof callback === "function") {
            callback(manifest);
        }
    }  
}

class Extensions_Mock {

    launch(uid, parameter) {}
    
    setInfo(info) {}

    getInfo(id, callback) {}

    registerInfo(id, eventsCallback, callback) {}

    unregisterInfo(id, callback) {}

    getRunningState(id, callback) {}

    getManifest(id, callback) {}

    relaunch() {}

    get onAppLaunchTriggered() {
        if (!this.onAppLaunchTriggered_mock) {
            this.onAppLaunchTriggered_mock = new EventListener_Mock;
        }
        return this.onAppLaunchTriggered_mock;
    }

    get current() {
        if (!this.current_mock) {
            this.current_mock = new CurrentExtension_Mock;
        }
        return this.current_mock;
    }
}

class Games_Mock {
    get onGameInfoUpdated() {
        return {
            removeListener: () => { },
            addListener: () => { }
        };
    }

    get events() {
        return {
            setRequiredFeatures: (features, callback) => {
                callback({ status: 'success' });
            },
            onNewEvents: {
                removeListener: (callback) => { },
                addListener: (callback) => { }
            },
            onInfoUpdates2: {
                removeListener: (callback) => { },
                addListener: (callback) => { }
            }
        };
    }

    getRunningGameInfo(callback) {
        callback({ isRunning: true });
    }
}

let globals = {};

let files = {
    'pubglistics\\config.json': GLOBAL_CONFIG,
    'pubglistics\\matches.json': GLOBAL_MATCHES,
    'pubglistics\\stats.json': GLOBAL_STATS,
};

let plugins = {
    'simple-io-plugin' : new SimpleIOPlugin_Mock
};


let overwolf = {
    io: new IO_Mock,
    media: new Media_Mock,
    profile: new Profile_Mock,
    windows: new Windows_Mock,
    benchmarking: new Benchmarking_Mock,
    games: new Games_Mock,
    web: new Web_Mock,
    logitech: new Logitech_Mock,
    egs: new Egs_Mock,
    streaming: new Streaming_Mock,
    log: new Log_Mock,
    extensions: new Extensions_Mock,
    utils: new Utils_Mock,
    settings: new Settings_Mock,
    social: new Social_Mock
};
