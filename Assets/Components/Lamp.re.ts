/*
 * Lamp.re
 * Manage the bouncer behaviour
 */

import * as RE from 'rogue-engine';
import CannonBody from 'Assets/rogue_packages/rogue-cannon/Components/CannonBody.re';
import { Audio } from 'three';

const { Prop } = RE;

export default class Lamp extends RE.Component {

  // Public component fields
  @Prop("Audio") sound: Audio;
  @Prop("Number") scorePoints: number = 20;
  
  // Private vars
  private bodyComponent: CannonBody;
  private isLightOn: Boolean = false;
  private onEnabledCallbacks: ((enabled: boolean) => void)[] = [];

  // Static methods:
  static onHit = (score: number) => { };

  awake() {
    this.bodyComponent = RE.getComponent(CannonBody, this.object3d) as CannonBody;
  }

  start() {

    this.bodyComponent.onCollide((e) => {

      if (CannonBody.findByBody(e.other)?.name == "CannonBall" && !this.isLightOn) {

        this.setEnabled(true);
        this.playAudio();
        Lamp.onHit(this.scorePoints);

      }
    })
  }

  setEnabled(enabled: boolean) {
    this.isLightOn = enabled;
    this.runEnabledCallbacks(enabled);
  }

  playAudio() {
    this.sound && this.sound.play();
  }

  onLampEnabled(callback: (enabled: boolean) => void) {
    this.onEnabledCallbacks.push(callback);
  }

  private runEnabledCallbacks(enabled: boolean) {
    for (const callback of this.onEnabledCallbacks) {
      callback(enabled);
    }
  }

  // Reset all lights to disabled state
  static reset = () => { 

    const lamps: Lamp[] = RE.getComponents(Lamp) as Lamp[];

    for (let i = 0, l = lamps.length; i < l; i++) {
      lamps[i].setEnabled(false);
    }
  };

}

RE.registerComponent(Lamp);
