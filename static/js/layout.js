/**
 * Train Depot - Layout module
 *
 * Renders the Layout page — hero, zones, photo gallery, lightbox.
 * All editing (hero, zones, photos) happens in-page via overlays.
 */
Object.assign(app, {

  // ==================== Render ====================

  renderLayout() {
    const layout = this._layoutData || { description: '', heroImage: null, zones: [] };
    const edit = this._layoutEditMode;
    const zones = [...(layout.zones || [])].sort((a, b) => a.order - b.order);

    const heroStyle = layout.heroImage
      ? `style="--layout-hero-img:url('${layout.heroImage}')"`
      : '';

    return `
      <div class="layout-page">

        <div class="layout-hero ${layout.heroImage ? 'has-image' : ''}" ${heroStyle}
             ${edit && !layout.heroImage ? `onclick="app.openLayoutHeroEdit()"` : ''}>
          <div class="layout-hero-overlay"></div>
          <div class="layout-hero-content">
            <h1 class="layout-hero-title">The Layout</h1>
            ${layout.description
              ? `<p class="layout-hero-desc">${this.esc(layout.description)}</p>`
              : (edit ? `<p class="layout-hero-desc layout-hero-desc--empty">Click "Edit Hero" to add a description</p>` : '')}
          </div>
        </div>

        <div class="layout-toolbar">
          ${edit ? `
            <button class="btn btn-primary btn-sm" onclick="app.openAddZoneModal()">+ Add Zone</button>
            <button class="btn btn-outline btn-sm" onclick="app.openLayoutHeroEdit()">🖼 Edit Hero</button>
            <button class="btn btn-outline btn-sm" onclick="app.toggleLayoutEdit()">✓ Done</button>
          ` : `
            <button class="btn btn-outline btn-sm" onclick="app.toggleLayoutEdit()">✏️ Edit Layout</button>
          `}
        </div>

        ${zones.length === 0 ? `
          <div class="layout-empty">
            <span class="empty-icon">🏗️</span>
            <p class="empty-title">No zones yet</p>
            <p class="empty-text">${edit ? 'Click "Add Zone" to create the first section.' : 'Click "Edit Layout" to get started.'}</p>
          </div>
        ` : `
          <div class="layout-zones">
            ${zones.map(z => this._renderLayoutZone(z, edit)).join('')}
          </div>
        `}
      </div>
    `;
  },

  _renderLayoutZone(zone, edit) {
    const photos = zone.images || [];
    return `
      <div class="layout-zone" data-zone-id="${zone.id}">
        <div class="layout-zone-header">
          <div class="layout-zone-meta">
            <h2 class="layout-zone-name">${this.esc(zone.name)}</h2>
            ${zone.description ? `<p class="layout-zone-desc">${this.esc(zone.description)}</p>` : ''}
          </div>
          ${edit ? `
            <div class="layout-zone-actions">
              <button class="btn btn-outline btn-sm" onclick="app.openEditZoneModal('${zone.id}')">✏️ Edit</button>
              <button class="btn btn-danger btn-sm" onclick="app.confirmDeleteZone('${zone.id}', '${this.esc(zone.name)}')">🗑</button>
            </div>
          ` : ''}
        </div>

        <div class="layout-photo-grid">
          ${photos.map((img, i) => `
            <div class="layout-photo-wrap">
              <img src="${img}" class="layout-photo" loading="lazy"
                   onclick="app.openLayoutLightbox('${zone.id}', ${i})">
              ${edit ? `
                <button class="layout-photo-remove" onclick="app.removeLayoutPhoto('${zone.id}', '${img}')" title="Remove photo">×</button>
              ` : ''}
            </div>
          `).join('')}
          ${edit ? `
            <div class="layout-photo-add" onclick="document.getElementById('lpu_${zone.id}').click()" title="Add photos">
              <span class="layout-photo-add-icon">+</span>
              <input type="file" id="lpu_${zone.id}" multiple accept="image/*" style="display:none"
                     onchange="app.uploadLayoutPhotos('${zone.id}', this)">
            </div>
          ` : (photos.length === 0 ? `<p class="layout-zone-empty">No photos in this zone yet.</p>` : '')}
        </div>
      </div>
    `;
  },

  // ==================== Edit mode ====================

  toggleLayoutEdit() {
    this._layoutEditMode = !this._layoutEditMode;
    this.render();
  },

  // ==================== Hero edit ====================

  openLayoutHeroEdit() {
    const layout = this._layoutData || {};
    const overlay = document.createElement('div');
    overlay.className = 'focal-picker-overlay';
    overlay.id = 'layoutHeroEditOverlay';
    overlay.innerHTML = `
      <div class="focal-picker-container" style="max-width:480px;gap:14px;">
        <h3 style="color:#fff;margin:0;">Edit Hero</h3>
        <div>
          <label style="display:block;color:rgba(255,255,255,0.8);font-size:0.85rem;margin-bottom:6px;">Hero Photo</label>
          ${layout.heroImage
            ? `<img src="${layout.heroImage}" style="width:100%;max-height:180px;object-fit:cover;border-radius:8px;margin-bottom:8px;">`
            : ''}
          <button class="btn btn-outline btn-sm" onclick="document.getElementById('heroPhotoInput').click()" style="width:100%;">
            ${layout.heroImage ? '🔄 Change Photo' : '📷 Upload Photo'}
          </button>
          <input type="file" id="heroPhotoInput" accept="image/*" style="display:none" onchange="app.uploadLayoutHero(this)">
        </div>
        <div>
          <label style="display:block;color:rgba(255,255,255,0.8);font-size:0.85rem;margin-bottom:6px;">Description</label>
          <textarea id="heroDescInput" class="form-textarea" rows="3"
            placeholder="A few words about the layout..."
            style="width:100%;box-sizing:border-box;">${this.esc(layout.description || '')}</textarea>
        </div>
        <div class="focal-picker-actions">
          <button class="btn btn-outline btn-sm" onclick="document.getElementById('layoutHeroEditOverlay').remove()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="app.saveLayoutHero()">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  async uploadLayoutHero(input) {
    const file = input.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/layout/hero', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        this._layoutData.heroImage = data.url;
        // Refresh preview in the overlay
        const overlay = document.getElementById('layoutHeroEditOverlay');
        if (overlay) {
          const existing = overlay.querySelector('img');
          if (existing) {
            existing.src = data.url;
          } else {
            const btn = overlay.querySelector('button');
            const img = document.createElement('img');
            img.src = data.url;
            img.style.cssText = 'width:100%;max-height:180px;object-fit:cover;border-radius:8px;margin-bottom:8px;';
            btn.parentNode.insertBefore(img, btn);
          }
          overlay.querySelector('button').textContent = '🔄 Change Photo';
        }
      }
    } catch(e) {
      this.showToast('Upload failed', 'error');
    }
  },

  async saveLayoutHero() {
    const desc = document.getElementById('heroDescInput')?.value.trim() || '';
    try {
      this._layoutData = await this.api('/api/layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc, heroImage: this._layoutData?.heroImage })
      });
      document.getElementById('layoutHeroEditOverlay')?.remove();
      this.render();
    } catch(e) {
      this.showToast('Save failed', 'error');
    }
  },

  // ==================== Add / Edit Zone ====================

  openAddZoneModal() {
    this._openZoneModal(null);
  },

  openEditZoneModal(id) {
    const zone = this._layoutData?.zones.find(z => z.id === id);
    this._openZoneModal(zone);
  },

  _openZoneModal(zone) {
    const isEdit = !!zone;
    const overlay = document.createElement('div');
    overlay.className = 'focal-picker-overlay';
    overlay.id = 'layoutZoneModal';
    overlay.innerHTML = `
      <div class="focal-picker-container" style="max-width:420px;gap:12px;">
        <h3 style="color:#fff;margin:0;">${isEdit ? 'Edit Zone' : 'Add Zone'}</h3>
        <div>
          <label style="display:block;color:rgba(255,255,255,0.8);font-size:0.85rem;margin-bottom:5px;">Zone Name</label>
          <input type="text" id="zoneNameInput" class="form-input" value="${this.esc(zone?.name || '')}"
                 placeholder="e.g. Goods Yard, Viaduct, Engine Shed">
        </div>
        <div>
          <label style="display:block;color:rgba(255,255,255,0.8);font-size:0.85rem;margin-bottom:5px;">Description <span style="opacity:0.6;">(optional)</span></label>
          <textarea id="zoneDescInput" class="form-textarea" rows="2"
                    placeholder="Brief description of this area..."
                    style="width:100%;box-sizing:border-box;">${this.esc(zone?.description || '')}</textarea>
        </div>
        <div class="focal-picker-actions">
          <button class="btn btn-outline btn-sm" onclick="document.getElementById('layoutZoneModal').remove()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="app.saveZoneModal('${zone?.id || ''}')">
            ${isEdit ? 'Save Changes' : 'Add Zone'}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('zoneNameInput').focus();
  },

  async saveZoneModal(existingId) {
    const name = document.getElementById('zoneNameInput')?.value.trim();
    const description = document.getElementById('zoneDescInput')?.value.trim() || '';
    if (!name) { this.showToast('Zone name is required', 'warning'); return; }

    try {
      if (existingId) {
        const updated = await this.api(`/api/layout/zones/${existingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description })
        });
        const idx = this._layoutData.zones.findIndex(z => z.id === existingId);
        if (idx !== -1) this._layoutData.zones[idx] = updated;
      } else {
        const zone = await this.api('/api/layout/zones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description })
        });
        this._layoutData.zones.push(zone);
      }
      document.getElementById('layoutZoneModal')?.remove();
      this.render();
    } catch(e) {
      this.showToast('Save failed', 'error');
    }
  },

  async confirmDeleteZone(id, name) {
    if (!confirm(`Delete zone "${name}" and all its photos?`)) return;
    try {
      await this.api(`/api/layout/zones/${id}`, { method: 'DELETE' });
      this._layoutData.zones = this._layoutData.zones.filter(z => z.id !== id);
      this.render();
    } catch(e) {
      this.showToast('Delete failed', 'error');
    }
  },

  // ==================== Zone photos ====================

  async uploadLayoutPhotos(zoneId, input) {
    const files = Array.from(input.files);
    if (!files.length) return;

    this.showToast(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''}…`);
    const fd = new FormData();
    files.forEach(f => fd.append('photos', f));

    try {
      const data = await fetch(`/api/layout/zones/${zoneId}/photos`, {
        method: 'POST', body: fd
      }).then(r => r.json());

      const zone = this._layoutData?.zones.find(z => z.id === zoneId);
      if (zone && data.files) {
        zone.images = [...(zone.images || []), ...data.files];
      }
      input.value = '';
      this.render();
    } catch(e) {
      this.showToast('Upload failed', 'error');
    }
  },

  async removeLayoutPhoto(zoneId, url) {
    try {
      await this.api(`/api/layout/zones/${zoneId}/photos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const zone = this._layoutData?.zones.find(z => z.id === zoneId);
      if (zone) zone.images = zone.images.filter(img => img !== url);
      this.render();
    } catch(e) {
      this.showToast('Remove failed', 'error');
    }
  },

  // ==================== Lightbox ====================

  openLayoutLightbox(zoneId, startIndex) {
    const zone = this._layoutData?.zones.find(z => z.id === zoneId);
    if (!zone || !zone.images.length) return;
    this._layoutLbImages = zone.images;
    this._layoutLbIndex = startIndex;
    this._renderLayoutLightbox();
  },

  _renderLayoutLightbox() {
    const images = this._layoutLbImages;
    const idx = this._layoutLbIndex;
    const existing = document.getElementById('layoutLightbox');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay show';
    overlay.id = 'layoutLightbox';
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    overlay.innerHTML = `
      <div class="lightbox-container">
        <img src="${images[idx]}" class="lightbox-image" alt="Layout photo">
        <button class="lightbox-close" onclick="document.getElementById('layoutLightbox').remove()">&times;</button>
        ${idx > 0 ? `<button class="lightbox-nav lightbox-prev" onclick="app._navLayoutLightbox(-1)">&#10094;</button>` : ''}
        ${idx < images.length - 1 ? `<button class="lightbox-nav lightbox-next" onclick="app._navLayoutLightbox(1)">&#10095;</button>` : ''}
        ${images.length > 1 ? `<div class="lightbox-counter">${idx + 1} / ${images.length}</div>` : ''}
      </div>
    `;

    document.body.appendChild(overlay);

    // Keyboard nav
    overlay._keyHandler = (e) => {
      if (e.key === 'ArrowLeft') this._navLayoutLightbox(-1);
      else if (e.key === 'ArrowRight') this._navLayoutLightbox(1);
      else if (e.key === 'Escape') overlay.remove();
    };
    document.addEventListener('keydown', overlay._keyHandler);
    overlay.addEventListener('remove', () => document.removeEventListener('keydown', overlay._keyHandler));
  },

  _navLayoutLightbox(dir) {
    const images = this._layoutLbImages;
    this._layoutLbIndex = Math.max(0, Math.min(images.length - 1, this._layoutLbIndex + dir));
    this._renderLayoutLightbox();
  },

});
