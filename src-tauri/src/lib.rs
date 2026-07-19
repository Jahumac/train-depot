use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

mod db;

// ── Data types ──────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub app_name: String,
    pub tagline: String,
    pub currency: String,
    pub service_interval_days: i64,
    pub password_hash: String,
    pub password_salt: String,
    pub share_token: String,
    pub ebay_app_id: String,
    pub ebay_cert_id: String,
    pub ebay_sandbox: bool,
    pub ebay_gauge: String,
    pub valuation_auto_refresh: bool,
    pub valuation_refresh_days: i64,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            app_name: "Train Depot".into(),
            tagline: "Your personal collection, beautifully organised".into(),
            currency: "£".into(),
            service_interval_days: 365,
            password_hash: String::new(),
            password_salt: String::new(),
            share_token: String::new(),
            ebay_app_id: String::new(),
            ebay_cert_id: String::new(),
            ebay_sandbox: false,
            ebay_gauge: "OO".into(),
            valuation_auto_refresh: true,
            valuation_refresh_days: 7,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub subcategories: Vec<Subcategory>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Subcategory {
    pub id: String,
    pub name: String,
    pub parent: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CatalogItem {
    pub id: String,
    pub name: String,
    pub category_id: String,
    pub subcategory_id: String,
    pub manufacturer: String,
    pub livery: String,
    pub running_number: String,
    pub product_code: String,
    pub condition: String,
    pub dcc_status: String,
    pub purchase_price: f64,
    pub current_value: f64,
    pub place_of_purchase: String,
    pub purchase_date: String,
    pub storage_location: String,
    pub last_service_date: String,
    pub goes_well_with: String,
    pub historical_background: String,
    pub wishlist: bool,
    pub wishlist_notes: String,
    pub wishlist_spotted_at: String,
    pub wishlist_spotted_price: f64,
    pub tags: String, // comma-separated
    pub images: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CollectionStats {
    pub total_items: i64,
    pub total_spent: f64,
    pub locomotive_count: i64,
    pub rolling_stock_count: i64,
    pub total_wishlist: i64,
    pub total_trash: i64,
    pub overdue_service: i64,
}

// ── App state ───────────────────────────────────────────────────────────────

pub struct AppState {
    pub db: Mutex<db::Database>,
}

// ── Tauri commands ───────────────────────────────────────────────────────────

#[tauri::command]
fn get_settings(state: State<AppState>) -> Result<AppSettings, String> {
    state.db.lock().map_err(|e| e.to_string())?.get_settings()
}

#[tauri::command]
fn update_settings(state: State<AppState>, data: AppSettings) -> Result<(), String> {
    state.db.lock().map_err(|e| e.to_string())?.update_settings(&data)
}

#[tauri::command]
fn get_categories(state: State<AppState>) -> Result<Vec<Category>, String> {
    state.db.lock().map_err(|e| e.to_string())?.get_categories()
}

#[tauri::command]
fn get_items(state: State<AppState>) -> Result<Vec<CatalogItem>, String> {
    state.db.lock().map_err(|e| e.to_string())?.get_items()
}

#[tauri::command]
fn create_item(state: State<AppState>, data: CatalogItem) -> Result<CatalogItem, String> {
    state.db.lock().map_err(|e| e.to_string())?.create_item(data)
}

#[tauri::command]
fn update_item(state: State<AppState>, id: String, data: CatalogItem) -> Result<(), String> {
    state.db.lock().map_err(|e| e.to_string())?.update_item(&id, &data)
}

#[tauri::command]
fn delete_item(state: State<AppState>, id: String) -> Result<(), String> {
    state.db.lock().map_err(|e| e.to_string())?.delete_item(&id)
}

#[tauri::command]
fn get_stats(state: State<AppState>) -> Result<CollectionStats, String> {
    state.db.lock().map_err(|e| e.to_string())?.get_stats()
}

#[tauri::command]
fn get_tags(state: State<AppState>) -> Result<Vec<String>, String> {
    state.db.lock().map_err(|e| e.to_string())?.get_tags()
}

#[tauri::command]
fn export_data(state: State<AppState>) -> Result<String, String> {
    state.db.lock().map_err(|e| e.to_string())?.export_json()
}

#[tauri::command]
fn import_data(state: State<AppState>, data: String) -> Result<(), String> {
    state.db.lock().map_err(|e| e.to_string())?.import_json(&data)
}

#[tauri::command]
fn auth_status(state: State<AppState>) -> Result<bool, String> {
    state.db.lock().map_err(|e| e.to_string())?.has_password()
}

#[tauri::command]
fn change_password(state: State<AppState>, current: String, new_password: String) -> Result<(), String> {
    state.db.lock().map_err(|e| e.to_string())?.change_password(&current, &new_password)
}

#[tauri::command]
fn remove_password(state: State<AppState>, current: String) -> Result<(), String> {
    state.db.lock().map_err(|e| e.to_string())?.remove_password(&current)
}

#[tauri::command]
fn health_check() -> String {
    "{\"status\":\"ok\",\"version\":\"1.4.0\"}".into()
}

// ── App entry point ─────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db_path = dirs_or_default_db_path();
    let database = db::Database::new(&db_path).expect("Failed to initialise database");

    tauri::Builder::default()
        .manage(AppState { db: Mutex::new(database) })
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            app.handle().plugin(tauri_plugin_dialog::init())?;
            app.handle().plugin(tauri_plugin_fs::init())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_settings,
            update_settings,
            get_categories,
            get_items,
            create_item,
            update_item,
            delete_item,
            get_stats,
            get_tags,
            export_data,
            import_data,
            auth_status,
            change_password,
            remove_password,
            health_check,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn dirs_or_default_db_path() -> String {
    // Use platform-appropriate data directory
    #[cfg(target_os = "linux")]
    {
        let home = std::env::var("HOME").unwrap_or_else(|_| ".".into());
        format!("{}/.local/share/train-depot/catalog.db", home)
    }
    #[cfg(target_os = "macos")]
    {
        let home = std::env::var("HOME").unwrap_or_else(|_| ".".into());
        format!("{}/Library/Application Support/train-depot/catalog.db", home)
    }
    #[cfg(target_os = "windows")]
    {
        let appdata = std::env::var("APPDATA").unwrap_or_else(|_| ".".into());
        format!("{}/train-depot/catalog.db", appdata)
    }
    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    {
        "catalog.db".into()
    }
}
