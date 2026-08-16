import { store } from './storage.js';
import { toast } from './ui.js';

const BUGS = [
  { id:'b1', cat:'Syntax', diff:'Beginner', lang:'JavaScript',
    code:`function greet(name) {\n  console.log("Hello, " + name\n}`,
    hint:'Look closely at the parentheses.',
    answer:'Missing closing parenthesis on console.log("Hello, " + name) — it should be console.log("Hello, " + name);' },
  { id:'b2', cat:'Logic', diff:'Beginner', lang:'Python',
    code:`def is_even(n):\n    if n % 2 == 1:\n        return True\n    return False`,
    hint:'What does n % 2 == 1 actually mean?',
    answer:'The condition is inverted — n % 2 == 1 checks for odd numbers, not even. It should check n % 2 == 0.' },
  { id:'b3', cat:'Loops', diff:'Intermediate', lang:'JavaScript',
    code:`for (let i = 0; i <= arr.length; i++) {\n  console.log(arr[i]);\n}`,
    hint:'Check the loop boundary against array indices.',
    answer:'Off-by-one error: <= should be < . With <=, the loop runs one extra time and accesses arr[arr.length], which is undefined.' },
  { id:'b4', cat:'Functions', diff:'Intermediate', lang:'Python',
    code:`def add_item(item, items=[]):\n    items.append(item)\n    return items`,
    hint:'Default arguments in Python are evaluated once — what does that mean across multiple calls?',
    answer:'Mutable default argument bug: the same list is reused across calls since default args are evaluated once at function definition time, causing items to persist and grow across unrelated calls.' },
  { id:'b5', cat:'Arrays', diff:'Beginner', lang:'JavaScript',
    code:`const nums = [1,2,3];\nconst doubled = nums.map(n => n * 2)\nconsole.log(doubled[3]);`,
    hint:'How many elements does doubled actually have?',
    answer:'doubled only has indices 0-2 (length 3); doubled[3] is out of bounds and logs undefined, not an error but likely not the intended value.' },
  { id:'b6', cat:'Async', diff:'Advanced', lang:'JavaScript',
    code:`function getData() {\n  fetch('/api/data').then(res => res.json());\n  return "done";\n}\nconsole.log(getData());`,
    hint:'When does the function actually return, relative to when the fetch resolves?',
    answer:'getData() returns "done" immediately without waiting for the fetch to resolve — the promise chain is never returned or awaited, so the caller can\'t access the fetched data.' },
  { id:'b7', cat:'Common mistakes', diff:'Beginner', lang:'JavaScript',
    code:`if (userInput = "admin") {\n  grantAccess();\n}`,
    hint:'Assignment vs. comparison.',
    answer:'Uses = (assignment) instead of === (comparison). This assigns "admin" to userInput and the condition is always truthy, granting access unconditionally.' },
  { id:'b8', cat:'Async', diff:'Nightmare', lang:'JavaScript',
    code:`async function loadAll(ids) {\n  const results = [];\n  ids.forEach(async (id) => {\n    const data = await fetchItem(id);\n    results.push(data);\n  });\n  return results;\n}`,
    hint:'Does forEach wait for async callbacks to finish?',
    answer:'forEach does not await its async callback — loadAll returns results (still empty) before any of the fetchItem calls resolve. Use Promise.all with map instead of forEach.' }
];

const DIFF_COLOR = { Beginner:'ok', Intermediate:'info', Advanced:'muted', Nightmare:'bad' };

export function render(el) {
  const progress = store.get('buglab-progress', { solved: [], streak: 0, score: 0 });

  el.innerHTML = `
    <div class="grid grid-4" style="margin-bottom:18px;">
      <div class="stat-card"><div class="stat-num">${progress.score}</div><div class="stat-label">Score</div></div>
      <div class="stat-card"><div class="stat-num">${progress.streak}</div><div class="stat-label">Streak</div></div>
      <div class="stat-card"><div class="stat-num">${progress.solved.length}/${BUGS.length}</div><div class="stat-label">Bugs solved</div></div>
      <div class="stat-card"><div class="stat-num">${BUGS.length}</div><div class="stat-label">Total in this set</div></div>
    </div>
    <div class="grid grid-3" id="bl-grid"></div>
    <div id="bl-detail" style="margin-top:18px;"></div>
  `;

  const grid = el.querySelector('#bl-grid');
  const detail = el.querySelector('#bl-detail');

  function renderGrid() {
    grid.innerHTML = BUGS.map(b => {
      const solved = progress.solved.includes(b.id);
      return `
        <button class="tool-card" data-bug="${b.id}" style="cursor:pointer; ${solved?'opacity:0.6;':''}">
          <div class="badge-row">
            <span class="pill muted">${b.cat}</span>
            <span class="pill ${DIFF_COLOR[b.diff]}">${b.diff}</span>
          </div>
          <h4 style="margin-top:8px;">${b.lang} bug ${solved ? '✅' : ''}</h4>
          <p>Click to inspect the broken snippet.</p>
        </button>
      `;
    }).join('');
    grid.querySelectorAll('[data-bug]').forEach(btn => btn.onclick = () => openBug(btn.dataset.bug));
  }

  function openBug(id) {
    const b = BUGS.find(x => x.id === id);
    const solved = progress.solved.includes(id);
    detail.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">${b.lang} · ${b.cat} · ${b.diff}</span>
          ${solved ? '<span class="pill ok">Solved</span>' : ''}
        </div>
        <div class="panel-body">
          <pre class="output-block mono">${b.code.replace(/</g,'&lt;')}</pre>
          <div style="display:flex; gap:8px; margin:14px 0;">
            <button class="btn btn-sm" id="bl-hint">💡 Hint</button>
            <button class="btn btn-sm" id="bl-reveal">Reveal answer</button>
            ${!solved ? `<button class="btn btn-sm primary" id="bl-solved">Mark solved</button>` : ''}
          </div>
          <div id="bl-answer"></div>
        </div>
      </div>
    `;
    detail.querySelector('#bl-hint').onclick = () => toast('Hint: ' + b.hint);
    detail.querySelector('#bl-reveal').onclick = () => {
      detail.querySelector('#bl-answer').innerHTML = `<div class="panel panel-pad" style="background:var(--bg-elevated);"><strong>The bug:</strong> ${b.answer}</div>`;
    };
    const solvedBtn = detail.querySelector('#bl-solved');
    if (solvedBtn) solvedBtn.onclick = () => {
      progress.solved.push(id);
      progress.streak += 1;
      progress.score += b.diff === 'Nightmare' ? 40 : b.diff === 'Advanced' ? 25 : b.diff === 'Intermediate' ? 15 : 10;
      store.set('buglab-progress', progress);
      toast('Nice — marked solved!');
      render(el);
    };
  }

  renderGrid();
  detail.innerHTML = `<div class="empty-state"><div class="ei">🐛</div><p>Pick a bug above. Find the issue yourself, then use hints or reveal the explanation.</p></div>`;
}
