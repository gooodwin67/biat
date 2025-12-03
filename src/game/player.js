import * as THREE from 'three';

export class PlayerClass {
  constructor(gameContext) {

    this.scene = gameContext.scene;
    this.events = gameContext.events;
    this.camera = gameContext.camera;

    this.physicsClass = gameContext.physicsClass;

    this.player = null;
    this.playerBody = null;
    this.options = {
      size: { w: 0.2, h: 0.5, d: 0.3 },
      color: 0x770074,
      speed: 1.0,
      turnSpeed: 1,
      name: 'player',
    }
    this.move = { left: 0, right: 0, forward: 0, backward: 0 }

    this.init();
  }

  loadPlayer() {
    let geometryMesh = new THREE.CapsuleGeometry(this.options.size.w / 4, 1.5);
    let materialMesh = new THREE.MeshStandardMaterial({ color: this.options.color, side: THREE.DoubleSide });
    this.player = new THREE.Mesh(geometryMesh, materialMesh);

    this.player.userData = { ...this.options };

    this.player.castShadow = true;
    this.player.receiveShadow = true;
    this.player.position.set(0, 1, 0);
    this.player.rotateX(Math.PI / 2);

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
    if (!body) return;

    // ===========================
    // 1. ПОВОРОТ (Steering)
    // ===========================
    let turn = 0;
    if (this.move.left) turn += 1;
    if (this.move.right) turn -= 1;

    if (turn !== 0) {
      const currentAngVel = body.angvel();
      body.setAngvel({
        x: currentAngVel.x,
        y: turn * this.options.turnSpeed,
        z: currentAngVel.z
      }, true);
    } else {
      const currentAngVel = body.angvel();
      body.setAngvel({ x: currentAngVel.x, y: 0, z: currentAngVel.z }, true);
    }

    // ===========================
    // 2. РАСЧЕТ ВЕКТОРОВ
    // ===========================

    const rotation = body.rotation();
    const q = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);

    // Вектор "Вперед" (локальный Y капсулы, лежащей на боку)
    const forwardDirection = new THREE.Vector3(0, 1, 0);
    forwardDirection.applyQuaternion(q);
    forwardDirection.normalize();

    // Вектор "Вправо" (локальный X). Нужен, чтобы найти боковую скорость.
    const rightDirection = new THREE.Vector3(1, 0, 0);
    rightDirection.applyQuaternion(q);
    rightDirection.normalize();

    this.player.userData.forwardDirection = forwardDirection;

    // ===========================
    // 3. УСТРАНЕНИЕ ЗАНОСА (ГЛАВНАЯ ЧАСТЬ)
    // ===========================

    // Получаем текущую линейную скорость
    const vel = body.linvel();
    const currentVel = new THREE.Vector3(vel.x, vel.y, vel.z);

    // 1. Находим, какая часть скорости направлена ВБОК (проекция на rightDirection)
    // dot продукт возвращает скаляр (число)
    const sideSpeed = currentVel.dot(rightDirection);

    // 2. Находим, какая часть скорости направлена ВПЕРЕД
    const forwardSpeed = currentVel.dot(forwardDirection);

    // 3. Параметр "Сцепление" (Grip).
    // 0.0 - чистый лед (полный занос)
    // 0.1 - мыло
    // 0.9 - рельсы (почти нет заноса)
    // 0.95-0.98 - хорошие лыжи
    const gripFactor = 0.95;

    // Мы уменьшаем боковую скорость
    const clampedSideSpeed = sideSpeed * (1 - gripFactor);

    // 4. Собираем новую скорость:
    // Берем текущую скорость вперед + (сильно уменьшенную) скорость вбок
    const newVel = forwardDirection.clone().multiplyScalar(forwardSpeed)
      .add(rightDirection.clone().multiplyScalar(clampedSideSpeed));

    // Важно: возвращаем вертикальную скорость (гравитацию), иначе лыжник зависнет в воздухе
    newVel.y = vel.y;

    // Применяем обновленную скорость к телу (убираем дрифт)
    body.setLinvel(newVel, true);


    // ===========================
    // 4. ГАЗ / ТОРМОЗ
    // ===========================
    let throttle = 0;
    if (this.move.forward) throttle += 1;
    if (this.move.backward) throttle -= 1;

    if (throttle !== 0) {
      const acceleration = this.options.speed * 2.0;

      // Применяем импульс
      body.applyImpulse({
        x: forwardDirection.x * acceleration * throttle,
        y: 0,
        z: forwardDirection.z * acceleration * throttle
      }, true);
    }
  }


}