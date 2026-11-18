const hardloper = document.querySelector('#hardloper');
const startKnop = document.querySelector('#start');
const resetKnop = document.querySelector('#reset');
const afstandTekst = document.querySelector('#afstand');
const bericht = document.querySelector('#bericht');
const stadion = document.querySelector('#stadion');

const medailles = {
  goud: document.querySelector('#goud'),
  zilver: document.querySelector('#zilver'),
  brons: document.querySelector('#brons')
};

const finishAfstand = 100;
let afstand = 0;
let snelheid = 7.2;
let gestart = false;
let startTijd = 0;
let vorigeUpdate = 0;
let animatieId = null;
let vorigRaak = 0;

function updateSpeler() {
  afstandTekst.textContent = `${Math.min(Math.floor(afstand), finishAfstand)} m`;
  const voortgang = Math.min(afstand / finishAfstand, 1);
  hardloper.style.left = `${14 + voortgang * 68}%`;
  const bob = gestart ? Math.sin(afstand * 0.45) * 3 : 0;
  hardloper.style.transform = `translateY(${bob}px) rotate(${bob * 0.35}deg)`;
}

function startRondje() {
  if (gestart) return;

  afstand = 0;
  snelheid = 7.2;
  gestart = true;
  startTijd = performance.now();
  vorigeUpdate = startTijd;
  hardloper.classList.add('lopen');
  bericht.textContent = 'Druk herhaaldelijk op spatie, S of tik op het stadion om te sprinten!';
  startKnop.textContent = 'Aan het lopen';
  updateSpeler();
  animatieId = requestAnimationFrame(updateRondje);
}

function updateRondje(tijdstip) {
  if (!gestart) return;

  const deltaSeconden = Math.min((tijdstip - vorigeUpdate) / 1000, 0.1);
  vorigeUpdate = tijdstip;
  afstand += snelheid * deltaSeconden;
  updateSpeler();

  if (afstand >= finishAfstand) {
    eindigRondje(tijdstip);
    return;
  }

  animatieId = requestAnimationFrame(updateRondje);
}

function sprint() {
  if (!gestart) return;
  snelheid = Math.min(12.5, snelheid + 0.65);
}

function eindigRondje(eindtijd) {
  gestart = false;
  if (animatieId !== null) cancelAnimationFrame(animatieId);
  animatieId = null;
  afstand = finishAfstand;
  hardloper.classList.remove('lopen');
  startKnop.textContent = 'Start';
  updateSpeler();

  const seconden = (eindtijd - startTijd) / 1000;
  const medaille = seconden < 12 ? 'goud' : seconden < 15 ? 'zilver' : 'brons';
  medailles[medaille].textContent = String(Number(medailles[medaille].textContent) + 1);
  bericht.textContent = `Gefinisht in ${seconden.toFixed(2)} seconden! Je wint ${medaille}.`;
}

function resetSpel() {
  gestart = false;
  if (animatieId !== null) cancelAnimationFrame(animatieId);
  animatieId = null;
  afstand = 0;
  snelheid = 7.2;
  hardloper.classList.remove('lopen');
  hardloper.style.left = '14%';
  hardloper.style.transform = 'none';
  afstandTekst.textContent = '0 m';
  bericht.textContent = 'Druk op start om te lopen.';
  startKnop.textContent = 'Start';
}

function tikOmTeSprinten() {
  const nu = Date.now();
  if (nu - vorigRaak < 180) return;
  vorigRaak = nu;
  if (!gestart) startRondje();
  else sprint();
}

startKnop.addEventListener('click', startRondje);
resetKnop.addEventListener('click', resetSpel);
stadion.addEventListener('pointerdown', tikOmTeSprinten);

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    if (!gestart) startRondje();
    else sprint();
  } else if (event.key.toLowerCase() === 's') {
    if (!gestart) startRondje();
    else sprint();
  }
});
