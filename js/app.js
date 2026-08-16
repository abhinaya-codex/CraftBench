import { store } from './storage.js';
import { applyTheme } from './theme.js';
import { toast } from './ui.js';
import * as dashboard from './dashboard.js';
import * as toolboxHub from './toolboxHub.js';
import * as buildHub from './buildHub.js';
import * as settingsPage from './settingsPage.js';
import * as aiSettings from './ai/settings.js';
import * as aiChat from './ai/chat.js';
import * as analyze from './analyze.js';
import * as learn from './learn.js';
import * as buglab from './buglab.js';
import * as comingSoon from './comingSoon.js';
import { shouldAutoShow, showOnboarding } from './onboarding.js';

import * as jsonTool from './tools/json.js';
import * as regexTool from './tools/regex.js';
import * as jwtTool from './tools/jwt.js';
import * as encodingTool from './tools/encoding.js';
import * as uuidTool from './tools/uuid.js';
import * as hashTool from './tools/hash.js';
import * as timeTool from './tools/time.js';
import * as colorTool from './tools/color.js';
import * as diffTool from './tools/diff.js';
import * as minifyTool from './tools/minify.js';

import * as readmeBuild from './build/readme.js';
import * as gitignoreBuild from './build/gitignore.js';
import * as licenseBuild from './build/license.js';

applyTheme(store.get('theme', 'dark'));

const NAV = [
  { group: null, items: [
    { key: 'dashboard', icon: '⌂', label: 'Dashboard' }
  ]},
  { group: 'AI Coder', items: [
    { key: 'ai-coder', icon: '🤖', label: 'CoDeX Chat' },
    { key: 'ai-settings', icon: '🔑', label: 'AI Settings' }
  ]},
  { group: 'Toolbox', items: [
    { key: 'toolbox', icon: '🧰', label: 'All tools' },
    { key: 'toolbox/json', icon: '{ }', label: 'JSON' },
    { key: 'toolbox/regex', icon: '.*', label: 'Regex' },
    { key: 'toolbox/jwt', icon: '🔑', label: 'JWT' },
    { key: 'toolbox/encoding', icon: '⇄', label: 'Encoding' },
    { key: 'toolbox/uuid', icon: '#', label: 'UUID' },
    { key: 'toolbox/hash', icon: '0x', label: 'Hash' },
    { key: 'toolbox/time', icon: '🕐', label: 'Time' },
    { key: 'toolbox/color', icon: '🎨', label: 'Color' },
    { key: 'toolbox/diff', icon: '±', label: 'Diff' },
    { key: 'toolbox/minify', icon: '⇣', label: 'Minifier' }
  ]},
  { group: 'Build Lab', items: [
    { key: 'build', icon: '🚀', label: 'All generators' },
    { key: 'build/readme', icon: '📝', label: 'README' },
    { key: 'build/gitignore', icon: '🚫', label: '.gitignore' },
    { key: 'build/license', icon: '⚖️', label: 'License' }
  ]},
  { group: 'Learn', items: [
    { key: 'learn', icon: '🧠', label: 'Roadmaps' },
    { key: 'buglab', icon: '🐛', label: 'BugLab' }
  ]},
  { group: 'Analyze', items: [
    { key: 'analyze', icon: '🔍', label: 'Project Analyzer' }
  ]},
  { group: null, items: [
    { key: 'settings', icon: '⚙', label: 'Settings' }
  ]}
];

const TITLES = Object.fromEntries(NAV.flatMap(g => g.items).map(i => [i.key, i.label]));

const ROUTES = {
  'dashboard': (el) => dashboard.render(el),
  'ai-coder': (el) => aiChat.render(el),
  'ai-settings': (el) => aiSettings.render(el),
  'toolbox': (el) => toolboxHub.render(el),
  'toolbox/json': (el) => jsonTool.render(el),
  'toolbox/regex': (el) => regexTool.render(el),
  'toolbox/jwt': (el) => jwtTool.render(el),
  'toolbox/encoding': (el) => encodingTool.render(el),
  'toolbox/uuid': (el) => uuidTool.render(el),
  'toolbox/hash': (el) => hashTool.render(el),
  'toolbox/time': (el) => timeTool.render(el),
  'toolbox/color': (el) => colorTool.render(el),
  'toolbox/diff': (el) => diffTool.render(el),
  'toolbox/minify': (el) => minifyTool.render(el),
  'build': (el) => buildHub.render(el),
  'build/readme': (el) => readmeBuild.render(el),
  'build/gitignore': (el) => gitignoreBuild.render(el),
  'build/license': (el) => licenseBuild.render(el),
  'analyze': (el) => analyze.render(el),
  'settings': (el) => settingsPage.render(el),
  'learn': (el) => learn.render(el),
  'buglab': (el) => buglab.render(el)
};

const EYEBROWS = {
  'dashboard': 'HOME',
  'ai-coder': 'CODEX AI CODER',
  'ai-settings': 'AI CODER · SETTINGS',
  'toolbox': 'DEVELOPER TOOLBOX',
  'build': 'BUILD LAB',
  'analyze': 'PROJECT ANALYZER',
  'settings': 'SETTINGS',
  'learn': 'LEARNING CENTER',
  'buglab': 'BUGLAB'
};
function eyebrowFor(route) {
  if (EYEBROWS[route]) return EYEBROWS[route];
  if (route.startsWith('toolbox/')) return 'DEVELOPER TOOLBOX';
  if (route.startsWith('build/')) return 'BUILD LAB';
  return 'CRAFTBENCH';
}

function renderNav() {
  const rail = document.getElementById('rail-scroll');
  rail.innerHTML = NAV.map(g => `
    ${g.group ? `<div class="rail-group-label">${g.group}</div>` : ''}
    <div class="rail-group">
      ${g.items.map(i => `
        <button class="peg-item" data-route="${i.key}">
          <span class="peg-icon mono">${i.icon}</span>${i.label}
        </button>
      `).join('')}
    </div>
  `).join('');
  rail.querySelectorAll('[data-route]').forEach(btn => {
    btn.onclick = () => { location.hash = '#/' + btn.dataset.route; closeDrawer(); };
  });
}

function setActiveNav(route) {
  document.querySelectorAll('.peg-item').forEach(b => b.classList.toggle('active', b.dataset.route === route));
}

function closeDrawer() {
  document.querySelector('.railnav').classList.remove('open');
  document.querySelector('.nav-scrim').classList.remove('show');
}

function navigate() {
  let route = (location.hash || '#/dashboard').replace(/^#\//, '');
  if (!ROUTES[route]) route = 'dashboard';
  const view = document.getElementById('view');
  view.classList.remove('view-enter');
  void view.offsetWidth;
  view.classList.add('view-enter');
  view.innerHTML = '';
  ROUTES[route](view);
  setActiveNav(route);
  document.getElementById('crumb-label').innerHTML = `<strong>${TITLES[route] || 'Craftbench'}</strong>`;
  document.getElementById('view-eyebrow').textContent = eyebrowFor(route);
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', navigate);

// ---- Mobile drawer ----
document.getElementById('menu-btn').addEventListener('click', () => {
  document.querySelector('.railnav').classList.add('open');
  document.querySelector('.nav-scrim').classList.add('show');
});
document.querySelector('.nav-scrim').addEventListener('click', closeDrawer);

// ---- Theme toggle ----
document.getElementById('theme-toggle').addEventListener('click', () => {
  const current = store.get('theme', 'dark');
  const next = current === 'dark' ? 'light' : 'dark';
  store.set('theme', next);
  applyTheme(next);
});

// ---- Command palette ----
const CMDK_ITEMS = NAV.flatMap(g => g.items).map(i => ({ ...i }));
let cmdkOpen = false, cmdkSel = 0, cmdkFiltered = CMDK_ITEMS;

function openCmdk() {
  cmdkOpen = true; cmdkSel = 0;
  const overlay = document.getElementById('cmdk-overlay');
  overlay.style.display = 'flex';
  const input = document.getElementById('cmdk-input');
  input.value = '';
  filterCmdk('');
  setTimeout(() => input.focus(), 10);
}
function closeCmdk() {
  cmdkOpen = false;
  document.getElementById('cmdk-overlay').style.display = 'none';
}
function filterCmdk(q) {
  cmdkFiltered = CMDK_ITEMS.filter(i => i.label.toLowerCase().includes(q.toLowerCase()));
  cmdkSel = 0;
  renderCmdkList();
}
function renderCmdkList() {
  const list = document.getElementById('cmdk-list');
  list.innerHTML = cmdkFiltered.map((i, idx) => `
    <div class="cmdk-item ${idx === cmdkSel ? 'sel' : ''}" data-idx="${idx}">
      <span class="ci mono">${i.icon}</span>${i.label}
    </div>
  `).join('') || `<div style="padding:14px; color:var(--text-faint); font-size:13px;">No matches.</div>`;
  list.querySelectorAll('[data-idx]').forEach(node => {
    node.addEventListener('click', () => selectCmdk(parseInt(node.dataset.idx)));
  });
}
function selectCmdk(idx) {
  const item = cmdkFiltered[idx];
  if (item) { location.hash = '#/' + item.key; closeCmdk(); }
}

document.getElementById('cmdk-input').addEventListener('input', e => filterCmdk(e.target.value));
document.getElementById('cmdk-overlay').addEventListener('click', e => { if (e.target.id === 'cmdk-overlay') closeCmdk(); });
document.getElementById('cmdk-btn').addEventListener('click', openCmdk);

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    cmdkOpen ? closeCmdk() : openCmdk();
    return;
  }
  if (cmdkOpen) {
    if (e.key === 'Escape') closeCmdk();
    if (e.key === 'ArrowDown') { e.preventDefault(); cmdkSel = Math.min(cmdkSel + 1, cmdkFiltered.length - 1); renderCmdkList(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); cmdkSel = Math.max(cmdkSel - 1, 0); renderCmdkList(); }
    if (e.key === 'Enter') { e.preventDefault(); selectCmdk(cmdkSel); }
    return;
  }
  if (e.key.toLowerCase() === 'c' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    openTerminal();
  }
});

// ---- Terminal ----
const TERM_LINES = [];
function openTerminal() {
  document.getElementById('terminal-overlay').style.display = 'flex';
  setTimeout(() => document.getElementById('terminal-input').focus(), 10);
  if (!TERM_LINES.length) termPrint('Craftbench terminal — not a real OS shell, just an in-app command helper. Type "help" to see commands.');
}
function closeTerminal() { document.getElementById('terminal-overlay').style.display = 'none'; }
function termPrint(text, prompt) {
  TERM_LINES.push({ text, prompt });
  const body = document.getElementById('terminal-body');
  const line = document.createElement('div');
  line.className = 'line';
  line.innerHTML = prompt ? `<span class="prompt">craftbench&gt;</span> ${escapeHtmlLocal(text)}` : escapeHtmlLocal(text);
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
}
function escapeHtmlLocal(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

const TERM_COMMANDS = {
  help: () => 'Commands: help, about, tools, learn, projects, analyze, github, clear, version',
  about: () => 'Craftbench — Build. Debug. Learn. Analyze. Ship.\nCreated by Abhinaya Tripathee (CoDeX).',
  tools: () => 'Opening Toolbox…',
  learn: () => 'Opening Learning Center…',
  projects: () => 'Opening CoDeX AI Coder…',
  analyze: () => 'Opening Project Analyzer…',
  github: () => 'https://github.com/abhinaya-codex',
  version: () => 'Craftbench v0.1.0 (foundation build)',
  clear: () => null
};
document.getElementById('terminal-input').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const val = e.target.value.trim();
  e.target.value = '';
  if (!val) return;
  termPrint(val, true);
  const cmd = val.toLowerCase();
  if (cmd === 'clear') { document.getElementById('terminal-body').innerHTML = ''; TERM_LINES.length = 0; return; }
  if (TERM_COMMANDS[cmd]) {
    termPrint(TERM_COMMANDS[cmd]());
    if (cmd === 'tools') location.hash = '#/toolbox';
    if (cmd === 'learn') location.hash = '#/learn';
    if (cmd === 'projects') location.hash = '#/ai-coder';
    if (cmd === 'analyze') location.hash = '#/analyze';
  } else {
    termPrint(`Unknown command: "${val}". Type "help" for a list.`);
  }
});
document.getElementById('terminal-close').addEventListener('click', closeTerminal);
document.getElementById('terminal-overlay').addEventListener('click', e => { if (e.target.id === 'terminal-overlay') closeTerminal(); });
document.getElementById('terminal-btn').addEventListener('click', openTerminal);

// ---- Welcome / onboarding guide ----
document.getElementById('help-btn').addEventListener('click', showOnboarding);

// ---- Boot ----
renderNav();
navigate();
if (shouldAutoShow()) {
  setTimeout(showOnboarding, 300);
}
