export function render(el, title, desc) {
  el.innerHTML = `
    <div class="panel">
      <div class="empty-state">
        <div class="ei">🛠️</div>
        <h3 style="margin-bottom:8px;">${title}</h3>
        <p style="max-width:440px; margin:0 auto; color:var(--text-muted); font-size:13.5px;">${desc}</p>
      </div>
    </div>
  `;
}
