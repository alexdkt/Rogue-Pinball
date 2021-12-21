/*
 * Flipper.re
 * Manage the flipper behaviour
 */

import * as RE from 'rogue-engine';
import CannonBody from 'Assets/rogue_packages/rogue-cannon/Components/CannonBody.re';
import { Vec3 } from 'cannon-es';
import { Audio } from 'three';
import GameLogic from './GameLogic.re';
const { Prop } = RE;

export default class Flipper extends RE.Component {

  // Public component fields
  @Prop("Number") angleRotationSpeed: number = 0.1;
  @Prop("Audio") sound: Audio;

  // Private vars
  private bodyComponent: CannonBody;
  private maxAngleRotation: number = 0.8;
  private currentAngleRotation: number = 0.0;
  private isBallColliding: boolean = false;
  private angleFlipperOnCollide: number = 0;
  private flipperForce: number = -0.5;
  private ballBody: CannonBody;

  // Public Enum List
  protected side: number = 0;
  protected typeOptions = [
    "Left",
    "Right"
  ];

  @RE.Prop("Select")
  get type() {
    return this.side;
  }

  set type(value: number) {
    this.side = value;
  }

  awake() {
    this.bodyComponent = RE.getComponent(CannonBody, this.object3d) as CannonBody;
  }

  start() {

    if (this.side == 0) { // If Left flipper inverse the angle rotation
      this.angleRotationSpeed *= -1;
    }

    // If flipper collides with the ball:
    this.bodyComponent.onCollide((e) => {

      const body = CannonBody.findByBody(e.other);

      if (body?.name != "CannonBall")
        return;

      // Keep ballBody object becouse in "endContact" callback the bodyA and bodyB fields always are null.  
      // Maybe related with: https://github.com/pmndrs/cannon-es/issues/97
      if (!this.ballBody)
        this.ballBody = body;

      //  Keep its angle to compare with the rotation when ball leaves
      this.angleFlipperOnCollide = this.currentAngleRotation;
      this.isBallColliding = true;

    });

    // If Flipper detects and encContact
    this.bodyComponent.body.world?.addEventListener('endContact', () => {

      // ApplyForce to ball when leaves the flipper 
      if (this.isBallColliding) {
        this.isBallColliding = false;
        this.applyBallForce();
      }

    })
  }

  isKeyPressed() {
    return (this.side == 1) ? RE.Input.keyboard.getKeyPressed("ArrowLeft") : RE.Input.keyboard.getKeyPressed("ArrowRight");
  }

  isKeyReleased() {
    return (this.side == 1) ? RE.Input.keyboard.getKeyUp("ArrowLeft") : RE.Input.keyboard.getKeyUp("ArrowRight");
  }

  isAngleLessThanLimit() {
    return (this.side == 1) ? this.currentAngleRotation < this.maxAngleRotation : this.currentAngleRotation > -this.maxAngleRotation;
  }

  applyBallForce() {

    var diff = this.angleFlipperOnCollide - this.currentAngleRotation;

    if (this.side == 1) {
      diff *= -1;
    }

    // No force is applied if rotation of flipper has not changed while ball is in contact
    if (diff <= 0)
      return;

    this.ballBody.body.applyImpulse(new Vec3(0, 0, this.flipperForce));

  }

  playAudio() {
    this.sound && this.sound.play();
  }

  update() {

    if (!GameLogic.isGamePlaying)
      return;


    // Flipper movement. 
    // TODO: Should be done with an HingeJoint and a torque instead of using an anchorPoint and a rotation.

    if (this.isKeyPressed()) {

      if (this.isAngleLessThanLimit()) {

        // Play audio when the flipper starts moving
        if (this.currentAngleRotation == 0) {
          this.playAudio();
        }

        // Rotates the flipper
        this.currentAngleRotation += this.angleRotationSpeed * RE.Runtime.deltaTime;
        this.bodyComponent.body.quaternion.setFromEuler(0, this.currentAngleRotation, 0);

      }
    }

    // Reset flipper status
    if (this.isKeyReleased()) {
      this.bodyComponent.body.quaternion.setFromEuler(0, 0, 0);
      this.currentAngleRotation = 0.0;
    }

  }
}

RE.registerComponent(Flipper);
