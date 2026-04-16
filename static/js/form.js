/**
 * Train Depot - form module
 *
 * Extracted from app.js. Add/edit item modal, image upload, save/delete, tags, wishlist fields, duplicate detection.
 *
 * Extends `app` in place via Object.assign. Depends on the core
 * `app` global (declared in app.js) and its base methods/state.
 */
Object.assign(app, {
  // ==================== Modal / Forms (open/close, category selects) ====================

  // ==================== Modal / Forms ====================

  async openAddModal() {
    this.editingItem = null;
    this.selectedRefModel = null;
    this.pendingImages = [];
    this.existingImages = [];
    this._focalPoints = {};
    document.getElementById('modalTitle').textContent = 'Add New Item';
    this.populateCategorySelects();
    this.clearForm();
    // Set smart defaults
    document.getElementById('formCondition').value = 'excellent-boxed';
    document.getElementById('formDccStatus').value = 'analogue';
    // Fetch known tags for autocomplete, then render empty tags
    await this.loadKnownTags();
    this.renderFormTags([]);
    // Reset wishlist fields
    const wfg = document.getElementById('wishlistFieldsGroup');
    if (wfg) wfg.style.display = 'none';
    // Reset reference notices
    const notice = document.getElementById('refImageNotice');
    if (notice) notice.style.display = 'none';
    const chips = document.getElementById('goesWellSuggestions');
    if (chips) { chips.style.display = 'none'; chips.innerHTML = ''; }
    document.getElementById('itemModal').classList.add('active');
  },

  async openEditModal(id) {
    const item = await this.api(`/api/items/${id}`);
    this.editingItem = item;
    this.pendingImages = [];
    this.existingImages = [...(item.images || [])];
    this._focalPoints = item.imageFocalPoints ? { ...item.imageFocalPoints } : {};

    document.getElementById('modalTitle').textContent = 'Edit Item';
    this.populateCategorySelects(item.categoryId);

    document.getElementById('formName').value = item.name || '';
    document.getElementById('formCategory').value = item.categoryId || '';
    this.updateSubcategories();
    document.getElementById('formSubcategory').value = item.subcategoryId || '';
    document.getElementById('formRunningNumber').value = item.runningNumber || '';
    document.getElementById('formProductCode').value = item.productCode || '';
    document.getElementById('formCondition').value = item.condition || '';
    document.getElementById('formDccStatus').value = item.dccStatus || '';
    document.getElementById('formManufacturer').value = item.manufacturer || '';
    document.getElementById('formLivery').value = item.livery || '';
    document.getElementById('formPrice').value = item.purchasePrice || '';
    document.getElementById('formCurrentValue').value = item.currentValue || '';
    document.getElementById('formPlace').value = item.placeOfPurchase || '';
    document.getElementById('formPurchaseDate').value = item.purchaseDate || '';
    document.getElementById('formStorageLocation').value = item.storageLocation || '';
    document.getElementById('formServiceDate').value = item.lastServiceDate || '';
    document.getElementById('formGoesWellWith').value = item.goesWellWith || '';
    document.getElementById('formHistory').value = item.historicalBackground || '';
    document.getElementById('formWishlist').checked = item.wishlist || false;
    // Populate wishlist spotted fields
    const wnEl = document.getElementById('formWishlistNotes');
    const wsaEl = document.getElementById('formWishlistSpottedAt');
    const wspEl = document.getElementById('formWishlistSpottedPrice');
    if (wnEl) wnEl.value = item.wishlistNotes || '';
    if (wsaEl) wsaEl.value = item.wishlistSpottedAt || '';
    if (wspEl) wspEl.value = item.wishlistSpottedPrice || '';
    this.toggleWishlistFields();

    // Fetch known tags for autocomplete, then render item's tags
    await this.loadKnownTags();
    this.renderFormTags(item.tags || []);

    this.renderUploadPreviews();
    document.getElementById('itemModal').classList.add('active');
  },

  closeModal() {
    document.getElementById('itemModal').classList.remove('active');
    this.editingItem = null;
    this.pendingImages = [];
    this.existingImages = [];
  },

  clearForm() {
    document.getElementById('itemForm').reset();
    document.getElementById('uploadPreviews').innerHTML = '';
  },

  populateCategorySelects(selectedCat = '') {
    const catSelect = document.getElementById('formCategory');
    catSelect.innerHTML = '<option value="">Select category...</option>';
    this.categories.forEach(cat => {
      catSelect.innerHTML += `<option value="${cat.id}" ${cat.id === selectedCat ? 'selected' : ''}>${cat.name}</option>`;
    });
    if (selectedCat) this.updateSubcategories();
  },

  updateSubcategories() {
    const catId = document.getElementById('formCategory').value;
    const subSelect = document.getElementById('formSubcategory');
    subSelect.innerHTML = '<option value="">Select subcategory...</option>';
    const cat = this.categories.find(c => c.id === catId);
    if (!cat) return;
    cat.subcategories.forEach(sub => {
      subSelect.innerHTML += `<option value="${sub.id}">${sub.name}</option>`;
    });
    // Only attach the listener once using a flag
    if (!subSelect._chipsListenerAttached) {
      subSelect.addEventListener('change', () => {
        const subId = subSelect.value;
        if (subId) this.showGoesWellWithChips(subId);
      });
      subSelect._chipsListenerAttached = true;
    }
  },

  // ==================== Image Upload ====================

  // ==================== Image Upload ====================

  handleFileSelect(event) {
    const files = Array.from(event.target.files);
    this.addFiles(files);
    event.target.value = '';
  },

  handleDrop(event) {
    event.preventDefault();
    event.target.closest('.upload-area').classList.remove('dragover');
    const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    this.addFiles(files);
  },

  addFiles(files) {
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        this.toast(`${file.name} is too large (max 10MB)`, 'error');
        continue;
      }
      this.pendingImages.push(file);
    }
    this.renderUploadPreviews();
  },

  renderUploadPreviews() {
    const container = document.getElementById('uploadPreviews');
    container.innerHTML = '';

    this.existingImages.forEach((url, i) => {
      const div = document.createElement('div');
      div.className = 'upload-preview';
      const hasFocal = this._focalPoints && this._focalPoints[url];
      div.innerHTML = `
        <img src="${url}" alt="Photo">
        <button class="upload-preview-remove" onclick="app.removeExistingImage(${i})">&times;</button>
        <button class="upload-preview-focal ${hasFocal ? 'has-focal' : ''}" onclick="event.stopPropagation();app.openFocalPicker(${i})" title="Set thumbnail focus">📌</button>
      `;
      container.appendChild(div);
    });

    this.pendingImages.forEach((file, i) => {
      const div = document.createElement('div');
      div.className = 'upload-preview';
      const img = document.createElement('img');
      const reader = new FileReader();
      reader.onload = e => { img.src = e.target.result; };
      reader.readAsDataURL(file);
      div.appendChild(img);

      const btn = document.createElement('button');
      btn.className = 'upload-preview-remove';
      btn.innerHTML = '&times;';
      btn.onclick = () => this.removePendingImage(i);
      div.appendChild(btn);

      container.appendChild(div);
    });

    // Initialize drag-drop reordering
    setTimeout(() => this.initDragDrop(), 50);
  },

  removePendingImage(index) {
    this.pendingImages.splice(index, 1);
    this.renderUploadPreviews();
  },

  removeExistingImage(index) {
    this.existingImages.splice(index, 1);
    this.renderUploadPreviews();
  },

  async uploadImages() {
    if (this.pendingImages.length === 0) return [];
    const formData = new FormData();
    this.pendingImages.forEach(file => formData.append('photos', file));
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Image upload failed');
    const data = await res.json();
    return data.files || [];
  },

  // ==================== Save Item / Delete ====================

  // ==================== Save Item ====================

  async saveItem(event) {
    if (event) event.preventDefault();

    const name = document.getElementById('formName').value.trim();
    const categoryId = document.getElementById('formCategory').value;
    const subcategoryId = document.getElementById('formSubcategory').value;

    if (!name) { this.toast('Name is required', 'error'); return; }
    if (!categoryId) { this.toast('Please select a category', 'error'); return; }
    if (!subcategoryId) { this.toast('Please select a subcategory', 'error'); return; }

    try {
      const newImageUrls = await this.uploadImages();
      const allImages = [...this.existingImages, ...newImageUrls];

      // Get tags from the form
      const tags = this.getFormTags();

      const itemData = {
        name,
        categoryId,
        subcategoryId,
        runningNumber: document.getElementById('formRunningNumber').value.trim(),
        productCode: document.getElementById('formProductCode').value.trim(),
        condition: document.getElementById('formCondition').value,
        dccStatus: document.getElementById('formDccStatus').value,
        manufacturer: document.getElementById('formManufacturer').value.trim(),
        livery: document.getElementById('formLivery').value.trim(),
        purchasePrice: document.getElementById('formPrice').value || 0,
        currentValue: document.getElementById('formCurrentValue').value || 0,
        placeOfPurchase: document.getElementById('formPlace').value.trim(),
        purchaseDate: document.getElementById('formPurchaseDate').value,
        storageLocation: document.getElementById('formStorageLocation').value.trim(),
        lastServiceDate: document.getElementById('formServiceDate').value,
        goesWellWith: document.getElementById('formGoesWellWith').value.trim(),
        historicalBackground: document.getElementById('formHistory').value.trim(),
        wishlist: document.getElementById('formWishlist').checked,
        wishlistNotes: document.getElementById('formWishlistNotes')?.value.trim() || '',
        wishlistSpottedPrice: document.getElementById('formWishlistSpottedPrice')?.value || 0,
        wishlistSpottedAt: document.getElementById('formWishlistSpottedAt')?.value.trim() || '',
        tags: tags,
        images: allImages,
        imageFocalPoints: this._focalPoints || {}
      };

      if (this.editingItem) {
        await this.api(`/api/items/${this.editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        });
        this.toast('All polished up \u2014 item updated!');
      } else {
        await this.api('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        });
        this.toast('Welcome to the shed \u2014 new item added!');
      }

      this.closeModal();
      await this.loadAllItems(); // refresh for suggest
      await this.loadStats();

      if (this.currentView === 'detail' && this.editingItem) {
        this.showDetail(this.editingItem.id);
      } else {
        this.showCatalog(this.currentFilter);
      }
    } catch (e) { /* toast already shown */ }
  },

  // ==================== Delete ====================

  async confirmDelete(id) {
    const item = this.detailItem || this.items.find(i => i.id === id);
    const name = item ? item.name : 'this item';
    const ok = await this.showConfirmModal({
      title: 'Send to the bin?',
      message: `<strong>${this.esc(name)}</strong> will be moved to the recycle bin. You can restore it within 30 days.`,
      confirmText: 'Move to bin',
      confirmClass: 'btn-outline',
      icon: '🗑️'
    });
    if (ok) this.deleteItem(id);
  },

  async deleteItem(id) {
    try {
      await this.api(`/api/items/${id}`, { method: 'DELETE' });
      this.toast('Moved to the bin \u2014 you can restore it from Settings for 30 days.');
      await this.loadAllItems();
      await this.loadStats();
      this.showCatalog(this.currentFilter);
    } catch (e) { /* toast shown */ }
  },

  // ==================== Tags Management ====================

  // ==================== Tags Management ====================

  // --- All known tags (fetched once per form open, shared across helpers) ---
  _allKnownTags: [],

  async loadKnownTags() {
    try {
      const tags = await this.api('/api/tags');
      this._allKnownTags = tags.map(t => t.name).sort((a, b) => a.localeCompare(b));
    } catch { this._allKnownTags = []; }
  },

  renderFormTags(tags) {
    const container = document.getElementById('formTagsContainer');
    if (!container) return;
    container.innerHTML = tags.map(tag => `
      <span class="tag-chip">
        ${this.esc(tag)}
        <span class="tag-chip-remove" onclick="app.removeFormTag('${this.esc(tag)}')">×</span>
      </span>
    `).join('');
    this.renderTagSuggestionChips(tags);
  },

  /** Show clickable chips for existing tags not yet added */
  renderTagSuggestionChips(currentTags) {
    const container = document.getElementById('tagSuggestionsChips');
    if (!container) return;
    const remaining = this._allKnownTags.filter(t => !currentTags.includes(t));
    if (remaining.length === 0) { container.innerHTML = ''; return; }
    container.innerHTML = remaining.map(tag => `
      <span class="tag-suggestion-chip" onclick="app.addTagByName('${this.esc(tag)}')">#${this.esc(tag)}</span>
    `).join('');
  },

  /** Populate the <datalist> with tags not yet applied */
  filterTagSuggestions() {
    const dl = document.getElementById('tagSuggestions');
    if (!dl) return;
    const currentTags = this.getFormTags();
    const input = (document.getElementById('formTags')?.value || '').toLowerCase();
    const matches = this._allKnownTags
      .filter(t => !currentTags.includes(t))
      .filter(t => !input || t.toLowerCase().includes(input));
    dl.innerHTML = matches.map(t => `<option value="${this.esc(t)}">`).join('');
  },

  getFormTags() {
    const container = document.getElementById('formTagsContainer');
    if (!container) return [];
    const chips = container.querySelectorAll('.tag-chip');
    return Array.from(chips).map(chip => {
      const text = chip.textContent.trim();
      return text.replace(/×$/, '').trim();
    });
  },

  removeFormTag(tag) {
    const tags = this.getFormTags();
    const idx = tags.indexOf(tag);
    if (idx !== -1) {
      tags.splice(idx, 1);
      this.renderFormTags(tags);
    }
  },

  /** Add tag from the text input (called by Add button or Enter key) */
  addTagFromInput() {
    const input = document.getElementById('formTags');
    if (!input) return;
    const tag = input.value.trim();
    if (!tag) return;
    const tags = this.getFormTags();
    if (!tags.includes(tag)) {
      tags.push(tag);
      this.renderFormTags(tags);
    }
    input.value = '';
    this.filterTagSuggestions();
    input.focus();
  },

  /** Add a known tag by clicking its suggestion chip */
  addTagByName(tag) {
    const tags = this.getFormTags();
    if (!tags.includes(tag)) {
      tags.push(tag);
      this.renderFormTags(tags);
    }
    const input = document.getElementById('formTags');
    if (input) { input.value = ''; input.focus(); }
  },

  handleTagInput(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTagFromInput();
    }
  },

  // ==================== Focal Point Picker ====================

  openFocalPicker(imageIndex) {
    const url = this.existingImages[imageIndex];
    if (!url) return;

    const existing = this._focalPoints && this._focalPoints[url];

    const overlay = document.createElement('div');
    overlay.className = 'focal-picker-overlay';
    overlay.innerHTML = `
      <div class="focal-picker-container">
        <p class="focal-picker-hint">Tap where the thumbnail should focus</p>
        <div class="focal-picker-image-wrap">
          <img src="${url}" class="focal-picker-img" alt="Pick focal point">
          <div class="focal-picker-crosshair" style="${existing ? `left:${existing.x}%;top:${existing.y}%` : 'display:none'}"></div>
        </div>
        <div class="focal-picker-actions">
          <button class="btn btn-outline btn-sm" onclick="app.closeFocalPicker(false)">Cancel</button>
          ${existing ? '<button class="btn btn-outline btn-sm" onclick="app.clearFocalPoint()">Reset</button>' : ''}
          <button class="btn btn-primary btn-sm" onclick="app.closeFocalPicker(true)">Set Focus</button>
        </div>
      </div>
    `;

    this._focalPickerUrl = url;
    this._focalPickerValue = existing ? { ...existing } : null;

    // Tap / click handler on the image
    const imgWrap = overlay.querySelector('.focal-picker-image-wrap');
    const crosshair = overlay.querySelector('.focal-picker-crosshair');
    const setPoint = (e) => {
      const rect = imgWrap.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
      crosshair.style.left = x + '%';
      crosshair.style.top = y + '%';
      crosshair.style.display = '';
      this._focalPickerValue = { x: Math.round(x), y: Math.round(y) };
    };
    imgWrap.addEventListener('click', setPoint);
    imgWrap.addEventListener('touchstart', (e) => { e.preventDefault(); setPoint(e); }, { passive: false });

    document.body.appendChild(overlay);
    this._focalPickerOverlay = overlay;
  },

  clearFocalPoint() {
    this._focalPickerValue = null;
    const ch = this._focalPickerOverlay?.querySelector('.focal-picker-crosshair');
    if (ch) ch.style.display = 'none';
  },

  closeFocalPicker(save) {
    if (save && this._focalPickerUrl) {
      if (this._focalPickerValue) {
        if (!this._focalPoints) this._focalPoints = {};
        this._focalPoints[this._focalPickerUrl] = this._focalPickerValue;
      } else {
        delete this._focalPoints[this._focalPickerUrl];
      }
      this.renderUploadPreviews();
    }
    if (this._focalPickerOverlay) {
      this._focalPickerOverlay.remove();
      this._focalPickerOverlay = null;
    }
  },

  // ==================== Wishlist fields + Product Code auto-detect ====================

  // ==================== Product Code Auto-Detect Manufacturer ====================

  toggleWishlistFields() {
    const isWishlist = document.getElementById('formWishlist').checked;
    const group = document.getElementById('wishlistFieldsGroup');
    if (group) group.style.display = isWishlist ? '' : 'none';
  },

  autoDetectManufacturer() {
    const productCode = document.getElementById('formProductCode').value.trim().toUpperCase();
    if (!productCode) return;

    let detected = '';
    if (productCode.startsWith('R')) detected = 'Hornby';
    else if (productCode.match(/^3[1238]-/)) detected = 'Bachmann';
    else if (productCode.startsWith('4S-')) detected = 'Dapol';
    else if (productCode.startsWith('OR76-')) detected = 'Oxford Rail';
    else if (productCode.startsWith('ACC')) detected = 'Accurascale';

    if (detected) {
      document.getElementById('formManufacturer').value = detected;
    }
  },

  // ==================== Duplicate Detection + Wishlist Notes ====================

  // ==================== Duplicate Detection ====================

  async checkDuplicate() {
    const productCode = document.getElementById('formProductCode').value.trim();
    if (!productCode || productCode.length < 2) return;
    // Don't check against self when editing
    try {
      const data = await this.api('/api/items/check-duplicate?productCode=' + encodeURIComponent(productCode));
      const dupes = data.duplicates.filter(d => !this.editingItem || d.id !== this.editingItem.id);
      if (dupes.length > 0) {
        this.toast(`Heads up! Product code "${productCode}" is already in your collection (${dupes[0].name}). Still good to add another if it's a different model!`, 'error');
      }
    } catch(e) { /* silent */ }
  },

  // ==================== Wishlist Notes ====================

  renderWishlistSpotted(item) {
    if (!item.wishlist) return '';
    const hasNotes = item.wishlistNotes || item.wishlistSpottedAt || item.wishlistSpottedPrice;
    if (!hasNotes) return '';
    return `
      <div class="wishlist-spotted">
        <div class="wishlist-spotted-label">Spotted Info</div>
        ${item.wishlistSpottedAt ? `<div>Where: ${this.esc(item.wishlistSpottedAt)}</div>` : ''}
        ${item.wishlistSpottedPrice ? `<div>Price: ${this.settings.currency}${item.wishlistSpottedPrice.toFixed(2)}</div>` : ''}
        ${item.wishlistNotes ? `<div>Notes: ${this.esc(item.wishlistNotes)}</div>` : ''}
      </div>
    `;
  },

});
