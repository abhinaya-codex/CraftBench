import { escapeHtml } from '../ui.js';

export function render(el) {
  el.innerHTML = `
    <div class="grid grid-2">
      <div>
        <label class="field-label">Original</label>
        <textarea id="d-a" class="code-area" style="min-height:260px;" placeholder="Paste original text..."></textarea>
      </div>
      <div>
        <label class="field-label">Changed</label>
        <textarea id="d-b" class="code-area" style="min-height:260px;" placeholder="Paste changed text..."></textarea>
      </div>
    </div>
    <div style="margin:14px 0;"><button class="btn primary" id="d-run">Compare</button> <span id="d-stats" class="hint" style="display:inline;"></span></div>
    <div class="panel">
      <div class="panel-body">
        <pre class="output-block" id="d-output" style="min-height:200px;">Paste text on both sides and click Compare.</pre>
      </div>
    </div>
  `;

  function diffLines(a, b) {
    const al = a.split('\n'), bl = b.split('\n');
    const n = al.length, m = bl.length;
    const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
    for (let i = n - 1; i >= 0; i--)
      for (let j = m - 1; j >= 0; j--)
        dp[i][j] = al[i] === bl[j] ? dp[i+1][j+1] + 1 : Math.max(dp[i+1][j], dp[i][j+1]);
    const out = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (al[i] === bl[j]) { out.push({ t: 'same', line: al[i] }); i++; j++; }
      else if (dp[i+1][j] >= dp[i][j+1]) { out.push({ t: 'del', line: al[i] }); i++; }
      else { out.push({ t: 'add', line: bl[j] }); j++; }
    }
    while (i < n) { out.push({ t: 'del', line: al[i] }); i++; }
    while (j < m) { out.push({ t: 'add', line: bl[j] }); j++; }
    return out;
  }

  el.querySelector('#d-run').onclick = () => {
    const a = el.querySelector('#d-a').value;
    const b = el.querySelector('#d-b').value;
    const result = diffLines(a, b);
    const added = result.filter(r => r.t === 'add').length;
    const removed = result.filter(r => r.t === 'del').length;
    el.querySelector('#d-stats').textContent = `+${added} added   -${removed} removed`;
    el.querySelector('#d-output').innerHTML = result.map(r => {
      const cls = r.t === 'add' ? 'diff-add' : r.t === 'del' ? 'diff-del' : '';
      const prefix = r.t === 'add' ? '+ ' : r.t === 'del' ? '- ' : '  ';
      return `<div class="${cls}">${escapeHtml(prefix + r.line)}</div>`;
    }).join('') || '—';
  };
}
