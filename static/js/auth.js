/**
 * Train Depot - Authentication module
 *
 * Extracted from app.js. Contains the user-facing auth actions:
 * logout, change password, remove password.
 *
 * The initial auth check (fetch /api/auth/status and redirect to
 * /login.html) still lives in app.init() because it's part of the
 * boot sequence.
 *
 * Depends on: `app` global, `app.api()`, `app.toast()`,
 * `app.showInputModal()` (from modals.js).
 */
Object.assign(app, {
  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch(e) {}
    window.location.href = '/login.html';
  },

  async changePassword() {
    const newPass = document.getElementById('settingsNewPassword').value;
    const confirm = document.getElementById('settingsConfirmPassword').value;
    if (!newPass || newPass.length < 4) { this.toast('Password must be at least 4 characters', 'error'); return; }
    if (newPass !== confirm) { this.toast('Passwords do not match', 'error'); return; }
    try {
      await this.api('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPass })
      });
      this.toast('Password updated!');
      document.getElementById('settingsNewPassword').value = '';
      document.getElementById('settingsConfirmPassword').value = '';
      // Show logout button now that a password is set
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) logoutBtn.style.display = '';
      const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
      if (mobileLogoutBtn) mobileLogoutBtn.style.display = '';
    } catch(e) { /* toast shown */ }
  },

  async removePasswordUI() {
    const currentPass = await this.showInputModal({
      title: 'Remove Password',
      label: 'Current Password',
      placeholder: 'Enter your current password to confirm',
      icon: '🔓',
      hint: 'This will make the app open to everyone on your network.'
    });
    if (!currentPass) return;
    try {
      await this.api('/api/auth/remove-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: currentPass })
      });
      this.toast('Password removed — app is now open access');
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) logoutBtn.style.display = 'none';
      const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
      if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';
    } catch(e) { /* toast shown */ }
  }
});
