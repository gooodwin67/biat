import * as THREE from "three";

export class GameClass {
  constructor(gameContext) {
    this.gameContext = gameContext;
    this.scene = gameContext.scene;
    this.assetsManager = gameContext.assetsManager;
    this.physicsClass = gameContext.physicsClass;

    this.camera = gameContext.camera;


    this.ground = null;

    this.cameraOffset = new THREE.Vector3();

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

    // this.camera.position.x =  this.playerClass.player.position.x;
    // this.camera.position.z =  this.playerClass.player.position.z + 7;

    //CAMERA

    const dist = 8;  // Дистанция позади игрока
    const height = 3; // Высота камеры над игроком
    const smooth = 0.1; // Плавность (0.01 - очень медленно, 1.0 - мгновенно)

    // Текущая позиция игрока (берем из меша, так как физика его обновляет)
    const playerPos = this.playerClass.player.position;

    // Вычисляем, где камера ДОЛЖНА быть:
    // Позиция игрока МИНУС вектор направления (чтобы быть сзади) умноженный на дистанцию
    const idealPosition = new THREE.Vector3()
      .copy(playerPos)
      .sub(this.playerClass.player.userData.forwardDirection.clone().multiplyScalar(dist)) // Отодвигаем назад
      .add(new THREE.Vector3(0, height, 0)); // Поднимаем вверх (глобально по Y)

    // Плавно перемещаем камеру к идеальной позиции
    // this.camera.position.lerp(idealPosition, smooth);

    // // Камера всегда смотрит на игрока (или чуть выше него)
    // this.camera.lookAt(playerPos.x, playerPos.y + 1.0, playerPos.z);
  }

}

