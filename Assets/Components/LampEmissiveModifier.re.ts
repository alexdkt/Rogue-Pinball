/*
 * LampEmissiveModifier.re
 * Manage the lamp emissive behaviour
 */

import * as RE from 'rogue-engine';
import { MeshStandardMaterial } from 'three';
import { Color, Mesh } from 'three';
import Lamp from './Lamp.re';
const { Prop } = RE;

export default class LampEmissiveModifier extends RE.Component {

  // Public component fields
  @Prop("Color") color: Color;
  @Prop("Boolean") change: Boolean;

  // Private vars:
  private material: MeshStandardMaterial;
  private lamp: Lamp;

  awake() {
    this.lamp = RE.getComponent(Lamp, this.object3d) as Lamp;
  }

  start() {

      // Clone the material in order to modify each lamp separately
      // To avoid this new material is overriden by Rogue you should mark them as "preload" in Asset Manager Tab
      if (this.object3d instanceof Mesh) { // We avoid errors with Type Assertions getting object.material
          this.material = this.object3d.material.clone();
          this.object3d.material = this.material;
      }

    this.lamp.onLampEnabled((enabled:boolean) => {
      if (enabled)
        this.material && this.material.emissive.set(this.color);
      else 
        this.material && this.material.emissive.set(new Color(0,0,0));  
    });

  }
  
}

RE.registerComponent(LampEmissiveModifier);
