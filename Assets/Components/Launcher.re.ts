/*
 * Launcher.re
 * Manage the launcher behaviour
 */

import * as RE from 'rogue-engine';
import CannonBody from 'Assets/rogue_packages/rogue-cannon/Components/CannonBody.re';
import { Object3D, Audio } from 'three';
import { Vec3 } from 'cannon-es';
import GameLogic from './GameLogic.re';
const { Prop } = RE;

export default class Launcher extends RE.Component {

  // Public component fields
  @Prop("String") keyCode: string = "Space";
  @Prop("Object3D") launcherGeo: Object3D;
  @Prop("Object3D") launcherTrigger: Object3D;
  @Prop("Number") launcherMaxZ: Number = 0.93;
  @Prop("Number") force: number;
  @Prop("Audio") sound: Audio;

  // Private vars
  private ballBody: CannonBody;
  private launcherTriggerBody: CannonBody;
  private launcherInitialPositionZ: number;
  private launcherSpeedMovement: number = 0.001;
  private isBallColliding: boolean = true;
  private timeBallEntersLauncherArea = 0;
  private safeTimeBallLeavesLauncherArea: number = 1;



  awake() {
    this.launcherTriggerBody = RE.getComponent(CannonBody, this.launcherTrigger) as CannonBody;
  }

  start() {

    this.launcherInitialPositionZ = this.launcherGeo.position.z;

    // If trigger collides with the ball:
    this.launcherTriggerBody.onCollide((e) => {

      const body = CannonBody.findByBody(e.other);

      if (body?.name != "CannonBall")
        return;

      // Keep ballBody object because in "endContact" callback the bodyA and bodyB fields always are null.  
      // Maybe related with: https://github.com/pmndrs/cannon-es/issues/97
      if (!this.ballBody)
        this.ballBody = body;

      this.isBallColliding = true;
      this.timeBallEntersLauncherArea = RE.Runtime.clock.elapsedTime;

    });

    // If trigger detects and encContact
    this.launcherTriggerBody.body.world?.addEventListener('endContact', (e) => {

      // Sometimes an endcontact event occurs right after the collision (this.launcherTriggerBody.onCollide). 
      // I don't know if because the ball hits another object or because any kind of bounce. 
      // We discard the endContact events that occur just after the collision event
      if (this.isBallColliding && (this.timeBallEntersLauncherArea + this.safeTimeBallLeavesLauncherArea < RE.Runtime.clock.elapsedTime))
        this.isBallColliding = false;

    })
  }

  update() {

    if (!GameLogic.isGamePlaying)
      return;

    // If ball is out of the launching area, skip  
    if (!this.ballBody || !this.isBallColliding)
      return;

    if (RE.Input.keyboard.getKeyPressed(this.keyCode)) {

      // pulls the launcher back
      if (this.launcherGeo.position.z < this.launcherMaxZ) {
        this.launcherGeo.translateZ(this.launcherSpeedMovement);
      }
    }

    if (RE.Input.keyboard.getKeyUp(this.keyCode)) {

      // Get launcher distance from init position and calc force
      var totalMovement: number = this.launcherInitialPositionZ - this.launcherGeo.position.z;
      var force = totalMovement * this.force;
      this.launcherGeo.position.z = this.launcherInitialPositionZ;

      const dt = RE.Runtime.deltaTime;
      const impulse = new Vec3(0, 0, force * dt);
      this.ballBody.body.applyImpulse(impulse)

      this.playAudio();
    }

  }

  playAudio() {
    this.sound && this.sound.play();
  }
}

RE.registerComponent(Launcher);
