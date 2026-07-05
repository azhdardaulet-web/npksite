interface Orb {
  x: number;
  y: number;
  r: number;
  color: { r: number; g: number; b: number };
  vx: number;
  vy: number;
  life: number;
  draw(ctx: CanvasRenderingContext2D): void;
  update(mouse: { x: number; y: number }, isLast: boolean): void;
}

class OrbImpl implements Orb {
  x: number;
  y: number;
  r: number;
  color: { r: number; g: number; b: number };
  vx: number;
  vy: number;
  life: number = 0;

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.r = 80 + Math.random() * 270;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.life = 0;

    const COLORS = [
      { r: 30, g: 5, b: 8 },
      { r: 15, g: 3, b: 5 },
      { r: 10, g: 2, b: 4 },
      { r: 25, g: 8, b: 6 },
      { r: 8, g: 2, b: 6 },
      { r: 219, g: 31, b: 38 },
      { r: 40, g: 6, b: 10 },
      { r: 5, g: 2, b: 8 },
    ];
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = 0.04 * this.life;
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
    gradient.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},1)`);
    gradient.addColorStop(1, `rgba(${this.color.r},${this.color.g},${this.color.b},0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  update(mouse: { x: number; y: number }, isLast: boolean): void {
    this.x += this.vx;
    this.y += this.vy;
    this.life = Math.min(this.life + 0.003, 1);

    if (isLast) {
      this.x += (mouse.x - this.x) * 0.01;
      this.y += (mouse.y - this.y) * 0.01;
    }
  }
}

export interface GlowInstance {
  destroy: () => void;
}

export function initGlowBackground(container: HTMLElement): GlowInstance {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.zIndex = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  let width = container.offsetWidth || window.innerWidth;
  let height = container.offsetHeight || window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  const MAX_ORBS = 6;
  const orbs: OrbImpl[] = [];
  const mouse = { x: width / 2, y: height / 2 };

  // Spawn initial orbs
  for (let i = 0; i < 4; i++) {
    orbs.push(new OrbImpl(width, height));
  }

  const onMouseMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };

  canvas.addEventListener('mousemove', onMouseMove);

  let frameId: number;

  const animate = () => {
    frameId = requestAnimationFrame(animate);

    // Motion trail
    ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let i = 0; i < 10; i++) {
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Update and draw orbs
    for (let i = 0; i < orbs.length; i++) {
      orbs[i].update(mouse, i === orbs.length - 1);
      orbs[i].draw(ctx);
    }

    // Respawn old orbs
    if (orbs[0] && orbs[0].life >= 1) {
      orbs.shift();
    }
    if (orbs.length < MAX_ORBS && Math.random() < 0.02) {
      orbs.push(new OrbImpl(width, height));
    }
  };

  animate();

  const onResize = () => {
    width = container.offsetWidth || window.innerWidth;
    height = container.offsetHeight || window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  };

  window.addEventListener('resize', onResize);

  return {
    destroy: () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousemove', onMouseMove);
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    },
  };
}
