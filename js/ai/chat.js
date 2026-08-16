import { getAiConfig } from './settings.js';
import { toast, escapeHtml, copyText } from '../ui.js';

const SYSTEM_PROMPT = `You are CoDeX, the AI coding assistant inside Craftbench, a developer workspace.

When the user describes a project they want built, respond with a clear PLAN using this exact structure, in plain text (no markdown headers needed, just labeled lines):

Project Name: <name>
Description: <one paragraph>
Technology Stack: <comma separated>
Features:
- <feature>
- <feature>
File Structure:
<a text file tree using indentation and / for folders>

Keep the plan concise but complete. Do not generate full file code in this step — that happens after the user confirms.

For any other request (debugging, explaining, refactoring, optimizing, writing tests, documenting, converting code, improving UI, checking security, or general chat), respond normally and helpfully as a senior software engineer. Be honest about limitations — never claim generated code is guaranteed bug-free, and never claim to have executed code you have not actually run.`;

const FILES_PROMPT = `Based on the plan you just gave, generate the full project now.

Respond with ONLY valid JSON, no markdown fences, no commentary, in exactly this shape:
{"files":[{"path":"relative/path.ext","content":"full file content as a string"}]}

Include every file from the file structure you proposed, fully implemented — not placeholders. Keep individual files reasonably sized and focused. Do not include any text before or after the JSON.`;

const QUICK_ACTIONS = [
  { icon: '🏗️', label: 'Build', prompt: 'Build this project.' },
  { icon: '🐛', label: 'Debug', prompt: 'Find and fix problems in the current code.' },
  { icon: '🧠', label: 'Explain', prompt: 'Explain how this code works.' },
  { icon: '🔧', label: 'Refactor', prompt: 'Refactor this code to be cleaner and more maintainable.' },
  { icon: '⚡', label: 'Optimize', prompt: 'Suggest performance optimizations for this code.' },
  { icon: '🧪', label: 'Test', prompt: 'Generate tests for this code.' },
  { icon: '📝', label: 'Document', prompt: 'Generate documentation for this code.' },
  { icon: '🔄', label: 'Convert', prompt: 'Convert this code to another language. Ask me which language if unclear.' },
  { icon: '🎨', label: 'Improve UI', prompt: 'Suggest improvements to the interface and user experience.' },
  { icon: '🔒', label: 'Security', prompt: 'Check this code for common security problems.' }
];

let messages = [];
let project = null; // { files: [{path, content}] }
let activeFile = null;

export function render(el) {
  const cfg = getAiConfig();

  if (!cfg.enabled || !cfg.apiKey) {
    el.innerHTML = `
      <div class="panel">
        <div class="empty-state">
          <div class="ei">🤖</div>
          <h3 style="margin-bottom:8px;">CoDeX AI Coder isn't connected yet</h3>
          <p style="max-width:420px; margin:0 auto 18px; color:var(--text-muted); font-size:13.5px;">
            Add your own OpenRouter API key in AI Settings to generate projects, debug code, and chat about what you're building.
            Every offline tool in Craftbench works fine without this.
          </p>
          <button class="btn primary" id="goto-settings">Go to AI Settings</button>
        </div>
      </div>
    `;
    el.querySelector('#goto-settings').onclick = () => location.hash = '#/ai-settings';
    return;
  }

  el.innerHTML = `
    <div class="grid" style="grid-template-columns: 1fr 320px; align-items:start; gap:18px;">
      <div class="chat-shell">
        <div class="badge-row" style="margin-bottom:12px;">
          ${QUICK_ACTIONS.map(a => `<button class="btn btn-sm qa" data-prompt="${escapeAttr(a.prompt)}">${a.icon} ${a.label}</button>`).join('')}
        </div>
        <div class="chat-log" id="chat-log"></div>
        <div class="chat-inputbar">
          <textarea id="chat-input" placeholder="Describe what you want to build, or ask CoDeX anything about your code..."></textarea>
          <button class="btn primary" id="chat-send">Send</button>
        </div>
      </div>
      <div class="panel" style="position:sticky; top:70px;">
        <div class="panel-header"><span class="panel-title">📁 Project explorer</span></div>
        <div class="panel-body" id="project-explorer">
          <div class="empty-state" style="padding:24px 10px;">
            <div class="ei">🗂️</div>
            <p style="font-size:12.5px; color:var(--text-faint);">No project generated yet.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  function escapeAttr(s){ return s.replace(/"/g,'&quot;'); }

  const log = el.querySelector('#chat-log');
  const input = el.querySelector('#chat-input');

  function renderLog() {
    log.innerHTML = messages.map((m, i) => {
      if (m.role === 'system') return '';
      const isPlan = m.role === 'assistant' && /Project Name:/i.test(m.content) && /File Structure:/i.test(m.content);
      return `
        <div class="msg ${m.role}">
          <div class="msg-avatar">${m.role === 'user' ? '🙂' : 'C'}</div>
          <div style="max-width:100%;">
            <div class="msg-bubble">${escapeHtml(m.content)}</div>
            ${isPlan ? `
              <div class="plan-block">
                <h5>Ready to build this?</h5>
                <div style="display:flex; gap:8px;">
                  <button class="btn btn-sm primary" data-gen="${i}">Create Project</button>
                  <button class="btn btn-sm" data-edit="${i}">Edit Request</button>
                </div>
              </div>` : ''}
          </div>
        </div>
      `;
    }).join('') || `<div class="empty-state"><div class="ei">💬</div><p>Tell CoDeX what you want to build, or pick a quick action above.</p></div>`;
    log.scrollTop = log.scrollHeight;
    log.querySelectorAll('[data-gen]').forEach(btn => btn.onclick = () => generateFiles());
    log.querySelectorAll('[data-edit]').forEach(btn => btn.onclick = () => { input.focus(); toast('Describe your changes and send'); });
  }

  function renderExplorer() {
    const wrap = el.querySelector('#project-explorer');
    if (!project) {
      wrap.innerHTML = `<div class="empty-state" style="padding:24px 10px;"><div class="ei">🗂️</div><p style="font-size:12.5px; color:var(--text-faint);">No project generated yet.</p></div>`;
      return;
    }
    wrap.innerHTML = `
      <div class="filetree" style="margin-bottom:12px; max-height:220px; overflow-y:auto;">
        ${project.files.map(f => `<div class="f" data-file="${escapeAttr(f.path)}" style="cursor:pointer; padding:2px 0; ${activeFile===f.path?'color:var(--brass-strong); font-weight:700;':''}">📄 ${f.path}</div>`).join('')}
      </div>
      <button class="btn btn-sm primary" id="dl-zip" style="width:100%; margin-bottom:8px;">⬇ Download ZIP</button>
      ${activeFile ? `
        <div class="copy-row"><button class="btn btn-sm" id="copy-file">Copy file</button></div>
        <pre class="output-block" style="max-height:260px;">${escapeHtml(project.files.find(f=>f.path===activeFile)?.content || '')}</pre>
      ` : ''}
    `;
    wrap.querySelectorAll('[data-file]').forEach(n => n.onclick = () => { activeFile = n.dataset.file; renderExplorer(); });
    const dlBtn = wrap.querySelector('#dl-zip');
    if (dlBtn) dlBtn.onclick = downloadZip;
    const cpBtn = wrap.querySelector('#copy-file');
    if (cpBtn) cpBtn.onclick = () => copyText(project.files.find(f=>f.path===activeFile)?.content || '');
  }

  async function downloadZip() {
    if (!window.JSZip) { toast('ZIP library not loaded', 'err'); return; }
    const zip = new JSZip();
    project.files.forEach(f => zip.file(f.path, f.content));
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (project.name || 'project').replace(/\s+/g, '-').toLowerCase() + '.zip';
    a.click();
  }

  async function callOpenRouter(msgList) {
    const conf = getAiConfig();
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${conf.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: conf.model,
        messages: msgList
      })
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`OpenRouter error ${res.status}: ${t.slice(0, 200)}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '(empty response)';
  }

  async function send(promptOverride) {
    const text = (promptOverride ?? input.value).trim();
    if (!text) return;
    if (!messages.length) messages.push({ role: 'system', content: SYSTEM_PROMPT });
    messages.push({ role: 'user', content: text });
    input.value = '';
    renderLog();
    log.insertAdjacentHTML('beforeend', `<div class="msg assistant" id="thinking"><div class="msg-avatar">C</div><div class="msg-bubble">Thinking…</div></div>`);
    log.scrollTop = log.scrollHeight;
    try {
      const reply = await callOpenRouter(messages);
      messages.push({ role: 'assistant', content: reply });
    } catch (e) {
      messages.push({ role: 'assistant', content: `⚠ ${e.message}\n\nCheck your API key and model in AI Settings, and that OpenRouter allows requests from this origin.` });
    }
    renderLog();
  }

  async function generateFiles() {
    messages.push({ role: 'user', content: FILES_PROMPT });
    renderLog();
    log.insertAdjacentHTML('beforeend', `<div class="msg assistant" id="thinking"><div class="msg-avatar">C</div><div class="msg-bubble">Generating files…</div></div>`);
    try {
      const reply = await callOpenRouter(messages);
      const cleaned = reply.trim().replace(/^```json\s*/i, '').replace(/```$/,'').trim();
      const parsed = JSON.parse(cleaned);
      if (!parsed.files || !Array.isArray(parsed.files)) throw new Error('Response did not contain a files array.');
      const nameMatch = messages.find(m => /Project Name:/i.test(m.content||''))?.content.match(/Project Name:\s*(.+)/i);
      project = { name: nameMatch ? nameMatch[1].trim() : 'project', files: parsed.files };
      activeFile = project.files[0]?.path || null;
      messages.push({ role: 'assistant', content: `Generated ${project.files.length} file(s). Check the Project Explorer on the right — you can view, copy, or download the project as a ZIP.` });
      toast(`${project.files.length} files generated`);
    } catch (e) {
      messages.push({ role: 'assistant', content: `⚠ Couldn't parse the generated project (${e.message}). You can ask me to try again.` });
    }
    renderLog();
    renderExplorer();
  }

  el.querySelector('#chat-send').onclick = () => send();
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  el.querySelectorAll('.qa').forEach(btn => btn.onclick = () => { input.value = btn.dataset.prompt; input.focus(); });

  renderLog();
  renderExplorer();
}
