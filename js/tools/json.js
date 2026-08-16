import { toast } from '../ui.js';

export function render(el) {
  el.innerHTML = `
    <div class="grid grid-2" style="align-items:start;">
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">📥 Input</span>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-sm" id="j-format">Format</button>
            <button class="btn btn-sm" id="j-minify">Minify</button>
            <button class="btn btn-sm" id="j-clear">Clear</button>
          </div>
        </div>
        <div class="panel-body">
          <textarea id="j-input" class="code-area" style="min-height:360px;" placeholder='{"paste":"your JSON here"}'></textarea>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">📤 Output</span>
          <span id="j-status" class="pill muted">Waiting</span>
        </div>
        <div class="panel-body">
          <div class="copy-row"><button class="btn btn-sm" id="j-copy">Copy</button></div>
          <pre class="output-block" id="j-output" style="min-height:340px;">Paste JSON on the left to format, validate, and explore it.</pre>
        </div>
      </div>
    </div>
    <div class="panel" style="margin-top:16px;">
      <div class="panel-header"><span class="panel-title">🌳 Tree view</span></div>
      <div class="panel-body">
        <div id="j-tree" class="output-block" style="min-height:120px;">—</div>
      </div>
    </div>
  `;

  const input = el.querySelector('#j-input');
  const output = el.querySelector('#j-output');
  const status = el.querySelector('#j-status');
  const tree = el.querySelector('#j-tree');

  function parse() {
    const raw = input.value.trim();
    if (!raw) {
      status.textContent = 'Waiting'; status.className = 'pill muted';
      output.textContent = 'Paste JSON on the left to format, validate, and explore it.';
      tree.textContent = '—';
      return null;
    }
    try {
      const data = JSON.parse(raw);
      status.textContent = 'Valid'; status.className = 'pill ok';
      return data;
    } catch (e) {
      status.textContent = 'Invalid'; status.className = 'pill bad';
      output.innerHTML = '';
      output.classList.add('error');
      output.textContent = `Parse error: ${e.message}`;
      tree.textContent = '—';
      return undefined; // undefined = error already shown
    }
  }

  function buildTree(val, depth = 0) {
    const pad = '  '.repeat(depth);
    if (val === null) return 'null';
    if (Array.isArray(val)) {
      if (!val.length) return '[]';
      return '[\n' + val.map(v => pad + '  ' + buildTree(v, depth + 1)).join(',\n') + '\n' + pad + ']';
    }
    if (typeof val === 'object') {
      const keys = Object.keys(val);
      if (!keys.length) return '{}';
      return '{\n' + keys.map(k => `${pad}  "${k}": ${buildTree(val[k], depth + 1)}`).join(',\n') + '\n' + pad + '}';
    }
    if (typeof val === 'string') return `"${val}"`;
    return String(val);
  }

  el.querySelector('#j-format').onclick = () => {
    const data = parse();
    if (data === undefined) return;
    if (data === null && !input.value.trim()) return;
    output.classList.remove('error');
    output.textContent = JSON.stringify(data, null, 2);
    tree.textContent = buildTree(data);
  };

  el.querySelector('#j-minify').onclick = () => {
    const data = parse();
    if (data === undefined) return;
    output.classList.remove('error');
    output.textContent = JSON.stringify(data);
  };

  el.querySelector('#j-clear').onclick = () => {
    input.value = '';
    parse();
  };

  el.querySelector('#j-copy').onclick = async () => {
    await navigator.clipboard.writeText(output.textContent);
    toast('Copied to clipboard');
  };

  input.addEventListener('input', () => parse());
}
