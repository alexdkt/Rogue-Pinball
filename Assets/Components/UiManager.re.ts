/*
 * UiManager
 * Manages the UI. 
 */

import * as RE from 'rogue-engine';

export default class UiManager extends RE.Component {

  // Private vars
  private startGameUi: HTMLDivElement;
  private inGameUi: HTMLDivElement;
  private ballsLabel: HTMLDivElement;
  private scoreLabel: HTMLDivElement;
  private onPressPlayCallback: (() => void)[] = [];
  
  start() {
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

    const startGameButton = document.getElementById("start-game-button") as HTMLDivElement;

    startGameButton.onclick = () => this.onPressStartButton();

    this.showStartGameUi();
   
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
}

RE.registerComponent(UiManager);
