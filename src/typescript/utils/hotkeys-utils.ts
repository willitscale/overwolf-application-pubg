import { HotkeysIds } from "../constants/hotkeys-ids";

export class HotkeysUtils {

  protected constructor() {
  }

  static get instance(): HotkeysUtils {
    if (!(<any>overwolf.windows.getMainWindow()).pubgistics_hotKeyService) {
        (<any>overwolf.windows.getMainWindow()).pubgistics_hotKeyService = new HotkeysUtils;
    }
    return (<any>overwolf.windows.getMainWindow()).pubgistics_hotKeyService;
  }

  private _getHotkey(hotkeyId: string, callback: (result: any) => void) {
    let that = this;
    overwolf.settings.getHotKey(hotkeyId, function (result: any) {
      if (!result || result.status === "error" || !result.hotkey) {
        setTimeout(function () {
          that._getHotkey(hotkeyId, callback);
        }, 2000);
      } else {
        callback(result.hotkey);
      }
    });
  }

  private _setHotkey(hotkeyId: string, action: () => void) {
    overwolf.settings.registerHotKey(hotkeyId, function (result) {
      if (result.status === 'success') {
        action();
      } else {
        console.error(`[HOTKEYS SERVICE] failed to register hotkey ${hotkeyId}`);
      }
    });
  }

  public setToggleOverlay(action: () => any) {
    this._setHotkey(HotkeysIds.TOGGLE_OVERLAY, action);
  }
}
