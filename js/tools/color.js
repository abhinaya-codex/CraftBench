export function render(el) {
  el.innerHTML = `
    <div class="panel">
      <div class="panel-body">
        <div style="display:flex; gap:18px; align-items:center; margin-bottom:18px; flex-wrap:wrap;">
          <input type="color" id="c-picker" value="#C89B54" style="width:60px; height:44px; border:1px solid var(--border); border-radius:8px; background:none; cursor:pointer;">
          <div id="c-swatch" style="width:60px; height:44px; border-radius:8px; border:1px solid var(--border); background:#C89B54;"></div>
          <div class="field" style="margin:0; flex:1; min-width:180px;">
            <label class="field-label">HEX</label>
            <input type="text" id="c-hex" value="#C89B54">
          </div>
        </div>
        <div class="grid grid-3">
          <div class="field" style="margin:0;">
            <label class="field-label">RGB</label>
            <input type="text" id="c-rgb" readonly>
          </div>
          <div class="field" style="margin:0;">
            <label class="field-label">HSL</label>
            <input type="text" id="c-hsl" readonly>
          </div>
          <div class="field" style="margin:0;">
            <label class="field-label">CSS var</label>
            <input type="text" id="c-var" readonly>
          </div>
        </div>
      </div>
    </div>
  `;

  const picker = el.querySelector('#c-picker');
  const swatch = el.querySelector('#c-swatch');
  const hex = el.querySelector('#c-hex');
  const rgbOut = el.querySelector('#c-rgb');
  const hslOut = el.querySelector('#c-hsl');
  const varOut = el.querySelector('#c-var');

  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const num = parseInt(h, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function update(fromHex) {
    if (!/^#([0-9a-fA-F]{3}){1,2}$/.test(fromHex)) return;
    const { r, g, b } = hexToRgb(fromHex);
    const { h, s, l } = rgbToHsl(r, g, b);
    swatch.style.background = fromHex;
    picker.value = fromHex.length === 4 ? '#' + [...fromHex.slice(1)].map(c => c + c).join('') : fromHex;
    rgbOut.value = `rgb(${r}, ${g}, ${b})`;
    hslOut.value = `hsl(${h}, ${s}%, ${l}%)`;
    varOut.value = `--color: ${fromHex};`;
  }

  hex.addEventListener('input', () => update(hex.value));
  picker.addEventListener('input', () => { hex.value = picker.value; update(picker.value); });
  update(hex.value);
}
