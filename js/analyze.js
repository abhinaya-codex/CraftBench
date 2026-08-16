const EXT_LANG = {
  js:'JavaScript', jsx:'JSX', ts:'TypeScript', tsx:'TSX', py:'Python', java:'Java',
  c:'C', h:'C header', cpp:'C++', cs:'C#', go:'Go', rs:'Rust', rb:'Ruby', php:'PHP',
  swift:'Swift', kt:'Kotlin', html:'HTML', css:'CSS', scss:'SCSS', json:'JSON',
  yml:'YAML', yaml:'YAML', md:'Markdown', sql:'SQL', sh:'Shell', ps1:'PowerShell',
  toml:'TOML', xml:'XML', lua:'Lua', pl:'Perl', dart:'Dart'
};
const DEP_FILES = {
  'package.json': { cat: 'Node.js', parse: parsePackageJson },
  'requirements.txt': { cat: 'Python', parse: parseRequirementsTxt },
  'pyproject.toml': { cat: 'Python', parse: parsePyprojectToml }
};

function parsePackageJson(text) {
  try {
    const j = JSON.parse(text);
    const deps = [];
    for (const [k, v] of Object.entries(j.dependencies || {})) deps.push({ name: k, version: v, category: 'dependency' });
    for (const [k, v] of Object.entries(j.devDependencies || {})) deps.push({ name: k, version: v, category: 'devDependency' });
    return deps;
  } catch { return []; }
}
function parseRequirementsTxt(text) {
  return text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).map(l => {
    const m = l.match(/^([A-Za-z0-9_.\-\[\]]+)\s*([=<>!~]{1,2}=?\s*[\w.\*]+)?/);
    return { name: m ? m[1] : l, version: m && m[2] ? m[2].replace(/\s+/g,'') : '—', category: 'dependency' };
  });
}
function parsePyprojectToml(text) {
  const deps = [];
  const m = text.match(/\[tool\.poetry\.dependencies\]([\s\S]*?)(\n\[|$)/);
  if (m) {
    m[1].split('\n').forEach(l => {
      const mm = l.match(/^([\w\-\.]+)\s*=\s*"?([^"\n]*)"?/);
      if (mm && mm[1] !== 'python') deps.push({ name: mm[1], version: mm[2] || '—', category: 'dependency' });
    });
  }
  return deps;
}

export function render(el) {
  el.innerHTML = `
    <div class="panel">
      <div class="panel-body">
        <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
          <input type="file" id="an-file" accept=".zip">
          <span class="hint" style="margin:0;">Upload a project as a .zip — everything is analyzed locally in your browser. Nothing is uploaded anywhere.</span>
        </div>
      </div>
    </div>
    <div id="an-results" style="margin-top:18px;"></div>
  `;

  const results = el.querySelector('#an-results');

  el.querySelector('#an-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!window.JSZip) { results.innerHTML = `<div class="panel panel-pad">ZIP library failed to load — check your connection and reload.</div>`; return; }
    results.innerHTML = `<div class="panel panel-pad">Analyzing…</div>`;
    try {
      const zip = await JSZip.loadAsync(file);
      await analyze(zip);
    } catch (err) {
      results.innerHTML = `<div class="panel panel-pad" style="color:var(--danger);">Couldn't read that ZIP: ${err.message}</div>`;
    }
  });

  async function analyze(zip) {
    const entries = Object.values(zip.files).filter(f => !f.dir);
    let totalLines = 0, blankLines = 0, commentLines = 0;
    const langCount = {};
    const fileSizes = [];
    let hasReadme = false, hasLicense = false, hasGitignore = false, hasTests = false, hasCI = false;
    const depFiles = {};

    for (const entry of entries) {
      const path = entry.name;
      const base = path.split('/').pop();
      const lower = base.toLowerCase();
      if (/^readme(\.|$)/.test(lower)) hasReadme = true;
      if (/^license(\.|$)/.test(lower) || /^licence(\.|$)/.test(lower)) hasLicense = true;
      if (lower === '.gitignore') hasGitignore = true;
      if (/test|spec/i.test(path)) hasTests = true;
      if (path.includes('.github/workflows/')) hasCI = true;
      if (DEP_FILES[base]) {
        const text = await entry.async('string');
        depFiles[base] = DEP_FILES[base].parse(text);
      }

      const ext = base.includes('.') ? base.split('.').pop().toLowerCase() : '';
      const lang = EXT_LANG[ext];
      if (lang && entry._data && entry._data.uncompressedSize < 3_000_000) {
        const text = await entry.async('string').catch(() => '');
        const lines = text.split('\n');
        totalLines += lines.length;
        lines.forEach(l => {
          const t = l.trim();
          if (!t) blankLines++;
          else if (t.startsWith('//') || t.startsWith('#') || t.startsWith('*') || t.startsWith('/*')) commentLines++;
        });
        langCount[lang] = (langCount[lang] || 0) + lines.length;
        fileSizes.push({ path, lines: lines.length });
      }
    }

    const totalFiles = entries.length;
    fileSizes.sort((a, b) => b.lines - a.lines);
    const topLangs = Object.entries(langCount).sort((a,b) => b[1]-a[1]);
    const langTotal = topLangs.reduce((s,[,v])=>s+v,0) || 1;

    // Heuristic health score
    const docScore = (hasReadme ? 70 : 0) + (hasLicense ? 30 : 0);
    const structScore = Math.min(100, 40 + (entries.some(e=>e.name.includes('/')) ? 30 : 0) + (hasGitignore ? 30 : 0));
    const testScore = hasTests ? 85 : 15;
    const gitScore = (hasGitignore ? 40 : 0) + (hasLicense ? 30 : 0) + (hasCI ? 30 : 0);
    const overall = Math.round((docScore + structScore + testScore + gitScore) / 4);

    results.innerHTML = `
      <div class="grid grid-4" style="margin-bottom:18px;">
        <div class="stat-card"><div class="stat-num">${totalFiles}</div><div class="stat-label">Total files</div></div>
        <div class="stat-card"><div class="stat-num">${totalLines.toLocaleString()}</div><div class="stat-label">Lines of code</div></div>
        <div class="stat-card"><div class="stat-num">${commentLines.toLocaleString()}</div><div class="stat-label">Comment lines</div></div>
        <div class="stat-card"><div class="stat-num">${blankLines.toLocaleString()}</div><div class="stat-label">Blank lines</div></div>
      </div>

      <div class="grid grid-2" style="align-items:start;">
        <div class="panel">
          <div class="panel-header"><span class="panel-title">🩺 Project Health Score</span></div>
          <div class="panel-body">
            ${healthRow('Documentation', docScore)}
            ${healthRow('Structure', structScore)}
            ${healthRow('Testing', testScore)}
            ${healthRow('Git Readiness', gitScore)}
            <div class="section-divider"></div>
            <div style="display:flex; align-items:baseline; gap:10px;">
              <span class="stat-num" style="font-size:32px;">${overall}</span><span class="text-muted" style="color:var(--text-muted);">/ 100 overall</span>
            </div>
            <div class="hint" style="margin-top:8px;">This score is a heuristic based on presence of common project-health signals — it's a prompt for what to improve, not a certification.</div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header"><span class="panel-title">✅ Readiness checklist</span></div>
          <div class="panel-body">
            ${checkRow('README.md', hasReadme)}
            ${checkRow('LICENSE', hasLicense)}
            ${checkRow('.gitignore', hasGitignore)}
            ${checkRow('Tests', hasTests)}
            ${checkRow('CI workflow (.github/workflows)', hasCI)}
          </div>
        </div>
      </div>

      <div class="grid grid-2" style="align-items:start; margin-top:16px;">
        <div class="panel">
          <div class="panel-header"><span class="panel-title">🗂️ Language distribution</span></div>
          <div class="panel-body">
            ${topLangs.length ? topLangs.map(([lang,count]) => `
              <div style="margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:4px;">
                  <span>${lang}</span><span style="color:var(--text-muted);">${Math.round(count/langTotal*100)}%</span>
                </div>
                <div style="height:6px; background:var(--bg-elevated); border-radius:4px; overflow:hidden;">
                  <div style="height:100%; width:${Math.round(count/langTotal*100)}%; background:var(--brass);"></div>
                </div>
              </div>
            `).join('') : '<p class="hint">No recognized source files found.</p>'}
          </div>
        </div>

        <div class="panel">
          <div class="panel-header"><span class="panel-title">📊 Largest files</span></div>
          <div class="panel-body">
            <table class="data-table">
              <thead><tr><th>File</th><th>Lines</th></tr></thead>
              <tbody>
                ${fileSizes.slice(0,8).map(f => `<tr><td>${f.path}</td><td>${f.lines}</td></tr>`).join('') || '<tr><td colspan="2">—</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      ${Object.keys(depFiles).length ? `
      <div class="panel" style="margin-top:16px;">
        <div class="panel-header"><span class="panel-title">📦 Dependencies</span></div>
        <div class="panel-body">
          ${Object.entries(depFiles).map(([file, deps]) => `
            <h4 style="font-size:13px; margin-bottom:8px;">${file}</h4>
            <table class="data-table" style="margin-bottom:16px;">
              <thead><tr><th>Dependency</th><th>Version</th><th>Category</th></tr></thead>
              <tbody>
                ${deps.length ? deps.map(d => `<tr><td>${d.name}</td><td>${d.version}</td><td>${d.category}</td></tr>`).join('') : '<tr><td colspan="3">No dependencies found</td></tr>'}
              </tbody>
            </table>
          `).join('')}
        </div>
      </div>` : ''}
    `;
  }

  function healthRow(label, score) {
    const color = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';
    return `
      <div style="margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
          <span>${label}</span><span style="color:${color}; font-weight:700;">${score}%</span>
        </div>
        <div style="height:6px; background:var(--bg-elevated); border-radius:4px; overflow:hidden;">
          <div style="height:100%; width:${score}%; background:${color};"></div>
        </div>
      </div>`;
  }
  function checkRow(label, ok) {
    return `<div class="checklist-row"><span>${label}</span><span class="pill ${ok?'ok':'bad'}">${ok?'✅ Found':'❌ Missing'}</span></div>`;
  }
}
