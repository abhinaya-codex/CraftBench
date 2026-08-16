import { copyText } from '../ui.js';

export function render(el) {
  el.innerHTML = `
    <div class="grid grid-2" style="align-items:start;">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">📝 Project details</span></div>
        <div class="panel-body">
          <div class="field"><label class="field-label">Project name</label><input type="text" id="rm-name" placeholder="My Project"></div>
          <div class="field"><label class="field-label">Tagline</label><input type="text" id="rm-tag" placeholder="A short one-line description"></div>
          <div class="field"><label class="field-label">Description</label><textarea id="rm-desc" style="min-height:80px;" placeholder="What does this project do and why does it exist?"></textarea></div>
          <div class="field"><label class="field-label">Tech stack (comma separated)</label><input type="text" id="rm-stack" placeholder="React, Node.js, PostgreSQL"></div>
          <div class="field"><label class="field-label">Features (one per line)</label><textarea id="rm-features" style="min-height:80px;" placeholder="User authentication&#10;Dashboard&#10;Dark mode"></textarea></div>
          <div class="field"><label class="field-label">Install command</label><input type="text" id="rm-install" placeholder="npm install"></div>
          <div class="field"><label class="field-label">Run command</label><input type="text" id="rm-run" placeholder="npm run dev"></div>
          <div class="field"><label class="field-label">License</label>
            <select id="rm-license"><option>MIT</option><option>Apache 2.0</option><option>GPL v3</option><option>BSD 3-Clause</option><option>None / Proprietary</option></select>
          </div>
          <div class="field">
            <label style="display:flex; gap:8px; align-items:center; font-size:13px;">
              <span class="switch"><input type="checkbox" id="rm-screenshots"><span class="track"></span></span>
              Include screenshots section
            </label>
          </div>
          <div class="field">
            <label style="display:flex; gap:8px; align-items:center; font-size:13px;">
              <span class="switch"><input type="checkbox" id="rm-contrib" checked><span class="track"></span></span>
              Include contribution section
            </label>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">📄 README.md preview</span>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-sm" id="rm-copy">Copy</button>
            <button class="btn btn-sm" id="rm-download">Download</button>
          </div>
        </div>
        <div class="panel-body">
          <pre class="output-block" id="rm-output" style="min-height:520px;"></pre>
        </div>
      </div>
    </div>
  `;

  const ids = ['rm-name','rm-tag','rm-desc','rm-stack','rm-features','rm-install','rm-run','rm-license'];
  const fields = Object.fromEntries(ids.map(id => [id, el.querySelector('#' + id)]));
  const screenshots = el.querySelector('#rm-screenshots');
  const contrib = el.querySelector('#rm-contrib');
  const output = el.querySelector('#rm-output');

  function generate() {
    const name = fields['rm-name'].value || 'Project Name';
    const tag = fields['rm-tag'].value;
    const desc = fields['rm-desc'].value || 'Describe what this project does.';
    const stack = fields['rm-stack'].value.split(',').map(s => s.trim()).filter(Boolean);
    const features = fields['rm-features'].value.split('\n').map(s => s.trim()).filter(Boolean);
    const install = fields['rm-install'].value || 'npm install';
    const run = fields['rm-run'].value || 'npm run dev';
    const license = fields['rm-license'].value;

    let md = `# ${name}\n\n`;
    if (tag) md += `> ${tag}\n\n`;
    md += `${desc}\n\n`;

    if (screenshots.querySelector('input').checked) {
      md += `## Screenshots\n\n_Add screenshots or a demo GIF here._\n\n`;
    }

    if (features.length) {
      md += `## Features\n\n${features.map(f => `- ${f}`).join('\n')}\n\n`;
    }

    if (stack.length) {
      md += `## Tech stack\n\n${stack.map(s => `- ${s}`).join('\n')}\n\n`;
    }

    md += `## Installation\n\n\`\`\`bash\n${install}\n\`\`\`\n\n`;
    md += `## Usage\n\n\`\`\`bash\n${run}\n\`\`\`\n\n`;

    if (contrib.checked) {
      md += `## Contributing\n\nContributions are welcome. Please open an issue to discuss what you'd like to change before submitting a pull request.\n\n1. Fork the repository\n2. Create a feature branch\n3. Commit your changes\n4. Open a pull request\n\n`;
    }

    if (license !== 'None / Proprietary') {
      md += `## License\n\nThis project is licensed under the ${license} License. See [LICENSE](./LICENSE) for details.\n`;
    }

    output.textContent = md;
  }

  Object.values(fields).forEach(f => f.addEventListener('input', generate));
  [screenshots, contrib].forEach(f => f.addEventListener('change', generate));

  el.querySelector('#rm-copy').onclick = () => copyText(output.textContent);
  el.querySelector('#rm-download').onclick = () => {
    const blob = new Blob([output.textContent], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'README.md';
    a.click();
  };

  generate();
}
