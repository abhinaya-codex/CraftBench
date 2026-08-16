import { copyText } from '../ui.js';

export function render(el) {
  el.innerHTML = `
    <div class="panel">
      <div class="panel-body">
        <div class="field-row" style="align-items:flex-end; margin-bottom:16px;">
          <div class="field" style="margin:0; max-width:160px;">
            <label class="field-label">Count</label>
            <input type="number" id="u-count" value="1" min="1" max="500">
          </div>
          <div class="field" style="margin:0; max-width:200px;">
            <label class="field-label">Version</label>
            <select id="u-version">
              <option value="4">UUID v4 (random)</option>
              <option value="7">UUID v7 (time-ordered)</option>
            </select>
          </div>
          <div class="field" style="margin:0;">
            <label class="field-label">&nbsp;</label>
            <label style="display:flex; gap:8px; align-items:center; font-size:13px; color:var(--text-muted);">
              <span class="switch"><input type="checkbox" id="u-upper"><span class="track"></span></span>
              Uppercase
            </label>
          </div>
          <button class="btn primary" id="u-gen">Generate</button>
        </div>
        <div class="copy-row"><button class="btn btn-sm" id="u-copy">Copy all</button></div>
        <pre class="output-block" id="u-output" style="min-height:220px;">Click Generate to create UUIDs.</pre>
      </div>
    </div>
  `;

  function uuidv4() {
    return crypto.randomUUID();
  }
  function uuidv7() {
    const ts = BigInt(Date.now());
    const rand = crypto.getRandomValues(new Uint8Array(10));
    const bytes = new Uint8Array(16);
    bytes[0] = Number((ts >> 40n) & 0xffn);
    bytes[1] = Number((ts >> 32n) & 0xffn);
    bytes[2] = Number((ts >> 24n) & 0xffn);
    bytes[3] = Number((ts >> 16n) & 0xffn);
    bytes[4] = Number((ts >> 8n) & 0xffn);
    bytes[5] = Number(ts & 0xffn);
    bytes[6] = 0x70 | (rand[0] & 0x0f);
    bytes[7] = rand[1];
    bytes[8] = 0x80 | (rand[2] & 0x3f);
    bytes[9] = rand[3];
    for (let i = 10; i < 16; i++) bytes[i] = rand[i - 6];
    const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  }

  const out = el.querySelector('#u-output');
  el.querySelector('#u-gen').onclick = () => {
    const count = Math.min(500, Math.max(1, parseInt(el.querySelector('#u-count').value) || 1));
    const version = el.querySelector('#u-version').value;
    const upper = el.querySelector('#u-upper').querySelector('input').checked;
    const list = Array.from({ length: count }, () => version === '7' ? uuidv7() : uuidv4());
    const text = list.join('\n');
    out.textContent = upper ? text.toUpperCase() : text;
  };
  el.querySelector('#u-copy').onclick = () => copyText(out.textContent);
}
