/*
 * Bouncer.re
 * Manage the bouncer behaviour
 */

import * as RE from 'rogue-engine';
import CannonBody from 'Assets/rogue_packages/rogue-cannon/Components/CannonBody.re';
import { Vec3 } from 'cannon-es';
import { Audio, Vector3 } from 'three';

const { Prop } = RE;

export default class Bouncer extends RE.Component {

  // Public component fields
  @Prop("Audio") sound: Audio;
  @Prop("Number") scorePoints: number = 10;
  @Prop("Number") bounceForce: number = 5;

  // Private vars
  private bodyComponent: CannonBody;
  private onCollisionEnterCallbacks: (() => void)[] = [];

  // Static methods:
  static onHit = (score: number) => { };

  awake() {
    this.bodyComponent = RE.getComponent(CannonBody, this.object3d) as CannonBody;
  }

  start() {

    this.bodyComponent.onCollide((e) => {

      if (CannonBody.findByBody(e.other)?.name == "CannonBall") { // If ball collides

        const ballBody = e.other;

        // Get inverse direction of collision in Vector3 (ThreeJs) format
        const substractVector = new Vector3(ballBody.position.x - this.object3d.position.x, ballBody.position.y - this.object3d.position.y, ballBody.position.z - this.object3d.position.z);
        const vectorWithForce = substractVector.normalize().multiplyScalar(this.bounceForce);

        // Convert Vector3 (ThreeJS) to Vec3 (CannonJS). TODO: Is there a more elegant way to do this?
        const vectorForce = new Vec3(vectorWithForce.x, vectorWithForce.y, vectorWithForce.z);

        // Apply ball force
        ballBody.applyForce(vectorForce);

        this.playAudio();

        // Fires static method. Useful when the static class fires an event without needing to know which object it is.
        this.scorePoints && Bouncer.onHit(this.scorePoints);

        //This object triggers a callback (and is used to animate its visual appearance in another script)
        this.runCollisionCallbacks();

      }

    })

  }

  playAudio() {

    if (!this.sound)
      return;

    if (this.sound.isPlaying)
      this.sound.stop();

    this.sound.play();
  }

  // Register a new callback
  onCollisionEnter(callback: () => void) {
    this.onCollisionEnterCallbacks.push(callback);
  }

  // Fire all calbacks registered
  private runCollisionCallbacks() {
    for (const callback of this.onCollisionEnterCallbacks) {
      callback();
    }
  }

}

RE.registerComponent(Bouncer);
