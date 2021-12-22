/*
 * Ball.re
 * Manage the ball behaviour
 */

import * as RE from 'rogue-engine';
import CannonBody from 'Assets/rogue_packages/rogue-cannon/Components/CannonBody.re';
import { Audio } from 'three';
import { Vec3 } from 'cannon-es';
const { Prop } = RE;

export default class Ball extends RE.Component {

  // Public component fields
  @Prop("Number") maxSpeed: number = 0.2;
  @Prop("Audio") sound: Audio;

  // Component dependencies
  bodyComponent: CannonBody;

  // Private vars
  private _mass: number;
  private initPosition: Vec3;

  // Static 
  static layerCollision: number = 2;

  awake() {
    this.bodyComponent = RE.getComponent(CannonBody, this.object3d) as CannonBody;
    this.bodyComponent.body.collisionFilterGroup = Ball.layerCollision;
    this.initPosition = new Vec3(this.object3d.position.x, this.object3d.position.y, this.object3d.position.z);
    this._mass = this.bodyComponent.mass;

    // We remove the mass of the object as soon as we start so that it does not move until all pinball colliders are ready
    this.setMassEnabled(false);
  }

  start() {

    this.sound && this.sound.setLoop(true);
    this.sound && this.sound.setVolume(0);
    this.sound && this.sound.play();

  }

  setMassEnabled(enabled: boolean) {
    this.bodyComponent.mass = enabled ? this._mass : 0;
  }

  // Reset ball speed and position
  reset() {
    this.setMassEnabled(false);
    this.bodyComponent.body.velocity.setZero();
    this.bodyComponent.body.position.copy(this.initPosition);
    this.setMassEnabled(true);
  }

  update() {

    // Limit the speed of the ball to avoid rapid movements that can cause problems with colliders and make the ball leaves the playing area
    const velocity = this.bodyComponent.body.velocity;

    if (velocity.length() > this.maxSpeed) {
      velocity.normalize();
      velocity.scale(this.maxSpeed, velocity);
    }

    // Sets the volume of the ball's sound based on speed
    this.sound && this.sound.setVolume(velocity.length());

  }
}

RE.registerComponent(Ball);
