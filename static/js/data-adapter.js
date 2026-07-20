/**
 * Train Depot - Data Adapter
 *
 * Provides a unified data access layer that works in three modes:
 *   1. API mode (Docker) — calls the existing Node.js server via fetch()
 *   2. Tauri mode (Desktop) — calls Rust backend via Tauri invoke()
 *   3. Capacitor mode (Mobile) — calls local SQLite via Capacitor plugin
 *
 * The rest of the frontend code calls this adapter instead of fetch() directly.
 * No other UI code needs to change when switching modes.
 */

const DataAdapter = {
  mode: 'api', // 'api' | 'tauri' | 'capacitor'

  // Set the mode at startup
  init(mode) {
    this.mode = mode;
  },

  // Generic request — the frontend calls this instead of fetch()
  async request(endpoint, options = {}) {
    if (this.mode === 'api') {
      return this._apiRequest(endpoint, options);
    }
    if (this.mode === 'tauri') {
      return this._tauriRequest(endpoint, options);
    }
    if (this.mode === 'capacitor') {
      return this._capacitorRequest(endpoint, options);
    }
    throw new Error(`Unknown data adapter mode: ${this.mode}`);
  },

  // ── API mode (Docker) ──────────────────────────────────────
  async _apiRequest(endpoint, options = {}) {
    const res = await fetch(endpoint, options);
    if (res.status === 401) {
      window.location.href = '/login.html';
      throw new Error('Session expired');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // ── Tauri mode (Desktop) ────────────────────────────────────
  async _tauriRequest(endpoint, options = {}) {
    // Tauri v2: invoke is on __TAURI_INTERNALS__, not __TAURI__
    const invoke = window.__TAURI_INTERNALS__?.invoke
                || window.__TAURI__?.core?.invoke;
    if (!invoke) throw new Error('Tauri bridge not available');

    const httpMethod = options.method || 'GET';
    const [urlPath, search] = this._parseEndpoint(endpoint);
    const command = this._endpointToCommand(httpMethod, urlPath);
    const args = this._buildArgs(httpMethod, urlPath, options);

    try {
      const result = await invoke(command, args);
      // Resolve image filenames to local file URLs for items responses
      if (Array.isArray(result) && result.length > 0 && result[0].images) {
        return this._resolveImageUrls(result);
      }
      if (result && result.images) {
        const resolved = await this._resolveImageUrls([result]);
        return resolved[0];
      }
      return result;
    } catch (e) {
      throw new Error(typeof e === 'string' ? e : e.message || 'Request failed');
    }
  },

  // Resolve image filenames to local file URLs in Tauri mode
  async _resolveImageUrls(items) {
    const invoke = window.__TAURI_INTERNALS__?.invoke
                || window.__TAURI__?.core?.invoke;
    if (!invoke) return items;
    try {
      const uploadDir = await invoke('get_upload_dir');
      // Tauri v2: use asset protocol directly
      // asset://localhost/<path> is the standard Tauri v2 asset URL
      for (const item of items) {
        if (item.images && item.images.length > 0) {
          item.images = item.images.map(fn => {
            if (fn.startsWith('http://') || fn.startsWith('https://') || fn.startsWith('asset://')) {
              return fn;
            }
            return `asset://localhost/${encodeURI(`${uploadDir}/${fn}`)}`;
          });
        }
      }
    } catch (e) {
      // If upload dir fails, leave images as-is
    }
    return items;
  },

  // ── Capacitor mode (Mobile) ─────────────────────────────────
  async _capacitorRequest(endpoint, options = {}) {
    // Capacitor SQLite plugin — direct local database access
    const db = window.__CAPACITOR_SQLITE__;
    if (!db) throw new Error('Capacitor SQLite not available');

    const httpMethod = options.method || 'GET';
    const [urlPath, search] = this._parseEndpoint(endpoint);
    return this._executeDbQuery(httpMethod, urlPath, options);
  },

  // ── Helpers ─────────────────────────────────────────────────
  _parseEndpoint(endpoint) {
    const parts = endpoint.split('?');
    const path = parts[0];
    const search = parts[1] || '';
    return [path, search];
  },

  _endpointToCommand(method, path) {
    // Map REST paths to Tauri command names
    const routeMap = {
      'GET /api/settings': 'get_settings',
      'PUT /api/settings': 'update_settings',
      'GET /api/categories': 'get_categories',
      'GET /api/items/': 'get_item',
      'GET /api/items': 'get_items',
      'POST /api/items': 'create_item',
      'PUT /api/items/': 'update_item',
      'DELETE /api/items/': 'delete_item',
      'GET /api/stats': 'get_stats',
      'GET /api/export': 'export_data',
      'POST /api/import': 'import_data',
      'GET /api/tags': 'get_tags',
      'GET /api/trash': 'get_trash',
      'POST /api/trash/': 'restore_from_trash',
      'DELETE /api/trash/': 'permanently_delete',
      'GET /api/health-check': 'health_check',
      'GET /api/share/status': 'get_share_status',
      'POST /api/share/enable': 'enable_share',
      'POST /api/share/disable': 'disable_share',
      'GET /api/auth/status': 'auth_status',
      'POST /api/auth/change-password': 'change_password',
      'POST /api/auth/remove-password': 'remove_password',
      'POST /api/auth/logout': 'logout',
      'GET /api/layout': 'get_layout',
      'POST /api/layout/hero': 'update_layout_hero',
      'POST /api/layout/zones': 'create_layout_zone',
      'PUT /api/layout/zones/': 'update_layout_zone',
      'DELETE /api/layout/zones/': 'delete_layout_zone',
    };

    // Try exact match first
    const key = `${method} ${path}`;
    if (routeMap[key]) return routeMap[key];

    // Try prefix match for parameterised routes
    for (const [route, cmd] of Object.entries(routeMap)) {
      const [rMethod, rPath] = route.split(' ');
      if (method === rMethod && path.startsWith(rPath)) {
        return cmd;
      }
    }

    throw new Error(`No Tauri command mapped for ${method} ${path}`);
  },

  _buildArgs(method, path, options) {
    // Extract IDs from paths like /api/items/abc-123
    const idMatch = path.match(/\/api\/[^/]+\/([a-f0-9-]+)/);
    const id = idMatch ? idMatch[1] : null;

    const args = {};
    if (id) args.id = id;
    if (options.body) {
      try {
        args.data = JSON.parse(options.body);
      } catch {
        args.data = options.body;
      }
    }
    if (options.method === 'DELETE' && id) args.id = id;
    return args;
  },

  // ── SQLite query builder (for Capacitor) ────────────────────
  async _executeDbQuery(method, path, options) {
    // This will be implemented when we set up Capacitor
    // For now, fall back to API mode
    return this._apiRequest(path, options);
  }
};

// Auto-detect mode from the environment
(function detectMode() {
  if (window.__TAURI_INTERNALS__ || window.__TAURI__) {
    DataAdapter.init('tauri');
  } else if (window.__CAPACITOR__) {
    DataAdapter.init('capacitor');
  } else {
    DataAdapter.init('api');
  }
})();
