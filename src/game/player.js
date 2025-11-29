import * as THREE from 'three';

export class PlayerClass {
  constructor(gameContext) {

    this.scene = gameContext.scene;
    this.events = gameContext.events;

    this.physicsClass = gameContext.physicsClass;

    this.player = null;
    this.playerBody = null;
    this.options = {
      size: { w: 0.2, h: 0.5, d: 0.3 },
      color: 0x770074,
      speed: 1.0,
      name: 'player',
    }
    this.move = { left: 0, right: 0, forward: 0, backward: 0 }

    this.init();
  }

  loadPlayer() {
    let geometryMesh = new THREE.BoxGeometry(this.options.size.w, this.options.size.h, this.options.size.d);
    let materialMesh = new THREE.MeshStandardMaterial({ color: this.options.color, side: THREE.DoubleSide });
    this.player = new THREE.Mesh(geometryMesh, materialMesh);

    this.player.userData = { ...this.options };

    this.player.castShadow = true;
    this.player.receiveShadow = true;
    this.player.position.set(0, 1, 0);

    this.physicsClass.addPhysicsToObject(this.player);
    this.playerBody = this.player.userData.body;

    this.scene.add(this.player)
  }

  init() {
    this.events.on('player_left', (e) => this.move.left = e);
    this.events.on('player_right', (e) => this.move.right = e);
    this.events.on('player_forward', (e) => this.move.forward = e);
    this.events.on('player_backward', (e) => this.move.backward = e);
  }


  update(delta) {
    const body = this.playerBody;

    // 1. Считываем ввод (направление, куда хотим толкать)
    let moveX = 0;
    let moveZ = 0;

    if (this.move.forward) moveZ -= 1;
    if (this.move.backward) moveZ += 1;
    if (this.move.left) moveX -= 1;
    if (this.move.right) moveX += 1;

    // Нормализуем вектор ввода
    const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (length > 0) {
      moveX /= length;
      moveZ /= length;
    }

    // ===============================================
    // ЧИСТАЯ ФИЗИКА (Impulse)
    // ===============================================

    // Сила толчка (подбирай экспериментально, начни с больших чисел, например 50-100)
    const acceleration = this.options.speed * 2.0;

    // Получаем текущую скорость, чтобы ограничить "бесконечный разгон"
    const vel = body.linvel();

    // Ограничение максимальной скорости (чтобы с горы не улетел в космос)
    const maxSpeed = this.options.speed;

    // Считаем горизонтальную скорость
    const currentSpeed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);

    // Толкаем, только если еще не достигли лимита скорости
    // (или если пытаемся повернуть в другую сторону)
    if (currentSpeed < maxSpeed || length === 0) {

      // Мы применяем ИМПУЛЬС. Это как "пинок" в нужном направлении.
      // wakeUp: true обязательно, чтобы разбудить тело
      body.applyImpulse({
        x: moveX * acceleration,
        y: 0, // Не толкаем вверх/вниз, пусть гравитация решает
        z: moveZ * acceleration
      }, true);
    }
  }


}