import { store } from '../storage.js';
import { toast } from '../ui.js';

const DEFAULT_MODELS = [
  'anthropic/claude-sonnet-4.5',
  'anthropic/claude-3.5-haiku',
  'openai/gpt-4o-mini',
  'openai/gpt-4o',
  'google/gemini-2.0-flash-001',
  'meta-llama/llama-3.3-70b-instruct',
  'deepseek/deepseek-chat'
];

export function getAiConfig() {
  return store.get('ai-config', { apiKey: '', model: DEFAULT_MODELS[0], enabled: false });
}

export function render(el) {
  const cfg = getAiConfig();

  el.innerHTML = `
    <div class="grid grid-2" style="align-items:start;">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">🤖 CoDeX AI Coder — connection</span></div>
        <div class="panel-body">
          <div class="field">
            <label class="field-label">AI provider</label>
            <input type="text" value="OpenRouter" disabled style="opacity:0.7;">
          </div>
          <div class="field">
            <label class="field-label">API key</label>
            <div style="display:flex; gap:8px;">
              <input type="password" id="ai-key" placeholder="sk-or-v1-..." value="${cfg.apiKey ? escapeAttr(cfg.apiKey) : ''}" style="flex:1;">
              <button class="btn btn-sm" id="ai-toggle-vis">Show</button>
            </div>
            <div class="hint">🔒 Stored only in this browser's local storage. Never sent anywhere except directly to OpenRouter's API when you use the AI Coder.</div>
          </div>
          <div class="field">
            <label class="field-label">Model</label>
            <select id="ai-model">
              ${DEFAULT_MODELS.map(m => `<option value="${m}" ${m === cfg.model ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
            <div class="hint">Any OpenRouter model ID works — this list is a starting point, not exhaustive.</div>
          </div>
          <div class="field">
            <label style="display:flex; gap:8px; align-items:center; font-size:13px;">
              <span class="switch"><input type="checkbox" id="ai-enabled" ${cfg.enabled ? 'checked' : ''}><span class="track"></span></span>
              Enable AI Coder
            </label>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:6px;">
            <button class="btn primary" id="ai-save">Save key</button>
            <button class="btn" id="ai-test">Test connection</button>
            <button class="btn danger" id="ai-remove">Remove key</button>
          </div>
          <div id="ai-test-result" style="margin-top:12px;"></div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header"><span class="panel-title">ℹ️ How BYOK works here</span></div>
        <div class="panel-body" style="font-size:13.5px; color:var(--text-muted); line-height:1.7;">
          <p>Craftbench never ships or stores a shared API key. Every user brings their own <strong>OpenRouter</strong> key, which unlocks pay-as-you-go access to many models from one account.</p>
          <p><strong>1.</strong> Create a key at <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" style="color:var(--brass);">openrouter.ai/keys</a>.</p>
          <p><strong>2.</strong> Paste it here and save — it's written to this browser's <code>localStorage</code> only.</p>
          <p><strong>3.</strong> When you use the AI Coder, your prompt and relevant code are sent directly from your browser to OpenRouter's API to get a completion.</p>
          <p class="hint warn" style="margin-top:12px;">Browser local storage is convenient, not a secure vault. Anyone with access to this browser profile can read a saved key. Don't paste a key on a shared or public computer, and rotate it if you ever suspect it's been exposed.</p>
          <p>Every offline tool in Craftbench (Toolbox, Build Lab, Analyzer) works with no key at all.</p>
        </div>
      </div>
    </div>
  `;

  function escapeAttr(s){ return s.replace(/"/g,'&quot;'); }

  const keyInput = el.querySelector('#ai-key');
  el.querySelector('#ai-toggle-vis').onclick = (e) => {
    const showing = keyInput.type === 'text';
    keyInput.type = showing ? 'password' : 'text';
    e.target.textContent = showing ? 'Show' : 'Hide';
  };

  el.querySelector('#ai-save').onclick = () => {
    const next = getAiConfig();
    next.apiKey = keyInput.value.trim();
    next.model = el.querySelector('#ai-model').value;
    next.enabled = el.querySelector('#ai-enabled').checked;
    store.set('ai-config', next);
    toast('AI settings saved locally');
  };

  el.querySelector('#ai-model').addEventListener('change', () => {
    const next = getAiConfig();
    next.model = el.querySelector('#ai-model').value;
    store.set('ai-config', next);
  });
  el.querySelector('#ai-enabled').addEventListener('change', () => {
    const next = getAiConfig();
    next.enabled = el.querySelector('#ai-enabled').checked;
    store.set('ai-config', next);
  });

  el.querySelector('#ai-remove').onclick = () => {
    store.set('ai-config', { apiKey: '', model: DEFAULT_MODELS[0], enabled: false });
    keyInput.value = '';
    el.querySelector('#ai-enabled').checked = false;
    el.querySelector('#ai-test-result').innerHTML = '';
    toast('API key removed', 'ok');
  };

  el.querySelector('#ai-test').onclick = async () => {
    const key = keyInput.value.trim();
    const result = el.querySelector('#ai-test-result');
    if (!key) { result.innerHTML = `<span class="pill bad">Enter a key first</span>`; return; }
    result.innerHTML = `<span class="pill muted">Testing…</span>`;
    try {
      const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      if (res.ok) {
        result.innerHTML = `<span class="pill ok">Connected — key is valid</span>`;
      } else {
        result.innerHTML = `<span class="pill bad">Connection failed (HTTP ${res.status})</span>`;
      }
    } catch (e) {
      result.innerHTML = `<span class="pill bad">Request failed — check your network or browser CORS settings</span>`;
    }
  };
}
