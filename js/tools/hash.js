import { copyText } from '../ui.js';

export function render(el) {
  el.innerHTML = `
    <div class="panel">
      <div class="panel-body">
        <label class="field-label">Input text</label>
        <textarea id="h-input" class="code-area" style="min-height:140px;" placeholder="Type or paste text to hash..."></textarea>
        <div class="hint">Hashing runs entirely in your browser via the Web Crypto API. Nothing is uploaded.</div>
        <div class="section-divider"></div>
        <div id="h-results"></div>
      </div>
    </div>
  `;

  const algos = ['SHA-256', 'SHA-384', 'SHA-512'];
  const results = el.querySelector('#h-results');
  results.innerHTML = algos.map(a => `
    <div class="field">
      <label class="field-label">${a}</label>
      <div style="display:flex; gap:8px;">
        <input type="text" readonly id="h-${a}" style="flex:1;" placeholder="—">
        <button class="btn btn-sm" data-copy="${a}">Copy</button>
      </div>
    </div>
  `).join('');

  async function hashAll(text) {
    const enc = new TextEncoder().encode(text);
    for (const a of algos) {
      const field = el.querySelector(`#h-${a}`);
      if (!text) { field.value = ''; continue; }
      const buf = await crypto.subtle.digest(a, enc);
      field.value = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    }
  }

  el.querySelector('#h-input').addEventListener('input', e => hashAll(e.target.value));
  el.addEventListener('click', e => {
    const a = e.target.dataset.copy;
    if (a) copyText(el.querySelector(`#h-${a}`).value);
  });
}
