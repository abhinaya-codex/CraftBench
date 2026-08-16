import { escapeHtml } from '../ui.js';

const COMMON = {
  'Email': '[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}',
  'URL': 'https?:\\/\\/[^\\s]+',
  'IPv4': '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
  'Hex color': '#(?:[0-9a-fA-F]{3}){1,2}\\b',
  'Date (YYYY-MM-DD)': '\\d{4}-\\d{2}-\\d{2}'
};

export function render(el) {
  el.innerHTML = `
    <div class="panel">
      <div class="panel-body">
        <div class="field-row" style="align-items:flex-end;">
          <div class="field" style="margin:0; flex:2;">
            <label class="field-label">Pattern</label>
            <input type="text" id="r-pattern" placeholder="\\b[A-Z][a-z]+\\b">
          </div>
          <div class="field" style="margin:0; max-width:140px;">
            <label class="field-label">Flags</label>
            <input type="text" id="r-flags" value="g">
          </div>
          <div class="field" style="margin:0;">
            <label class="field-label">Common patterns</label>
            <select id="r-common">
              <option value="">— pick one —</option>
              ${Object.keys(COMMON).map(k => `<option value="${k}">${k}</option>`).join('')}
            </select>
          </div>
        </div>
        <div id="r-error" class="hint warn"></div>
        <div class="section-divider"></div>
        <label class="field-label">Test string</label>
        <textarea id="r-text" class="code-area" style="min-height:160px;" placeholder="Paste text to test against..."></textarea>
        <div class="section-divider"></div>
        <div class="panel-title" style="margin-bottom:8px;">Matches (<span id="r-count">0</span>)</div>
        <div id="r-highlighted" class="output-block" style="min-height:100px;">—</div>
        <div style="margin-top:12px;">
          <div class="panel-title" style="margin-bottom:6px;">Capture groups</div>
          <div id="r-groups" class="output-block" style="min-height:60px;">—</div>
        </div>
      </div>
    </div>
  `;

  const pattern = el.querySelector('#r-pattern');
  const flags = el.querySelector('#r-flags');
  const text = el.querySelector('#r-text');
  const err = el.querySelector('#r-error');
  const hl = el.querySelector('#r-highlighted');
  const count = el.querySelector('#r-count');
  const groups = el.querySelector('#r-groups');

  function run() {
    err.textContent = '';
    const p = pattern.value;
    const src = text.value;
    if (!p) { hl.textContent = '—'; count.textContent = '0'; groups.textContent = '—'; return; }
    let f = flags.value.includes('g') ? flags.value : flags.value + 'g';
    let re;
    try { re = new RegExp(p, f); }
    catch (e) { err.textContent = 'Invalid regex: ' + e.message; hl.textContent = '—'; count.textContent = '0'; groups.textContent = '—'; return; }

    let m, last = 0, html = '', n = 0, groupLines = [];
    while ((m = re.exec(src)) !== null) {
      html += escapeHtml(src.slice(last, m.index));
      html += `<mark style="background:var(--brass-soft); color:var(--brass-strong); border-radius:3px; padding:0 2px;">${escapeHtml(m[0])}</mark>`;
      last = m.index + m[0].length;
      n++;
      if (m.length > 1) groupLines.push(`Match ${n}: ` + m.slice(1).map((g, i) => `[${i+1}] ${g ?? '∅'}`).join('  '));
      if (m.index === re.lastIndex) re.lastIndex++;
      if (n > 2000) break;
    }
    html += escapeHtml(src.slice(last));
    hl.innerHTML = html || '—';
    count.textContent = String(n);
    groups.textContent = groupLines.length ? groupLines.join('\n') : 'No capture groups matched.';
  }

  [pattern, flags, text].forEach(node => node.addEventListener('input', run));
  el.querySelector('#r-common').addEventListener('change', e => {
    if (e.target.value) { pattern.value = COMMON[e.target.value]; run(); }
  });
}
