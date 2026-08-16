const TOOLS = [
  { icon:'📝', key:'readme', title:'README Architect', desc:'Generate a complete README.md from project details.' },
  { icon:'🚫', key:'gitignore', title:'.gitignore Generator', desc:'Combine templates for Node, Python, React, and more.' },
  { icon:'⚖️', key:'license', title:'License Generator', desc:'MIT, Apache 2.0, BSD 3-Clause, or GPL v3.' }
];

export function render(el) {
  el.innerHTML = `
    <div class="grid grid-3">
      ${TOOLS.map(t => `
        <a class="tool-card" href="#/build/${t.key}" style="text-decoration:none; color:inherit;">
          <div class="ti mono">${t.icon}</div>
          <h4>${t.title}</h4>
          <p>${t.desc}</p>
        </a>
      `).join('')}
      <div class="tool-card" style="opacity:0.55; cursor:default;">
        <div class="ti mono">🧩</div>
        <h4>Open-source templates</h4>
        <p>CONTRIBUTING.md, CODE_OF_CONDUCT.md & issue templates — coming in a future update.</p>
      </div>
      <div class="tool-card" style="opacity:0.55; cursor:default;">
        <div class="ti mono">🌐</div>
        <h4>API Playground</h4>
        <p>Test GET/POST/PUT/DELETE requests with generated cURL & fetch snippets — coming in a future update.</p>
      </div>
    </div>
  `;
}
