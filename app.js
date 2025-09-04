/* ===========
   DATA MODEL (unchanged)
   =========== */
const DATA = {
  "TNPSC": {
    icon: "🏛️",
    description: "Tamil Nadu Public Service Commission exams.",
    streams: {
      "Group 1": { materials: [], blueprints: [], papers: [], quiz: { questions: [] }},
      "Group 2": { materials: [], blueprints: [], papers: [], quiz: { questions: [] }},
      "Group 4": {
        materials: [
          { title: "TNPSC Group 4 Syllabus (Official)", url: "https://www.tnpsc.gov.in/", source: "tnpsc.gov.in", type: "PDF" }
        ],
        blueprints: [],
        papers: [],
        quiz: {
          questions: [
            { id: "tnpsc-g4-001", question: "Which of the following is a prime number?", options: ["21","29","39","51"], answerIndex:1, explanation:"29 has exactly two factors: 1 and 29." },
            { id: "tnpsc-g4-002", question: "Find the HCF of 24 and 36.", options: ["6","8","12","18"], answerIndex:2, explanation:"HCF = 12." },
            { id: "tnpsc-g4-003", question: "The synonym of ‘benevolent’ is:", options: ["Cruel","Kind","Harsh","Vulgar"], answerIndex:1, explanation:"Benevolent means kind." },
            { id: "tnpsc-g4-004", question: "Choose the correct plural of ‘radius’.", options: ["Radiuses","Radi","Radii","Radium"], answerIndex:2, explanation:"Radii is correct." },
            { id: "tnpsc-g4-005", question: "If A=1, B=2, ..., then value of ‘CAT’ is:", options: ["24","27","42","26"], answerIndex:0, explanation:"C(3)+A(1)+T(20)=24." }
          ]
        }
      }
    }
  },

  "Bank Exams": {
    icon: "🏦",
    description: "IBPS, SBI, RBI and other banking exams.",
    streams: {
      "IBPS PO": { materials: [{ title: "IBPS PO Syllabus (Overview)", url: "#", source: "ibps.in", type: "PDF" }], blueprints: [], papers: [], quiz: { questions: [] } },
      "SBI Clerk": { materials: [], blueprints: [], papers: [], quiz: { questions: [] } }
    }
  },

  "Railway": {
    icon: "🚆",
    description: "RRB NTPC, Group D, ALP & more.",
    streams: { "RRB NTPC": { materials: [], blueprints: [], papers: [], quiz: { questions: [] } }, "RRB Group D": { materials: [], blueprints: [], papers: [], quiz: { questions: [] } } }
  },

  "Postal / Post Office": {
    icon: "📮",
    description: "GDS, MTS & other postal recruitments.",
    streams: { "GDS": { materials: [], blueprints: [], papers: [], quiz: { questions: [] } }, "MTS": { materials: [], blueprints: [], papers: [], quiz: { questions: [] } } }
  },

  "Other Govt Exams": {
    icon: "🧩",
    description: "Add your own categories here.",
    streams: { "Police Constable": { materials: [], blueprints: [], papers: [], quiz: { questions: [] } }, "SSC CHSL": { materials: [], blueprints: [], papers: [], quiz: { questions: [] } } }
  }
};

/* ===========
   HELPERS & STATE
   =========== */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const byId = id => document.getElementById(id);

const state = { exam: null, stream: null, resource: null };

const yearEl = byId('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* THEME TOGGLE */
const themeToggle = byId('themeToggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
});

/* NAVIGATION BUTTONS */
const navButtons = $$('.nav-btn');
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // set active
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.target;
    showSection(target);
  });
});

// hero CTA -> start exams
const startExamsBtn = byId('startExams');
if (startExamsBtn) startExamsBtn.addEventListener('click', () => {
  setActiveNav('exams');
  showSection('exams');
});

function setActiveNav(target) {
  navButtons.forEach(b => {
    if (b.dataset.target === target) b.classList.add('active');
    else b.classList.remove('active');
  });
}

/* BREADCRUMB */
function setBreadcrumb(parts = []) {
  const bc = byId('breadcrumb').querySelector('ol');
  bc.innerHTML = '';
  const mk = (label, data) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'crumb';
    btn.textContent = label;
    if (data) Object.entries(data).forEach(([k,v]) => btn.dataset[k] = v);
    li.appendChild(btn);
    bc.appendChild(li);
  };
  mk('Home', { level:'home' });
  if (parts[0]) mk(parts[0], { level:'exam', value:parts[0] });
  if (parts[1]) mk(parts[1], { level:'stream', value:parts[1] });
  bc.querySelectorAll('.crumb').forEach(btn => {
    btn.addEventListener('click', () => {
      const level = btn.dataset.level;
      if (level === 'home') showSection('home');
      if (level === 'exam') showStreams(btn.dataset.value);
      if (level === 'stream') {
        const exam = parts[0];
        showResources(exam, btn.dataset.value);
      }
    });
  });
}

/* SHOW/HIDE top-level sections by id */
function hideAllSections() {
  const sections = ['section-home','section-exams','section-streams','section-resources','section-about','section-feedback','section-contact'];
  sections.forEach(s => {
    const el = byId(s);
    if (el) el.classList.add('hidden');
  });
}
function showSection(target) {
  hideAllSections();
  if (target === 'home') {
    byId('section-home').classList.remove('hidden');
    setBreadcrumb();
  } else if (target === 'exams') {
    showExams();
  } else if (target === 'about') {
    byId('section-about').classList.remove('hidden');
    setBreadcrumb();
  } else if (target === 'feedback') {
    byId('section-feedback').classList.remove('hidden');
    byId('feedbackForm').classList.remove('hidden');
    byId('feedbackThanks').classList.add('hidden');
    setBreadcrumb(['Feedback']);
  } else if (target === 'contact') {
    byId('section-contact').classList.remove('hidden');
    setBreadcrumb(['Contact']);
  }
}

/* RENDER EXAMS (grid) */
function showExams() {
  state.exam = null; state.stream = null; state.resource = null;
  setBreadcrumb();
  byId('section-exams').classList.remove('hidden');
  byId('section-streams').classList.add('hidden');
  byId('section-resources').classList.add('hidden');
  byId('section-home') && byId('section-home').classList.add('hidden');
  byId('section-about') && byId('section-about').classList.add('hidden');
  byId('section-feedback') && byId('section-feedback').classList.add('hidden');
  byId('section-contact') && byId('section-contact').classList.add('hidden');

  const grid = byId('examGrid');
  if (!grid) return;
  grid.innerHTML = '';
  Object.entries(DATA).forEach(([exam, payload]) => {
    const item = document.createElement('div');
    item.className = 'card-item';
    item.innerHTML = `
      <div class="icon">${payload.icon || '📘'}</div>
      <div>
        <h3>${exam}</h3>
        <p>${payload.description || ''}</p>
      </div>`;
    item.addEventListener('click', () => { setActiveNav('exams'); showStreams(exam); });
    grid.appendChild(item);
  });
}

/* RENDER Streams */
function showStreams(exam) {
  state.exam = exam; state.stream = null; state.resource = null;
  setBreadcrumb([exam]);

  byId('section-exams').classList.add('hidden');
  byId('section-streams').classList.remove('hidden');
  byId('section-resources').classList.add('hidden');

  byId('streamsTitle').textContent = `Select ${exam} Stream`;
  byId('streamsSubtitle').textContent = `Choose a specific track to see resources and quiz.`;

  const grid = byId('streamGrid');
  grid.innerHTML = '';
  const streams = DATA[exam]?.streams || {};
  Object.keys(streams).forEach(stream => {
    const item = document.createElement('div');
    item.className = 'card-item';
    item.innerHTML = `
      <div class="icon">📂</div>
      <div>
        <h3>${stream}</h3>
        <p>Open resources & quiz for ${stream}.</p>
      </div>`;
    item.addEventListener('click', () => showResources(exam, stream));
    grid.appendChild(item);
  });
}

/* Render Resources */
function showResources(exam, stream) {
  state.exam = exam; state.stream = stream; state.resource = null;
  setBreadcrumb([exam, stream]);

  byId('section-exams').classList.add('hidden');
  byId('section-streams').classList.add('hidden');
  byId('section-resources').classList.remove('hidden');
  byId('section-home') && byId('section-home').classList.add('hidden');

  byId('resourcesTitle').textContent = `${exam} — ${stream}`;
  byId('contentArea').innerHTML = `
    <div class="placeholder">
      <div class="illustration">📁</div>
      <h3>Select a resource above</h3>
      <p>Study Materials, Blueprints, Previous Papers & Answers, or Quiz.</p>
    </div>`;

  buildSmartFinder(exam, stream);

  $$('.resource-actions .pill').forEach(btn => {
    btn.onclick = () => {
      const r = btn.dataset.resource;
      state.resource = r;
      if (r === 'quiz') renderQuiz(exam, stream);
      if (r === 'materials') renderLinks(exam, stream, 'materials', 'Study Materials');
      if (r === 'blueprints') renderLinks(exam, stream, 'blueprints', 'Blueprints');
      if (r === 'papers') renderLinks(exam, stream, 'papers', 'Previous Papers & Answers');
    };
  });
}

/* Smart Finder */
function buildSmartFinder(exam, stream){
  const map = {
    materials: `syllabus ${exam} ${stream} filetype:pdf`,
    blueprints: `exam pattern blueprint ${exam} ${stream} site:gov.in OR site:tnpsc.gov.in filetype:pdf`,
    papers: `previous year question paper with answers ${exam} ${stream} filetype:pdf`,
  };
  const smart = byId('smartSearch');
  const row = byId('smartLinks');
  row.innerHTML = '';
  Object.entries(map).forEach(([key, q]) => {
    const a = document.createElement('a');
    a.className = 'chip';
    a.target = '_blank';
    a.rel = 'noopener';
    a.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    a.textContent = key === 'materials' ? '🔎 Syllabus PDFs'
                : key === 'blueprints' ? '🔎 Blueprints/Pattern'
                : '🔎 Previous Papers';
    row.appendChild(a);
  });
  smart.classList.remove('hidden');
}

/* Render Links */
function renderLinks(exam, stream, key, title){
  const area = byId('contentArea');
  const list = DATA[exam]?.streams?.[stream]?.[key] || [];
  if (!list.length){
    area.innerHTML = `
      <div class="placeholder">
        <div class="illustration">📄</div>
        <h3>No ${title} added yet</h3>
        <p>Use Smart Finder above to locate official PDFs, then add them to your data in <code>app.js</code>.</p>
      </div>`;
    return;
  }
  const wrapper = document.createElement('div');
  const heading = document.createElement('div');
  heading.innerHTML = `<h3>${title}</h3><p class="tiny meta">Curated for ${exam} → ${stream}</p>`;
  wrapper.appendChild(heading);

  const ul = document.createElement('div');
  ul.className = 'link-list';
  list.forEach(item => {
    const li = document.createElement('div');
    li.className = 'link-item';
    li.innerHTML = `
      <div>🔗</div>
      <div>
        <a href="${item.url}" target="_blank" rel="noopener">${item.title}</a>
        <div class="meta">${item.source || ''} ${item.type ? ' • '+item.type : ''}</div>
      </div>`;
    ul.appendChild(li);
  });
  wrapper.appendChild(ul);
  area.innerHTML = '';
  area.appendChild(wrapper);
}

/* =============
   QUIZ ENGINE
   ============= */
function renderQuiz(exam, stream){
  const area = byId('contentArea');
  const bank = DATA[exam]?.streams?.[stream]?.quiz?.questions || [];
  if (!bank.length){
    area.innerHTML = `
      <div class="placeholder">
        <div class="illustration">🧪</div>
        <h3>No quiz added yet</h3>
        <p>Add questions for ${exam} → ${stream} in <code>app.js</code>.</p>
      </div>`;
    return;
  }

  const MAX_Q = Math.min(10, bank.length);
  const seenKey = `seen_${exam}_${stream}`;
  const seen = new Set(JSON.parse(localStorage.getItem(seenKey) || '[]'));

  let pool = bank.filter(q => !seen.has(q.id));
  if (pool.length < MAX_Q) pool = [...bank];

  const selected = pickRandom(pool, MAX_Q);

  area.innerHTML = '';
  const quizDiv = document.createElement('div');
  quizDiv.className = 'quiz';
  quizDiv.innerHTML = `
    <div class="q-head">
      <div class="badge">New set — no repeats this attempt</div>
      <div class="badge">${exam} • ${stream}</div>
    </div>
    <div id="qWrap"></div>
    <div class="quiz-actions">
      <button id="submitQuiz" class="btn small">Submit</button>
      <button id="newSet" class="btn small alt">New Questions</button>
      <button id="clearMemory" class="btn small" style="background:#ef4444">Reset Memory</button>
    </div>
    <div id="result"></div>
  `;
  area.appendChild(quizDiv);

  const qWrap = byId('qWrap');
  selected.forEach((q, idx) => {
    const card = document.createElement('div');
    card.className = 'q-card';
    card.innerHTML = `
      <div class="q-title">Q${idx+1}. ${q.question}</div>
      <div class="options">
        ${q.options.map((opt,i)=>`
          <label class="opt">
            <input type="radio" name="q_${q.id}" value="${i}" />
            <span>${opt}</span>
          </label>
        `).join('')}
      </div>
    `;
    qWrap.appendChild(card);
  });

  byId('submitQuiz').onclick = () => {
    let score = 0;
    const review = [];
    selected.forEach(q => {
      const chosen = qWrap.querySelector(`input[name="q_${q.id}"]:checked`);
      const ans = chosen ? parseInt(chosen.value,10) : null;
      const correct = ans === q.answerIndex;
      if (correct) score++;
      review.push({ q, ans, correct });
    });

    const newSeen = new Set(JSON.parse(localStorage.getItem(seenKey) || '[]'));
    selected.forEach(q => newSeen.add(q.id));
    localStorage.setItem(seenKey, JSON.stringify([...newSeen]));

    showResult(score, selected.length, review);
  };

  byId('newSet').onclick = () => renderQuiz(exam, stream);
  byId('clearMemory').onclick = () => {
    localStorage.removeItem(seenKey);
    renderQuiz(exam, stream);
  };
}

function showResult(score, total, review){
  const result = byId('result');
  const pct = Math.round((score/total)*100);
  result.innerHTML = `
    <div class="result">
      <div class="score">Score: ${score}/${total} (${pct}%)</div>
      <div class="meta">Instant evaluation completed. Review below:</div>
      <div class="review">
        ${review.map(r => `
          <div class="q-card">
            <div class="q-title">${r.q.question}</div>
            <div class="${r.correct ? 'correct':'wrong'}">
              Your answer: ${r.ans !== null ? r.q.options[r.ans] : 'Not answered'} •
              Correct: ${r.q.options[r.q.answerIndex]}
            </div>
            <div class="meta">${r.q.explanation || ''}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function pickRandom(arr, count){
  const copy = arr.slice();
  for (let i = copy.length -1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

/* =========
   FEEDBACK FORM
   ========= */
const feedbackForm = byId('feedbackForm');
if (feedbackForm){
  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = byId('fbName').value.trim();
    const email = byId('fbEmail').value.trim();
    const message = byId('fbMessage').value.trim();
    if (!name || !email || !message) return alert('Please fill all fields.');

    const saved = JSON.parse(localStorage.getItem('feedback_messages') || '[]');
    saved.push({ id: Date.now(), name, email, message });
    localStorage.setItem('feedback_messages', JSON.stringify(saved));

    // show thanks
    feedbackForm.classList.add('hidden');
    byId('feedbackThanks').classList.remove('hidden');
  });

  byId('clearFeedback').addEventListener('click', () => {
    byId('fbName').value = '';
    byId('fbEmail').value = '';
    byId('fbMessage').value = '';
  });
}

/* INIT: show home by default */
showSection('home');
setActiveNav('home');

/* Click breadcrumb home initially to wire it */
document.addEventListener('DOMContentLoaded', () => {
  const crumbHome = document.querySelector('.breadcrumb .crumb');
  if (crumbHome) crumbHome.addEventListener('click', () => { showSection('home'); setActiveNav('home'); });
});

/* Expose showExams to other controls e.g. start button */
window.showExams = showExams;
