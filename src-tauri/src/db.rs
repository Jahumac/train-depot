use crate::{AppSettings, CatalogItem, Category, CollectionStats, Subcategory};
use chrono::Utc;
use rand::Rng;
use rusqlite::{params, Connection};
use sha2::{Digest, Sha256};
use std::path::Path;
use uuid::Uuid;

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(path: &str) -> Result<Self, String> {
        // Ensure directory exists
        if let Some(parent) = Path::new(path).parent() {
            std::fs::create_dir_all(parent).map_err(|e| format!("Failed to create data dir: {}", e))?;
        }

        let conn = Connection::open(path).map_err(|e| format!("Failed to open database: {}", e))?;

        // Enable WAL mode for performance
        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")
            .map_err(|e| e.to_string())?;

        let mut db = Database { conn };
        db.migrate()?;
        Ok(db)
    }

    fn migrate(&mut self) -> Result<(), String> {
        self.conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS settings (
                key   TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS categories (
                id   TEXT PRIMARY KEY,
                name TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS subcategories (
                id        TEXT PRIMARY KEY,
                name      TEXT NOT NULL,
                parent_id TEXT NOT NULL REFERENCES categories(id)
            );

            CREATE TABLE IF NOT EXISTS items (
                id                  TEXT PRIMARY KEY,
                name                TEXT NOT NULL,
                category_id         TEXT NOT NULL,
                subcategory_id      TEXT NOT NULL,
                manufacturer        TEXT DEFAULT '',
                livery              TEXT DEFAULT '',
                running_number      TEXT DEFAULT '',
                product_code        TEXT DEFAULT '',
                condition           TEXT DEFAULT '',
                dcc_status          TEXT DEFAULT '',
                purchase_price      REAL DEFAULT 0,
                current_value       REAL DEFAULT 0,
                place_of_purchase   TEXT DEFAULT '',
                purchase_date       TEXT DEFAULT '',
                storage_location    TEXT DEFAULT '',
                last_service_date   TEXT DEFAULT '',
                goes_well_with      TEXT DEFAULT '',
                historical_background TEXT DEFAULT '',
                wishlist            INTEGER DEFAULT 0,
                wishlist_notes      TEXT DEFAULT '',
                wishlist_spotted_at TEXT DEFAULT '',
                wishlist_spotted_price REAL DEFAULT 0,
                tags                TEXT DEFAULT '',
                images              TEXT DEFAULT '[]',
                created_at          TEXT DEFAULT (datetime('now')),
                updated_at          TEXT DEFAULT (datetime('now')),
                deleted_at          TEXT DEFAULT NULL
            );

            CREATE TABLE IF NOT EXISTS tags (
                name TEXT PRIMARY KEY
            );

            CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
            CREATE INDEX IF NOT EXISTS idx_items_subcategory ON items(subcategory_id);
            CREATE INDEX IF NOT EXISTS idx_items_deleted ON items(deleted_at);
            ",
        )
        .map_err(|e| format!("Migration failed: {}", e))?;

        // Seed default categories if empty
        let count: i64 = self
            .conn
            .query_row("SELECT COUNT(*) FROM categories", [], |row| row.get(0))
            .map_err(|e| e.to_string())?;

        if count == 0 {
            self.seed_categories()?;
        }

        Ok(())
    }

    fn seed_categories(&mut self) -> Result<(), String> {
        let cats = vec![
            ("locomotives", "Locomotives"),
            ("rolling-stock", "Rolling Stock"),
        ];
        let subcats = vec![
            ("steam-pre-grouping", "Steam - Pre-Grouping", "locomotives"),
            ("steam-lner", "Steam - LNER", "locomotives"),
            ("steam-lms", "Steam - LMS", "locomotives"),
            ("steam-southern", "Steam - Southern", "locomotives"),
            ("steam-gwr", "Steam - GWR", "locomotives"),
            ("steam-br", "Steam - BR", "locomotives"),
            ("diesel", "Diesel Locomotives", "locomotives"),
            ("multiple-units", "Multiple Units", "locomotives"),
            ("rs-pre-grouping", "Pre-Grouping", "rolling-stock"),
            ("rs-lner", "LNER", "rolling-stock"),
            ("rs-lms", "LMS", "rolling-stock"),
            ("rs-southern", "Southern", "rolling-stock"),
            ("rs-gwr", "GWR", "rolling-stock"),
            ("rs-br", "BR", "rolling-stock"),
            ("rs-nationalisation", "Nationalisation Onwards", "rolling-stock"),
        ];

        for (id, name) in cats {
            self.conn
                .execute("INSERT OR IGNORE INTO categories (id, name) VALUES (?1, ?2)", params![id, name])
                .map_err(|e| e.to_string())?;
        }
        for (id, name, parent) in subcats {
            self.conn
                .execute(
                    "INSERT OR IGNORE INTO subcategories (id, name, parent_id) VALUES (?1, ?2, ?3)",
                    params![id, name, parent],
                )
                .map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    // ── Settings ────────────────────────────────────────────────────────────

    pub fn get_settings(&self) -> Result<AppSettings, String> {
        let mut settings = AppSettings::default();
        let mut stmt = self.conn.prepare("SELECT key, value FROM settings").map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })
            .map_err(|e| e.to_string())?;

        for row in rows {
            let (key, value) = row.map_err(|e| e.to_string())?;
            match key.as_str() {
                "app_name" => settings.app_name = value,
                "tagline" => settings.tagline = value,
                "currency" => settings.currency = value,
                "service_interval_days" => settings.service_interval_days = value.parse().unwrap_or(365),
                "password_hash" => settings.password_hash = value,
                "password_salt" => settings.password_salt = value,
                "share_token" => settings.share_token = value,
                "ebay_app_id" => settings.ebay_app_id = value,
                "ebay_cert_id" => settings.ebay_cert_id = value,
                "ebay_sandbox" => settings.ebay_sandbox = value == "true",
                "ebay_gauge" => settings.ebay_gauge = value,
                "valuation_auto_refresh" => settings.valuation_auto_refresh = value != "false",
                "valuation_refresh_days" => settings.valuation_refresh_days = value.parse().unwrap_or(7),
                _ => {}
            }
        }
        Ok(settings)
    }

    pub fn update_settings(&self, data: &AppSettings) -> Result<(), String> {
        let service_days = data.service_interval_days.to_string();
        let sandbox = if data.ebay_sandbox { "true" } else { "false" };
        let auto_refresh = if data.valuation_auto_refresh { "true" } else { "false" };
        let refresh_days = data.valuation_refresh_days.to_string();

        let pairs: Vec<(&str, &str)> = vec![
            ("app_name", &data.app_name),
            ("tagline", &data.tagline),
            ("currency", &data.currency),
            ("service_interval_days", &service_days),
            ("ebay_gauge", &data.ebay_gauge),
            ("ebay_sandbox", &sandbox),
            ("valuation_auto_refresh", &auto_refresh),
            ("valuation_refresh_days", &refresh_days),
        ];

        for (key, value) in pairs {
            self.conn
                .execute(
                    "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
                    params![key, value],
                )
                .map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    // ── Categories ──────────────────────────────────────────────────────────

    pub fn get_categories(&self) -> Result<Vec<Category>, String> {
        let mut cat_stmt = self.conn.prepare("SELECT id, name FROM categories").map_err(|e| e.to_string())?;
        let mut sub_stmt = self
            .conn
            .prepare("SELECT id, name, parent_id FROM subcategories WHERE parent_id = ?1")
            .map_err(|e| e.to_string())?;

        let categories = cat_stmt
            .query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .map(|(id, name)| {
                let subcategories: Vec<Subcategory> = sub_stmt
                    .query_map(params![&id], |row| {
                        Ok(Subcategory {
                            id: row.get(0)?,
                            name: row.get(1)?,
                            parent: row.get(2)?,
                        })
                    })
                    .map_err(|e| e.to_string())
                    .map(|rows| rows.filter_map(|r| r.ok()).collect())
                    .unwrap_or_default();

                Category {
                    id,
                    name,
                    subcategories,
                }
            })
            .collect();

        Ok(categories)
    }

    // ── Items ───────────────────────────────────────────────────────────────

    pub fn get_items(&self) -> Result<Vec<CatalogItem>, String> {
        let mut stmt = self
            .conn
            .prepare(
                "SELECT id, name, category_id, subcategory_id, manufacturer, livery,
                        running_number, product_code, condition, dcc_status,
                        purchase_price, current_value, place_of_purchase, purchase_date,
                        storage_location, last_service_date, goes_well_with,
                        historical_background, wishlist, wishlist_notes,
                        wishlist_spotted_at, wishlist_spotted_price, tags, images,
                        created_at, updated_at
                 FROM items WHERE deleted_at IS NULL
                 ORDER BY created_at DESC",
            )
            .map_err(|e| e.to_string())?;

        let items = stmt
            .query_map([], |row| {
                let images_str: String = row.get(23)?;
                let images: Vec<String> = serde_json::from_str(&images_str).unwrap_or_default();

                Ok(CatalogItem {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    category_id: row.get(2)?,
                    subcategory_id: row.get(3)?,
                    manufacturer: row.get(4)?,
                    livery: row.get(5)?,
                    running_number: row.get(6)?,
                    product_code: row.get(7)?,
                    condition: row.get(8)?,
                    dcc_status: row.get(9)?,
                    purchase_price: row.get(10)?,
                    current_value: row.get(11)?,
                    place_of_purchase: row.get(12)?,
                    purchase_date: row.get(13)?,
                    storage_location: row.get(14)?,
                    last_service_date: row.get(15)?,
                    goes_well_with: row.get(16)?,
                    historical_background: row.get(17)?,
                    wishlist: row.get::<_, i64>(18)? != 0,
                    wishlist_notes: row.get(19)?,
                    wishlist_spotted_at: row.get(20)?,
                    wishlist_spotted_price: row.get(21)?,
                    tags: row.get(22)?,
                    images,
                    created_at: row.get(24)?,
                    updated_at: row.get(25)?,
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        Ok(items)
    }

    pub fn create_item(&self, mut data: CatalogItem) -> Result<CatalogItem, String> {
        data.id = Uuid::new_v4().to_string();
        let now = Utc::now().format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string();
        data.created_at = now.clone();
        data.updated_at = now;

        let images_json = serde_json::to_string(&data.images).unwrap_or_else(|_| "[]".into());

        self.conn
            .execute(
                "INSERT INTO items (id, name, category_id, subcategory_id, manufacturer, livery,
                 running_number, product_code, condition, dcc_status,
                 purchase_price, current_value, place_of_purchase, purchase_date,
                 storage_location, last_service_date, goes_well_with,
                 historical_background, wishlist, wishlist_notes,
                 wishlist_spotted_at, wishlist_spotted_price, tags, images,
                 created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10,
                         ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20,
                         ?21, ?22, ?23, ?24, ?25, ?26)",
                params![
                    data.id, data.name, data.category_id, data.subcategory_id,
                    data.manufacturer, data.livery, data.running_number, data.product_code,
                    data.condition, data.dcc_status, data.purchase_price, data.current_value,
                    data.place_of_purchase, data.purchase_date, data.storage_location,
                    data.last_service_date, data.goes_well_with, data.historical_background,
                    data.wishlist as i64, data.wishlist_notes, data.wishlist_spotted_at,
                    data.wishlist_spotted_price, data.tags, images_json,
                    data.created_at, data.updated_at,
                ],
            )
            .map_err(|e| format!("Failed to create item: {}", e))?;

        // Update tags
        self.sync_tags(&data.tags)?;

        Ok(data)
    }

    pub fn update_item(&self, id: &str, data: &CatalogItem) -> Result<(), String> {
        let now = Utc::now().format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string();
        let images_json = serde_json::to_string(&data.images).unwrap_or_else(|_| "[]".into());

        self.conn
            .execute(
                "UPDATE items SET name=?1, category_id=?2, subcategory_id=?3, manufacturer=?4,
                 livery=?5, running_number=?6, product_code=?7, condition=?8, dcc_status=?9,
                 purchase_price=?10, current_value=?11, place_of_purchase=?12, purchase_date=?13,
                 storage_location=?14, last_service_date=?15, goes_well_with=?16,
                 historical_background=?17, wishlist=?18, wishlist_notes=?19,
                 wishlist_spotted_at=?20, wishlist_spotted_price=?21, tags=?22, images=?23,
                 updated_at=?24
                 WHERE id=?25 AND deleted_at IS NULL",
                params![
                    data.name, data.category_id, data.subcategory_id,
                    data.manufacturer, data.livery, data.running_number, data.product_code,
                    data.condition, data.dcc_status, data.purchase_price, data.current_value,
                    data.place_of_purchase, data.purchase_date, data.storage_location,
                    data.last_service_date, data.goes_well_with, data.historical_background,
                    data.wishlist as i64, data.wishlist_notes, data.wishlist_spotted_at,
                    data.wishlist_spotted_price, data.tags, images_json, now, id,
                ],
            )
            .map_err(|e| format!("Failed to update item: {}", e))?;

        self.sync_tags(&data.tags)?;
        Ok(())
    }

    pub fn delete_item(&self, id: &str) -> Result<(), String> {
        // Soft delete — move to trash
        let now = Utc::now().format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string();
        self.conn
            .execute(
                "UPDATE items SET deleted_at=?1, updated_at=?1 WHERE id=?2 AND deleted_at IS NULL",
                params![now, id],
            )
            .map_err(|e| format!("Failed to delete item: {}", e))?;
        Ok(())
    }

    // ── Stats ───────────────────────────────────────────────────────────────

    pub fn get_stats(&self) -> Result<CollectionStats, String> {
        let total_items: i64 = self
            .conn
            .query_row(
                "SELECT COUNT(*) FROM items WHERE deleted_at IS NULL",
                [],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        let total_spent: f64 = self
            .conn
            .query_row(
                "SELECT COALESCE(SUM(purchase_price), 0) FROM items WHERE deleted_at IS NULL",
                [],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        let total_current_value: f64 = self
            .conn
            .query_row(
                "SELECT COALESCE(SUM(current_value), 0) FROM items WHERE deleted_at IS NULL",
                [],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        let locomotive_count: i64 = self
            .conn
            .query_row(
                "SELECT COUNT(*) FROM items WHERE category_id='locomotives' AND deleted_at IS NULL",
                [],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        let rolling_stock_count: i64 = self
            .conn
            .query_row(
                "SELECT COUNT(*) FROM items WHERE category_id='rolling-stock' AND deleted_at IS NULL",
                [],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        let total_wishlist: i64 = self
            .conn
            .query_row(
                "SELECT COUNT(*) FROM items WHERE wishlist=1 AND deleted_at IS NULL",
                [],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        let total_trash: i64 = self
            .conn
            .query_row(
                "SELECT COUNT(*) FROM items WHERE deleted_at IS NOT NULL",
                [],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        let overdue_service: i64 = self
            .conn
            .query_row(
                "SELECT COUNT(*) FROM items WHERE deleted_at IS NULL",
                [],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        Ok(CollectionStats {
            total_items,
            total_spent,
            total_current_value,
            locomotive_count,
            rolling_stock_count,
            total_wishlist,
            total_trash,
            overdue_service,
        })
    }

    // ── Tags ────────────────────────────────────────────────────────────────

    pub fn get_tags(&self) -> Result<Vec<String>, String> {
        let mut stmt = self
            .conn
            .prepare("SELECT name FROM tags ORDER BY name")
            .map_err(|e| e.to_string())?;

        let tags = stmt
            .query_map([], |row| row.get::<_, String>(0))
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        Ok(tags)
    }

    fn sync_tags(&self, tags_str: &str) -> Result<(), String> {
        let tags: Vec<&str> = tags_str.split(',').map(|t| t.trim()).filter(|t| !t.is_empty()).collect();
        for tag in tags {
            self.conn
                .execute("INSERT OR IGNORE INTO tags (name) VALUES (?1)", params![tag])
                .map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    // ── Export / Import ─────────────────────────────────────────────────────

    pub fn export_json(&self) -> Result<String, String> {
        let items = self.get_items()?;
        let settings = self.get_settings()?;
        let categories = self.get_categories()?;

        let export = serde_json::json!({
            "version": "1.4.0",
            "exportedAt": Utc::now().to_rfc3339(),
            "settings": settings,
            "categories": categories,
            "items": items,
        });

        serde_json::to_string_pretty(&export).map_err(|e| e.to_string())
    }

    pub fn import_json(&self, json_str: &str) -> Result<(), String> {
        let mut data: serde_json::Value =
            serde_json::from_str(json_str).map_err(|e| format!("Invalid JSON: {}", e))?;

        // Normalize camelCase → snake_case for Docker backup compatibility
        if let Some(items) = data["items"].as_array_mut() {
            for item_val in items.iter_mut() {
                if let Some(obj) = item_val.as_object_mut() {
                    let renames: Vec<(String, String)> = obj.keys()
                        .filter(|k| k.chars().any(|c| c.is_uppercase()))
                        .map(|k| {
                            let snake = k.chars().fold(String::new(), |mut s, c| {
                                if c.is_uppercase() {
                                    s.push('_');
                                    s.push(c.to_ascii_lowercase());
                                } else {
                                    s.push(c);
                                }
                                s
                            });
                            (k.clone(), snake)
                        })
                        .collect();
                    for (old, new) in renames {
                        if let Some(v) = obj.remove(&old) {
                            obj.insert(new, v);
                        }
                    }
                    // Normalize tags: array → comma-separated string
                    if let Some(tags_val) = obj.get("tags") {
                        if tags_val.is_array() {
                            let tags_str: String = tags_val.as_array().unwrap().iter()
                                .filter_map(|v| v.as_str())
                                .collect::<Vec<&str>>()
                                .join(",");
                            obj.insert("tags".to_string(), serde_json::Value::String(tags_str));
                        }
                    }
                    // Normalize images: array of objects → array of filenames
                    if let Some(images_val) = obj.get("images") {
                        if images_val.is_array() {
                            let filenames: Vec<serde_json::Value> = images_val.as_array().unwrap().iter()
                                .filter_map(|v| {
                                    if let Some(filename) = v.get("filename") {
                                        Some(filename.clone())
                                    } else if let Some(s) = v.as_str() {
                                        Some(serde_json::Value::String(s.to_string()))
                                    } else {
                                        None
                                    }
                                })
                                .collect();
                            obj.insert("images".to_string(), serde_json::Value::Array(filenames));
                        }
                    }
                }
            }
        }

        // Import items
        if let Some(items) = data["items"].as_array() {
            for item_val in items {
                let item: CatalogItem = serde_json::from_value(item_val.clone())
                    .map_err(|e| format!("Invalid item: {}", e))?;
                // Upsert by ID
                let images_json = serde_json::to_string(&item.images).unwrap_or_else(|_| "[]".into());
                self.conn
                    .execute(
                        "INSERT OR REPLACE INTO items
                         (id, name, category_id, subcategory_id, manufacturer, livery,
                          running_number, product_code, condition, dcc_status,
                          purchase_price, current_value, place_of_purchase, purchase_date,
                          storage_location, last_service_date, goes_well_with,
                          historical_background, wishlist, wishlist_notes,
                          wishlist_spotted_at, wishlist_spotted_price, tags, images,
                          created_at, updated_at, deleted_at)
                         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,
                                 ?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,
                                 ?21,?22,?23,?24,?25,?26,NULL)",
                        params![
                            item.id, item.name, item.category_id, item.subcategory_id,
                            item.manufacturer, item.livery, item.running_number, item.product_code,
                            item.condition, item.dcc_status, item.purchase_price, item.current_value,
                            item.place_of_purchase, item.purchase_date, item.storage_location,
                            item.last_service_date, item.goes_well_with, item.historical_background,
                            item.wishlist as i64, item.wishlist_notes, item.wishlist_spotted_at,
                            item.wishlist_spotted_price, item.tags, images_json,
                            item.created_at, item.updated_at,
                        ],
                    )
                    .map_err(|e| format!("Failed to import item: {}", e))?;
            }
        }

        Ok(())
    }

    // ── Password ────────────────────────────────────────────────────────────

    pub fn has_password(&self) -> Result<bool, String> {
        let hash: String = self
            .conn
            .query_row(
                "SELECT value FROM settings WHERE key='password_hash'",
                [],
                |row| row.get(0),
            )
            .unwrap_or_default();
        Ok(!hash.is_empty())
    }

    pub fn change_password(&self, current: &str, new_password: &str) -> Result<(), String> {
        // Verify current password
        let stored_hash: String = self
            .conn
            .query_row(
                "SELECT value FROM settings WHERE key='password_hash'",
                [],
                |row| row.get(0),
            )
            .unwrap_or_default();

        if !stored_hash.is_empty() {
            let stored_salt: String = self
                .conn
                .query_row(
                    "SELECT value FROM settings WHERE key='password_salt'",
                    [],
                    |row| row.get(0),
                )
                .unwrap_or_default();

            let current_hash = hash_password(current, &stored_salt);
            if current_hash != stored_hash {
                return Err("Current password is incorrect".into());
            }
        }

        let salt = generate_salt();
        let hash = hash_password(new_password, &salt);

        self.conn
            .execute(
                "INSERT OR REPLACE INTO settings (key, value) VALUES ('password_hash', ?1)",
                params![hash],
            )
            .map_err(|e| e.to_string())?;
        self.conn
            .execute(
                "INSERT OR REPLACE INTO settings (key, value) VALUES ('password_salt', ?1)",
                params![salt],
            )
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn remove_password(&self, current: &str) -> Result<(), String> {
        let stored_hash: String = self
            .conn
            .query_row(
                "SELECT value FROM settings WHERE key='password_hash'",
                [],
                |row| row.get(0),
            )
            .unwrap_or_default();

        if !stored_hash.is_empty() {
            let stored_salt: String = self
                .conn
                .query_row(
                    "SELECT value FROM settings WHERE key='password_salt'",
                    [],
                    |row| row.get(0),
                )
                .unwrap_or_default();

            let current_hash = hash_password(current, &stored_salt);
            if current_hash != stored_hash {
                return Err("Current password is incorrect".into());
            }
        }

        self.conn
            .execute("DELETE FROM settings WHERE key='password_hash'", [])
            .map_err(|e| e.to_string())?;
        self.conn
            .execute("DELETE FROM settings WHERE key='password_salt'", [])
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn import_from_zip(&self, zip_bytes: &[u8]) -> Result<String, String> {
        use std::io::Read;
        use zip::read::ZipArchive;

        let mut archive = ZipArchive::new(std::io::Cursor::new(zip_bytes))
            .map_err(|e| format!("Invalid ZIP file: {}", e))?;

        let mut data_json = None;
        let mut photo_count = 0u32;

        // Use the same platform-aware data directory as the database
        let data_dir = std::env::var("TRAIN_DEPOT_DATA_DIR").unwrap_or_else(|_| {
            let home = std::env::var("HOME").unwrap_or_else(|_| ".".into());
            #[cfg(target_os = "macos")]
            { format!("{}/Library/Application Support/train-depot", home) }
            #[cfg(target_os = "windows")]
            { format!("{}/train-depot", std::env::var("APPDATA").unwrap_or_else(|_| ".".into())) }
            #[cfg(not(any(target_os = "macos", target_os = "windows")))]
            { format!("{}/.local/share/train-depot", home) }
        });
        let upload_dir = format!("{}/uploads", data_dir);
        std::fs::create_dir_all(&upload_dir).map_err(|e| e.to_string())?;

        for i in 0..archive.len() {
            let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
            let name = file.name().to_string();

            if name == "data.json" {
                let mut contents = String::new();
                file.read_to_string(&mut contents).map_err(|e| e.to_string())?;
                data_json = Some(contents);
            } else if name.starts_with("uploads/") && !name.ends_with('/') {
                let filename = name.trim_start_matches("uploads/");
                let dest_path = format!("{}/{}", upload_dir, filename);
                let mut out = std::fs::File::create(&dest_path).map_err(|e| e.to_string())?;
                std::io::copy(&mut file, &mut out).map_err(|e| e.to_string())?;
                photo_count += 1;
            }
        }

        let json_str = data_json.ok_or("ZIP is missing data.json — not a Train Depot full backup")?;
        self.import_json(&json_str)?;

        Ok(format!("{}", photo_count))
    }
}

// ── Password helpers ────────────────────────────────────────────────────────

fn generate_salt() -> String {
    let salt: [u8; 16] = rand::thread_rng().gen();
    hex::encode(salt)
}

fn hash_password(password: &str, salt: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(salt.as_bytes());
    hasher.update(password.as_bytes());
    hex::encode(hasher.finalize())
}
