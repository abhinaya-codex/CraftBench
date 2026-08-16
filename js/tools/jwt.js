export function render(el) {
  el.innerHTML = `
    <div class="panel">
      <div class="panel-body">
        <label class="field-label">JWT token</label>
        <textarea id="w-input" class="code-area" style="min-height:100px;" placeholder="eyJhbGciOi..."></textarea>
        <div class="hint warn">⚠ This decodes the token only — it does <strong>not</strong> verify the signature. A decoded token is not proof the token is valid or untampered.</div>
        <div class="section-divider"></div>
        <div class="grid grid-2">
          <div>
            <div class="panel-title" style="margin-bottom:8px;">🔖 Header</div>
            <pre class="output-block" id="w-header" style="min-height:140px;">—</pre>
          </div>
          <div>
            <div class="panel-title" style="margin-bottom:8px;">📦 Payload / Claims</div>
            <pre class="output-block" id="w-payload" style="min-height:140px;">—</pre>
          </div>
        </div>
        <div id="w-meta" style="margin-top:10px;"></div>
      </div>
    </div>
  `;

  function b64urlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return decodeURIComponent(escape(atob(str)));
  }

  el.querySelector('#w-input').addEventListener('input', e => {
    const token = e.target.value.trim();
    const header = el.querySelector('#w-header');
    const payload = el.querySelector('#w-payload');
    const meta = el.querySelector('#w-meta');
    header.classList.remove('error'); payload.classList.remove('error');
    if (!token) { header.textContent = '—'; payload.textContent = '—'; meta.innerHTML = ''; return; }
    const parts = token.split('.');
    if (parts.length < 2) {
      header.classList.add('error'); header.textContent = 'Not a valid JWT (expected 3 dot-separated segments).';
      payload.textContent = '—'; meta.innerHTML = ''; return;
    }
    try {
      const h = JSON.parse(b64urlDecode(parts[0]));
      const p = JSON.parse(b64urlDecode(parts[1]));
      header.textContent = JSON.stringify(h, null, 2);
      payload.textContent = JSON.stringify(p, null, 2);
      let metaHtml = `<span class="pill ${parts.length===3?'ok':'bad'}">${parts.length===3?'3 segments':'Missing signature segment'}</span> `;
      if (p.exp) {
        const expDate = new Date(p.exp * 1000);
        const expired = expDate < new Date();
        metaHtml += `<span class="pill ${expired?'bad':'ok'}">${expired ? 'Expired' : 'Not expired'} — exp ${expDate.toLocaleString()}</span>`;
      }
      meta.innerHTML = metaHtml;
    } catch (err) {
      header.classList.add('error'); header.textContent = 'Could not decode: ' + err.message;
      payload.textContent = '—'; meta.innerHTML = '';
    }
  });
}
