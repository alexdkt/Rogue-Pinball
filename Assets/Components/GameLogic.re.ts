/*
 * GameLogic
 * Manage the life cycle of the game. 
 * Is a global manager but not intended to be a god-object, valid for casual games with a single screen. 
 */

import * as RE from 'rogue-engine';
import { Object3D, Audio } from 'three';
import UiManager from './UiManager.re';
import Lamp from './Lamp.re';
import Bouncer from './Bouncer.re';
import CannonBody from 'Assets/rogue_packages/rogue-cannon/Components/CannonBody.re';
import Ball from './Ball.re';

const { Prop } = RE;

export default class GameLogic extends RE.Component {

  // Public component fields
  @Prop("Object3D") ball: Object3D;
  @Prop("Number") ballsRound: number;
  @Prop("Audio") music: Audio;
  @Prop("Audio") soundLostBall: Audio;

  // Game dependencies
  uiManager: UiManager;
  ballBody: CannonBody;
  ballController: Ball;

  // Private vars
  private currentBalls: number;
  private currentScore: number;

  // Static 
  static isGamePlaying: boolean = false;

  awake() {

    this.ballBody = RE.getComponent(CannonBody, this.ball) as CannonBody;
    this.ballController = RE.getComponent(Ball, this.ball) as Ball;
    this.uiManager = RE.getComponent(UiManager, this.object3d) as UiManager;

  }

  start() {

    // Handles when the player clicks the start playing UI button
    this.uiManager.onPressPlay(() => {
      
      this.startGame();
      this.playAudio();

      // Enables mass of ball
      // I'm using a timeout because sometimes if the mass of the ball is enabled very soon, it leaves the playing area (it does not collide correctly with walls).
      // TODO: Check the time out, I don't like it at all!
      setTimeout(() => {
        this.ballController.setMassEnabled(true);
      }, 1000)
    })

    // Handles when the user loses a ball. TODO: Avoid ballBody dependency and create an onCollide callback in BallController
    this.ballBody.onCollide((e) => {

      const colliderObj = CannonBody.findByBody(e.other);

      if (colliderObj?.name == "DrainTrigger") { // This is the collider at the bottom of the pinball

        this.ballController.reset();
        this.currentBalls--;

        this.uiManager.setBallsLabel(this.currentBalls);

        (this.currentBalls <= 0) && this.endGame();

        this.soundLostBall && this.soundLostBall.play();

      }
    })


    // Handles when lamps detect a collision with the ball
    Lamp.onHit = (score: number) => {
      this.addScore(score);
    };

    // Handles when bouncers detect a collision with the ball
    Bouncer.onHit = (score: number) => {
      this.addScore(score);
    }

  }

  // Add score to UI
  addScore(amount: number) {
    this.currentScore += amount;
    this.uiManager.setScoreLabel(this.currentScore);
  }

  startGame() {
    this.currentBalls = this.ballsRound;
    this.currentScore = 0;
    this.uiManager.setScoreLabel(this.currentScore);
    this.uiManager.setBallsLabel(this.currentBalls);
    this.uiManager.showInGameUi();
    GameLogic.isGamePlaying = true;
  }

  endGame() {
    GameLogic.isGamePlaying = false;
    this.ballController.setMassEnabled(false);
    this.uiManager.showStartGameUi();
    Lamp.reset();
    this.stopAudio();
  }

  playAudio() {
    this.music && this.music.play();
  }

  stopAudio() {
    this.music && this.music.stop();
  }

}

RE.registerComponent(GameLogic);
