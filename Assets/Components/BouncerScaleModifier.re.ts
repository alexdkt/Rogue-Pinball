/*
 * BouncerScaleModifier.re
 * Manage the bouncer scale behaviour
 */

import * as RE from 'rogue-engine';
import { Object3D, Vector3 } from 'three';
import Bouncer from './Bouncer.re';

const { Prop } = RE;

export default class BouncerScaleModifier extends RE.Component {

  // Public component fields
  @Prop("Object3D") target: Object3D;
  @Prop("Number") duration: number = 0.5;
  @Prop("Vector3") scaleFactor: Vector3 = new Vector3(1, 1, 1);

  // Private vars
  private bouncer: Bouncer;
  private maxTime: number = 0;
  private changingScale: boolean = false;
  private initScale: Vector3 = new Vector3(1, 1, 1);

  awake() {
    this.bouncer = RE.getComponent(Bouncer, this.object3d) as Bouncer;
    this.initScale = this.target.scale.clone();
  }

  start() {

    // Register bouncer "oncollisionEnter" callback
    this.bouncer.onCollisionEnter(() => {

      this.target.scale.multiply(this.scaleFactor);

      this.maxTime = RE.Runtime.clock.elapsedTime + this.duration;

      this.changingScale = true;
    });

  }

  update() {

    // Fade out the scale change
    if (this.changingScale) {

      const now = RE.Runtime.clock.elapsedTime;

      if (now < this.maxTime) {

        const w = 1 - (this.maxTime - now) / this.duration;
        this.target.scale.lerp(this.initScale, w);

      } else { // If the duration is over, reset the status

        this.changingScale = false;
        this.target.scale.set(this.initScale.x, this.initScale.y, this.initScale.z);

      }
    }
  }

}

RE.registerComponent(BouncerScaleModifier);
