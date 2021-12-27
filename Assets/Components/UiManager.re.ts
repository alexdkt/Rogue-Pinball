/*
 * UiManager
 * Manages the UI. 
 */

import * as RE from 'rogue-engine';
import { DefaultLoadingManager } from 'three';
import DeviceUtils from './Static/DeviceUtils';

export default class UiManager extends RE.Component {

  // Private vars
  private startGameUi: HTMLDivElement;
  private inGameUi: HTMLDivElement;
  private ballsLabel: HTMLDivElement;
  private scoreLabel: HTMLDivElement;
  private startGameButton: HTMLDivElement;
  private progressBarContainer: HTMLDivElement;
  private progressBar: HTMLDivElement;
  private onPressPlayCallback: (() => void)[] = [];
  
  awake() {
    if (!DeviceUtils.isValidBrowser()) {
      this.showNonSupportedDeviceScreen();
      RE.Runtime.stop();
      return;
    }

    this.initUI();
  }

  async initUI() {

    const htmlPath = RE.getStaticPath("ui.html");
    const gameUI = await(await fetch(htmlPath)).text();

    RE.Runtime.uiContainer.innerHTML = gameUI;

    this.startGameUi = document.getElementById("start-game-ui") as HTMLDivElement;
    this.inGameUi = document.getElementById("in-game-ui") as HTMLDivElement;

    this.ballsLabel = document.getElementById("balls-label") as HTMLDivElement;
    this.scoreLabel = document.getElementById("score-label") as HTMLDivElement;

    this.progressBarContainer = document.getElementById("progress-bar-container") as HTMLDivElement;
    this.progressBar = document.getElementById("progress-bar") as HTMLDivElement;

    this.startGameButton = document.getElementById("start-game-button") as HTMLDivElement;

    this.startGameButton.onclick = () => this.onPressStartButton();

    this.showStartGameUi();

    // Creating listeners for THREEJS Loading Manager
    DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.progressBar.style.width = (itemsLoaded / itemsTotal * 100) + '%';
    }

    // We show the startGamebutton only when everything is loaded correctly.
    // This way we avoid an error in Firefox if the button was clicked before the full load of the game.
    DefaultLoadingManager.onLoad = () => {
      this.progressBarContainer.style.display = "none";
      this.startGameButton.style.display = "block";
    }
   
  }


  showStartGameUi() {
    this.setDivEnabled(this.startGameUi, true, "flex");
    this.setDivEnabled(this.inGameUi, false);
  }

  showInGameUi() {
    this.setDivEnabled(this.startGameUi, false);
    this.setDivEnabled(this.inGameUi, true);
  }

  private setDivEnabled(div: HTMLDivElement, enabled:boolean, type:string = "block") {
    div.style.display = enabled ? type : "none";
  }

  setScoreLabel(amount:number) {
    this.scoreLabel.textContent = "" + amount;
  }

  setBallsLabel(amount:number) {
    this.ballsLabel.textContent = "" + amount;
  }

  onPressStartButton() {
    this.runPressPlayCallbacks();
  }

  onPressPlay(callback: () => void) {
    this.onPressPlayCallback.push(callback);
  }

  private runPressPlayCallbacks() {
    for (const callback of this.onPressPlayCallback) {
      callback();
    }
  }

  showNonSupportedDeviceScreen() {
    var divNonSupported = document.createElement("div");
    divNonSupported.innerHTML = "Browser not supported. We recommend Chrome or Firefox on Desktop";
    divNonSupported.style.cssText = "text-align: center;top: 40%;position: relative;font-size: xx-large;color: white;";
    document.body.insertBefore(divNonSupported, document.body.firstChild);
  }
}

RE.registerComponent(UiManager);
