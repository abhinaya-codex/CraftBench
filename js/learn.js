import { store } from './storage.js';
import { toast } from './ui.js';

const ROADMAPS = {
  'Web Development': ['HTML fundamentals','CSS layout (Flexbox & Grid)','Responsive design','JavaScript basics','DOM manipulation','Fetch & APIs','Version control (Git)','Deploying a static site'],
  'Frontend': ['Component-based UI thinking','State management basics','Client-side routing','Build tools (Vite/webpack)','Accessibility fundamentals','Testing components','Performance basics (bundle size, lazy load)'],
  'Backend': ['HTTP & REST fundamentals','Routing & middleware','Databases (SQL basics)','Authentication & sessions','Environment config & secrets','Error handling & logging','Deploying a backend service'],
  'Full Stack': ['Frontend fundamentals','Backend fundamentals','Connecting client & API','Auth across the stack','Database design','Caching basics','CI/CD basics','Monitoring & logs'],
  'Python': ['Syntax & data types','Functions & modules','Lists, dicts, comprehensions','File I/O','Virtual environments','Testing with pytest','Packaging a project'],
  'JavaScript': ['Variables & scope','Functions & closures','Async/await & Promises','Array & object methods','Modules (import/export)','Error handling','Working with the DOM'],
  'C++': ['Syntax & types','Pointers & references','Memory management','STL containers','Classes & OOP','Templates basics','Build tools (CMake)'],
  'AI/ML': ['Python for data','NumPy & pandas basics','Statistics fundamentals','Supervised learning basics','Model evaluation','Neural network basics','Working with a real dataset'],
  'DevOps': ['Linux command line basics','Git workflows','Containers (Docker) basics','CI/CD pipelines','Infrastructure as code basics','Monitoring & alerting','Cloud provider fundamentals']
};

export function render(el) {
  const progress = store.get('roadmap-progress', {});

  el.innerHTML = `
    <div class="grid grid-3" id="rm-cards"></div>
    <div id="rm-detail" style="margin-top:20px;"></div>
  `;

  const cards = el.querySelector('#rm-cards');
  const detail = el.querySelector('#rm-detail');

  function pct(name) {
    const done = progress[name] || [];
    return Math.round((done.length / ROADMAPS[name].length) * 100);
  }

  function renderCards() {
    cards.innerHTML = Object.keys(ROADMAPS).map(name => `
      <button class="tool-card" data-roadmap="${name}" style="border:1px solid var(--border); cursor:pointer;">
        <h4>${name}</h4>
        <div style="height:6px; background:var(--bg-elevated); border-radius:4px; overflow:hidden; margin:6px 0;">
          <div style="height:100%; width:${pct(name)}%; background:var(--brass);"></div>
        </div>
        <p>${pct(name)}% complete · ${ROADMAPS[name].length} topics</p>
      </button>
    `).join('');
    cards.querySelectorAll('[data-roadmap]').forEach(btn => btn.onclick = () => openRoadmap(btn.dataset.roadmap));
  }

  function openRoadmap(name) {
    const done = new Set(progress[name] || []);
    detail.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">🧭 ${name} roadmap</span>
          <span class="pill info">${pct(name)}% complete</span>
        </div>
        <div class="panel-body">
          ${ROadmapListStub(name, ROADMAPS[name], done)}
        </div>
      </div>
    `;
    detail.querySelectorAll('[data-topic]').forEach(row => {
      row.addEventListener('click', () => {
        const topic = row.dataset.topic;
        const set = new Set(progress[name] || []);
        if (set.has(topic)) set.delete(topic); else set.add(topic);
        progress[name] = [...set];
        store.set('roadmap-progress', progress);
        toast(set.has(topic) ? 'Marked complete' : 'Marked incomplete');
        renderCards();
        openRoadmap(name);
      });
    });
  }

  function ROadmapListStub(name, topics, done) {
    return topics.map(t => `
      <div class="checklist-row" data-topic="${t}" style="cursor:pointer;">
        <span style="${done.has(t) ? 'color:var(--text-faint); text-decoration:line-through;' : ''}">${t}</span>
        <span class="pill ${done.has(t) ? 'ok' : 'muted'}">${done.has(t) ? '✅ Done' : 'Mark done'}</span>
      </div>
    `).join('');
  }

  renderCards();
  detail.innerHTML = `<div class="empty-state"><div class="ei">🧭</div><p>Pick a roadmap above to see its topics and track your progress. Progress is saved locally in this browser.</p></div>`;
}
