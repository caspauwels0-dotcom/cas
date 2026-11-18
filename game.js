const hardloper = document.querySelector('#hardloper');
const startKnop = document.querySelector('#start');
const resetKnop = document.querySelector('#reset');
const afstandTekst = document.querySelector('#afstand');
const bericht = document.querySelector('#bericht');

let afstand = 0;
let snelheid = 0.8;
let draait = null;
let gestart = false;

const medailles = {
  goud: document.querySelector('#goud'),
  zilver: document.querySelector('#zilver'),
  brons: document.querySelector('#brons')
};

function updateSpeler() {
  afstandTekst.textContent = `${Math.floor(afstand)} m`;
  const voortgang = Math.min(afstand / 100, 1);
  hardloper.style.left = `${14 + voortgang * 68}%`;
  const bob = gestart ? Math.sin(afstand * 0.7) * 3 : 0;
  hardloper.style.transform = `translateY(${bob}px) rotate(${bob * 0.35}deg)`;
}

function startRondje() {
  if (gestart) return;
  gestart = true;
  afstand = 0;
  snelheid = 0.55 + Math.random() * 0.25;
  hardloper.classList.add('lopen');
  bericht.textContent = 'Gebruik de sneltoets of de spatiebalk om harder te lopen!';
  startKnop.textContent = 'Lopen';

  draait = window.setInterval(() => {
    afstand += snelheid;

    if (Math.random() > 0.72) {
      snelheid = Math.max(0.35, snelheid - 0.12);
    } else if (snelheid < 1.15) {
      snelheid += 0.035;
    }

    updateSpeler();

    if (afstand >= 100) {
      eindigRondje();
    }
  }, 50);
}

function sprint() {
  if (!gestart) return;
  snelheid = Math.min(1.55, snelheid + 0.26);
}

function eindigRondje() {
  window.clearInterval(draait);
  draait = null;
  gestart = false;
  hardloper.classList.remove('lopen');
  startKnop.textContent = 'Start';

  const tijd = 100 / (snelheid || 1);
  let medaille;

  if (tijd < 77) {
    medaille = 'goud';
  } else if (tijd < 145) {
    medaille = 'zilver';
  } else {
    medaille = 'brons';
  }

  medailles[medaille].textContent = Number(medailles[medaille].textContent) + 1;
  bericht.textContent = `Einde! Je wint ${medaille === 'goud' ? 'goud' : medaille === 'zilver' ? 'zilver' : 'brons'}!`;
}

function resetSpel() {
  if (draait) window.clearInterval(draait);
  draait = null;
  gestart = false;
  afstand = 0;
  snelheid = 0.8;
  hardloper.classList.remove('lopen');
  hardloper.style.left = '14%';
  hardloper.style.transform = 'none';
  afstandTekst.textContent = '0 m';
  bericht.textContent = 'Druk op start om te lopen.';
  startKnop.textContent = 'Start';
}

startKnop.addEventListener('click', startRondje);
resetKnop.addEventListener('click', resetSpel);

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventEventDefault?.();
    if (!gestart) startRondje();
    else sprint();
  }
  if (event.key.toLowerCase() === 's') sprint();
});

let vorigRaak = 0;
stadion = document.querySelector('#stadion');
stadion.addEventListener('pointerdown', () => {
  const nu = Date.now();
  if (nu - vorigRaak < 500) return;
  vorigRaak = nu;
  if (!gestart) startRondje();
  else sprint();
});
