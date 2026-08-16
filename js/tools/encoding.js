import { copyText } from '../ui.js';

const MODES = {
  base64: {
    label: 'Base64',
    encode: s => btoa(unescape(encodeURIComponent(s))),
    decode: s => decodeURIComponent(escape(atob(s)))
  },
  url: {
    label: 'URL',
    encode: s => encodeURIComponent(s),
    decode: s => decodeURIComponent(s)
  },
  unicode: {
    label: 'Unicode escape',
    encode: s => [...s].map(c => {
      const cp = c.codePointAt(0);
      return cp > 127 ? '\\u' + cp.toString(16).padStart(4, '0') : c;
    }).join(''),
    decode: s => s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  },
  html: {
    label: 'HTML entities',
    encode: s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    decode: s => s.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, e => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" }[e]))
  }
};

export function render(el) {
  el.innerHTML = `
    <div class="panel">
      <div class="panel-body">
        <div class="field-row" style="margin-bottom:16px; align-items:flex-end;">
          <div class="field" style="margin:0;">
            <label class="field-label">Encoding</label>
            <select id="e-mode">
              ${Object.entries(MODES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
            </select>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn" id="e-encode">Encode →</button>
            <button class="btn" id="e-decode">← Decode</button>
          </div>
        </div>
        <div class="grid grid-2">
          <div>
            <label class="field-label">Plain text</label>
            <textarea id="e-plain" class="code-area" placeholder="Type or paste text..."></textarea>
          </div>
          <div>
            <label class="field-label">Encoded</label>
            <textarea id="e-encoded" class="code-area" placeholder="Encoded value..."></textarea>
          </div>
        </div>
        <div id="e-error" class="hint warn" style="margin-top:8px;"></div>
        <div class="copy-row" style="margin-top:10px;">
          <button class="btn btn-sm" id="e-copy-plain">Copy plain</button>
          <button class="btn btn-sm" id="e-copy-encoded">Copy encoded</button>
        </div>
      </div>
    </div>
  `;

  const mode = el.querySelector('#e-mode');
  const plain = el.querySelector('#e-plain');
  const encoded = el.querySelector('#e-encoded');
  const err = el.querySelector('#e-error');

  el.querySelector('#e-encode').onclick = () => {
    err.textContent = '';
    try { encoded.value = MODES[mode.value].encode(plain.value); }
    catch (e) { err.textContent = 'Encode error: ' + e.message; }
  };
  el.querySelector('#e-decode').onclick = () => {
    err.textContent = '';
    try { plain.value = MODES[mode.value].decode(encoded.value); }
    catch (e) { err.textContent = 'Decode error: ' + e.message; }
  };
  el.querySelector('#e-copy-plain').onclick = () => copyText(plain.value);
  el.querySelector('#e-copy-encoded').onclick = () => copyText(encoded.value);
}
