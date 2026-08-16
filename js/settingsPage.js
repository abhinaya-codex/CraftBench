import { store } from './storage.js';
import { toast } from './ui.js';
import { applyTheme } from './theme.js';

export function render(el) {
  const theme = store.get('theme', 'dark');
  el.innerHTML = `
    <div class="grid grid-2" style="align-items:start;">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">🎨 Appearance</span></div>
        <div class="panel-body">
          <div class="field">
            <label class="field-label">Theme</label>
            <select id="s-theme">
              <option value="dark" ${theme==='dark'?'selected':''}>Dark (default)</option>
              <option value="light" ${theme==='light'?'selected':''}>Light</option>
            </select>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header"><span class="panel-title">💾 Local data</span></div>
        <div class="panel-body">
          <p style="font-size:13px; color:var(--text-muted); margin-top:0;">Settings, saved snippets, and progress live only in this browser's local storage. Export a backup or move it to another browser.</p>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn" id="s-export">Export data</button>
            <label class="btn" style="cursor:pointer;">Import data<input type="file" id="s-import" accept="application/json" style="display:none;"></label>
            <button class="btn danger" id="s-clear">Clear all local data</button>
          </div>
        </div>
      </div>
    </div>

    <div class="panel" style="margin-top:16px;">
      <div class="panel-header"><span class="panel-title">🔒 Privacy</span></div>
      <div class="panel-body" style="font-size:13.5px; color:var(--text-muted); line-height:1.7;">
        <p><strong>Craftbench is local-first.</strong> Every tool in the Toolbox, Build Lab, and Project Analyzer processes your code and files entirely inside this browser tab — nothing is uploaded to a server.</p>
        <p>The one exception is the <strong>AI Coder</strong>: when you use it, your prompt and any code you include are sent directly from your browser to OpenRouter's API, using the API key you provided in AI Settings. Craftbench itself never sees or stores that traffic.</p>
      </div>
    </div>
  `;

  el.querySelector('#s-theme').addEventListener('change', e => {
    store.set('theme', e.target.value);
    applyTheme(e.target.value);
  });

  el.querySelector('#s-export').onclick = () => {
    const blob = new Blob([JSON.stringify(store.exportAll(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'craftbench-data.json';
    a.click();
  };

  el.querySelector('#s-import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      store.importAll(JSON.parse(text));
      toast('Data imported — reloading…');
      setTimeout(() => location.reload(), 800);
    } catch {
      toast('Could not read that file', 'err');
    }
  });

  el.querySelector('#s-clear').onclick = () => {
    if (!confirm('This clears all Craftbench data saved in this browser (settings, keys, progress). This cannot be undone. Continue?')) return;
    store.clearAll();
    toast('Local data cleared — reloading…');
    setTimeout(() => location.reload(), 800);
  };
}
