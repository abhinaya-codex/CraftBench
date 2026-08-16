import { store } from './storage.js';

export function shouldAutoShow() {
  return !store.get('onboarding-seen', false);
}

export function showOnboarding() {
  if (document.getElementById('onboard-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'onboard-overlay';
  overlay.id = 'onboard-overlay';
  overlay.innerHTML = `
    <div class="onboard-box" role="dialog" aria-label="Welcome to Craftbench">
      <div class="onboard-head">
        <div class="onboard-eyebrow">WELCOME TO CRAFTBENCH</div>
        <h2>Build. Debug. Learn. Analyze. Ship.</h2>
        <p>A quick map of what's here — most of it works the second you land, and one part only unlocks once you bring your own key. Skip this anytime, no pressure.</p>
      </div>

      <div class="onboard-body">
        <div class="grid grid-2">
          <div class="onboard-panel">
            <div class="onboard-col-head"><span class="dot" style="background:var(--success);"></span>Works right now — no key needed</div>
            <ul class="onboard-list">
              <li>Toolbox — JSON, Regex, JWT decoder, Encoding, UUID, Hash, Time, Color, Diff, Minifier</li>
              <li>Build Lab — README, .gitignore, and License generators</li>
              <li>Project Analyzer — upload a .zip, get a local health score</li>
              <li>Learning Center roadmaps &amp; BugLab challenges</li>
              <li>Command palette (Ctrl/Cmd+K), terminal, themes, local data export</li>
            </ul>
          </div>
          <div class="onboard-panel" style="border-color:var(--brass-soft);">
            <div class="onboard-col-head"><span class="dot" style="background:var(--brass);"></span>Unlocks with your OpenRouter key</div>
            <ul class="onboard-list">
              <li>Chat with CoDeX about your code or an idea</li>
              <li>Get a project plan, then generate a full file tree</li>
              <li>Download AI-built projects as a ZIP</li>
              <li>Quick actions — Debug, Refactor, Optimize, Test, Document, Convert, Security</li>
            </ul>
            <div class="hint" style="margin-top:10px;">🔒 Your key stays in this browser's local storage and is only sent directly to OpenRouter when you use these features.</div>
          </div>
        </div>
      </div>

      <div class="onboard-foot">
        <span class="onboard-foot-hint">You can reopen this from the <span class="kbd">?</span> button in the top bar.</span>
        <div style="display:flex; gap:8px;">
          <button class="btn" id="onboard-skip">Skip for now</button>
          <button class="btn primary" id="onboard-ai">Set up AI Coder</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  store.set('onboarding-seen', true);

  function close() { overlay.remove(); }

  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });
  overlay.querySelector('#onboard-skip').onclick = close;
  overlay.querySelector('#onboard-ai').onclick = () => { close(); location.hash = '#/ai-settings'; };
}
