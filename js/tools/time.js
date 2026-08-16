export function render(el) {
  el.innerHTML = `
    <div class="grid grid-2">
      <div class="panel">
        <div class="panel-header"><span class="panel-title">🕐 Unix timestamp → Date</span></div>
        <div class="panel-body">
          <div class="field-row">
            <div class="field" style="margin:0;">
              <label class="field-label">Timestamp</label>
              <input type="text" id="t-ts" placeholder="1700000000">
            </div>
            <div class="field" style="margin:0; max-width:120px;">
              <label class="field-label">Unit</label>
              <select id="t-unit"><option value="s">Seconds</option><option value="ms">Millis</option></select>
            </div>
          </div>
          <button class="btn btn-sm" id="t-now">Use current time</button>
          <div class="section-divider"></div>
          <div id="t-dateout" class="output-block">—</div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header"><span class="panel-title">📅 Date → Unix timestamp</span></div>
        <div class="panel-body">
          <label class="field-label">Date &amp; time (local)</label>
          <input type="text" id="t-datein" placeholder="2026-08-16T14:30:00">
          <div class="hint">ISO format, e.g. 2026-08-16T14:30:00</div>
          <div class="section-divider"></div>
          <div id="t-tsout" class="output-block">—</div>
        </div>
      </div>
    </div>
  `;

  const ts = el.querySelector('#t-ts');
  const unit = el.querySelector('#t-unit');
  const dateout = el.querySelector('#t-dateout');
  const datein = el.querySelector('#t-datein');
  const tsout = el.querySelector('#t-tsout');

  function fromTs() {
    const raw = ts.value.trim();
    if (!raw || isNaN(Number(raw))) { dateout.textContent = '—'; return; }
    const ms = unit.value === 's' ? Number(raw) * 1000 : Number(raw);
    const d = new Date(ms);
    if (isNaN(d.getTime())) { dateout.textContent = 'Invalid timestamp'; return; }
    dateout.textContent =
      `ISO:        ${d.toISOString()}\n` +
      `Local:      ${d.toString()}\n` +
      `UTC:        ${d.toUTCString()}\n` +
      `Relative:   ${relativeTime(d)}`;
  }

  function relativeTime(d) {
    const diff = (d.getTime() - Date.now()) / 1000;
    const abs = Math.abs(diff);
    const units = [['year',31536000],['month',2592000],['day',86400],['hour',3600],['minute',60],['second',1]];
    for (const [name, secs] of units) {
      if (abs >= secs || name === 'second') {
        const val = Math.round(abs / secs);
        return diff < 0 ? `${val} ${name}${val!==1?'s':''} ago` : `in ${val} ${name}${val!==1?'s':''}`;
      }
    }
  }

  function fromDate() {
    const raw = datein.value.trim();
    if (!raw) { tsout.textContent = '—'; return; }
    const d = new Date(raw);
    if (isNaN(d.getTime())) { tsout.textContent = 'Invalid date. Try ISO format like 2026-08-16T14:30:00'; return; }
    tsout.textContent = `Seconds:      ${Math.floor(d.getTime()/1000)}\nMilliseconds: ${d.getTime()}`;
  }

  el.querySelector('#t-now').onclick = () => { ts.value = Math.floor(Date.now()/1000); unit.value='s'; fromTs(); };
  [ts, unit].forEach(n => n.addEventListener('input', fromTs));
  datein.addEventListener('input', fromDate);
  fromTs();
}
