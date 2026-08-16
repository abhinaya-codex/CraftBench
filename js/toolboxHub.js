const TOOLS = [
  { icon:'{ }', key:'json', title:'JSON Toolkit', desc:'Format, validate, minify, and view JSON as a tree.' },
  { icon:'.*', key:'regex', title:'Regex Tester', desc:'Live match highlighting, capture groups, common patterns.' },
  { icon:'🔑', key:'jwt', title:'JWT Decoder', desc:'Decode header & payload. Does not verify signatures.' },
  { icon:'⇄', key:'encoding', title:'Encoding', desc:'Base64, URL, Unicode escapes, HTML entities.' },
  { icon:'#', key:'uuid', title:'UUID Generator', desc:'Bulk-generate UUID v4 or time-ordered v7.' },
  { icon:'0x', key:'hash', title:'Hash Generator', desc:'SHA-256, SHA-384, SHA-512 via Web Crypto.' },
  { icon:'🕐', key:'time', title:'Time Converter', desc:'Unix timestamps ↔ human-readable dates.' },
  { icon:'🎨', key:'color', title:'Color Converter', desc:'HEX, RGB, HSL, and CSS variable output.' },
  { icon:'±', key:'diff', title:'Diff Viewer', desc:'Line-level text & code comparison.' },
  { icon:'⇣', key:'minify', title:'Minifier', desc:'HTML, CSS, and basic JavaScript minification.' }
];

export function render(el) {
  el.innerHTML = `
    <div class="grid grid-3">
      ${TOOLS.map(t => `
        <a class="tool-card" href="#/toolbox/${t.key}" style="text-decoration:none; color:inherit;">
          <div class="ti mono">${t.icon}</div>
          <h4>${t.title}</h4>
          <p>${t.desc}</p>
        </a>
      `).join('')}
    </div>
  `;
}
