const texts = {
  fi: {
    start: "Aloita testi",
    clickWhenReady: "Klikkaa illuusiota vasta, kun se muuttuu!",
    clickNow: "Klikkaa nyt!",
    tooEarly: "Liian aikaisin!",
    resultText: (s) => `Vasteaikasi: ${s}s`,
    average: (s) => `Keskiarvoinen vasteaikasi: ${s}s`,
    thanks: "Kiitos testaamisesta!",
    compareTitle: "Keskimääräiset vasteajat ikäryhmittäin:",
    restart: "Testaa uudestaan",
    donate: "Haluatko tukea projektia?",
    donateLink: "Lahjoita Ko-fi:ssa"
  },
  en: {
    start: "Start Test",
    clickWhenReady: "Click the illusion only when it changes!",
    clickNow: "Click now!",
    tooEarly: "Too early!",
    resultText: (s) => `Your reaction time: ${s}s`,
    average: (s) => `Your average reaction time: ${s}s`,
    thanks: "Thanks for testing!",
    compareTitle: "Average reaction times by age group:",
    restart: "Try again",
    donate: "Want to support the project?",
    donateLink: "Donate on Ko-fi"
  }
};

let lang = 'fi';
function toggleLang() {
  lang = lang === 'fi' ? 'en' : 'fi';
  document.getElementById('start-button').textContent = texts[lang].start;
  document.getElementById('instructions').textContent = texts[lang].clickWhenReady;
  document.getElementById('thanks-text').textContent = texts[lang].thanks;
  document.getElementById('age-compare-title').textContent = texts[lang].compareTitle;
  document.getElementById('restart-button').textContent = texts[lang].restart;
  document.getElementById('donate-text').textContent = texts[lang].donate;
  document.getElementById('donate-link').textContent = texts[lang].donateLink;
}

const illusions = [
  { html: '<div class="illusion illusion-spin"></div>' },
  { html: '<div class="illusion illusion-grid"></div>' },
  { html: '<div class="illusion illusion-perspective"></div>' },
  { html: '<div class="illusion illusion-spiral"></div>' }
];

const averageByAge = [
  { range: '10–19', avg: 0.25 },
  { range: '20–29', avg: 0.24 },
  { range: '30–39', avg: 0.27 },
  { range: '40–49', avg: 0.30 },
  { range: '50–59', avg: 0.33 },
  { range: '60+',   avg: 0.36 },
];

const testContainer = document.getElementById('test-container');
const feedback = document.getElementById('feedback-text');
const startButton = document.getElementById('start-button');
const resultsScreen = document.getElementById('results-screen');
const resultsDetail = document.getElementById('results-detail');
const compareTable = document.getElementById('compare-table');
const finalAverage = document.getElementById('final-average');
const restartButton = document.getElementById('restart-button');

let results = [];
let current = 0;
let startTime = 0;

startButton.addEventListener('click', () => {
  results = [];
  current = 0;
  resultsScreen.classList.add('hidden');
  testContainer.innerHTML = '';
  feedback.textContent = '';
  startButton.classList.add('hidden');
  runTest();
});

restartButton.addEventListener('click', () => location.reload());

function runTest() {
  if (current >= illusions.length) return showResults();

  testContainer.innerHTML = illusions[current].html;
  feedback.textContent = texts[lang].clickWhenReady;

  const el = testContainer.querySelector('.illusion');
  let clicked = false;
  let ready = false;

  const delay = Math.random() * 2000 + 1000;
  const timeout = setTimeout(() => {
    el.classList.add('illusion-ready');
    startTime = performance.now();
    ready = true;
    feedback.textContent = texts[lang].clickNow;
  }, delay);

  function handleResponse() {
    if (clicked) return;
    clicked = true;

    if (!ready) {
      clearTimeout(timeout);
      feedback.textContent = texts[lang].tooEarly;
      cleanup();
      return setTimeout(() => { current++; runTest(); }, 1500);
    }

    const reaction = ((performance.now() - startTime) / 1000).toFixed(2);
    results.push(Number(reaction));
    feedback.textContent = texts[lang].resultText(reaction);
    cleanup();
    current++;
    setTimeout(runTest, 1200);
  }

  function onKeyDown(e) {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      handleResponse();
    }
  }

  function cleanup() {
    el.removeEventListener('click', handleResponse);
    document.removeEventListener('keydown', onKeyDown);
  }

  el.addEventListener('click', handleResponse);
  document.addEventListener('keydown', onKeyDown);
}

function showResults() {
  const avg = (results.reduce((a, b) => a + b, 0) / results.length).toFixed(2);
  finalAverage.textContent = texts[lang].average(avg);

  let rows = results.map((r, i) => `<tr><td>${i + 1}</td><td>${r.toFixed(2)}</td></tr>`).join("");
  resultsDetail.innerHTML = `<table class="results-table"><tr><th>#</th><th>${lang === 'fi' ? 'Vasteaika (s)' : 'Time (s)'}</th></tr>${rows}</table>`;

  let compareRows = averageByAge.map(g => {
    const highlight = Math.abs(avg - g.avg) < 0.03 ? ' style="color:#00ffcc"' : '';
    return `<tr${highlight}><td>${g.range}</td><td>${g.avg.toFixed(2)}</td></tr>`;
  }).join("");
  compareTable.innerHTML = `<table class="results-table"><tr><th>${lang === 'fi' ? 'Ikäryhmä' : 'Age Group'}</th><th>${lang === 'fi' ? 'Keskiarvo' : 'Avg.'}</th></tr>${compareRows}</table>`;

  resultsScreen.classList.remove('hidden');
}
