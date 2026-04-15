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
    document.getElementById('modalTitle').textContent = 'Add New Item';
    this.populateCategorySelects();
    this.clearForm();
    // Set smart defaults
    document.getElementById('formCondition').value = 'excellent-boxed';
    document.getElementById('formDccStatus').value = 'analogue';
    // Initialize empty tags
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

    // Render tags
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
      div.innerHTML = `
        <img src="${url}" alt="Photo">
        <button class="upload-preview-remove" onclick="app.removeExistingImage(${i})">&times;</button>
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
        images: allImages
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

  renderFormTags(tags) {
    const container = document.getElementById('formTagsContainer');
    if (!container) return;
    container.innerHTML = tags.map(tag => `
      <span class="tag-chip">
        ${this.esc(tag)}
        <span class="tag-chip-remove" onclick="app.removeFormTag('${this.esc(tag)}')">×</span>
      </span>
    `).join('');
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

  handleTagInput(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const input = document.getElementById('formTags');
      const tag = input.value.trim();
      if (!tag) return;

      const tags = this.getFormTags();
      if (!tags.includes(tag)) {
        tags.push(tag);
        this.renderFormTags(tags);
      }
      input.value = '';
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
