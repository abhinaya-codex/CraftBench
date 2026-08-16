import { copyText } from '../ui.js';

function minifyCss(s) {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\s+/g, ' ')
    .trim();
}
function minifyHtml(s) {
  return s
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
function minifyJs(s) {
  // Conservative: strips // and /* */ comments and collapses blank lines.
  // Not a full JS parser — for anything with regex literals containing '//', review the output.
  return s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .split('\n').map(l => l.trim()).filter(Boolean).join('\n');
}

export function render(el) {
  el.innerHTML = `
    <div class="panel">
      <div class="panel-body">
        <div class="field" style="max-width:220px;">
          <label class="field-label">Language</label>
          <select id="m-lang">
            <option value="css">CSS</option>
            <option value="html">HTML</option>
            <option value="js">JavaScript (basic)</option>
          </select>
        </div>
        <div class="hint warn" id="m-warn" style="display:none;">JS minification here only strips comments and blank lines — it's not a full parser. For production builds, use a real bundler (esbuild, terser).</div>
        <div class="grid grid-2" style="margin-top:12px;">
          <div>
            <label class="field-label">Input</label>
            <textarea id="m-in" class="code-area" style="min-height:260px;"></textarea>
          </div>
          <div>
            <label class="field-label">Minified</label>
            <textarea id="m-out" class="code-area" style="min-height:260px;" readonly></textarea>
          </div>
        </div>
        <div style="margin-top:10px; display:flex; gap:8px;">
          <button class="btn primary" id="m-run">Minify</button>
          <button class="btn" id="m-copy">Copy output</button>
          <span id="m-stats" class="hint" style="align-self:center;"></span>
        </div>
      </div>
    </div>
  `;

  const lang = el.querySelector('#m-lang');
  const warn = el.querySelector('#m-warn');
  lang.addEventListener('change', () => { warn.style.display = lang.value === 'js' ? 'block' : 'none'; });

  el.querySelector('#m-run').onclick = () => {
    const input = el.querySelector('#m-in').value;
    const fn = { css: minifyCss, html: minifyHtml, js: minifyJs }[lang.value];
    const out = fn(input);
    el.querySelector('#m-out').value = out;
    const before = new Blob([input]).size, after = new Blob([out]).size;
    const pct = before ? Math.round((1 - after / before) * 100) : 0;
    el.querySelector('#m-stats').textContent = `${before} → ${after} bytes (${pct}% smaller)`;
  };
  el.querySelector('#m-copy').onclick = () => copyText(el.querySelector('#m-out').value);
}
