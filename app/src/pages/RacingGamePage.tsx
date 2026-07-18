import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────
// Мини-игра «8-битная гонка» (/gonka)
// Псевдо-ретро 3D: three.js рендерит в низком разрешении,
// картинка растягивается с image-rendering: pixelated —
// получается «восьмибитный» пиксельный вид. Машинка игрока — синяя.
// Управление: ← → или A/D (на телефоне — левая/правая половина экрана).
// ─────────────────────────────────────────────────────────────

// Внутреннее разрешение рендера по вертикали (чем меньше — тем «пиксельнее»)
const RENDER_HEIGHT = 192;

// Геометрия трассы
const LANE_WIDTH = 3; // ширина полосы
const LANES_X = [-LANE_WIDTH, 0, LANE_WIDTH]; // центры трёх полос
const ROAD_WIDTH = LANE_WIDTH * 3;
const ROAD_LENGTH = 260; // насколько далеко вперёд тянется дорога
const PLAYER_Z = 3; // машинка игрока стоит на месте, мир едет на неё

// Скорости (юниты/сек)
const SPEED_START = 26;
const SPEED_MAX = 88;
const SPEED_ACCEL = 1.6; // прирост скорости в секунду

// 8-битная палитра
const PALETTE = {
  sky: 0x64b0ff,
  ground: 0x2e9e3f,
  road: 0x3a3a44,
  marking: 0xf0f0e0,
  curbA: 0xd82800,
  curbB: 0xf0f0e0,
  playerBody: 0x1b4fd8, // синяя машинка игрока
  playerCabin: 0x5c94fc,
  wheel: 0x141414,
  headlight: 0xf8d848,
  taillight: 0xd82800,
  trunk: 0x7a4a12,
  leaves: 0x1e7d2c,
  sun: 0xf8d848,
};

// Цвета машин-соперников (всё, кроме синего)
const TRAFFIC_COLORS: Array<[number, number]> = [
  [0xd82800, 0xf87858], // красная
  [0xf8b800, 0xf8d878], // жёлтая
  [0x8828b8, 0xb878e0], // фиолетовая
  [0x00a844, 0x58d878], // зелёная
  [0xe0e0e0, 0xf8f8f8], // белая
];

type Phase = 'start' | 'playing' | 'over';

// Машина-соперник в пуле
interface TrafficCar {
  group: THREE.Group;
  lane: number;
  speed: number; // собственная скорость (медленнее игрока)
  active: boolean;
}

// Простой квадратный «чиптюн»-бипер на WebAudio (звук в стиле 8 бит)
function makeBeeper() {
  let ctx: AudioContext | null = null;
  const ensure = () => {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  const beep = (freq: number, dur: number, delay = 0, vol = 0.04) => {
    try {
      const ac = ensure();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ac.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + delay + dur);
      osc.connect(gain).connect(ac.destination);
      osc.start(ac.currentTime + delay);
      osc.stop(ac.currentTime + delay + dur);
    } catch {
      // звук не критичен — молча игнорируем (например, автоплей запрещён)
    }
  };
  return {
    start() {
      beep(440, 0.09);
      beep(660, 0.09, 0.1);
      beep(880, 0.14, 0.2);
    },
    crash() {
      beep(220, 0.12, 0, 0.06);
      beep(160, 0.14, 0.1, 0.06);
      beep(110, 0.3, 0.2, 0.06);
    },
    score() {
      beep(1320, 0.05, 0, 0.02);
    },
  };
}

// Собирает «воксельную» машинку из коробок
function buildCar(bodyColor: number, cabinColor: number): THREE.Group {
  const g = new THREE.Group();
  const mat = (color: number) => new THREE.MeshLambertMaterial({ color });

  const body = new THREE.Mesh(new THREE.BoxGeometry(2, 0.6, 3.6), mat(bodyColor));
  body.position.y = 0.55;
  g.add(body);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 1.7), mat(cabinColor));
  cabin.position.set(0, 1.1, 0.25);
  g.add(cabin);

  const wheelGeo = new THREE.BoxGeometry(0.4, 0.7, 0.9);
  const wheelMat = mat(PALETTE.wheel);
  for (const [x, z] of [
    [-1.05, -1.15],
    [1.05, -1.15],
    [-1.05, 1.15],
    [1.05, 1.15],
  ]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.position.set(x, 0.35, z);
    g.add(w);
  }

  // Фары спереди (машины едут в -z) и стоп-сигналы сзади
  const lightGeo = new THREE.BoxGeometry(0.35, 0.2, 0.1);
  for (const x of [-0.6, 0.6]) {
    const head = new THREE.Mesh(lightGeo, mat(PALETTE.headlight));
    head.position.set(x, 0.6, -1.82);
    g.add(head);
    const tail = new THREE.Mesh(lightGeo, mat(PALETTE.taillight));
    tail.position.set(x, 0.6, 1.82);
    g.add(tail);
  }
  return g;
}

// Пиксельное дерево у обочины: ствол + «кубическая» крона
function buildTree(): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 1.6, 0.5),
    new THREE.MeshLambertMaterial({ color: PALETTE.trunk }),
  );
  trunk.position.y = 0.8;
  g.add(trunk);
  const leaves = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 2.2, 2.2),
    new THREE.MeshLambertMaterial({ color: PALETTE.leaves }),
  );
  leaves.position.y = 2.6;
  g.add(leaves);
  return g;
}

export function RacingGamePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const speedRef = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<Phase>('start');
  const [lastScore, setLastScore] = useState(0);
  const [hiScore, setHiScore] = useState(() =>
    Number(localStorage.getItem('npk-gonka-hiscore') || 0),
  );
  // Актуальная фаза для обработчиков внутри игрового цикла
  const phaseRef = useRef<Phase>('start');
  // Внешние команды в игровой цикл (старт/рестарт по кнопке или тапу)
  const startRequestRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Сцена, камера, рендерер ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PALETTE.sky);
    scene.fog = new THREE.Fog(PALETTE.sky, 70, 170);

    const camera = new THREE.PerspectiveCamera(70, 16 / 9, 0.1, 400);
    camera.position.set(0, 5.2, PLAYER_Z + 8.5);
    camera.lookAt(0, 1, PLAYER_Z - 14);

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(1); // низкое разрешение — основа пиксельного вида
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.imageRendering = 'pixelated';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const resize = () => {
      const aspect = container.clientWidth / Math.max(1, container.clientHeight);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(Math.round(RENDER_HEIGHT * aspect), RENDER_HEIGHT, false);
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Свет ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(-6, 12, 4);
    scene.add(sunLight);

    // ── Статика: земля, дорога, солнце ──
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600),
      new THREE.MeshLambertMaterial({ color: PALETTE.ground }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.05, -150);
    scene.add(ground);

    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(ROAD_WIDTH, ROAD_LENGTH + 60),
      new THREE.MeshLambertMaterial({ color: PALETTE.road }),
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -ROAD_LENGTH / 2 + 20);
    scene.add(road);

    const sun = new THREE.Mesh(
      new THREE.CircleGeometry(14, 8),
      new THREE.MeshBasicMaterial({ color: PALETTE.sun, fog: false }),
    );
    sun.position.set(-45, 45, -220);
    scene.add(sun);

    // ── Прокручиваемые элементы: разметка, бордюры, деревья ──
    // Все они едут на камеру (+z) и по выходу из кадра переносятся вперёд.
    const scrollers: THREE.Object3D[] = [];
    const recycleAt = camera.position.z + 6; // за камерой — переносим вперёд

    // Пунктир на границах полос: при трёх полосах границы проходят на x = ±LANE_WIDTH/2
    const markingGeo = new THREE.BoxGeometry(0.18, 0.02, 1.6);
    const markingMat = new THREE.MeshBasicMaterial({ color: PALETTE.marking });
    const markingXs = [-LANE_WIDTH / 2, LANE_WIDTH / 2];
    for (const x of markingXs) {
      for (let z = 0; z < ROAD_LENGTH; z += 5) {
        const m = new THREE.Mesh(markingGeo, markingMat);
        m.position.set(x, 0.01, -z + 10);
        scene.add(m);
        scrollers.push(m);
      }
    }

    // Бордюры по краям дороги — чередование красных и белых сегментов
    const curbGeo = new THREE.BoxGeometry(0.7, 0.24, 2.4);
    const curbMatA = new THREE.MeshLambertMaterial({ color: PALETTE.curbA });
    const curbMatB = new THREE.MeshLambertMaterial({ color: PALETTE.curbB });
    for (const side of [-1, 1]) {
      let toggle = false;
      for (let z = 0; z < ROAD_LENGTH; z += 2.4) {
        const c = new THREE.Mesh(curbGeo, toggle ? curbMatA : curbMatB);
        c.position.set(side * (ROAD_WIDTH / 2 + 0.35), 0.1, -z + 10);
        scene.add(c);
        scrollers.push(c);
        toggle = !toggle;
      }
    }

    // Деревья вдоль обочин
    for (const side of [-1, 1]) {
      for (let z = 0; z < ROAD_LENGTH; z += 16) {
        const t = buildTree();
        t.position.set(side * (ROAD_WIDTH / 2 + 4 + (z % 32 === 0 ? 2.5 : 0)), 0, -z - side * 7);
        scene.add(t);
        scrollers.push(t);
      }
    }

    // ── Машинка игрока (синяя) ──
    const player = buildCar(PALETTE.playerBody, PALETTE.playerCabin);
    player.position.set(0, 0, PLAYER_Z);
    scene.add(player);

    // ── Пул машин-соперников ──
    const traffic: TrafficCar[] = [];
    for (let i = 0; i < 8; i++) {
      const [body, cabin] = TRAFFIC_COLORS[i % TRAFFIC_COLORS.length];
      const group = buildCar(body, cabin);
      group.visible = false;
      scene.add(group);
      traffic.push({ group, lane: 1, speed: 0, active: false });
    }

    // ── Состояние игры ──
    const beeper = makeBeeper();
    let raf = 0;
    let last = performance.now();
    let speed = SPEED_START;
    let score = 0;
    let scoreMilestone = 0; // для звукового «дзынь» каждые 500 очков
    let steer = 0; // -1 влево, 1 вправо
    let playerX = 0;
    let spawnCooldown = 0;
    let shake = 0; // тряска камеры после аварии
    const keys = new Set<string>();
    const touchSides = new Map<number, number>(); // pointerId → -1|1

    const setPhaseBoth = (p: Phase) => {
      phaseRef.current = p;
      setPhase(p);
    };

    const resetGame = () => {
      speed = SPEED_START;
      score = 0;
      scoreMilestone = 0;
      playerX = 0;
      player.position.x = 0;
      player.rotation.z = 0;
      spawnCooldown = 1.2;
      shake = 0;
      for (const car of traffic) {
        car.active = false;
        car.group.visible = false;
      }
    };

    const startGame = () => {
      resetGame();
      setPhaseBoth('playing');
      beeper.start();
    };

    const gameOver = () => {
      setPhaseBoth('over');
      beeper.crash();
      shake = 0.7;
      const finalScore = Math.floor(score);
      setLastScore(finalScore);
      setHiScore((prev) => {
        const next = Math.max(prev, finalScore);
        localStorage.setItem('npk-gonka-hiscore', String(next));
        return next;
      });
    };

    // ── Спавн соперника в свободную полосу ──
    const spawnTraffic = () => {
      const free = traffic.filter((c) => !c.active);
      if (free.length === 0) return;
      // Не занимаем полосу, где у горизонта уже есть машина — оставляем проезд
      const blockedLanes = new Set(
        traffic.filter((c) => c.active && c.group.position.z < -ROAD_LENGTH * 0.55).map((c) => c.lane),
      );
      const lanes = [0, 1, 2].filter((l) => !blockedLanes.has(l));
      if (lanes.length <= 1) return; // всегда оставляем хотя бы одну свободную полосу
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      const car = free[Math.floor(Math.random() * free.length)];
      car.active = true;
      car.lane = lane;
      car.speed = speed * (0.35 + Math.random() * 0.25); // едут медленнее игрока
      car.group.position.set(LANES_X[lane], 0, -ROAD_LENGTH + 30);
      car.group.visible = true;
    };

    // ── Ввод: клавиатура ──
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space', 'Enter'].includes(e.code)) {
        e.preventDefault();
      }
      keys.add(e.code);
      if (phaseRef.current !== 'playing' && ['Space', 'Enter'].includes(e.code)) {
        startGame();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ── Ввод: касания/мышь — левая и правая половина экрана ──
    const onPointerDown = (e: PointerEvent) => {
      if (phaseRef.current !== 'playing') {
        startGame();
        return;
      }
      touchSides.set(e.pointerId, e.clientX < window.innerWidth / 2 ? -1 : 1);
    };
    const onPointerEnd = (e: PointerEvent) => touchSides.delete(e.pointerId);
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerEnd);
    window.addEventListener('pointercancel', onPointerEnd);

    // ── Главный цикл ──
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Запрос старта из React-оверлея (кнопка)
      if (startRequestRef.current) {
        startRequestRef.current = false;
        if (phaseRef.current !== 'playing') startGame();
      }

      const playing = phaseRef.current === 'playing';
      // Мир продолжает медленно ехать на стартовом экране — «аттракт-режим»
      const worldSpeed = playing ? speed : SPEED_START * 0.4;

      if (playing) {
        speed = Math.min(SPEED_MAX, speed + SPEED_ACCEL * dt);
        score += speed * dt;
        if (score - scoreMilestone >= 500) {
          scoreMilestone += 500;
          beeper.score();
        }

        // Руление
        steer = 0;
        if (keys.has('ArrowLeft') || keys.has('KeyA')) steer -= 1;
        if (keys.has('ArrowRight') || keys.has('KeyD')) steer += 1;
        for (const side of touchSides.values()) steer += side;
        steer = Math.max(-1, Math.min(1, steer));

        const maxX = ROAD_WIDTH / 2 - 1.3;
        playerX = Math.max(-maxX, Math.min(maxX, playerX + steer * 11 * dt));
        player.position.x += (playerX - player.position.x) * Math.min(1, 14 * dt);
        player.rotation.z += (steer * -0.12 - player.rotation.z) * Math.min(1, 10 * dt);

        // Спавн соперников — чаще с ростом скорости
        spawnCooldown -= dt;
        if (spawnCooldown <= 0) {
          spawnTraffic();
          spawnCooldown = 1.9 - (speed / SPEED_MAX) * 1.1 + Math.random() * 0.5;
        }
      }

      // Прокрутка дороги
      for (const obj of scrollers) {
        obj.position.z += worldSpeed * dt;
        if (obj.position.z > recycleAt) obj.position.z -= ROAD_LENGTH;
      }

      // Движение соперников (относительно игрока) + столкновения
      for (const car of traffic) {
        if (!car.active) continue;
        car.group.position.z += (worldSpeed - car.speed) * dt;
        if (car.group.position.z > recycleAt) {
          car.active = false;
          car.group.visible = false;
          continue;
        }
        if (playing) {
          const dz = Math.abs(car.group.position.z - player.position.z);
          const dx = Math.abs(car.group.position.x - player.position.x);
          if (dz < 3.3 && dx < 2.1) gameOver();
        }
      }

      // Тряска камеры после столкновения
      if (shake > 0) {
        shake = Math.max(0, shake - dt);
        camera.position.x = (Math.random() - 0.5) * shake * 1.2;
        camera.position.y = 5.2 + (Math.random() - 0.5) * shake * 0.8;
      } else {
        // Камера чуть следует за игроком по x — усиливает ощущение 3D
        camera.position.x += (player.position.x * 0.35 - camera.position.x) * Math.min(1, 5 * dt);
        camera.position.y = 5.2;
      }

      // HUD пишем напрямую в DOM, чтобы не дёргать React каждый кадр
      if (scoreRef.current) scoreRef.current.textContent = String(Math.floor(score)).padStart(6, '0');
      if (speedRef.current) speedRef.current.textContent = String(Math.round(speed * 2.2));

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
      container.removeChild(renderer.domElement);
    };
  }, []);

  // Пиксельный стиль текста без внешних шрифтов: моноширинный + «жёсткая» тень
  const pixelText: React.CSSProperties = {
    fontFamily: '"Courier New", monospace',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#fff',
    textShadow: '2px 2px 0 #000',
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none',
        cursor: 'default',
      }}
    >
      {/* HUD: очки и скорость */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 16px',
          pointerEvents: 'none',
          ...pixelText,
          fontSize: 'clamp(14px, 2.4vw, 22px)',
        }}
      >
        <div>
          SCORE <span ref={scoreRef}>000000</span>
        </div>
        <div>HI {String(hiScore).padStart(6, '0')}</div>
        <div>
          <span ref={speedRef}>0</span> KM/H
        </div>
      </div>

      {/* Стартовый экран / экран проигрыша */}
      {phase !== 'playing' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            background: 'rgba(0,0,0,0.45)',
            pointerEvents: 'none',
            textAlign: 'center',
            padding: 16,
          }}
        >
          <div style={{ ...pixelText, fontSize: 'clamp(26px, 6vw, 54px)', color: '#5c94fc' }}>
            {phase === 'start' ? 'NPK RACER' : 'GAME OVER'}
          </div>
          {phase === 'over' && (
            <div style={{ ...pixelText, fontSize: 'clamp(16px, 3vw, 26px)' }}>
              SCORE {String(lastScore).padStart(6, '0')} · HI {String(hiScore).padStart(6, '0')}
            </div>
          )}
          <div style={{ ...pixelText, fontSize: 'clamp(13px, 2.2vw, 18px)', opacity: 0.9 }}>
            ← → или A/D — руль · на телефоне жми левую/правую половину экрана
          </div>
          <div
            style={{
              ...pixelText,
              fontSize: 'clamp(15px, 2.6vw, 22px)',
              color: '#f8d848',
              animation: 'gonka-blink 1s steps(2, start) infinite',
            }}
          >
            {phase === 'start' ? 'Нажми SPACE или тапни, чтобы стартовать' : 'SPACE / тап — ещё раз'}
          </div>
          {/* Мигание в стиле старых приставок */}
          <style>{'@keyframes gonka-blink { 50% { opacity: 0; } }'}</style>
        </div>
      )}
    </div>
  );
}
