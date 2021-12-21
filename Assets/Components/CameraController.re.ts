/*
 * CameraController.re
 * Manage the camera movement
 */

import * as RE from 'rogue-engine';
import { MathUtils, Object3D } from 'three';
const { Prop } = RE;

export default class CameraController extends RE.Component {

  // Public component fields
  @Prop("Object3D") target: Object3D;
  @Prop("Number") offset: number = 1;
  @Prop("Number") smooth: number = 0.1;
  @Prop("Number") limitZ: number = 1;
  @Prop("Number") maxCameraZ: number = 1.6;
  @Prop("Number") minCameraZ: number = 0.16;


  update() {

    if (this.target) {

      const newZ = this.target.position.z + this.offset;  // Add an offset to the target position
      const smoothZ = MathUtils.lerp(this.target.position.z, newZ, this.smooth); // Smooth Lerp movement
      const clampedZ = MathUtils.clamp(smoothZ, this.minCameraZ, this.maxCameraZ); // Clamp movement
      this.object3d.position.z = clampedZ; // Set new Z pos

    }

  }
}

RE.registerComponent(CameraController);
