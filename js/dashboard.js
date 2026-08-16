import { getAiConfig } from './ai/settings.js';

const TOOLS = [
  { icon:'{ }', title:'JSON Toolkit', desc:'Format, validate, minify, and explore JSON.', href:'#/toolbox/json' },
  { icon:'.*', title:'Regex Tester', desc:'Test patterns live with match & group highlighting.', href:'#/toolbox/regex' },
  { icon:'🔑', title:'JWT Decoder', desc:'Inspect headers and claims — no verification implied.', href:'#/toolbox/jwt' },
  { icon:'⇄', title:'Encoding', desc:'Base64, URL, Unicode, and HTML entities.', href:'#/toolbox/encoding' },
  { icon:'#', title:'Hash Generator', desc:'SHA-256 / 384 / 512 via Web Crypto.', href:'#/toolbox/hash' },
  { icon:'🧾', title:'README Architect', desc:'Generate a polished README.md from a form.', href:'#/build/readme' }
];

export function render(el) {
  const cfg = getAiConfig();
  el.innerHTML = `
    <div class="hero">
      <div class="hero-rail"></div>
      <div class="hero-eyebrow">CRAFTBENCH — DEVELOPER WORKSPACE</div>
      <h1>Build. Debug. Learn. Analyze. Ship.</h1>
      <p>A full offline developer toolbox, project-health analyzer, and build-prep lab — with an optional AI coder you power with your own OpenRouter key.</p>
      <div class="hero-actions">
        <button class="btn primary" id="go-ai">🤖 Open CoDeX AI Coder</button>
        <button class="btn" id="go-toolbox">🧰 Browse Toolbox</button>
        <button class="btn ghost" id="go-analyze">🔍 Analyze a project</button>
      </div>
    </div>

    <div class="grid grid-4" style="margin-bottom:22px;">
      <div class="stat-card"><div class="stat-num">${cfg.enabled && cfg.apiKey ? 'On' : 'Off'}</div><div class="stat-label">AI Coder</div></div>
      <div class="stat-card"><div class="stat-num">10+</div><div class="stat-label">Offline tools</div></div>
      <div class="stat-card"><div class="stat-num">0</div><div class="stat-label">Server calls for offline tools</div></div>
      <div class="stat-card"><div class="stat-num">Local</div><div class="stat-label">Where your data lives</div></div>
    </div>

    <div class="view-header" style="margin-bottom:14px;">
      <h3 style="font-size:16px;">Jump back in</h3>
    </div>
    <div class="grid grid-3">
      ${TOOLS.map(t => `
        <a class="tool-card" href="${t.href}" style="text-decoration:none; color:inherit;">
          <div class="ti mono">${t.icon}</div>
          <h4>${t.title}</h4>
          <p>${t.desc}</p>
        </a>
      `).join('')}
    </div>

    <div class="section-divider"></div>
    <div class="panel panel-pad" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
      <div>
        <div style="font-weight:700; margin-bottom:4px;">Local-first, always.</div>
        <div style="color:var(--text-muted); font-size:13px; max-width:520px;">Every offline tool runs entirely in this browser tab. Nothing about your code or projects is uploaded — except when you deliberately use the AI Coder, which sends your prompt directly to OpenRouter through your own key.</div>
      </div>
      <button class="btn" onclick="location.hash='#/settings'">Privacy &amp; data settings</button>
    </div>
  `;

  el.querySelector('#go-ai').onclick = () => location.hash = '#/ai-coder';
  el.querySelector('#go-toolbox').onclick = () => location.hash = '#/toolbox';
  el.querySelector('#go-analyze').onclick = () => location.hash = '#/analyze';
}
