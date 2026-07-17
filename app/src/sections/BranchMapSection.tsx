import { useEffect, useRef, useState } from 'react';
import { getLenis } from '@/hooks/useLenis';

// ─── Branch data ──────────────────────────────────────────────────────────────
const BRANCHES = [
  { name:'Алматинский городской филиал',           short:'Алматы',                       city:true, lng:76.889, lat:43.238, chairman:'Кусаинов Бейбут Булатович',         email:'halykparty_almaty@mail.ru',      address:'050000, г. Алматы, пр. Абая, 52',                    phone:'8 (727) 250-14-30' },
  { name:'Астанинский городской филиал',            short:'Астана',                        city:true, lng:71.449, lat:51.169, chairman:'Оразханов Нұрдәулет Амантайұлы',    email:'halykparty_astana@mail.ru',      address:'010000, г. Астана, ул. Желтоксан, 16',               phone:'8 (7172) 700-216'  },
  { name:'Шымкентский городской филиал',            short:'Шымкент',                       city:true, lng:69.587, lat:42.317, chairman:'Умаров Баймырза Абденбаевич',        email:'halykparty_shymkent@mail.ru',    address:'160000, г. Шымкент, пр. Тауке хана, 24',            phone:'8 (7252) 53-11-08' },
  { name:'Акмолинский областной филиал',            short:'Акмолинская область',           city:false, lng:69.388, lat:53.284, chairman:'Тастамбеков Арман Зейнуллаевич',   email:'halykparty_akmola@mail.ru',      address:'020000, г. Кокшетау, ул. М. Дулатулы, 31',          phone:'8 (7752) 12-92-93' },
  { name:'Актюбинский областной филиал',            short:'Актюбинская область',           city:false, lng:57.166, lat:50.283, chairman:'Курмангазин Бауыржан Олжашевич',   email:'halykparty_aktobe@mail.ru',      address:'030000, г. Актобе, пр. Абилкайыр хана, 40',         phone:'8 (7132) 56-20-44' },
  { name:'Алматинский областной филиал',            short:'Алматинская область',           city:false, lng:77.07,  lat:43.86,  chairman:'Дудабаев Еркебулан Бакытович',      email:'halykparty_almatyobl@mail.ru',   address:'040000, г. Қонаев, ул. Гагарина, 7',                phone:'8 (72822) 6-15-30' },
  { name:'Атырауский областной филиал',             short:'Атырауская область',            city:false, lng:51.923, lat:47.094, chairman:'Досмухамбетова Балжан Ибатовна',    email:'halykparty_atyrau@mail.ru',      address:'060000, г. Атырау, пр. Азаттык, 17',                phone:'8 (7122) 32-18-65' },
  { name:'Восточно-Казахстанский областной филиал', short:'Восточно-Казахстанская область',city:false, lng:82.628, lat:49.948, chairman:'Мусин Кайрат Маратович',            email:'halykparty_vko@mail.ru',         address:'070000, г. Усть-Каменогорск, ул. Кабанбай батыра, 156', phone:'8 (7232) 25-40-19' },
  { name:'Жетысуский областной филиал',             short:'Жетысуская область',            city:false, lng:78.374, lat:45.016, chairman:'Ибраимов Олжас Бекдаулетович',      email:'halykparty_zhetysu@mail.ru',     address:'040000, г. Талдыкорган, ул. Тауелсиздик, 53',       phone:'8 (7282) 27-11-90' },
  { name:'Жамбылский областной филиал',             short:'Жамбылская область',            city:false, lng:71.367, lat:42.9,   chairman:'Аккозиев Рахман Сейлханович',       email:'halykparty_zhambyl@mail.ru',     address:'080000, г. Тараз, пр. Жамбыла, 79',                 phone:'8 (7262) 43-22-17' },
  { name:'Западно-Казахстанский областной филиал',  short:'Западно-Казахстанская область', city:false, lng:51.387, lat:51.227, chairman:'Лаврентьев Борис Георгиевич',       email:'halykparty_zko@mail.ru',         address:'090000, г. Уральск, пр. Достык-Дружба, 182',        phone:'8 (7112) 51-08-33' },
  { name:'Карагандинский областной филиал',         short:'Карагандинская область',        city:false, lng:73.085, lat:49.806, chairman:'Максутов Калел Мухатаевич',          email:'halykparty_karaganda@mail.ru',   address:'100000, г. Караганда, ул. Ерубаева, 26',            phone:'8 (7212) 41-15-72' },
  { name:'Костанайский областной филиал',           short:'Костанайская область',          city:false, lng:63.632, lat:53.214, chairman:'Березуцкая Ольга Ивановна',          email:'halykparty_kostanay@mail.ru',    address:'110000, г. Костанай, ул. Аль-Фараби, 65',           phone:'8 (7142) 54-30-21' },
  { name:'Филиал области Абай',                     short:'Область Абай',                  city:false, lng:80.227, lat:50.411, chairman:'',                                   email:'halykparty_abay@mail.ru',        address:'071400, г. Семей, ул. Абая, 90',                    phone:'8 (7222) 56-12-04' },
  { name:'Кызылординский областной филиал',         short:'Кызылординская область',        city:false, lng:65.482, lat:44.848, chairman:'Ерназаров Кайрат Шаршыбекович',      email:'halykparty_kyzylorda@mail.ru',   address:'120000, г. Кызылорда, ул. Айтеке би, 29',           phone:'8 (7242) 27-09-15' },
  { name:'Мангистауский областной филиал',          short:'Мангистауская область',         city:false, lng:51.198, lat:43.641, chairman:'Тулеугалиев Рашид Бектурович',        email:'halykparty_mangistau@mail.ru',   address:'130000, г. Актау, 14 микрорайон, 1',                phone:'8 (7292) 43-17-60' },
  { name:'Павлодарский областной филиал',           short:'Павлодарская область',          city:false, lng:76.967, lat:52.287, chairman:'Агибаев Алимбек Тулегенович',         email:'halykparty_pavlodar@mail.ru',    address:'140000, г. Павлодар, ул. Кутузова, 204',            phone:'8 (7182) 32-44-81' },
  { name:'Северо-Казахстанский областной филиал',   short:'Северо-Казахстанская область',  city:false, lng:69.163, lat:54.873, chairman:'Жумагулов Ергали Сергалиевич',        email:'halykparty_sko@mail.ru',         address:'150000, г. Петропавловск, ул. Конституции, 58',     phone:'8 (7152) 46-20-37' },
  { name:'Туркестанский областной филиал',          short:'Туркестанская область',         city:false, lng:68.252, lat:43.297, chairman:'Камбарова Зухра Медеуовна',            email:'halykparty_turkestan@mail.ru',   address:'161200, г. Туркестан, пр. Тауке хана, 312',         phone:'8 (72533) 4-11-22' },
  { name:'Областной филиал Улытау',                 short:'Улытауская область',            city:false, lng:67.707, lat:47.803, chairman:'Максутов Калел Мухатаевич',           email:'halykparty_ulytau@mail.ru',      address:'100600, г. Жезказган, пр. Сатпаева, 28',            phone:'8 (7102) 76-30-15' },
];

const GEO_LABELS: {t:string,lng:number,lat:number,big?:boolean}[] = [];
const REGION_LABELS = [
  {t:'АКМОЛИНСКАЯ\nОБЛАСТЬ',lng:69.8,lat:51.6},{t:'АКТЮБИНСКАЯ\nОБЛАСТЬ',lng:58.5,lat:48.6},
  {t:'АЛМАТИНСКАЯ\nОБЛАСТЬ',lng:78.5,lat:44.2},{t:'АТЫРАУСКАЯ\nОБЛАСТЬ',lng:52.5,lat:47.6},
  {t:'ВОСТОЧНО-\nКАЗАХСТАНСКАЯ',lng:83.5,lat:48.6},{t:'ЖЕТЫСУСКАЯ\nОБЛАСТЬ',lng:79.4,lat:45.7},
  {t:'ЖАМБЫЛСКАЯ\nОБЛАСТЬ',lng:72,lat:43.7},{t:'ЗАПАДНО-\nКАЗАХСТАНСКАЯ',lng:50.5,lat:49.5},
  {t:'КАРАГАНДИНСКАЯ\nОБЛАСТЬ',lng:73.5,lat:48.7},{t:'КОСТАНАЙСКАЯ\nОБЛАСТЬ',lng:64,lat:51.8},
  {t:'ОБЛАСТЬ АБАЙ',lng:79.5,lat:49.6},{t:'КЫЗЫЛОРДИНСКАЯ\nОБЛАСТЬ',lng:64,lat:45.2},
  {t:'МАНГИСТАУСКАЯ\nОБЛАСТЬ',lng:53.5,lat:44},{t:'ПАВЛОДАРСКАЯ\nОБЛАСТЬ',lng:77,lat:52},
  {t:'СЕВЕРО-\nКАЗАХСТАНСКАЯ',lng:69,lat:54.2},{t:'ТУРКЕСТАНСКАЯ\nОБЛАСТЬ',lng:68.5,lat:43.6},
  {t:'УЛЫТАУСКАЯ\nОБЛАСТЬ',lng:67,lat:48.5},
];

// ─── Globe controller (pure imperative SVG, no React) ────────────────────────
type GlobeState = { selected: number | null; hovered: number | null };
type Feat = { type: string; coords: number[][][][] };

class GlobeController {
  private host: HTMLElement;
  private onChange: (s: GlobeState) => void;
  private state: GlobeState = { selected: null, hovered: null };
  private D2R = Math.PI / 180;
  private R2D = 180 / Math.PI;
  private view = { lambda:67, phi:8, gamma:0, R:600, cx:800, cy:760, zoom:0.78 };
  private _scrollZoom = 0.78;
  private _baseZoom   = 0.78;
  private _fullZoom   = 1.32;
  private drag = { on:false, x:0, y:0, l:0, p:0 };
  private parallax = { x:0, y:0, tx:0, ty:0 };
  private lastUser = 0;
  private hoverFeat = -1;
  private hoverMarker = -1;
  private _moved = false;
  private _mounted = true;
  private _raf = 0;
  private _hoverTimer = 0;
  private _lastHoveredBi: number | null | undefined = undefined;
  private W = 0; private H = 0;
  private _world: Feat[] = [];
  private _kz: Feat[] = [];
  private _branchFeat: number[] = [];
  private _featBranch: Record<number,number> = {};
  private _worldEls: {p:SVGPathElement,f:Feat}[] = [];
  private _lightPts: {lng:number,lat:number,col:string,a:number,r:number}[] = [];
  private _lightEls: SVGCircleElement[] = [];
  private _regionEls: {fillP:SVGPathElement,lineP:SVGPathElement,f:Feat,i:number}[] = [];
  private _labelEls: {el:SVGTextElement,o:{t:string,lng:number,lat:number,big?:boolean},kind:string,lines:string[]}[] = [];
  private _markerEls: any[] = [];
  private _ro: ResizeObserver | null = null;
  private svg: SVGSVGElement | null = null;
  private els: Record<string,any> = {};

  constructor(host: HTMLElement, onChange: (s: GlobeState) => void) {
    this.host = host;
    this.onChange = onChange;
    this._tick = this._tick.bind(this);
    this._buildScene();
    this._makeLabels();
    this._makeMarkers();
    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(host);
    this._loadData();
    this._raf = requestAnimationFrame(this._tick);
    this._bindEvents();
  }

  destroy() {
    this._mounted = false;
    cancelAnimationFrame(this._raf);
    this._ro?.disconnect();
    clearTimeout(this._hoverTimer);
    this.host.innerHTML = '';
  }

  setScrollZoom(progress: number) {
    this._scrollZoom = this._baseZoom + (this._fullZoom - this._baseZoom) * Math.max(0, Math.min(1, progress));
  }

  selectBranch(i: number) { this._setState({ selected: i, hovered: null }); }
  close() { this._setState({ selected: null, hovered: null }); }

  private _setState(patch: Partial<GlobeState>) {
    this.state = { ...this.state, ...patch };
    this.onChange(this.state);
  }

  // ── SVG element helper ─────────────────────────────────────────────────────
  private _S(tag: string, attrs?: Record<string,string>) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag) as any;
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  // ── Sphere math ─────────────────────────────────────────────────────────────
  private _proj(lng: number, lat: number) {
    const V=this.view, D=this.D2R;
    const lr=(lng-V.lambda)*D, la=lat*D, cl=Math.cos(la);
    const x0=cl*Math.cos(lr), y0=cl*Math.sin(lr), z0=Math.sin(la);
    const cp=Math.cos(V.phi*D), sp=Math.sin(V.phi*D);
    const x1=x0*cp+z0*sp, y1=y0, z1=-x0*sp+z0*cp;
    const cg=Math.cos(V.gamma*D), sg=Math.sin(V.gamma*D);
    const rx=x1, ry=y1*cg-z1*sg, rz=y1*sg+z1*cg;
    return { sx:V.cx+V.R*ry, sy:V.cy-V.R*rz, rx, ry, rz, v:rx>=0 };
  }

  private _unproj(px: number, py: number) {
    const V=this.view, D=this.D2R;
    const Ry=(px-V.cx)/V.R, Rz=-(py-V.cy)/V.R;
    const r2=Ry*Ry+Rz*Rz; if(r2>1) return null;
    const cg=Math.cos(V.gamma*D), sg=Math.sin(V.gamma*D);
    const y1=Ry*cg+Rz*sg, z1=-Ry*sg+Rz*cg, x1=Math.sqrt(Math.max(0,1-r2));
    const cp=Math.cos(V.phi*D), sp=Math.sin(V.phi*D);
    const x0=x1*cp-z1*sp, y0=y1, z0=x1*sp+z1*cp;
    const lat=Math.asin(Math.max(-1,Math.min(1,z0)))*this.R2D;
    let lng=Math.atan2(y0,x0)*this.R2D+V.lambda;
    lng=((((lng+180)%360)+360)%360)-180;
    return { lng, lat };
  }

  private _limb(A: any, B: any) {
    const V=this.view, D=this.D2R, tol=1e-4; let lo=0,hi=1;
    for(let k=0;k<14;k++){ const m=(lo+hi)/2, lm=A.rx+m*(B.rx-A.rx); lm<tol?hi=m:lo=m; }
    const t=(lo+hi)/2;
    const Ry=A.ry+t*(B.ry-A.ry), Rz=A.rz+t*(B.rz-A.rz), n=Math.sqrt(Ry*Ry+Rz*Rz);
    if(n<1e-9) return null;
    return { sx:V.cx+V.R*(Ry/n), sy:V.cy-V.R*(Rz/n) };
  }

  private _ringSegs(ring: number[][]) {
    const n=ring.length; if(n<3) return [];
    const pr=ring.map(c=>this._proj(c[0],c[1])); const vis=pr.filter(p=>p.v).length;
    if(vis===0) return []; if(vis===n) return [pr];
    let s=-1; for(let i=0;i<n;i++) if(!pr[i].v && pr[(i+1)%n].v){ s=i; break; }
    if(s===-1) return [pr];
    const segs: any[][] = []; let cur: any[] = [];
    for(let k=0;k<n;k++){
      const A=pr[(s+k)%n], B=pr[(s+k+1)%n];
      if(A.v&&B.v) cur.push(B);
      else if(A.v&&!B.v){ const it=this._limb(A,B); if(it) cur.push(it); if(cur.length>=2) segs.push(cur); cur=[]; }
      else if(!A.v&&B.v){ const it=this._limb(A,B); if(it) cur.push(it); cur.push(B); }
    }
    return segs;
  }

  private _path(type: string, coords: any) {
    let out = '';
    const add = (ring: number[][]) => {
      for(const sg of this._ringSegs(ring))
        for(let i=0;i<sg.length;i++) out+=(i===0?'M':'L')+sg[i].sx.toFixed(1)+','+sg[i].sy.toFixed(1);
      out+='Z';
    };
    if(type==='Polygon') coords.forEach((r: number[][])=>add(r));
    else if(type==='MultiPolygon') coords.forEach((p: number[][][])=>p.forEach((r: number[][])=>add(r)));
    return out;
  }

  private _pointInRing(x: number, y: number, ring: number[][]) {
    let inside=false; const n=ring.length;
    for(let i=0,j=n-1;i<n;j=i++){
      const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];
      if((yi>y)!==(yj>y) && x<((xj-xi)*(y-yi)/(yj-yi)+xi)) inside=!inside;
    }
    return inside;
  }

  // ── TopoJSON decode ─────────────────────────────────────────────────────────
  private _decArcs(t: any) {
    const tf=t.transform; if(!tf) return t.arcs;
    const sx=tf.scale[0],sy=tf.scale[1],dx=tf.translate[0],dy=tf.translate[1];
    return t.arcs.map((a: number[][])=>{ let x=0,y=0; return a.map((p: number[])=>{ x+=p[0]; y+=p[1]; return [x*sx+dx,y*sy+dy]; }); });
  }
  private _resolveRing(idx: number[], arcs: number[][][]) {
    const out: number[][] = [];
    for(const i of idx){ const a=i>=0?arcs[i]:arcs[~i].slice().reverse(); for(let j=out.length>0?1:0;j<a.length;j++) out.push(a[j]); }
    return out;
  }
  private _extractWorld(t: any): Feat[] {
    const arcs=this._decArcs(t); const gs=t.objects.countries?.geometries; if(!gs) return [];
    return gs.map((g: any)=>{
      let c: any = null;
      if(g.type==='Polygon') c=g.arcs.map((r: number[])=>this._resolveRing(r,arcs));
      else if(g.type==='MultiPolygon') c=g.arcs.map((p: number[][])=>p.map((r: number[])=>this._resolveRing(r,arcs)));
      return { type:g.type, coords:c };
    });
  }

  // ── Build SVG scene ─────────────────────────────────────────────────────────
  private _buildScene() {
    const svg=this._S('svg',{width:'100%',height:'100%'}) as SVGSVGElement;
    svg.style.cssText='display:block;position:absolute;inset:0';
    const defs=this._S('defs');

    const addFilter = (id: string, blur: string) => {
      const f=this._S('filter',{id,x:'-60%',y:'-60%',width:'220%',height:'220%'});
      const fb=this._S('feGaussianBlur',{stdDeviation:blur,result:'b'});
      const fm=this._S('feMerge');
      fm.appendChild(this._S('feMergeNode',{in:'b'})); fm.appendChild(this._S('feMergeNode',{in:'SourceGraphic'}));
      f.appendChild(fb); f.appendChild(fm); defs.appendChild(f);
    };
    addFilter('npk-glow','3.4'); addFilter('npk-soft','5');

    const lg=this._S('linearGradient',{id:'npk-atm',x1:'0',y1:'0',x2:'0',y2:'1'});
    [[0,'#5fc8ff',0.95],[14,'#2e9be0',0.6],[42,'#1c5a92',0.12],[100,'#0a1a3d',0.04]].forEach(([o,c,a])=>{
      lg.appendChild(this._S('stop',{offset:o+'%','stop-color':c as string,'stop-opacity':String(a)}));
    });
    defs.appendChild(lg);

    const rg=this._S('radialGradient',{id:'npk-ocean',cx:'52%',cy:'44%',r:'55%'});
    [[0,'var(--globe-ocean-1)',1],[55,'var(--globe-ocean-2)',1],[100,'var(--globe-ocean-3)',1]].forEach(([o,c,a])=>{
      rg.appendChild(this._S('stop',{offset:o+'%','stop-color':c as string,'stop-opacity':String(a)}));
    });
    defs.appendChild(rg);

    const sg=this._S('radialGradient',{id:'npk-shade',cx:'28%',cy:'32%',r:'60%'});
    [['0%','#ffffff','0.06'],['58%','#000000','0'],['100%','#000000','0.5']].forEach(([o,c,a])=>
      sg.appendChild(this._S('stop',{offset:o,'stop-color':c,'stop-opacity':a})));
    defs.appendChild(sg);

    const clip=this._S('clipPath',{id:'npk-disc'}); const clipC=this._S('circle',{cx:'0',cy:'0',r:'1'}); clip.appendChild(clipC); defs.appendChild(clip);
    svg.appendChild(defs);

    const gStars=this._S('g'); svg.appendChild(gStars);
    const atmBlur=this._S('circle',{fill:'none',stroke:'url(#npk-atm)','stroke-width':'104',filter:'url(#npk-soft)',opacity:'0.85'}); svg.appendChild(atmBlur);
    const atmBlur2=this._S('circle',{fill:'none',stroke:'url(#npk-atm)','stroke-width':'34',opacity:'0.8'}); svg.appendChild(atmBlur2);
    const ocean=this._S('circle',{fill:'url(#npk-ocean)'}); svg.appendChild(ocean);
    const clipped=this._S('g',{'clip-path':'url(#npk-disc)'}); svg.appendChild(clipped);
    const gWorld=this._S('g'); clipped.appendChild(gWorld);
    const gLights=this._S('g'); clipped.appendChild(gLights);
    const gRegions=this._S('g'); clipped.appendChild(gRegions);
    const shade=this._S('circle',{fill:'url(#npk-shade)','pointer-events':'none'}); svg.appendChild(shade);
    const rim=this._S('circle',{fill:'none',stroke:'url(#npk-atm)','stroke-width':'1.6'}); svg.appendChild(rim);
    const gLabels=this._S('g',{'pointer-events':'none'}); svg.appendChild(gLabels);
    const gMarkers=this._S('g'); svg.appendChild(gMarkers);

    this.host.innerHTML=''; this.host.appendChild(svg); this.svg=svg;
    this.els={ svg,defs,clipC,gStars,atmBlur,atmBlur2,ocean,gWorld,gLights,gRegions,shade,rim,gLabels,gMarkers };

    svg.addEventListener('pointerdown', e=>this._down(e));
    window.addEventListener('pointermove', e=>this._move(e));
    window.addEventListener('pointerup', ()=>this._up());
  }

  private _resize() {
    const r=this.host.getBoundingClientRect(); this.W=r.width||1200; this.H=r.height||700;
    this.els.svg?.setAttribute('viewBox',`0 0 ${this.W} ${this.H}`);
    this._makeStars();
  }

  private _makeStars() {
    const g=this.els.gStars; if(!g) return; g.innerHTML='';
    let s=0x9e3a; const rnd=()=>{ s=(s*16807+12345)&0x7fffffff; return (s%10000)/10000; };
    for(let i=0;i<150;i++){
      const x=rnd()*this.W, y=rnd()*this.H*0.8;
      g.appendChild(this._S('circle',{cx:x.toFixed(0),cy:y.toFixed(0),r:(0.4+rnd()*1.1).toFixed(1),fill:'var(--globe-star)',opacity:(0.1+rnd()*0.5).toFixed(2)}));
    }
  }

  private _makeLabels() {
    const g=this.els.gLabels; if(!g) return; g.innerHTML=''; this._labelEls=[];
    const font="'Formular','Hanken Grotesk',Arial,sans-serif";
    const mk=(o: any, kind: string) => {
      const lines=o.t.split('\n');
      const el=this._S('text',{'text-anchor':'middle'}) as SVGTextElement;
      el.style.fontFamily=font;
      if(kind==='country'){ el.setAttribute('fill','var(--text)'); el.setAttribute('font-size',o.big?'22':'14'); el.setAttribute('font-weight','600'); el.setAttribute('letter-spacing',o.big?'0.34em':'0.16em'); }
      else { el.setAttribute('fill','var(--text-muted)'); el.setAttribute('font-size','10.5'); el.setAttribute('font-weight','500'); el.setAttribute('letter-spacing','0.08em'); }
      lines.forEach((ln: string,i: number)=>{ const ts=this._S('tspan',{x:'0',dy:i===0?'0':(kind==='country'?'1.15em':'1.1em')}); ts.textContent=ln; el.appendChild(ts); });
      g.appendChild(el); this._labelEls.push({el,o,kind,lines});
    };
    GEO_LABELS.forEach(o=>mk(o,'country')); REGION_LABELS.forEach(o=>mk(o,'region'));
  }

  private _makeMarkers() {
    const g=this.els.gMarkers; if(!g) return; g.innerHTML=''; this._markerEls=[];
    BRANCHES.forEach((b,i)=>{
      const grp=this._S('g'); grp.style.cursor='pointer';
      if(b.city){
        const cityHalo=this._S('circle',{r:'11',fill:'rgba(255,196,64,0.12)'});
        const cityOuter=this._S('circle',{r:'7',fill:'none',stroke:'rgba(255,196,64,0.9)','stroke-width':'1.4'});
        const cityInner=this._S('circle',{r:'3.2',fill:'#ffc440'});
        const cityLabel=this._S('text',{'text-anchor':'middle',y:'-12','font-size':'9','font-weight':'600','letter-spacing':'0.06em',fill:'rgba(255,210,80,0.9)'});
        cityLabel.textContent=b.short.toUpperCase();
        grp.appendChild(cityHalo); grp.appendChild(cityOuter); grp.appendChild(cityInner); grp.appendChild(cityLabel);
        g.appendChild(grp); this._markerEls.push({grp,cityHalo,cityOuter,cityInner,cityLabel,b,i,_sx:null,_sy:null,_vis:false});
      } else {
        const halo=this._S('circle',{r:'9',fill:'rgba(219,31,38,0.18)'});
        const pulse=this._S('circle',{r:'6',fill:'#db1f26',opacity:'0'}); pulse.style.transformBox='fill-box'; pulse.style.transformOrigin='center';
        const core=this._S('circle',{r:'4.5',fill:'#db1f26',stroke:'var(--globe-marker-ring)','stroke-width':'1.2'});
        grp.appendChild(halo); grp.appendChild(pulse); grp.appendChild(core);
        g.appendChild(grp); this._markerEls.push({grp,halo,pulse,core,b,i,_sx:null,_sy:null,_vis:false});
      }
    });
  }

  private async _loadData() {
    const tryFetch = async (urls: string[]) => {
      for(const u of urls){ try{ const r=await fetch(u); if(r.ok) return r.json(); }catch(e){} } return null;
    };
    const world=await tryFetch(['https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json','https://unpkg.com/world-atlas@2/countries-110m.json']);
    if(world && this._mounted){ this._world=this._extractWorld(world); this._buildWorldPaths(); this._makeLights(); this._draw(); }
    // kz oblasts
    const kz=await tryFetch([
      'https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09/releaseData/gbOpen/KAZ/ADM1/geoBoundaries-KAZ-ADM1_simplified.geojson',
      'https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09/releaseData/gbOpen/KAZ/ADM1/geoBoundaries-KAZ-ADM1.geojson'
    ]);
    if(kz && kz.features && this._mounted){
      this._kz=kz.features.map((f: any)=>({type:f.geometry.type,coords:f.geometry.coordinates}));
      this._buildRegionPaths();
      this._mapBranchesToRegions();
      this._draw();
    }
  }

  private _buildWorldPaths() {
    const g=this.els.gWorld; if(!g) return; g.innerHTML=''; this._worldEls=[];
    for(const f of this._world){ const p=this._S('path',{fill:'var(--globe-land)',stroke:'var(--globe-land-stroke)','stroke-width':'0.5'}); g.appendChild(p); this._worldEls.push({p,f}); }
  }

  private _makeLights() {
    const g=this.els.gLights; if(!g||!this._world) return; g.innerHTML=''; this._lightPts=[]; this._lightEls=[];
    const feats=this._world.map(f=>{ let mnx=180,mxx=-180,mny=90,mxy=-90; const rings: number[][][] = [];
      const visit=(r: number[][])=>{ rings.push(r); for(const p of r){ if(p[0]<mnx)mnx=p[0]; if(p[0]>mxx)mxx=p[0]; if(p[1]<mny)mny=p[1]; if(p[1]>mxy)mxy=p[1]; } };
      if(f.type==='Polygon') (f.coords as number[][][]).forEach(visit); else (f.coords as number[][][][]).forEach(p=>(p as number[][][]).forEach(visit));
      return {rings,mnx,mxx,mny,mxy}; });
    let s=0x4d2a; const rnd=()=>{ s=(s*16807+12345)&0x7fffffff; return (s%100000)/100000; };
    const warm=['rgba(255,196,128,','rgba(255,224,170,','rgba(190,214,255,','rgba(255,170,120,'];
    let tries=0;
    while(this._lightPts.length<520 && tries<6000){
      tries++; const lng=20+rnd()*100, lat=18+rnd()*54;
      let inside=false;
      for(const fe of feats){ if(lng<fe.mnx||lng>fe.mxx||lat<fe.mny||lat>fe.mxy) continue; let c=false; for(const r of fe.rings){ if(this._pointInRing(lng,lat,r)) c=!c; } if(c){ inside=true; break; } }
      if(!inside) continue;
      if(!(Math.abs(lng-67)<26 && Math.abs(lat-48)<13) && rnd()<0.45) continue;
      this._lightPts.push({lng,lat,col:warm[(rnd()*4)|0],a:0.35+rnd()*0.6,r:0.5+rnd()*1.1});
    }
    for(const lp of this._lightPts){ const c=this._S('circle',{r:lp.r.toFixed(2),fill:lp.col+lp.a+')'}); g.appendChild(c); this._lightEls.push(c); }
  }

  private _buildRegionPaths() {
    const g=this.els.gRegions; if(!g) return; g.innerHTML=''; this._regionEls=[];
    this._kz.forEach((f,i)=>{
      const fillP=this._S('path',{fill:'var(--globe-region-fill)',stroke:'none'});
      const lineP=this._S('path',{fill:'none',stroke:'var(--globe-region-stroke)','stroke-width':'1.1','stroke-linejoin':'round'});
      g.appendChild(fillP); g.appendChild(lineP); this._regionEls.push({fillP,lineP,f,i});
    });
  }

  private _mapBranchesToRegions() {
    const rings=(f: Feat): number[][][] => { const r: number[][][] = []; if(f.type==='Polygon') (f.coords as any).forEach((x: any)=>r.push(x)); else (f.coords as any).forEach((p: any)=>p.forEach((x: any)=>r.push(x))); return r; };
    this._branchFeat=BRANCHES.map(b=>{ for(let i=0;i<this._kz.length;i++){ let c=false; for(const r of rings(this._kz[i])){ if(this._pointInRing(b.lng,b.lat,r)) c=!c; } if(c) return i; } return -1; });
    this._featBranch={}; this._branchFeat.forEach((fi,bi)=>{ if(fi>=0 && this._featBranch[fi]===undefined) this._featBranch[fi]=bi; });
  }

  private _findFeatAt(lng: number, lat: number) {
    for(let i=0;i<this._kz.length;i++){ const f=this._kz[i]; let c=false;
      const rs: number[][][] = []; if(f.type==='Polygon') (f.coords as any).forEach((r: any)=>rs.push(r)); else (f.coords as any).forEach((p: any)=>p.forEach((r: any)=>rs.push(r)));
      for(const r of rs) if(this._pointInRing(lng,lat,r)) c=!c;
      if(c) return i;
    }
    return -1;
  }

  // ── Interactions ────────────────────────────────────────────────────────────
  private _local(e: PointerEvent) { const r=this.host.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; }

  private _down(e: PointerEvent) {
    const m=this._local(e), V=this.view, dx=m.x-V.cx, dy=m.y-V.cy;
    if(dx*dx+dy*dy>(V.R+40)*(V.R+40)) return;
    this.drag={on:true,x:m.x,y:m.y,l:V.lambda,p:V.phi}; this.host.style.cursor='grabbing'; this._moved=false;
  }

  private _move(e: PointerEvent) {
    const m=this._local(e);
    if(!this.drag.on){
      this.parallax.tx=(m.x/this.W)-0.5; this.parallax.ty=(m.y/this.H)-0.5;
      const ll=this._unproj(m.x,m.y); let hf=-1, hm=-1;
      if(this._markerEls){
        for(const me of this._markerEls){ if(me._sx==null||!me._vis) continue; const d=(me._sx-m.x)**2+(me._sy-m.y)**2; if(d<13*13){ hm=me.i; break; } }
      }
      if(hm>=0) hf=this._branchFeat?.[hm]??-1;
      else if(ll) hf=this._findFeatAt(ll.lng,ll.lat);
      this.hoverFeat=hf; this.hoverMarker=hm;
      let hovBi: number|null = null;
      if(hm>=0) hovBi=hm;
      else if(hf>=0 && this._featBranch[hf]!==undefined) hovBi=this._featBranch[hf];
      if(this.state.selected===null) this._setHoveredBranch(hovBi);
      this.host.style.cursor=(hovBi!==null)?'pointer':'grab';
      return;
    }
    this._moved=true;
    const V=this.view;
    V.lambda=this.drag.l-(m.x-this.drag.x)*0.32;
    V.phi=Math.max(-20,Math.min(78,this.drag.p+(m.y-this.drag.y)*0.32));
  }

  private _up() { if(this.drag.on){ this.drag.on=false; this.lastUser=performance.now(); this.host.style.cursor='grab'; } }

  onWheel(deltaY: number) {
    // Called by parent React component — always pass to Lenis
    const lenis=getLenis();
    if(lenis) lenis.scrollTo(window.scrollY+deltaY*2.5, { immediate:false });
  }

  _click(e: MouseEvent) {
    if(this._moved){ this._moved=false; return; }
    const m={x:(e as any).clientX-this.host.getBoundingClientRect().left, y:(e as any).clientY-this.host.getBoundingClientRect().top};
    if(this.hoverMarker>=0){ this._setState({selected:this.hoverMarker,hovered:null}); return; }
    const ll=this._unproj(m.x,m.y); if(!ll) return;
    const fi=this._findFeatAt(ll.lng,ll.lat);
    if(fi>=0 && this._featBranch[fi]!==undefined) this._setState({selected:this._featBranch[fi],hovered:null});
    else this._setState({selected:null});
  }

  private _setHoveredBranch(bi: number|null) {
    if(bi===this._lastHoveredBi) return; this._lastHoveredBi=bi; clearTimeout(this._hoverTimer);
    if(bi!=null) this._setState({hovered:bi});
    else this._hoverTimer=setTimeout(()=>{ if(this._mounted) this._setState({hovered:null}); },90) as any;
  }

  // ── Card position (centroid of selected region) ──────────────────────────
  cardPos(bi: number): {x:number,y:number} {
    if(!this._kz||!this._branchFeat) return {x:this.W/2,y:200};
    const fi=this._branchFeat[bi]; let cx: number|undefined, cy: number|undefined;
    if(fi>=0){
      let sumX=0,sumY=0,cnt=0;
      const addR=(r: number[][])=>{ for(const p of r){ sumX+=p[0]; sumY+=p[1]; cnt++; } };
      const f=this._kz[fi]; if(f.type==='Polygon') (f.coords as any).forEach(addR); else (f.coords as any).forEach((p: any)=>p.forEach(addR));
      if(cnt>0){ const cp=this._proj(sumX/cnt,sumY/cnt); cx=cp.sx; cy=cp.sy; }
    }
    if(cx==null){ const b=BRANCHES[bi]; const p=this._proj(b.lng,b.lat); cx=p.sx; cy=p.sy; }
    const CARD_W=300,CARD_H=240,PAD=16;
    let x=cx!, y=cy!-60-CARD_H;
    x=Math.max(CARD_W/2+PAD,Math.min(this.W-CARD_W/2-PAD,x));
    y=Math.max(PAD,Math.min(this.H-CARD_H-PAD,y));
    return {x,y};
  }

  // ── Per-frame ────────────────────────────────────────────────────────────────
  private _tick(_t: number) {
    if(!this._mounted) return;
    this._raf=requestAnimationFrame(this._tick);
    if(!this.els.svg||!this.W) return;
    this.parallax.x+=(this.parallax.tx-this.parallax.x)*0.06;
    this.parallax.y+=(this.parallax.ty-this.parallax.y)*0.06;
    if(Math.abs(this.view.zoom-this._scrollZoom)>0.001) this.view.zoom+=(this._scrollZoom-this.view.zoom)*0.07;
    this._draw();
  }

  private _draw() {
    const V=this.view, W=this.W, H=this.H; if(!W||!this.els.svg) return;
    const maxD=Math.max(W,H); V.R=maxD*1.18*V.zoom; V.cx=W*0.545; V.cy=H*0.55+V.R*Math.sin((48-V.phi)*this.D2R);
    if(!this.drag.on){ V.cx+=this.parallax.x*44; V.cy+=this.parallax.y*24; }
    this._render();
  }

  private _render() {
    const V=this.view, E=this.els;
    const setCircle=(el: any)=>{ el.setAttribute('cx',V.cx); el.setAttribute('cy',V.cy); el.setAttribute('r',V.R); };
    setCircle(E.clipC); setCircle(E.ocean); setCircle(E.shade); setCircle(E.rim);
    E.atmBlur.setAttribute('cx',V.cx); E.atmBlur.setAttribute('cy',V.cy); E.atmBlur.setAttribute('r',V.R+30);
    E.atmBlur2.setAttribute('cx',V.cx); E.atmBlur2.setAttribute('cy',V.cy); E.atmBlur2.setAttribute('r',V.R+6);
    for(const w of this._worldEls) w.p.setAttribute('d',this._path(w.f.type,w.f.coords));
    for(let i=0;i<this._lightPts.length;i++){ const lp=this._lightPts[i],p=this._proj(lp.lng,lp.lat),el=this._lightEls[i];
      if(p.v&&p.rx>0.04){ el.setAttribute('cx',p.sx.toFixed(1)); el.setAttribute('cy',p.sy.toFixed(1)); el.style.display=''; el.setAttribute('opacity',(Math.min(1,p.rx*1.5)).toFixed(2)); } else el.style.display='none'; }
    const sel=this.state.selected, hf=this.hoverFeat;
    for(const r of this._regionEls){ const d=this._path(r.f.type,r.f.coords); r.lineP.setAttribute('d',d); r.fillP.setAttribute('d',d);
      const isSel=this._branchFeat&&sel!=null&&this._branchFeat[sel]===r.i, isHov=hf===r.i;
      if(isSel){ r.lineP.setAttribute('stroke','#db1f26'); r.lineP.setAttribute('stroke-width','1.9'); r.lineP.setAttribute('filter','url(#npk-glow)'); r.fillP.setAttribute('fill','rgba(219,31,38,0.16)'); }
      else if(isHov){ r.lineP.setAttribute('stroke','var(--globe-region-hover-stroke)'); r.lineP.setAttribute('stroke-width','1.5'); r.lineP.setAttribute('filter','url(#npk-glow)'); r.fillP.setAttribute('fill','var(--globe-region-hover-fill)'); }
      else { r.lineP.setAttribute('stroke','var(--globe-region-stroke)'); r.lineP.setAttribute('stroke-width','1.05'); r.lineP.removeAttribute('filter'); r.fillP.setAttribute('fill','var(--globe-region-fill)'); }
    }
    for(const L of this._labelEls){ const p=this._proj(L.o.lng,L.o.lat);
      if(p.v&&p.rx>0.12){ const op=Math.min(1,(p.rx-0.12)*2.2); L.el.style.display=''; L.el.setAttribute('opacity',op.toFixed(2)); L.el.setAttribute('transform',`translate(${p.sx.toFixed(1)},${p.sy.toFixed(1)})`); } else L.el.style.display='none'; }
    for(const me of this._markerEls){ const p=this._proj(me.b.lng,me.b.lat);
      if(p.v&&p.rx>0.05){ const op=Math.min(1,p.rx*3); me.grp.style.display=''; me.grp.setAttribute('opacity',op.toFixed(2)); me.grp.setAttribute('transform',`translate(${p.sx.toFixed(1)},${p.sy.toFixed(1)})`); me._sx=p.sx; me._sy=p.sy; me._vis=true;
        const active=(me.i===sel||me.i===this.state.hovered);
        if(me.b.city){ me.cityOuter.setAttribute('stroke',active?'#ffd740':'rgba(255,196,64,0.85)'); me.cityOuter.setAttribute('r',active?'9':'7'); me.cityInner.setAttribute('r',active?'4':'3.2'); me.cityHalo.setAttribute('fill',active?'rgba(255,215,64,0.22)':'rgba(255,196,64,0.1)'); }
        else { if(active){ me.pulse.setAttribute('opacity','0.5'); me.pulse.style.animation='npkpulse 2.2s ease-out infinite'; me.halo.setAttribute('fill','rgba(219,31,38,0.28)'); me.core.setAttribute('r','5.4'); }
          else { me.pulse.style.animation='none'; me.pulse.setAttribute('opacity','0'); me.halo.setAttribute('fill','rgba(219,31,38,0.14)'); me.core.setAttribute('r','4.5'); } }
      } else { me.grp.style.display='none'; me._vis=false; }
    }
  }

  _bindEvents() {
    if(!this.els.svg) return;
    this.els.svg.addEventListener('click', (e: MouseEvent)=>this._click(e));
  }
}

// ─── Mobile helpers ───────────────────────────────────────────────────────────

function useIsMobile() {
  const [mob, setMob] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mob;
}

// Real Kazakhstan SVG map with dot overlay
function KZRealMap({ activeBi, onSelect }: { activeBi: number|null; onSelect: (i:number)=>void }) {
  // Map SVG viewBox: 0 0 1174 671. KZ spans roughly lng 50–87°E, lat 40–55°N
  const px = (lng: number) => ((lng - 50) / 37) * 1146 + 14;
  const py = (lat: number) => ((55 - lat) / 15) * 632 + 28;
  return (
    <div style={{position:'relative',borderRadius:16,overflow:'hidden',background:'var(--surface)'}}>
      <img src="/mapkz.svg" alt="Карта Казахстана" style={{width:'100%',display:'block',opacity:0.9}}/>
      <svg viewBox="0 0 1174 671" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}>
        <defs>
          <filter id="mob-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {BRANCHES.map((b,i)=>{
          const x=px(b.lng), y=py(b.lat);
          const active = i===activeBi;
          return (
            <g key={i} style={{cursor:'pointer'}} onClick={()=>onSelect(i)}>
              {active ? <>
                <circle cx={x} cy={y} r={36} fill="rgba(219,31,38,0.12)"/>
                <circle cx={x} cy={y} r={20} fill="rgba(219,31,38,0.25)"/>
                <circle cx={x} cy={y} r={10} fill="#db1f26" filter="url(#mob-glow)"/>
                <circle cx={x} cy={y} r={10} fill="#db1f26"/>
              </> : <>
                <circle cx={x} cy={y} r={b.city?14:10}
                  fill={b.city?'rgba(255,196,64,0.18)':'var(--globe-region-fill)'}/>
                <circle cx={x} cy={y} r={b.city?7:5}
                  fill={b.city?'#ffc440':'var(--text-muted)'}
                  stroke={b.city?'rgba(255,196,64,0.5)':'var(--line)'} strokeWidth="2"/>
              </>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function BranchMapMobile() {
  const [listOpen, setListOpen] = useState(false);
  const [activeBi, setActiveBi] = useState<number|null>(null);

  const select = (i: number) => {
    setActiveBi(prev => prev===i ? null : i);
    setListOpen(false);
  };

  const cities  = BRANCHES.filter(b=>b.city);
  const oblasts = BRANCHES.filter(b=>!b.city);
  const selBranch = activeBi!=null ? BRANCHES[activeBi] : null;

  return (
    <section style={{background:'var(--surface)',fontFamily:"'Formular',Arial,sans-serif"}}>
      {/* Header */}
      <div style={{padding:'40px 20px 20px'}}>
        <p style={{fontSize:11,letterSpacing:'0.18em',color:'#db1f26',textTransform:'uppercase',fontWeight:600,margin:'0 0 10px'}}>
          Наши филиалы
        </p>
        <h2 style={{fontSize:28,fontWeight:700,color:'var(--text)',lineHeight:'92%',letterSpacing:'-0.03em',margin:0}}>
          {BRANCHES.length} отделений<br/>по всему Казахстану
        </h2>
      </div>

      {/* Single collapse button above map */}
      <div style={{padding:'0 16px 14px'}}>
        <button
          onClick={()=>setListOpen(p=>!p)}
          style={{
            width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'14px 18px',background:'var(--surface-2)',
            borderRadius:listOpen?'12px 12px 0 0':'12px',
            border:'1px solid var(--line)',
            borderBottom: listOpen?'1px solid var(--line)':'1px solid var(--line)',
            outline:'none',cursor:'pointer',transition:'border-radius .2s'
          }}
        >
          <span style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{
              width:8,height:8,borderRadius:'50%',flexShrink:0,
              background: activeBi!=null
                ? '#db1f26'
                : 'var(--text-muted)'
            }}/>
            <span style={{fontSize:14,fontWeight:600,color:'var(--text)',fontFamily:"'Formular',Arial,sans-serif"}}>
              {selBranch ? selBranch.short : 'Ваш регион'}
            </span>
          </span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
            style={{flexShrink:0,transform:listOpen?'rotate(180deg)':'rotate(0deg)',transition:'transform .22s'}}>
            <path d="M5 7l4 4 4-4" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Collapsible full list */}
        <div style={{
          overflow:'hidden',
          maxHeight: listOpen ? 440 : 0,
          transition:'max-height .35s ease',
        }}>
          <div style={{
            background:'rgb(var(--globe-panel-rgb) / .98)',
            border:'1px solid var(--line)',borderTop:'none',
            borderRadius:'0 0 12px 12px',
            maxHeight:440,overflowY:'auto'
          }} data-lenis-prevent>
            {/* Cities group */}
            <div style={{padding:'10px 18px 4px'}}>
              <div style={{fontSize:9.5,letterSpacing:'0.14em',color:'var(--text-muted)',textTransform:'uppercase',fontWeight:600,marginBottom:4}}>
                Города респ. значения
              </div>
              {cities.map(b=>{const bi=BRANCHES.indexOf(b);return(
                <button key={bi} onClick={()=>select(bi)} style={{
                  width:'100%',display:'flex',alignItems:'center',gap:12,
                  padding:'10px 0',background:'none',border:'none',
                  borderBottom:'1px solid var(--line)',
                  cursor:'pointer',outline:'none',textAlign:'left'
                }}>
                  <span style={{width:7,height:7,borderRadius:'50%',flexShrink:0,
                    background:activeBi===bi?'#db1f26':'#ffc440'}}/>
                  <span style={{fontSize:13,fontFamily:"'Formular',Arial,sans-serif",
                    color:activeBi===bi?'var(--text)':'var(--text-muted)',
                    fontWeight:activeBi===bi?700:400}}>{b.short}</span>
                </button>
              );})}
            </div>
            {/* Oblasts group */}
            <div style={{padding:'10px 18px 14px'}}>
              <div style={{fontSize:9.5,letterSpacing:'0.14em',color:'var(--text-muted)',textTransform:'uppercase',fontWeight:600,marginBottom:4}}>
                Областные филиалы
              </div>
              {oblasts.map(b=>{const bi=BRANCHES.indexOf(b);return(
                <button key={bi} onClick={()=>select(bi)} style={{
                  width:'100%',display:'flex',alignItems:'center',gap:12,
                  padding:'10px 0',background:'none',border:'none',
                  borderBottom:'1px solid var(--line)',
                  cursor:'pointer',outline:'none',textAlign:'left'
                }}>
                  <span style={{width:7,height:7,borderRadius:'50%',flexShrink:0,
                    background:activeBi===bi?'#db1f26':'var(--text-muted)'}}/>
                  <span style={{fontSize:13,fontFamily:"'Formular',Arial,sans-serif",
                    color:activeBi===bi?'var(--text)':'var(--text-muted)',
                    fontWeight:activeBi===bi?700:400}}>{b.short}</span>
                </button>
              );})}
            </div>
          </div>
        </div>
      </div>

      {/* Real KZ map */}
      <div style={{padding:'0 16px'}}>
        <KZRealMap activeBi={activeBi} onSelect={select}/>
      </div>

      {/* Branch detail card (shown when selected) */}
      <div style={{
        overflow:'hidden',
        maxHeight: selBranch ? 320 : 0,
        opacity: selBranch ? 1 : 0,
        transition:'max-height .32s ease, opacity .24s ease',
        padding: selBranch ? '12px 16px 0' : '0 16px'
      }}>
        {selBranch && (
          <div style={{
            display:'flex',flexDirection:'column',gap:10,
            background:'rgba(219,31,38,0.06)',borderRadius:12,
            padding:'16px',border:'1px solid rgba(219,31,38,0.16)',
            fontFamily:"'Formular',Arial,sans-serif"
          }}>
            <div style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>{selBranch.short}</div>
            {selBranch.chairman && <div>
              <div style={{fontSize:9,letterSpacing:'0.12em',color:'var(--text-muted)',textTransform:'uppercase',marginBottom:2}}>Председатель</div>
              <div style={{fontSize:12.5,color:'var(--text)',fontWeight:500}}>{selBranch.chairman}</div>
            </div>}
            <div>
              <div style={{fontSize:9,letterSpacing:'0.12em',color:'var(--text-muted)',textTransform:'uppercase',marginBottom:2}}>Адрес</div>
              <div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.45}}>{selBranch.address}</div>
            </div>
            <div>
              <div style={{fontSize:9,letterSpacing:'0.12em',color:'var(--text-muted)',textTransform:'uppercase',marginBottom:2}}>Телефон</div>
              <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{selBranch.phone}</div>
            </div>
            <a href="#" style={{
              display:'block',marginTop:4,padding:'10px 0',textAlign:'center',
              background:'#db1f26',borderRadius:10,fontSize:13,fontWeight:700,
              color:'#fff',textDecoration:'none',letterSpacing:'0.02em'
            }}>Подробнее →</a>
          </div>
        )}
      </div>

      <div style={{height:48}}/>
    </section>
  );
}

// ─── React component ─────────────────────────────────────────────────────────
export function BranchMapSection() {
  const isMobile = useIsMobile();
  const sectionRef   = useRef<HTMLElement>(null);
  const hostRef      = useRef<HTMLDivElement>(null);
  const controllerRef= useRef<GlobeController | null>(null);
  const [globeState, setGlobeState] = useState<GlobeState>({ selected:null, hovered:null });

  // Create globe controller (desktop only)
  useEffect(() => {
    if(isMobile || !hostRef.current) return;
    const ctrl = new GlobeController(hostRef.current, setGlobeState);
    controllerRef.current = ctrl;
    return () => { ctrl.destroy(); controllerRef.current=null; };
  }, [isMobile]);

  // Scroll progress → zoom (desktop only)
  useEffect(() => {
    if(isMobile) return;
    const section=sectionRef.current; if(!section) return;
    let lastP=-1;
    const onScroll=()=>{
      const rect=section.getBoundingClientRect(), sH=section.offsetHeight, vH=window.innerHeight;
      const extra=sH-vH, scrolled=-rect.top;
      const p=extra>0?Math.max(0,Math.min(1,scrolled/extra)):0;
      if(Math.abs(p-lastP)<0.004) return; lastP=p;
      controllerRef.current?.setScrollZoom(p);
    };
    window.addEventListener('scroll',onScroll,{passive:true});
    onScroll();
    return ()=>window.removeEventListener('scroll',onScroll);
  }, []);

  // Wheel on globe → Lenis (desktop only)
  useEffect(() => {
    if(isMobile) return;
    const host=hostRef.current; if(!host) return;
    const onWheel=(e: WheelEvent)=>{ e.preventDefault(); controllerRef.current?.onWheel(e.deltaY); };
    host.addEventListener('wheel',onWheel,{passive:false});
    return ()=>host.removeEventListener('wheel',onWheel);
  }, [isMobile]);

  const displayBi = globeState.selected ?? globeState.hovered;
  const selBranch = displayBi != null ? BRANCHES[displayBi] : null;

  if (isMobile) return <BranchMapMobile />;

  return (
    <section ref={sectionRef} className="relative w-full" style={{height:'300vh',background:'var(--surface)'}}>
      <div className="sticky top-0 w-full overflow-hidden" style={{height:'100vh'}}>
        {/* Globe canvas */}
        <div ref={hostRef} className="absolute inset-0 z-[1]" />

        {/* Vignette */}
        <div className="absolute inset-0 z-[2] pointer-events-none"
          style={{background:'radial-gradient(130% 90% at 14% 36%,rgb(var(--globe-vignette-rgb) / .82) 0%,rgb(var(--globe-vignette-rgb) / .3) 38%,rgb(var(--globe-vignette-rgb) / 0) 56%),linear-gradient(180deg,rgb(var(--globe-vignette-rgb) / .45) 0%,rgb(var(--globe-vignette-rgb) / 0) 18%)'}} />

        {/* Side list */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-[7] flex flex-col rounded-[20px] overflow-hidden"
          style={{width:296,maxHeight:'76vh',background:'rgb(var(--globe-panel-rgb) / .86)',border:'1px solid rgb(var(--globe-panel-border-rgb) / .1)',backdropFilter:'blur(20px)',boxShadow:'0 30px 80px rgba(0,0,0,.55)',fontFamily:"'Formular',Arial,sans-serif"}}>
          <div className="flex items-center justify-between px-[18px] py-[14px]" style={{borderBottom:'1px solid rgb(var(--globe-panel-border-rgb) / .08)'}}>
            <span style={{fontSize:11,letterSpacing:'0.18em',color:'var(--text-muted)',fontWeight:600}}>ВЫБЕРИТЕ ФИЛИАЛ</span>
            <span style={{fontSize:11,color:'#db1f26',fontWeight:700}}>{BRANCHES.length}</span>
          </div>
          <div className="overflow-y-auto p-[6px]" data-lenis-prevent>
            {BRANCHES.map((b,i)=>{
              const active=globeState.selected===i||(globeState.selected===null&&globeState.hovered===i);
              return (
                <button key={i} onClick={()=>controllerRef.current?.selectBranch(i)}
                  className="w-full flex items-center gap-[10px] text-left rounded-[10px] mb-[2px] transition-colors"
                  style={{padding:'10px 11px',background:active?'rgba(219,31,38,0.12)':'transparent',borderLeft:`2.5px solid ${active?'#db1f26':'transparent'}`,outline:'none',cursor:'pointer'}}>
                  <span style={{width:7,height:7,borderRadius:'50%',flexShrink:0,background:active?'#db1f26':(b.city?'rgba(255,196,64,0.9)':'var(--text-muted)'),boxShadow:active?'0 0 8px rgba(219,31,38,0.9)':'none'}}/>
                  <span className="flex flex-col gap-[1px] min-w-0">
                    <span className="truncate" style={{fontSize:13,fontWeight:600,color:active?'var(--text)':'var(--text-muted)'}}>{b.short}</span>
                    <span className="truncate" style={{fontSize:10.5,color:'var(--text-muted)'}}>{b.chairman||'—'}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info card */}
        {selBranch && displayBi!=null && (()=>{
          const pos=controllerRef.current?.cardPos(displayBi)??{x:600,y:200};
          return (
            <div className="absolute z-[8] rounded-[18px] pointer-events-auto"
              style={{width:300,left:pos.x,top:pos.y,transform:'translate(-50%,0)',padding:'18px 20px 20px',background:'rgb(var(--globe-panel-rgb) / .92)',border:'1px solid rgba(120,170,225,.22)',backdropFilter:'blur(22px)',boxShadow:'0 24px 70px rgba(0,0,0,.7)',animation:'npkfade .3s ease',fontFamily:"'Formular',Arial,sans-serif",color:'var(--text)'}}>
              <style>{`@keyframes npkfade{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
              <div style={{position:'absolute',top:0,right:0,width:70,height:70,borderRadius:'0 18px 0 0',background:'radial-gradient(80% 80% at 100% 0%,rgba(219,31,38,.2),transparent 70%)',pointerEvents:'none'}}/>
              <button onClick={()=>controllerRef.current?.close()}
                style={{position:'absolute',top:12,right:12,width:24,height:24,borderRadius:7,border:'1px solid rgb(var(--globe-panel-border-rgb) / .15)',color:'var(--text-muted)',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:'none',outline:'none'}}>✕</button>
              <div className="flex items-center gap-[10px] mb-4 pr-7">
                <span style={{width:26,height:26,borderRadius:8,background:'rgba(219,31,38,.15)',border:'1px solid rgba(219,31,38,.5)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{width:9,height:9,borderRadius:'50%',background:'#db1f26',boxShadow:'0 0 8px rgba(219,31,38,.9)'}}/>
                </span>
                <span style={{fontSize:14.5,fontWeight:700,lineHeight:1.2,color:'var(--text)'}}>{selBranch.name}</span>
              </div>
              <div className="flex flex-col gap-[11px]">
                {selBranch.chairman && <div><div style={{fontSize:10,letterSpacing:'0.08em',color:'var(--text-muted)',marginBottom:2,textTransform:'uppercase'}}>Председатель</div><div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{selBranch.chairman}</div></div>}
                <div><div style={{fontSize:10,letterSpacing:'0.08em',color:'var(--text-muted)',marginBottom:2,textTransform:'uppercase'}}>Email</div><div style={{fontSize:12.5,color:'#7cc4f2'}}>{selBranch.email}</div></div>
                <div><div style={{fontSize:10,letterSpacing:'0.08em',color:'var(--text-muted)',marginBottom:2,textTransform:'uppercase'}}>Адрес</div><div style={{fontSize:12,color:'var(--text)',lineHeight:1.45}}>{selBranch.address}</div></div>
                <div><div style={{fontSize:10,letterSpacing:'0.08em',color:'var(--text-muted)',marginBottom:2,textTransform:'uppercase'}}>Телефон</div><div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{selBranch.phone}</div></div>
              </div>
              <a href="#" style={{display:'block',marginTop:16,padding:'9px 0',textAlign:'center',background:'#db1f26',borderRadius:10,fontSize:13,fontWeight:700,color:'#fff',textDecoration:'none',letterSpacing:'0.02em',transition:'background .2s'}}
                onMouseEnter={e=>(e.currentTarget.style.background='#b91721')}
                onMouseLeave={e=>(e.currentTarget.style.background='#db1f26')}>
                Подробнее →
              </a>
              <div style={{position:'absolute',bottom:-9,left:'50%',transform:'translateX(-50%)',width:0,height:0,borderLeft:'9px solid transparent',borderRight:'9px solid transparent',borderTop:'9px solid rgb(var(--globe-panel-rgb) / .92)'}}/>
            </div>
          );
        })()}

        {/* Legend — top right */}
        <div className="absolute right-5 top-5 z-[5] flex flex-col gap-[9px] rounded-[14px]"
          style={{padding:'14px 18px',background:'rgb(var(--globe-panel-rgb) / .55)',border:'1px solid rgb(var(--globe-panel-border-rgb) / .07)',backdropFilter:'blur(12px)',fontFamily:"'Formular',Arial,sans-serif"}}>
          {[['#db1f26','0 0 8px rgba(219,31,38,.9)','Выбранный регион'],['var(--text)','0 0 6px rgba(120,120,120,.4)','Филиалы'],['#ffc440','0 0 6px rgba(255,196,64,.7)','Города респ. значения']].map(([bg,sh,label])=>(
            <div key={label} className="flex items-center gap-[9px]" style={{fontSize:11.5,color:'var(--text-muted)'}}>
              <span style={{width:10,height:10,borderRadius:'50%',background:bg,boxShadow:sh,flexShrink:0}}/>
              {label}
            </div>
          ))}
        </div>

        {/* Compass */}
        <div className="absolute right-[52px] bottom-[44px] z-[5] rounded-full flex items-center justify-center"
          style={{width:70,height:70,border:'1px solid rgb(var(--globe-panel-border-rgb) / .16)',background:'rgb(var(--globe-panel-rgb) / .4)',backdropFilter:'blur(10px)'}}>
          <svg width="46" height="46" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="21" fill="none" stroke="var(--line)"/>
            <text x="24" y="11" textAnchor="middle" fontSize="8" fill="var(--text-muted)" fontFamily="inherit">N</text>
            <path d="M24 13 L28 24 L24 22 L20 24 Z" fill="#db1f26"/>
            <path d="M24 35 L20 24 L24 26 L28 24 Z" fill="var(--text-muted)"/>
          </svg>
        </div>

        {/* Scroll hint */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[42px] z-[5] flex items-center gap-[11px]"
          style={{fontSize:12.5,letterSpacing:'0.04em',color:'var(--text-muted)',pointerEvents:'none'}}>
          <span style={{width:20,height:1,background:'linear-gradient(90deg,transparent,var(--text-muted))'}}/>
          <svg width="15" height="20" viewBox="0 0 16 22" fill="none" stroke="var(--text-muted)" strokeWidth="1.4"><rect x="1" y="1" width="14" height="20" rx="7"/><path d="M8 5v4"/></svg>
          Прокрутите для масштабирования
          <span style={{width:20,height:1,background:'linear-gradient(270deg,transparent,var(--text-muted))'}}/>
        </div>
      </div>
    </section>
  );
}
