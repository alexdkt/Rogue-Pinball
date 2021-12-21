import * as RE from 'rogue-engine';
import CannonBody from 'Assets/rogue_packages/rogue-cannon/Components/CannonBody.re';
const { Prop } = RE;

export default class DrainFlipperTrigger extends RE.Component {

  @Prop("Boolean") isTrigger: boolean;
  static layerCollision: number = 3;

  bodyComponent: CannonBody;
  

  awake() {
    this.bodyComponent = RE.getComponent(CannonBody, this.object3d) as CannonBody;
    this.bodyComponent.body.collisionFilterGroup = DrainFlipperTrigger.layerCollision;
    this.bodyComponent.body.isTrigger = this.isTrigger;
    //this.bodyComponent.body.isTrigger = true;
    //
  //this.bodyComponent.isTrigger = true;
  }

  start() {
    RE.Debug.log("isTrigger " + this.bodyComponent.isTrigger);
    console.log("isTrigger " + this.bodyComponent.isTrigger);
  }

  update() {

  }
}

RE.registerComponent(DrainFlipperTrigger);
