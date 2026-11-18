import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

const stadion = document.querySelector('#stadion');
const laden = document.querySelector('#laden');
const afstandTekst = document.querySelector('#afstand');
const klokTekst = document.querySelector('#klok');
const snelheidTekst = document.querySelector('#snelheid');
const bericht = document.querySelector('#bericht');
const startKnop = document.querySelector('#start');
const resetKnop = document.querySelector('#reset');
const finishAfstand = 100;
const baanLengte = 112;
const baanX = -baanLengte / 2;

const medailles = {
  goud: document.querySelector('#goud'),
  zilver: document.querySelector('#zilver'),
  brons: document.querySelector('#brons')
};

const scene = new THREE.Scene();
scene.background = new THREE.Color('#91c9e8');
scene.fog = new THREE.Fog('#91c9e8', 95, 220);
const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 400);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.domElement.setAttribute('aria-label', '3D-weergave van de 100-meter sprintbaan');
renderer.domElement.tabIndex = 0;
stadion.prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xe4f6ff, 0x6a493c, 2.0));
const zonlicht = new THREE.DirectionalLight(0xffedcc, 3.2);
zonlicht.position.set(-25, 45, 28);
zonlicht.castShadow = true;
zonlicht.shadow.mapSize.set(2048, 2048);
zonlicht.shadow.camera.left = -80;
zonlicht.shadow.camera.right = 80;
zonlicht.shadow.camera.top = 70;
zonlicht.shadow.camera.bottom = -70;
scene.add(zonlicht);

const materiaal = (kleur, extra = {}) => new THREE.MeshStandardMaterial({ color: kleur, roughness: 0.82, ...extra });
const gras = materiaal('#31794b');
const baanMateriaal = materiaal('#b94639');
const baanLicht = materiaal('#d25c4c');
const wit = materiaal('#fff4dd');
const tribuneKleuren = ['#173d68', '#205383', '#e7edf1', '#b8c9d8'];

function blok(afmetingen, kleur, positie, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...afmetingen), kleur);
  mesh.position.set(...positie);
  mesh.castShadow = options.schaduw !== false;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

// Veld en rechte tartan-sprintbaan.
blok([250, 1, 150], gras, [0, -0.65, 0], { schaduw: false });
blok([baanLengte + 8, 0.18, 19], materiaal('#e8e2d5'), [0, -0.08, 0], { schaduw: false });
blok([baanLengte, 0.2, 18], baanMateriaal, [0, 0.03, 0], { schaduw: false });
for (let lane = 0; lane <= 6; lane++) {
  const z = -8.4 + lane * 2.8;
  blok([baanLengte - 1, 0.025, 0.10], lane === 0 || lane === 6 ? wit : materiaal('#f5c5a5'), [0, 0.15, z], { schaduw: false });
}
// Startlijn, finishlijn en afstandsmarkeringen.
blok([0.3, 0.04, 18], wit, [baanX + 5.5, 0.18, 0], { schaduw: false });
blok([0.45, 0.04, 18], wit, [baanX + 5.5 + finishAfstand, 0.19, 0], { schaduw: false });
for (const meter of [20, 40, 60, 80]) {
  const x = baanX + 5.5 + meter;
  blok([0.14, 0.025, 18], materiaal('#f0b5a0'), [x, 0.17, 0], { schaduw: false });
  const textCanvas = document.createElement('canvas');
  textCanvas.width = 128; textCanvas.height = 64;
  const ctx = textCanvas.getContext('2d');
  ctx.fillStyle = '#fff4dd'; ctx.font = 'bold 42px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(`${meter} m`, 64, 46);
  const texture = new THREE.CanvasTexture(textCanvas);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide }));
  label.rotation.x = -Math.PI / 2; label.position.set(x, 0.19, -7.3); scene.add(label);
}

// Tribunes rondom het stadion, met kleurrijke zitrijen en lichtmasten.
for (let side = 0; side < 2; side++) {
  const zSide = side === 0 ? -1 : 1;
  for (let row = 0; row < 7; row++) {
    const width = 122 - row * 2;
    const seat = materiaal(tribuneKleuren[(row + side) % tribuneKleuren.length]);
    const tier = new THREE.Mesh(new THREE.BoxGeometry(width, 1.45, 2.2), seat);
    tier.position.set(0, 1.05 + row * 1.45, zSide * (14 + row * 1.25));
    tier.rotation.x = zSide * -0.07;
    tier.castShadow = true; tier.receiveShadow = true; scene.add(tier);
  }
  blok([130, 1.3, 1.2], materiaal('#dce5eb'), [0, 12, zSide * 24], { schaduw: false });
}
for (const x of [-55, -25, 25, 55]) {
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.45, 22, 8), materiaal('#dce5eb'));
  mast.position.set(x, 11, -28); mast.castShadow = true; scene.add(mast);
  const lamp = new THREE.PointLight(0xe8f5ff, 1.4, 45);
  lamp.position.set(x, 22, -28); scene.add(lamp);
}

// Eenvoudig maar beweegbaar 3D-model van een sprinter.
const loper = new THREE.Group();
loper.position.set(baanX + 5.5, 0.2, 0);
scene.add(loper);
const huid = materiaal('#a96543');
const shirt = materiaal('#1767d2', { roughness: 0.58 });
const broek = materiaal('#10264a');
const schoenen = materiaal('#f7f3e8');
const hoofd = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 16), huid);
hoofd.position.y = 2.05; hoofd.castShadow = true; loper.add(hoofd);
const romp = new THREE.Mesh(new THREE.CapsuleGeometry(0.39, 0.72, 6, 12), shirt);
romp.position.set(0, 1.38, 0); romp.rotation.z = -0.18; romp.castShadow = true; loper.add(romp);
const heup = new THREE.Group(); heup.position.set(0, 0.94, 0); loper.add(heup);
const bekken = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.35, 0.5), broek);
bekken.position.y = -0.02; bekken.castShadow = true; heup.add(bekken);
const armen = [];
for (const zijde of [-1, 1]) {
  const arm = new THREE.Group(); arm.position.set(zijde * 0.42, 1.72, 0); loper.add(arm); armen.push(arm);
  const bovenarm = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.47, 5, 10), huid);
  bovenarm.position.set(zijde * 0.02, -0.31, 0); bovenarm.rotation.z = zijde * -0.2; bovenarm.castShadow = true; arm.add(bovenarm);
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), huid);
  hand.position.set(zijde * 0.04, -0.65, 0); arm.add(hand);
}
const benen = [];
for (const zijde of [-1, 1]) {
  const been = new THREE.Group(); been.position.set(zijde * 0.2, 0.82, 0); loper.add(been); benen.push(been);
  const dij = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.52, 5, 10), broek);
  dij.position.y = -0.36; dij.castShadow = true; been.add(dij);
  const onderbeen = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.48, 5, 10), huid);
  onderbeen.position.set(0, -0.83, 0); onderbeen.castShadow = true; been.add(onderbeen);
  const schoen = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.13, 0.4), schoenen);
  schoen.position.set(0, -1.12, 0.12); schoen.castShadow = true; been.add(schoen);
}

// Finishboog is een goed zichtbaar doel in de 3D-scene.
const finishX = baanX + 5.5 + finishAfstand;
for (const z of [-8.5, 8.5]) {
  const paal = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 5.5, 12), wit);
  paal.position.set(finishX, 2.75, z); paal.castShadow = true; scene.add(paal);
}
blok([0.35, 0.35, 17.2], materiaal('#f4d15b'), [finishX, 5.45, 0], { schaduw: false });

let afstand = 0;
let snelheid = 0;
let gestart = false;
let startTijd = 0;
let laatsteTijd = 0;
let frameId = null;
let tikTijd = 0;
const klok = new THREE.Clock();

function formaatCanvas() {
  const breedte = stadion.clientWidth;
  const hoogte = stadion.clientHeight;
  if (!breedte || !hoogte) return;
  renderer.setSize(breedte, hoogte, false);
  camera.aspect = breedte / hoogte;
  camera.updateProjectionMatrix();
}

function updateCamera() {
  const lookX = loper.position.x + 12;
  camera.position.set(loper.position.x - 19, 12.5, 23);
  camera.lookAt(lookX, 2, 0);
}

function teken() {
  const t = klok.getElapsedTime();
  if (gestart) {
    const dt = Math.min(klok.getDelta(), 0.05);
    afstand = Math.min(finishAfstand, afstand + snelheid * dt);
    loper.position.x = baanX + 5.5 + afstand;
    const fase = t * (5 + snelheid * 0.23);
    benen[0].rotation.z = Math.sin(fase) * 0.72;
    benen[1].rotation.z = Math.sin(fase + Math.PI) * 0.72;
    armen[0].rotation.z = Math.sin(fase + Math.PI) * 0.62;
    armen[1].rotation.z = Math.sin(fase) * 0.62;
    loper.position.y = 0.2 + Math.abs(Math.sin(fase * 2)) * 0.08;
    afstandTekst.textContent = `${Math.floor(afstand)} m`;
    snelheidTekst.textContent = `${(snelheid * 3.6).toFixed(0)} km/u`;
    klokTekst.textContent = `${((performance.now() - startTijd) / 1000).toFixed(2)} s`;
    updateCamera();
    if (afstand >= finishAfstand) { finish(); }
  } else {
    loper.position.y = 0.2 + Math.sin(t * 1.6) * 0.025;
  }
  renderer.render(scene, camera);
  frameId = requestAnimationFrame(teken);
}

function startSprint() {
  if (gestart) return;
  afstand = 0; snelheid = 5.8; gestart = true;
  startTijd = performance.now(); laatsteTijd = startTijd;
  klokTekst.textContent = '00.00 s';
  bericht.textContent = 'Sprint! Tik of druk herhaaldelijk op spatie of S om te versnellen!';
  startKnop.textContent = 'Sprint bezig';
  startKnop.disabled = true;
  updateCamera();
}

function sprint() {
  if (!gestart) return;
  snelheid = Math.min(12.5, snelheid + 0.8);
}

function finish() {
  gestart = false;
  afstand = finishAfstand;
  loper.position.x = finishX;
  afstandTekst.textContent = `${finishAfstand} m`;
  startKnop.disabled = false;
  startKnop.textContent = 'Start';
  const seconden = (performance.now() - startTijd) / 1000;
  const medaille = seconden < 12 ? 'goud' : seconden < 15 ? 'zilver' : 'brons';
  medailles[medaille].textContent = String(Number(medailles[medaille].textContent) + 1);
  bericht.textContent = `Gefinisht in ${seconden.toFixed(2)} seconden! Je wint ${medaille}.`;
}

function resetSpel() {
  gestart = false; afstand = 0; snelheid = 0;
  loper.position.set(baanX + 5.5, 0.2, 0);
  for (const ledemaat of [...benen, ...armen]) ledemaat.rotation.set(0, 0, 0);
  afstandTekst.textContent = '0 m'; klokTekst.textContent = '00.00 s'; snelheidTekst.textContent = '0 km/u';
  bericht.textContent = 'Klaar voor de start? Druk op Start!';
  startKnop.disabled = false; startKnop.textContent = 'Start';
  updateCamera();
}

function tikOpBaan() {
  const nu = performance.now();
  if (nu - tikTijd < 120) return;
  tikTijd = nu;
  if (!gestart) startSprint(); else sprint();
}

startKnop.addEventListener('click', startSprint);
resetKnop.addEventListener('click', resetSpel);
renderer.domElement.addEventListener('pointerdown', tikOpBaan);
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    if (!gestart) startSprint(); else sprint();
  } else if (event.key.toLowerCase() === 's') {
    if (!gestart) startSprint(); else sprint();
  }
});
window.addEventListener('resize', formaatCanvas);
new ResizeObserver(formaatCanvas).observe(stadion);

try {
  formaatCanvas();
  updateCamera();
  laden.classList.add('verbergen');
  teken();
} catch (error) {
  console.error('Het 3D-stadion kon niet worden gestart:', error);
  laden.textContent = 'Het 3D-spel kon niet laden. Controleer je internetverbinding en laad de pagina opnieuw.';
}
