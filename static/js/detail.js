/**
 * Train Depot - detail module
 *
 * Extracted from app.js. Detail view renderer, image lightbox, service log, drag-and-drop image reorder.
 *
 * Extends `app` in place via Object.assign. Depends on the core
 * `app` global (declared in app.js) and its base methods/state.
 */
Object.assign(app, {
  // ==================== Detail View (renderDetail) ====================

  // --- Detail View ---
  renderDetail() {
    const item = this.detailItem;
    if (!item) return '<div class="main-content"><p>Item not found</p></div>';

    this.currentLightboxIndex = 0;
    const firstImgUrl = item.images && item.images.length > 0 ? item.images[0] : null;
    const mainImg = firstImgUrl
      ? `<img src="${firstImgUrl}" id="detailMainImg" alt="${this.esc(item.name)}" onclick="app.openLightbox(0)" style="cursor:pointer;">`
      : `<div class="detail-main-placeholder">${this.categorySilhouette(item.categoryId)}</div>`;
    // Inline CSS custom property powers the blurred hero backdrop that fills
    // the container behind portrait photos so they don't look marooned.
    const heroBgStyle = firstImgUrl ? ` style="--hero-bg: url('${firstImgUrl}');"` : '';

    const catName = this.getCategoryName(item.categoryId);
    const subcatName = this.getSubcategoryName(item.subcategoryId);
    const serviceOverdue = this.daysSinceService(item.lastServiceDate) > (this.settings.serviceIntervalDays || 365);

    // Quick Facts — compact at-a-glance pill under the title
    const quickFacts = [
      item.manufacturer ? this.esc(item.manufacturer) : null,
      item.livery ? this.esc(item.livery) : null,
      subcatName ? this.esc(subcatName) : null,
      item.runningNumber ? `No. ${this.esc(item.runningNumber)}` : null,
    ].filter(Boolean);

    return `
      <div class="main-content">
        <div class="item-detail">
          <div class="detail-header">
            <a class="detail-back" onclick="app.showCatalog(app.currentFilter, app.catalogPage || 1)">Back to catalog</a>
            <div class="detail-actions">
              <button class="btn btn-outline btn-sm" onclick="app.showQRForItem('${item.id}')">📱 QR</button>
              <button class="btn btn-outline btn-sm" onclick="app.openEditModal('${item.id}')">✏️ Edit</button>
              <button class="btn btn-danger btn-sm" onclick="app.confirmDelete('${item.id}')">🗑️ Delete</button>
            </div>
          </div>
          <div class="detail-body">
            <div class="detail-images">
              <div class="detail-main-image${firstImgUrl ? ' has-hero-bg' : ''}"${heroBgStyle}>
                ${mainImg}
                ${item.wishlist ? '<span class="detail-hero-wishlist" title="Wishlist">⭐</span>' : ''}
                ${serviceOverdue ? '<span class="detail-hero-service" title="Service overdue">🔧</span>' : ''}
                ${item.runningNumber ? `<span class="detail-hero-nameplate">${this.esc(item.runningNumber)}</span>` : ''}
              </div>
              ${item.images && item.images.length > 1 ? `
                <div class="detail-thumbnails">
                  ${item.images.map((img, i) => `
                    <div class="detail-thumb ${i === 0 ? 'active' : ''}" onclick="app.switchImage('${img}', this)" ondblclick="app.openLightbox(${i})">
                      <img src="${img}" alt="Photo ${i+1}" style="cursor:pointer;">
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
            <div class="detail-info">
              <h1 class="detail-name">${this.esc(item.name)}</h1>
              ${subcatName ? `<span class="detail-category-badge">${this.esc(catName)} &mdash; ${this.esc(subcatName)}</span>` : ''}

              ${quickFacts.length > 0 ? `
                <div class="detail-quick-facts">
                  ${quickFacts.map(f => `<span class="detail-quick-fact">${f}</span>`).join('<span class="detail-quick-sep">·</span>')}
                </div>
              ` : ''}

              ${item.productCode ? `
                <div class="detail-product-code">
                  <span class="detail-product-code-label">Product Code</span>
                  <span class="detail-product-code-value">${this.esc(item.productCode)}</span>
                </div>
              ` : ''}

              ${this.renderWishlistSpotted(item)}

              ${item.condition || item.dccStatus ? `
                <div style="margin: 12px 0;">
                  ${item.condition ? `<span class="condition-badge condition-${item.condition}">${item.condition.replace('-', ' / ')}</span>` : ''}
                  ${item.dccStatus ? `<span class="dcc-badge dcc-${item.dccStatus}">${item.dccStatus.replace('-', ' ')}</span>` : ''}
                </div>
              ` : ''}

              <div class="detail-fields">
                <div class="detail-field">
                  <span class="detail-field-label">Purchase Price</span>
                  <span class="detail-field-value price">${item.purchasePrice ? this.settings.currency + item.purchasePrice.toFixed(2) : '—'}</span>
                </div>
                <div class="detail-field">
                  <span class="detail-field-label">Current Value</span>
                  <span class="detail-field-value ${item.currentValue && item.purchasePrice ? (item.currentValue > item.purchasePrice ? 'value-up' : item.currentValue < item.purchasePrice ? 'value-down' : '') : ''}">${item.currentValue ? this.settings.currency + item.currentValue.toFixed(2) : '—'}</span>
                </div>
              </div>

              ${this.renderValuationDetail(item)}

              <div class="detail-fields">
                <div class="detail-field">
                  <span class="detail-field-label">Manufacturer</span>
                  <span class="detail-field-value">${this.esc(item.manufacturer || '—')}</span>
                </div>
                <div class="detail-field">
                  <span class="detail-field-label">Livery</span>
                  <span class="detail-field-value">${this.esc(item.livery || '—')}</span>
                </div>
                <div class="detail-field">
                  <span class="detail-field-label">Place of Purchase</span>
                  <span class="detail-field-value">${this.esc(item.placeOfPurchase || '—')}</span>
                </div>
                <div class="detail-field">
                  <span class="detail-field-label">Purchase Date</span>
                  <span class="detail-field-value">${item.purchaseDate ? this.formatDate(item.purchaseDate) : '—'}</span>
                </div>
                <div class="detail-field">
                  <span class="detail-field-label">Storage Location</span>
                  <span class="detail-field-value">${this.esc(item.storageLocation || '—')}</span>
                </div>
                <div class="detail-field">
                  <span class="detail-field-label">Last Service Date</span>
                  <span class="detail-field-value">${item.lastServiceDate ? this.formatDate(item.lastServiceDate) : '—'}</span>
                  ${this.serviceStatusBadge(item.lastServiceDate)}
                </div>
                <div class="detail-field">
                  <span class="detail-field-label">Added to Catalog</span>
                  <span class="detail-field-value">${this.formatDate(item.createdAt)}</span>
                </div>
              </div>

              ${item.tags && item.tags.length > 0 ? `
                <div class="detail-section">
                  <div class="detail-section-title">Tags</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${item.tags.map(tag => `
                      <span class="tag-chip tag-chip-readonly" onclick="app.showCatalog({ type: 'tag', value: '${this.esc(tag)}' })">
                        ${this.esc(tag)}
                      </span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${item.goesWellWith ? `
                <div class="detail-section">
                  <div class="detail-section-title">Goes Well With</div>
                  <div class="detail-section-text">${this.esc(item.goesWellWith)}</div>
                </div>
              ` : ''}

              ${item.historicalBackground ? `
                <div class="detail-section">
                  <div class="detail-section-title">Historical Background</div>
                  <div class="detail-section-text">${this.esc(item.historicalBackground)}</div>
                </div>
              ` : ''}

              ${this.renderServiceLog(item)}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ==================== Image Viewer / Lightbox ====================

  // ==================== Image Viewer ====================

  switchImage(src, thumbEl) {
    const mainImg = document.getElementById('detailMainImg');
    if (mainImg) mainImg.src = src;
    // Sync the blurred backdrop with the newly-selected main image
    const heroBox = mainImg ? mainImg.closest('.detail-main-image') : null;
    if (heroBox) heroBox.style.setProperty('--hero-bg', `url('${src}')`);
    document.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
  },

  openLightbox(imageIndex) {
    const item = this.detailItem;
    if (!item || !item.images || item.images.length === 0) return;
    this.currentLightboxIndex = imageIndex;
    this.renderLightbox();
  },

  renderLightbox() {
    const item = this.detailItem;
    if (!item || !item.images || item.images.length === 0) return;

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay show';
    overlay.id = 'lightboxOverlay';
    overlay.onclick = (e) => {
      if (e.target === overlay) this.closeLightbox();
    };

    const img = item.images[this.currentLightboxIndex];
    const showPrev = item.images.length > 1 && this.currentLightboxIndex > 0;
    const showNext = item.images.length > 1 && this.currentLightboxIndex < item.images.length - 1;

    overlay.innerHTML = `
      <div class="lightbox-container">
        <img src="${img}" alt="Photo" class="lightbox-image">
        <button class="lightbox-close" onclick="app.closeLightbox()">&times;</button>
        ${showPrev ? '<button class="lightbox-nav lightbox-prev" onclick="app.prevLightboxImage()">&#10094;</button>' : ''}
        ${showNext ? '<button class="lightbox-nav lightbox-next" onclick="app.nextLightboxImage()">&#10095;</button>' : ''}
        <div class="lightbox-counter">${this.currentLightboxIndex + 1} / ${item.images.length}</div>
      </div>
    `;

    const existing = document.getElementById('lightboxOverlay');
    if (existing) existing.remove();
    document.body.appendChild(overlay);

    // Add keyboard support
    const handleKeydown = (e) => {
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowLeft' && showPrev) this.prevLightboxImage();
      if (e.key === 'ArrowRight' && showNext) this.nextLightboxImage();
    };
    overlay._keyHandler = handleKeydown;
    document.addEventListener('keydown', handleKeydown);
  },

  closeLightbox() {
    const overlay = document.getElementById('lightboxOverlay');
    if (overlay) {
      if (overlay._keyHandler) {
        document.removeEventListener('keydown', overlay._keyHandler);
      }
      overlay.remove();
    }
  },

  prevLightboxImage() {
    if (this.currentLightboxIndex > 0) {
      this.currentLightboxIndex--;
      this.renderLightbox();
    }
  },

  nextLightboxImage() {
    const item = this.detailItem;
    if (item && item.images && this.currentLightboxIndex < item.images.length - 1) {
      this.currentLightboxIndex++;
      this.renderLightbox();
    }
  },

  // ==================== Service Log ====================

  // ==================== Service Log ====================

  renderServiceLog(item) {
    const formHtml = `
      <div class="service-log-form" id="serviceLogForm">
        <div style="margin-bottom: 8px;">
          <label style="display: block; font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 4px;">Service Date</label>
          <input type="date" id="serviceLogDate" class="form-input" style="width: 100%; padding: 8px;">
        </div>
        <div style="margin-bottom: 8px;">
          <label style="display: block; font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 4px;">Notes</label>
          <textarea id="serviceLogNote" class="form-input" placeholder="What was serviced?" style="width: 100%; padding: 8px; resize: vertical; min-height: 60px;"></textarea>
        </div>
        <div class="service-log-buttons">
          <button class="btn btn-outline btn-sm" onclick="app.toggleServiceLogForm()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="app.addServiceLogEntry()">Save Entry</button>
        </div>
      </div>
    `;

    if (!item.serviceLog || item.serviceLog.length === 0) {
      return `
        <div class="service-log-section">
          <div class="service-log-title">Service Log</div>
          <p style="color: var(--color-text-muted); font-size: 0.95rem;">No service entries yet.</p>
          <button class="btn btn-outline btn-sm" onclick="app.toggleServiceLogForm()">+ Add Service Entry</button>
          ${formHtml}
        </div>
      `;
    }

    const sorted = [...item.serviceLog].sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );

    return `
      <div class="service-log-section">
        <div class="service-log-title">Service Log</div>
        <div class="service-log-timeline">
          ${sorted.map(entry => `
            <div class="service-log-entry">
              <div class="service-log-date">${this.formatDate(entry.date)}</div>
              <div class="service-log-note">${this.esc(entry.note)}</div>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-outline btn-sm" onclick="app.toggleServiceLogForm()" style="margin-top: 12px;">+ Add Service Entry</button>
        ${formHtml}
      </div>
    `;
  },

  toggleServiceLogForm() {
    const form = document.getElementById('serviceLogForm');
    if (form) {
      form.classList.toggle('show');
    }
  },

  async addServiceLogEntry() {
    const dateInput = document.getElementById('serviceLogDate');
    const noteInput = document.getElementById('serviceLogNote');
    const date = dateInput.value;
    const note = noteInput.value.trim();

    if (!date || !note) {
      this.toast('Please enter both date and note', 'error');
      return;
    }

    try {
      const item = await this.api(`/api/items/${this.detailItem.id}/service-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, note })
      });
      this.detailItem = item;
      this.showDetail(this.detailItem.id);
      this.toast('Service entry logged \u2014 keeping her running smoothly!');
    } catch (e) { /* toast shown */ }
  },

  // ==================== Drag & Drop Image Reorder ====================

  // ==================== Drag & Drop Image Reorder ====================

  initDragDrop() {
    const container = document.getElementById('uploadPreviews');
    if (!container) return;
    const previews = container.querySelectorAll('.upload-preview');
    previews.forEach((el, i) => {
      el.setAttribute('draggable', 'true');
      el.dataset.index = i;
      el.addEventListener('dragstart', (e) => {
        this.dragSrcIndex = i;
        el.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      el.addEventListener('dragend', () => { el.classList.remove('dragging'); });
      el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('drag-over'); });
      el.addEventListener('dragleave', () => { el.classList.remove('drag-over'); });
      el.addEventListener('drop', (e) => {
        e.preventDefault();
        el.classList.remove('drag-over');
        const from = this.dragSrcIndex;
        const to = i;
        if (from === to) return;
        this.reorderImages(from, to);
      });
    });
  },

  reorderImages(fromIndex, toIndex) {
    // Combine existing and pending for a unified list
    const allImages = [...this.existingImages.map(url => ({ type: 'existing', url })), ...this.pendingImages.map(file => ({ type: 'pending', file }))];
    const [moved] = allImages.splice(fromIndex, 1);
    allImages.splice(toIndex, 0, moved);
    this.existingImages = allImages.filter(i => i.type === 'existing').map(i => i.url);
    this.pendingImages = allImages.filter(i => i.type === 'pending').map(i => i.file);
    this.renderUploadPreviews();
    // Re-init drag-drop after re-render
    setTimeout(() => this.initDragDrop(), 50);
  },

});
