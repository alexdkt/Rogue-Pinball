/*
 * BouncerEmissiveModifier.re
 * Manage the bouncer emissive behaviour
 */

import * as RE from 'rogue-engine';
import { MeshStandardMaterial } from 'three';
import Bouncer from './Bouncer.re';
import { Color } from 'three';
const { Prop } = RE;

export default class BouncerEmissiveModifier extends RE.Component {

  // Public component fields
  @Prop("Material") material: MeshStandardMaterial;  
  @Prop("Number") duration: number = 0.5;
  @Prop("Color") color: Color;

  // Private vars
  private bouncer: Bouncer;
  private changingColor: boolean = false;
  private maxTimeBounce: number = 0;
  private initColor: Color = new Color(0, 0, 0);


  awake() {
    this.bouncer = RE.getComponent(Bouncer, this.object3d) as Bouncer;
  }

  start() {

    // Register bouncer "oncollisionEnter" callback
    this.bouncer.onCollisionEnter(() => {

      this.material.emissive.set(this.color);

      this.maxTimeBounce = RE.Runtime.clock.elapsedTime + this.duration;

      this.changingColor = true;
    });

  }

  update() {

    // Fade out the color change
    if (this.changingColor) {

      const now = RE.Runtime.clock.elapsedTime;

      if (now < this.maxTimeBounce) {

        const w = 1 - (this.maxTimeBounce - now) / this.duration;
        const newColor = Color.prototype.lerpColors(this.color, this.initColor, w);
        this.material.emissive.set(newColor);

      } else { // If the duration is over, reset the status

        this.changingColor = false;
        this.material.emissive.set(this.initColor);

      }
    }
  }
}

RE.registerComponent(BouncerEmissiveModifier);
