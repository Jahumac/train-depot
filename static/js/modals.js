/**
 * Train Depot - Modals & Mascot module
 *
 * Extracted from app.js to keep the main file lean.
 * Contains: styled input/confirm dialogs and the friendly Smokey mascot SVGs
 * used by toasts and dialogs.
 *
 * Depends on: `app` global (defined in app.js), `app.esc()`.
 * Extends `app` in place via Object.assign.
 */
Object.assign(app, {
  // ==================== Styled Modal Dialogs ====================

  /**
   * Show a styled input modal (replaces browser prompt()).
   * Returns a Promise that resolves with the input value or null if cancelled.
   */
  showInputModal({ title, label, placeholder, value, icon, hint }) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'confirm-overlay';
      overlay.innerHTML = `
        <div class="depot-dialog">
          <div class="depot-dialog-header">
            <div class="depot-dialog-mascot">${this.mascotSmall()}</div>
            <div>
              <h3 class="depot-dialog-title">${title || 'Input'}</h3>
              ${hint ? `<p class="depot-dialog-hint">${hint}</p>` : ''}
            </div>
          </div>
          <div class="depot-dialog-body">
            <label class="form-label">${label || 'Name'}</label>
            <input type="text" class="form-input depot-dialog-input" placeholder="${this.esc(placeholder || '')}" value="${this.esc(value || '')}" autofocus>
          </div>
          <div class="depot-dialog-actions">
            <button class="btn btn-outline" data-action="cancel">Cancel</button>
            <button class="btn btn-primary" data-action="confirm">${icon || '✅'} Confirm</button>
          </div>
        </div>
      `;

      const input = overlay.querySelector('.depot-dialog-input');
      const confirm = () => {
        const val = input.value.trim();
        overlay.remove();
        resolve(val || null);
      };
      const cancel = () => { overlay.remove(); resolve(null); };

      overlay.querySelector('[data-action="cancel"]').onclick = cancel;
      overlay.querySelector('[data-action="confirm"]').onclick = confirm;
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') confirm();
        if (e.key === 'Escape') cancel();
      });
      overlay.addEventListener('click', e => { if (e.target === overlay) cancel(); });

      document.body.appendChild(overlay);
      setTimeout(() => input.focus(), 50);
    });
  },

  /**
   * Show a styled confirm modal (replaces browser confirm()).
   * Returns a Promise that resolves with true/false.
   */
  showConfirmModal({ title, message, confirmText, confirmClass, icon }) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'confirm-overlay';
      overlay.innerHTML = `
        <div class="depot-dialog">
          <div class="depot-dialog-header">
            <div class="depot-dialog-mascot">${this.mascotSmall('worried')}</div>
            <div>
              <h3 class="depot-dialog-title">${title || 'Are you sure?'}</h3>
            </div>
          </div>
          <div class="depot-dialog-body">
            <p class="depot-dialog-message">${message}</p>
          </div>
          <div class="depot-dialog-actions">
            <button class="btn btn-outline" data-action="cancel">Keep it</button>
            <button class="btn ${confirmClass || 'btn-danger'}" data-action="confirm">${icon || '🗑️'} ${confirmText || 'Delete'}</button>
          </div>
        </div>
      `;

      overlay.querySelector('[data-action="cancel"]').onclick = () => { overlay.remove(); resolve(false); };
      overlay.querySelector('[data-action="confirm"]').onclick = () => { overlay.remove(); resolve(true); };
      overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); resolve(false); } });
      document.body.appendChild(overlay);
    });
  },

  // ==================== Mascot (Smokey the Depot Engine) ====================

  /**
   * SVG mascot — a friendly little tank engine face.
   * Moods: 'happy' (default), 'worried', 'thinking'
   * Used in dialogs, empty states, and toasts for personality.
   */
  mascotTiny(mood = 'happy') {
    const eyeL = mood === 'worried' ? 'cy="10"' : 'cy="11"';
    const eyeR = mood === 'worried' ? 'cy="10"' : 'cy="11"';
    const mouth = mood === 'happy'
      ? '<path d="M11 17 Q14 20 17 17" stroke="#333" stroke-width="1.2" fill="none" stroke-linecap="round"/>'
      : mood === 'worried'
        ? '<path d="M11 19 Q14 17 17 19" stroke="#333" stroke-width="1.2" fill="none" stroke-linecap="round"/>'
        : '<line x1="11" y1="18" x2="17" y2="18" stroke="#333" stroke-width="1.2" stroke-linecap="round"/>';
    return `<svg viewBox="0 0 28 28" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="24" height="18" rx="6" fill="#2d6a4f"/>
      <rect x="2" y="4" width="24" height="5" rx="3" fill="#c9a227"/>
      <circle cx="10" ${eyeL} r="2.5" fill="white"/><circle cx="10.3" ${eyeL} r="1.2" fill="#333"/>
      <circle cx="18" ${eyeR} r="2.5" fill="white"/><circle cx="18.3" ${eyeR} r="1.2" fill="#333"/>
      ${mouth}
      <rect x="11" y="1" width="6" height="4" rx="2" fill="#1b4332"/>
      <circle cx="7" cy="24" r="3" fill="#444" stroke="#555" stroke-width="0.8"/><circle cx="7" cy="24" r="1" fill="#c9a227"/>
      <circle cx="21" cy="24" r="3" fill="#444" stroke="#555" stroke-width="0.8"/><circle cx="21" cy="24" r="1" fill="#c9a227"/>
    </svg>`;
  },

  mascotSmall(mood = 'happy') {
    const eyeL = mood === 'worried' ? 'cy="30"' : 'cy="32"';
    const eyeR = mood === 'worried' ? 'cy="30"' : 'cy="32"';
    const brow = mood === 'worried'
      ? '<line x1="20" y1="23" x2="27" y2="25" stroke="#1b4332" stroke-width="2" stroke-linecap="round"/><line x1="48" y1="25" x2="55" y2="23" stroke="#1b4332" stroke-width="2" stroke-linecap="round"/>'
      : '';
    const mouth = mood === 'happy'
      ? '<path d="M28 44 Q37 52 46 44" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>'
      : mood === 'worried'
        ? '<path d="M30 48 Q37 43 44 48" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>'
        : '<line x1="30" y1="46" x2="44" y2="46" stroke="#333" stroke-width="2" stroke-linecap="round"/>';
    const cheeks = mood === 'happy' ? '<circle cx="19" cy="39" r="4" fill="#e8886880"/><circle cx="55" cy="39" r="4" fill="#e8886880"/>' : '';
    return `<svg viewBox="0 0 74 66" width="52" height="46" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="12" width="62" height="40" rx="12" fill="#2d6a4f"/>
      <rect x="6" y="10" width="62" height="10" rx="5" fill="#c9a227"/>
      ${brow}
      <circle cx="27" ${eyeL} r="6" fill="white"/><circle cx="28" ${eyeL} r="3" fill="#333"/>
      <circle cx="47" ${eyeR} r="6" fill="white"/><circle cx="48" ${eyeR} r="3" fill="#333"/>
      ${cheeks}
      ${mouth}
      <rect x="29" y="2" width="16" height="10" rx="4" fill="#1b4332"/>
      <rect x="26" y="0" width="22" height="5" rx="3" fill="#0f2b1f"/>
      <circle cx="18" cy="58" r="6" fill="#444" stroke="#555" stroke-width="1.5"/><circle cx="18" cy="58" r="2" fill="#c9a227"/>
      <circle cx="56" cy="58" r="6" fill="#444" stroke="#555" stroke-width="1.5"/><circle cx="56" cy="58" r="2" fill="#c9a227"/>
      <circle cx="37" cy="58" r="5" fill="#444" stroke="#555" stroke-width="1.5"/><circle cx="37" cy="58" r="1.5" fill="#c9a227"/>
    </svg>`;
  },

  mascotMedium(mood = 'happy') {
    const mouth = mood === 'happy'
      ? '<path d="M42 68 Q56 80 70 68" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
      : '<path d="M44 74 Q56 66 68 74" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    return `<svg viewBox="0 0 112 100" width="100" height="90" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <rect x="10" y="20" width="92" height="58" rx="16" fill="#2d6a4f"/>
      <!-- Gold stripe -->
      <rect x="10" y="16" width="92" height="14" rx="7" fill="#c9a227"/>
      <!-- Chimney -->
      <rect x="44" y="2" width="24" height="16" rx="6" fill="#1b4332"/>
      <rect x="40" y="0" width="32" height="7" rx="4" fill="#0f2b1f"/>
      <!-- Steam puffs -->
      <g opacity="0.3" fill="white">
        <circle cx="40" cy="6" r="5"><animate attributeName="cy" values="6;0;6" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite"/></circle>
        <circle cx="72" cy="4" r="4"><animate attributeName="cy" values="4;-2;4" dur="4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.25;0;0.25" dur="4s" repeatCount="indefinite"/></circle>
      </g>
      <!-- Eyes -->
      <circle cx="40" cy="48" r="10" fill="white"/>
      <circle cx="41.5" cy="49" r="5" fill="#333"/>
      <circle cx="43" cy="47" r="1.5" fill="white"/>
      <circle cx="72" cy="48" r="10" fill="white"/>
      <circle cx="73.5" cy="49" r="5" fill="#333"/>
      <circle cx="75" cy="47" r="1.5" fill="white"/>
      <!-- Rosy cheeks -->
      <circle cx="28" cy="58" r="6" fill="#e8886850"/>
      <circle cx="84" cy="58" r="6" fill="#e8886850"/>
      ${mouth}
      <!-- Wheels -->
      <circle cx="28" cy="88" r="9" fill="#444" stroke="#555" stroke-width="2"/><circle cx="28" cy="88" r="3" fill="#c9a227"/>
      <circle cx="56" cy="88" r="8" fill="#444" stroke="#555" stroke-width="2"/><circle cx="56" cy="88" r="2.5" fill="#c9a227"/>
      <circle cx="84" cy="88" r="9" fill="#444" stroke="#555" stroke-width="2"/><circle cx="84" cy="88" r="3" fill="#c9a227"/>
      <!-- Headlamp -->
      <circle cx="10" cy="44" r="5" fill="#FFD700" opacity="0.8"/><circle cx="10" cy="44" r="2.5" fill="#FFF8DC"/>
    </svg>`;
  }
});
