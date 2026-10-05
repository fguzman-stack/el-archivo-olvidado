import * as THREE from 'three';
import {GameEngine} from './game-engine';

/** Loaded only when entering the game. All art is generated locally. */
export class HouseWorld {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(76, 16 / 9, .04, 42);
  private renderer: THREE.WebGLRenderer;
  private root = new THREE.Group();
  private flashlight = new THREE.SpotLight(0xffe2ae, 28, 22, .58, .65, 1.2);
  private target = new THREE.Object3D();
  private items: THREE.Group[] = [];
  private jeff = new THREE.Group();
  private slender = new THREE.Group();
  private dog = new THREE.Group();
  private tv = new THREE.Group();
  private tvLight = new THREE.PointLight(0xc51a29, 2, 8);
  private textures: THREE.Texture[] = [];
  private readonly scale = 1 / 8;
  private reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private lastEncounter = -20;
  private lastRelocation = -1;

  constructor(canvas: HTMLCanvasElement, private engine: GameEngine) {
    this.renderer = new THREE.WebGLRenderer({canvas, antialias: true, powerPreference: 'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.scene.background = new THREE.Color('#090c0b');
    this.scene.fog = new THREE.FogExp2('#090c0b', .07);
    this.scene.add(new THREE.AmbientLight(0x87998d, .48));
    this.scene.add(this.root, this.flashlight, this.target);
    this.flashlight.target = this.target;
    this.build();
  }

  private material(color: number, roughness = .85): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({color, roughness});
  }

  private box(parent: THREE.Object3D, material: THREE.Material, size: number[], pos: number[]): THREE.Mesh {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size as [number, number, number]), material);
    mesh.position.set(...pos as [number, number, number]); parent.add(mesh); return mesh;
  }

  private sphere(parent: THREE.Object3D, material: THREE.Material, pos: number[], size: number[]): THREE.Mesh {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), material);
    mesh.position.set(...pos as [number, number, number]); mesh.scale.set(...size as [number, number, number]); parent.add(mesh); return mesh;
  }

  private texture(kind: 'wall' | 'floor' | 'blood' | 'jeff' | 'sonic' | 'dog'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const c = canvas.getContext('2d')!;
    if (kind === 'wall' || kind === 'floor') {
      c.fillStyle = kind === 'wall' ? '#5b5545' : '#47342a'; c.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 1400; i++) {
        c.fillStyle = i % 2 ? '#12150c20' : '#ad96701a';
        c.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 30, Math.random() * 4);
      }
      c.strokeStyle = '#191a14'; c.lineWidth = 2;
      for (let i = 0; i < 256; i += kind === 'wall' ? 32 : 48) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 4, 256); c.stroke(); }
      if (kind === 'wall') {
        for (let i = 0; i < 12; i++) { c.fillStyle = '#141f1370'; c.beginPath(); c.ellipse(Math.random() * 256, 245, 12 + Math.random() * 30, 30 + Math.random() * 50, 0, 0, 7); c.fill(); }
        c.strokeStyle = '#24211c'; c.beginPath(); c.moveTo(80, 0); c.lineTo(94, 55); c.lineTo(78, 88); c.lineTo(107, 130); c.stroke();
      }
    } else if (kind === 'blood') {
      const pool = c.createRadialGradient(122, 132, 5, 122, 132, 85);
      pool.addColorStop(0, '#260407'); pool.addColorStop(.7, '#52070ddd'); pool.addColorStop(1, '#70131a99');
      c.fillStyle = pool; c.beginPath();
      for (let i = 0; i < 70; i++) {
        const angle = i / 70 * Math.PI * 2; const radius = 50 + Math.sin(i * 1.8) * 14 + Math.random() * 18;
        const x = 128 + Math.cos(angle) * radius; const y = 128 + Math.sin(angle) * radius * .75;
        if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.closePath(); c.fill();
      c.strokeStyle = '#5b070ab8'; c.lineCap = 'round';
      for (let i = 0; i < 12; i++) {
        c.lineWidth = 1 + Math.random() * 4; c.beginPath(); c.moveTo(128, 140); c.bezierCurveTo(120 + Math.random() * 50, 160, 130 + Math.random() * 60, 170, 125 + Math.random() * 60, 235); c.stroke();
      }
      for (let i = 0; i < 120; i++) {
        c.fillStyle = '#5c0a0fc0'; c.beginPath(); c.arc(Math.random() * 240 + 8, Math.random() * 230 + 8, .5 + Math.random() * 2.2, 0, 7); c.fill();
      }
      c.strokeStyle = '#b5393d35'; c.lineWidth = 1; c.beginPath(); c.moveTo(99, 97); c.quadraticCurveTo(120, 91, 149, 101); c.stroke();
    } else {
      c.fillStyle = kind === 'sonic' ? '#152956' : kind === 'dog' ? '#4a201b' : '#d6d1c7'; c.fillRect(0, 0, 256, 256);
      c.fillStyle = '#080807';
      for (const x of [70, 180]) { c.beginPath(); c.ellipse(x, 98, 35, 28, -.12, 0, 7); c.fill(); c.fillStyle = '#cf1020'; c.beginPath(); c.arc(x, 98, kind === 'jeff' ? 4 : 9, 0, 7); c.fill(); c.fillStyle = '#080807'; }
      c.strokeStyle = '#4b080b'; c.lineWidth = 12; c.beginPath(); c.arc(128, 133, 77, .12, Math.PI - .12); c.stroke();
      c.fillStyle = '#e5dbc5';
      for (let i = 0; i < 12; i++) c.fillRect(54 + i * 13, 178 + Math.sin(i / 11 * Math.PI) * 24, 7, 9);
      if (kind === 'sonic') { c.fillStyle = '#cf1020'; c.font = 'bold 18px monospace'; c.fillText('I AM GOD', 80, 246); }
    }
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    if (kind === 'floor') { texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(15, 11); }
    this.textures.push(texture); return texture;
  }

  private build(): void {
    const wall = new THREE.MeshStandardMaterial({map: this.texture('wall'), roughness: .95});
    const wood = this.material(0x39271e);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 44), new THREE.MeshStandardMaterial({map: this.texture('floor'), roughness: .8}));
    floor.rotation.x = -Math.PI / 2; floor.position.set(30, 0, 22); this.root.add(floor);
    this.box(this.root, this.material(0x26271f), [60, .15, 44], [30, 3.7, 22]);
    const blood = new THREE.MeshStandardMaterial({map: this.texture('blood'), transparent: true, depthWrite: false, roughness: .25, side: THREE.DoubleSide});
    for (let y = 0; y < this.engine.rows; y++) {
      for (let x = 0; x < this.engine.cols; x++) {
        const cell = this.engine.grid[y][x];
        if (cell.top) this.wall(wall, wood, x * 4 + 2, y * 4, false);
        if (cell.left) this.wall(wall, wood, x * 4, y * 4 + 2, true);
        if (y === this.engine.rows - 1 && cell.bottom) this.wall(wall, wood, x * 4 + 2, (y + 1) * 4, false);
        if (x === this.engine.cols - 1 && cell.right) this.wall(wall, wood, (x + 1) * 4, y * 4 + 2, true);
        if ((x * 7 + y * 3) % 9 === 0 || (y === 0 && x === 1)) {
          const stain = new THREE.Mesh(new THREE.PlaneGeometry(3, 2.8), blood);
          stain.rotation.x = -Math.PI / 2; stain.rotation.z = (x + y) * .7; stain.position.set(x * 4 + 2, .015, y * 4 + 2); this.root.add(stain);
        }
      }
    }
    // Furnishings stay out of corridor paths and doorways.
    for (const [x, z] of [[4.8, 5], [21, 8], [40, 17], [9, 29], [34, 33]]) {
      const table = new THREE.Group(); table.position.set(x, 0, z);
      this.box(table, wood, [1.6, .16, .8], [0, .86, 0]);
      for (const dx of [-.65, .65]) for (const dz of [-.28, .28]) this.box(table, wood, [.1, .85, .1], [dx, .4, dz]);
      this.box(table, this.material(0xb9ab85), [.38, .025, .26], [.2, .96, 0]); this.root.add(table);
      const lamp = new THREE.PointLight(0xaf6938, .8, 7); lamp.position.set(x, 2.7, z); this.root.add(lamp);
    }
    // Abandoned sofa, overturned chair, bed and ceiling beams.
    const fabric = this.material(0x383b29);
    this.box(this.root, fabric, [2.5, .5, .85], [6, .5, 8.8]);
    this.box(this.root, fabric, [2.5, .8, .25], [6, 1, 9.2]);
    this.box(this.root, wood, [2.7, .3, 1.4], [11, .4, 33]);
    this.box(this.root, this.material(0xaaa087), [2.6, .25, 1.3], [11, .68, 33]);
    for (const z of [4, 12, 20, 28, 36]) this.box(this.root, wood, [60, .18, .22], [30, 3.5, z]);
    this.buildJeff(); this.buildSlender(); this.buildDog(); this.buildTv();
    this.root.add(this.jeff, this.slender, this.dog, this.tv, this.tvLight);
    this.slender.position.set(9, 0, 3); this.dog.position.set(10, 0, 30);
    this.tv.position.set(42, 0, 18); this.tvLight.position.set(42, 1.6, 18);
    this.items = this.engine.items.map(item => {
      const group = new THREE.Group();
      group.position.set(item.x * this.scale, .65, item.y * this.scale);
      if (item.type === 'key') {
        const gold = this.material(0xc5a447, .35);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(.14, .04, 8, 16), gold); group.add(ring);
        this.box(group, gold, [.06, .35, .06], [0, -.22, 0]); this.box(group, gold, [.16, .05, .05], [.05, -.34, 0]);
      } else this.box(group, this.material(item.type === 'battery' ? 0x577357 : 0xd8cba6), item.type === 'battery' ? [.18, .4, .18] : [.5, .03, .35], [0, 0, 0]);
      const light = new THREE.PointLight(item.type === 'key' ? 0xe8b84b : 0x93c8ac, .5, 3); group.add(light); this.root.add(group); return group;
    });
    const door = new THREE.Group(); door.position.set(this.engine.exitX * this.scale, 0, this.engine.exitY * this.scale);
    this.box(door, wood, [1.2, 2.8, .15], [0, 1.4, 0]);
    this.box(door, this.material(0xb69a48), [.08, .08, .12], [.45, 1.3, -.12]);
    const label = document.createElement('canvas'); label.width = 256; label.height = 64;
    const c = label.getContext('2d')!; c.fillStyle = '#19291e'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#ced5ad'; c.font = '30px monospace'; c.fillText('SALIDA', 68, 43);
    const texture = new THREE.CanvasTexture(label); this.textures.push(texture);
    this.box(door, new THREE.MeshBasicMaterial({map: texture}), [.9, .24, .02], [0, 2.3, -.1]); this.root.add(door);
  }

  private wall(wall: THREE.Material, wood: THREE.Material, x: number, z: number, vertical: boolean): void {
    this.box(this.root, wall, vertical ? [.13, 3.7, 4] : [4, 3.7, .13], [x, 1.85, z]);
    this.box(this.root, wood, vertical ? [.17, .17, 4] : [4, .17, .17], [x, .1, z]);
  }

  private buildJeff(): void {
    const hoodie = this.material(0xbbb8a8); const dark = this.material(0x111414);
    this.box(this.jeff, hoodie, [.55, .8, .3], [0, 1.25, 0]);
    for (const x of [-.17, .17]) this.box(this.jeff, dark, [.19, .85, .22], [x, .45, 0]);
    for (const x of [-.38, .38]) this.box(this.jeff, hoodie, [.16, .8, .2], [x, 1.1, 0]);
    const face = new THREE.MeshStandardMaterial({map: this.texture('jeff'), roughness: .8});
    this.sphere(this.jeff, dark, [0, 1.97, .02], [.34, .39, .28]);
    this.box(this.jeff, face, [.43, .5, .04], [0, 1.94, -.26]);
    const blade = this.box(this.jeff, this.material(0xa6abaa, .25), [.08, .5, .025], [.38, .55, -.08]); blade.rotation.z = -.3;
  }

  private buildSlender(): void {
    const suit = this.material(0x060708); const skin = this.material(0xc9cbbc);
    this.box(this.slender, suit, [.5, 1.1, .28], [0, 1.85, 0]);
    this.box(this.slender, skin, [.14, .3, .04], [0, 2.23, -.16]);
    this.box(this.slender, this.material(0x611519), [.04, .38, .05], [0, 2.08, -.19]);
    this.sphere(this.slender, skin, [0, 2.7, 0], [.23, .34, .22]);
    for (const x of [-.16, .16]) this.box(this.slender, suit, [.14, 1.4, .16], [x, .72, 0]);
    for (const x of [-.4, .4]) this.box(this.slender, suit, [.11, 1.5, .13], [x, 1.7, 0]);
    for (let i = 0; i < 6; i++) {
      const points = [new THREE.Vector3(0, 2, .1), new THREE.Vector3((i % 2 ? 1 : -1) * .8, 2.5 - i * .16, .4), new THREE.Vector3((i % 2 ? 1 : -1) * 1.3, 1.4 + i * .2, .1)];
      this.slender.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 12, .04, 5, false), suit));
    }
  }

  private buildDog(): void {
    const fur = this.material(0x3c2118);
    this.sphere(this.dog, fur, [0, .55, .2], [.45, .4, .7]);
    this.box(this.dog, new THREE.MeshStandardMaterial({map: this.texture('dog')}), [.65, .62, .3], [0, .9, -.5]);
    for (const x of [-.23, .23]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(.16, .4, 3), fur); ear.position.set(x, 1.37, -.4); this.dog.add(ear);
      for (const z of [-.15, .65]) this.box(this.dog, fur, [.12, .45, .15], [x, .22, z]);
    }
  }

  private buildTv(): void {
    this.box(this.tv, this.material(0x251b15), [1.9, 1.3, .9], [0, 1.1, 0]);
    this.box(this.tv, new THREE.MeshBasicMaterial({map: this.texture('sonic')}), [1.5, .95, .02], [-.08, 1.15, -.46]);
    const blue = this.material(0x122d61);
    const sonic = new THREE.Group(); sonic.position.set(1.5, 0, -.1);
    this.sphere(sonic, blue, [0, 1.1, 0], [.28, .5, .22]);
    this.sphere(sonic, blue, [0, 1.75, 0], [.43, .42, .35]);
    this.box(sonic, new THREE.MeshStandardMaterial({map: this.texture('sonic')}), [.58, .5, .04], [0, 1.75, -.33]);
    for (let i = 0; i < 5; i++) { const spike = new THREE.Mesh(new THREE.ConeGeometry(.18, .65, 4), blue); spike.position.set(Math.sin(i) * .3, 1.8 + Math.cos(i) * .3, .25); spike.rotation.x = Math.PI / 2; sonic.add(spike); }
    for (const x of [-.2, .2]) this.box(sonic, this.material(0x801b1c), [.3, .2, .5], [x, .18, -.1]);
    sonic.name = 'sonic'; this.tv.add(sonic);
  }

  render(time: number): void {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth; const height = canvas.clientHeight;
    if (!width || !height) return;
    const pixelRatio = this.renderer.getPixelRatio();
    if (canvas.width !== Math.floor(width * pixelRatio) || canvas.height !== Math.floor(height * pixelRatio)) {
      this.renderer.setSize(width, height, false); this.camera.aspect = width / height; this.camera.updateProjectionMatrix();
    }
    this.camera.position.set(this.engine.playerX * this.scale, 1.65, this.engine.playerY * this.scale);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.set(this.engine.playerPitch, -this.engine.playerAngle - Math.PI / 2, 0);
    const direction = new THREE.Vector3(); this.camera.getWorldDirection(direction);
    this.flashlight.position.copy(this.camera.position);
    this.target.position.copy(this.camera.position).add(direction.multiplyScalar(10));
    const battery = this.engine.battery();
    this.flashlight.intensity = battery <= 0 ? 0 : (battery < 25 ? 12 : 28) * (this.reducedMotion ? 1 : .95 + Math.sin(time * 12) * .05);
    this.jeff.position.set(this.engine.creatureX * this.scale, 0, this.engine.creatureY * this.scale);
    this.jeff.rotation.y = Math.atan2(this.camera.position.x - this.jeff.position.x, this.camera.position.z - this.jeff.position.z) + Math.PI;
    this.items.forEach((group, index) => { group.visible = !this.engine.items[index].collected; if (!this.reducedMotion) group.rotation.y = time * .4; });
    this.slender.visible = this.engine.gameTime() > 6 && this.engine.gameTime() % 24 < 17;
    this.dog.visible = this.engine.gameTime() > 15;
    const sonic = this.tv.getObjectByName('sonic'); if (sonic) sonic.visible = this.engine.gameTime() > 35;
    for (const entity of [this.slender, this.dog]) {
      entity.rotation.y = Math.atan2(this.camera.position.x - entity.position.x, this.camera.position.z - entity.position.z) + Math.PI;
    }
    const cycle = Math.floor(this.engine.gameTime() / 24);
    if (cycle !== this.lastRelocation && cycle > 0) {
      this.lastRelocation = cycle;
      const rooms = [[26, 10], [10, 30], [42, 18], [34, 34], [6, 6]];
      const room = rooms[cycle % rooms.length];
      this.slender.position.set(room[0], 0, room[1]);
    }
    if (this.engine.gameTime() - this.lastEncounter > 9) {
      const sight = new THREE.Vector3(); this.camera.getWorldDirection(sight);
      for (const [entity, message] of [[this.slender, 'Slender Man. El rostro está vacío. Aparta la mirada.'], [this.dog, 'Smile Dog: «Difunde la palabra». La sonrisa no pertenece a un animal.'], [this.tv, 'Sonic.exe: «I AM GOD». El televisor no tiene cable de corriente.']] as [THREE.Group, string][]) {
        const offset = entity.position.clone().sub(this.camera.position); offset.y = 0;
        if (entity.visible && offset.length() < 7 && sight.dot(offset.normalize()) > .8) {
          // Occlusion prevents psychological effects through walls.
          const ray = new THREE.Raycaster(this.camera.position, entity.position.clone().add(new THREE.Vector3(0, 1.4, 0)).sub(this.camera.position).normalize(), .1, 7);
          const hits = ray.intersectObjects(this.root.children, true);
          if (!hits.length) continue;
          let hit: THREE.Object3D | null = hits[0].object;
          while (hit && hit !== entity) hit = hit.parent;
          if (hit !== entity) continue;
          this.lastEncounter = this.engine.gameTime();
          this.engine.encounter.set(message);
          this.engine.sanity.update(value => Math.max(0, value - 7));
          break;
        }
      }
    }
    this.tvLight.intensity = this.reducedMotion ? 1 : 1.5 + Math.sin(time * 3) * .4;
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.scene.traverse(object => {
      if (object instanceof THREE.Mesh) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(material => material.dispose()); }
    });
    this.textures.forEach(texture => texture.dispose()); this.renderer.dispose();
  }
}
