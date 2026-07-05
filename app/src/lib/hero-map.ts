import * as THREE from 'three';

// ─── Color Palette (red hues only) ───
const COLOR_PALETTE = [
  { h: 358, s: 100, l: 50, range: 2 },
  { h: 0, s: 90, l: 45, range: 4 },
  { h: 355, s: 80, l: 60, range: 3 },
  { h: 360, s: 95, l: 40, range: 5 },
  { h: 357, s: 85, l: 55, range: 3 },
];

function getRandomColor(max = 1, min = 0): THREE.Color {
  max = Math.max(0, Math.min(1, max));
  const index = Math.floor(Math.random() * COLOR_PALETTE.length);
  const entry = COLOR_PALETTE[index];
  const range = entry.range || 0;
  const hue = ((entry.h + (Math.random() * range - range / 2)) % 360 + 360) % 360;
  const saturation = entry.s * (min + Math.random() * (max - min));
  const lightness = entry.l * (min + Math.random() * (max - min));
  return new THREE.Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
}

// ─── Line Vertex & Fragment Shaders ───
const lineVertexShader = `
  attribute float linePosition;
  varying float vLinePosition;
  void main() {
    vLinePosition = linePosition;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const lineFragmentShader = `
  uniform vec3 color;
  uniform float opacity;
  uniform float progress;
  varying float vLinePosition;
  void main() {
    if (vLinePosition > progress) discard;
    float edge = smoothstep(progress - 0.05, progress, vLinePosition);
    float glow = 1.0 - edge;
    vec3 finalColor = color + glow * 0.4;
    gl_FragColor = vec4(finalColor, opacity * (0.6 + glow * 0.4));
  }
`;

// ─── MeshLine Class ───
class MeshLine {
  mesh: THREE.Line;
  material: THREE.ShaderMaterial;
  speed: number;
  dying: boolean = false;
  timer: number = 0;
  maxTimer: number = 60 + Math.random() * 120;
  progress: number = 0;

  constructor(points: THREE.Vector3[], speedMultiplier: number = 1) {
    this.speed = (0.04 + Math.random() * 0.04) * speedMultiplier;

    const positions: number[] = [];
    const linePositions: number[] = [];
    const totalPoints = points.length;

    for (let i = 0; i < totalPoints; i++) {
      positions.push(points[i].x, points[i].y, points[i].z);
      linePositions.push(i / (totalPoints - 1));
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('linePosition', new THREE.Float32BufferAttribute(linePositions, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader: lineVertexShader,
      fragmentShader: lineFragmentShader,
      uniforms: {
        color: { value: getRandomColor() },
        opacity: { value: 0.8 + Math.random() * 0.2 },
        progress: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.mesh = new THREE.Line(geometry, this.material);
  }

  draw(): void {
    this.progress += this.speed;
    this.material.uniforms.progress.value = Math.min(this.progress, 1.2);

    if (this.progress >= 1.0) {
      this.timer++;
      if (this.timer >= this.maxTimer) {
        this.dying = true;
      }
    }
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

// ─── Kazakhstan Border Data ───
function centralLine(): THREE.Vector3[] {
  return [
    new THREE.Vector3(12.5, 17.2, 0),
    new THREE.Vector3(11.5, 15.8, 0),
    new THREE.Vector3(10.8, 14.0, 0),
    new THREE.Vector3(9.8, 12.2, 0),
    new THREE.Vector3(8.5, 10.0, 0),
    new THREE.Vector3(7.0, 8.0, 0),
    new THREE.Vector3(5.0, 6.0, 0),
    new THREE.Vector3(3.0, 4.2, 0),
    new THREE.Vector3(2.0, 3.0, 0),
    new THREE.Vector3(0.5, 1.5, 0),
    new THREE.Vector3(-1.0, 0.5, 0),
    new THREE.Vector3(-2.2, -0.8, 0),
    new THREE.Vector3(-3.5, -2.0, 0),
    new THREE.Vector3(-4.8, -3.0, 0),
    new THREE.Vector3(-6.0, -3.5, 0),
    new THREE.Vector3(-5.0, -2.5, 0),
    new THREE.Vector3(-3.8, -1.8, 0),
    new THREE.Vector3(-2.0, -1.0, 0),
    new THREE.Vector3(-0.5, 0.2, 0),
    new THREE.Vector3(1.0, 1.5, 0),
    new THREE.Vector3(2.5, 3.0, 0),
    new THREE.Vector3(4.0, 4.5, 0),
    new THREE.Vector3(5.5, 6.2, 0),
    new THREE.Vector3(7.0, 8.0, 0),
    new THREE.Vector3(8.2, 9.8, 0),
    new THREE.Vector3(9.5, 11.5, 0),
    new THREE.Vector3(10.5, 13.2, 0),
    new THREE.Vector3(11.0, 14.5, 0),
    new THREE.Vector3(12.0, 16.0, 0),
  ];
}

function leftLine(): THREE.Vector3[] {
  return [
    new THREE.Vector3(-10.0, 4.0, 0),
    new THREE.Vector3(-9.2, 2.8, 0),
    new THREE.Vector3(-8.5, 1.5, 0),
    new THREE.Vector3(-7.8, 0.2, 0),
    new THREE.Vector3(-7.0, -1.0, 0),
    new THREE.Vector3(-6.5, -2.2, 0),
    new THREE.Vector3(-6.0, -3.5, 0),
  ];
}

function rightLine(): THREE.Vector3[] {
  return [
    new THREE.Vector3(12.5, 17.2, 0),
    new THREE.Vector3(13.2, 16.2, 0),
    new THREE.Vector3(14.0, 15.0, 0),
    new THREE.Vector3(14.8, 13.5, 0),
    new THREE.Vector3(15.5, 12.0, 0),
    new THREE.Vector3(15.2, 10.5, 0),
    new THREE.Vector3(14.5, 9.0, 0),
    new THREE.Vector3(13.5, 7.5, 0),
    new THREE.Vector3(12.5, 6.5, 0),
  ];
}

// ─── LineGroup Class ───
class LineGroup {
  lines: MeshLine[] = [];
  maxCount: number = 4;
  scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  addLine(points: THREE.Vector3[], speedMultiplier: number = 1): void {
    if (this.lines.length >= this.maxCount) return;

    // Subdivide points for smoother curves
    const smoothPoints: THREE.Vector3[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      smoothPoints.push(p1);
      smoothPoints.push(new THREE.Vector3(
        (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 0.3,
        (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 0.3,
        0
      ));
    }
    smoothPoints.push(points[points.length - 1]);

    const line = new MeshLine(smoothPoints, speedMultiplier);
    this.lines.push(line);
    this.scene.add(line.mesh);
  }

  letFallLine(position: THREE.Vector3): void {
    const angle = Math.random() * Math.PI * 2;
    const length = 5 + Math.random() * 5;
    const endX = position.x + Math.cos(angle) * length;
    const endY = position.y + Math.sin(angle) * length;

    const points = [
      new THREE.Vector3(position.x, position.y, 0),
      new THREE.Vector3(
        (position.x + endX) / 2 + (Math.random() - 0.5) * 2,
        (position.y + endY) / 2 + (Math.random() - 0.5) * 2,
        0
      ),
      new THREE.Vector3(endX, endY, 0),
    ];

    this.addLine(points, 1.5);
  }

  update(): void {
    for (let i = this.lines.length - 1; i >= 0; i--) {
      const line = this.lines[i];
      line.draw();
      if (line.dying) {
        this.scene.remove(line.mesh);
        line.dispose();
        this.lines.splice(i, 1);
      }
    }
  }
}

// ─── Ambient Particles ───
function createParticles(scene: THREE.Scene): { update: (time: number) => void; dispose: () => void } {
  const count = 50;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const basePositions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 50;
    const y = (Math.random() - 0.5) * 50;
    const z = (Math.random() - 0.5) * 50;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    basePositions[i * 3] = x;
    basePositions[i * 3 + 1] = y;
    basePositions[i * 3 + 2] = z;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return {
    update: (time: number) => {
      const posArray = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        posArray[idx] = basePositions[idx] + Math.sin(time * 0.1 + i) * 0.5;
        posArray[idx + 1] = basePositions[idx + 1] + Math.cos(time * 0.08 + i * 0.5) * 0.3;
      }
      geometry.attributes.position.needsUpdate = true;
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
      scene.remove(points);
    },
  };
}

// ─── Main Init Function ───
export interface HeroMapInstance {
  destroy: () => void;
}

export function initHeroMap(container: HTMLElement): HeroMapInstance {
  const width = container.offsetWidth || window.innerWidth;
  const height = container.offsetHeight || window.innerHeight;

  // Scene
  const scene = new THREE.Scene();
  scene.background = null; // Transparent — shows Canvas2D glow beneath

  // Camera
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 30;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000001, 0); // Transparent clear
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);

  // Line Groups for each border region
  const centralGroup = new LineGroup(scene);
  const leftGroup = new LineGroup(scene);
  const rightGroup = new LineGroup(scene);

  // Initialize with border outline segments
  const central = centralLine();
  const left = leftLine();
  const right = rightLine();

  // Split border into segments for progressive drawing
  function splitIntoSegments(points: THREE.Vector3[], segments: number): THREE.Vector3[][] {
    const result: THREE.Vector3[][] = [];
    const perSegment = Math.floor(points.length / segments);
    for (let i = 0; i < segments; i++) {
      const start = i * perSegment;
      const end = i === segments - 1 ? points.length : (i + 1) * perSegment + 1;
      result.push(points.slice(start, end));
    }
    return result;
  }

  // Add segments with staggered delays
  const centralSegments = splitIntoSegments(central, 4);
  const leftSegments = splitIntoSegments(left, 2);
  const rightSegments = splitIntoSegments(right, 2);

  // Add initial border segments
  centralSegments.forEach((seg, i) => {
    setTimeout(() => centralGroup.addLine(seg, 0.8), i * 400);
  });
  leftSegments.forEach((seg, i) => {
    setTimeout(() => leftGroup.addLine(seg, 0.8), 800 + i * 400);
  });
  rightSegments.forEach((seg, i) => {
    setTimeout(() => rightGroup.addLine(seg, 0.8), 1200 + i * 400);
  });

  // Ambient particles
  const particles = createParticles(scene);

  // Raycaster for click interaction
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-10, -10);
  const planeGeometry = new THREE.PlaneGeometry(500, 500);
  const planeMaterial = new THREE.MeshBasicMaterial({ visible: false });
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(planeMesh);

  let intersection: THREE.Vector3 | null = null;

  const onMouseMove = (event: MouseEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(planeMesh);
    if (intersects.length > 0) {
      intersection = intersects[0].point;
    }
  };

  const onClick = () => {
    if (intersection) {
      // Add 2-3 lines from click point
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          centralGroup.letFallLine(intersection!);
        }, i * 100);
      }
    }
  };

  renderer.domElement.addEventListener('mousemove', onMouseMove);
  renderer.domElement.addEventListener('click', onClick);

  // Animation loop
  let frameId: number;
  const startTime = Date.now();

  const animate = () => {
    frameId = requestAnimationFrame(animate);
    const time = (Date.now() - startTime) / 1000;

    particles.update(time);
    centralGroup.update();
    leftGroup.update();
    rightGroup.update();

    renderer.render(scene, camera);
  };

  animate();

  // Resize handler
  const onResize = () => {
    const w = container.offsetWidth || window.innerWidth;
    const h = container.offsetHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };

  window.addEventListener('resize', onResize);

  // Return cleanup function
  return {
    destroy: () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      particles.dispose();
      [centralGroup, leftGroup, rightGroup].forEach(g => {
        g.lines.forEach(l => l.dispose());
      });
      renderer.dispose();
      planeGeometry.dispose();
      planeMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
