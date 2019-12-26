import { Controller } from "./controllers/controller";
import { DashboardController } from "./controllers/dashboard-controller";
import { OverlayController } from "./controllers/overlay-controller";
import { MainController } from "./controllers/main-controller";
import { BackgroundController } from "./controllers/background-controller";
import $ from "jquery";

class Main {

  private controller: Controller | any = null;

  constructor() {
    this.initialise();
  }

  initialise() {
    switch (this.getController()) {

      case BackgroundController.FILE:
        this.controller = new BackgroundController;
        break;

      case DashboardController.FILE:
        this.controller = new DashboardController;
        break;

      case OverlayController.FILE:
        this.controller = new OverlayController;
        break;

      case MainController.FILE:
        this.controller = new MainController;
        break;
    }

    if (this.controller) {
      this.controller.run();
    }
  }

  private getController() {
    return window.location.pathname
      .replace('/files/html/', '')
      .split('/')[0]
      .split('.')[0];
  }
}

$(document).ready(function () {
  new Main();
});
