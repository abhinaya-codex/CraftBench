import { copyText } from '../ui.js';

const TEMPLATES = {
  Node: `node_modules/\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\ndist/\nbuild/\n.env\n.env.local\ncoverage/\n.DS_Store`,
  Python: `__pycache__/\n*.py[cod]\n*.egg-info/\n.eggs/\n.venv/\nvenv/\nenv/\n.env\n.pytest_cache/\n.mypy_cache/\ndist/\nbuild/\n*.log`,
  React: `node_modules/\nbuild/\ndist/\n.env\n.env.local\nnpm-debug.log*\ncoverage/\n.DS_Store`,
  'Next.js': `node_modules/\n.next/\nout/\nbuild/\n.env*.local\nnpm-debug.log*\n.vercel\n.DS_Store`,
  'C++': `*.o\n*.obj\n*.exe\n*.out\n*.a\n*.lib\n*.so\n*.dll\nbuild/\ncmake-build-*/\n.vs/\n.vscode/`,
  Java: `*.class\n*.jar\n*.war\ntarget/\nbuild/\n.gradle/\n.idea/\n*.iml\nout/`,
  Android: `*.apk\n*.ap_\n*.dex\nbuild/\n.gradle/\nlocal.properties\n.idea/\n*.iml\ncaptures/`,
  Flutter: `.dart_tool/\n.flutter-plugins\n.flutter-plugins-dependencies\nbuild/\n.packages\n.pub-cache/\n.pub/\n*.iml\n.idea/`,
  Go: `*.exe\n*.test\n*.out\nvendor/\n.env\nbin/`,
  Rust: `target/\nCargo.lock\n**/*.rs.bk\n.env`
};

export function render(el) {
  el.innerHTML = `
    <div class="grid grid-2" style="align-items:start;">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">📦 Select stacks</span></div>
        <div class="panel-body">
          <div id="gi-checks" style="display:flex; flex-direction:column; gap:10px;">
            ${Object.keys(TEMPLATES).map(k => `
              <label style="display:flex; align-items:center; gap:10px; font-size:13.5px;">
                <span class="switch"><input type="checkbox" data-stack="${k}"><span class="track"></span></span>
                ${k}
              </label>
            `).join('')}
          </div>
          <div class="section-divider"></div>
          <label class="field-label">Extra entries (one per line)</label>
          <textarea id="gi-extra" style="min-height:80px;" placeholder=".idea/&#10;*.tmp"></textarea>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">📄 .gitignore preview</span>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-sm" id="gi-copy">Copy</button>
            <button class="btn btn-sm" id="gi-download">Download</button>
          </div>
        </div>
        <div class="panel-body">
          <pre class="output-block" id="gi-output" style="min-height:400px;">Select a stack to generate a .gitignore.</pre>
        </div>
      </div>
    </div>
  `;

  const checks = el.querySelectorAll('#gi-checks input');
  const extra = el.querySelector('#gi-extra');
  const output = el.querySelector('#gi-output');

  function generate() {
    const selected = [...checks].filter(c => c.checked).map(c => c.dataset.stack);
    if (!selected.length && !extra.value.trim()) {
      output.textContent = 'Select a stack to generate a .gitignore.';
      return;
    }
    let out = '';
    selected.forEach(s => {
      out += `# ---- ${s} ----\n${TEMPLATES[s]}\n\n`;
    });
    if (extra.value.trim()) {
      out += `# ---- Custom ----\n${extra.value.trim()}\n`;
    }
    output.textContent = out.trim();
  }

  checks.forEach(c => c.addEventListener('change', generate));
  extra.addEventListener('input', generate);
  el.querySelector('#gi-copy').onclick = () => copyText(output.textContent);
  el.querySelector('#gi-download').onclick = () => {
    const blob = new Blob([output.textContent], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '.gitignore';
    a.click();
  };
}
