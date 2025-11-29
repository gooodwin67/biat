import * as THREE from "three";

export class GameClass {
  constructor(gameContext) {
    this.gameContext = gameContext;
    this.scene = gameContext.scene;
    this.assetsManager = gameContext.assetsManager;
    this.physicsClass = gameContext.physicsClass;

    this.camera = gameContext.camera;


    this.ground = null;

    this.options = {
      size: { w: 10, h: 10, d: 0.2 },
      name: 'ground'
    }
  }



  loadMesh() {
    let geometryPlane = new THREE.BoxGeometry(this.options.size.w, this.options.size.h, this.options.size.d);
    let materialPlane = new THREE.MeshPhongMaterial({ color: 0xcccccc, side: THREE.DoubleSide });
    this.ground = new THREE.Mesh(geometryPlane, materialPlane);
    this.ground.userData = { ...this.options };
    this.ground.rotateX(Math.PI / 2);
    this.ground.receiveShadow = true;

    // this.physicsClass.addPhysicsToObject(this.ground);

    // this.scene.add(this.ground);
  }

  loadTrack() {

    this.physicsClass.addPhysicsToObject(this.assetsManager.modelTrack1);
    this.scene.add(this.assetsManager.modelTrack1);

  }

  get playerClass() {
    return this.gameContext.playerClass;
  }

  update() {

    // console.log(this.playerClass.player.position.x)
  }

}

