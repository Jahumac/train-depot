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
#[serde(rename_all = "camelCase")]
pub struct CatalogItem {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub category_id: String,
    #[serde(default)]
    pub subcategory_id: String,
    #[serde(default)]
    pub manufacturer: String,
    #[serde(default)]
    pub livery: String,
    #[serde(default)]
    pub running_number: String,
    #[serde(default)]
    pub product_code: String,
    #[serde(default)]
    pub condition: String,
    #[serde(default)]
    pub dcc_status: String,
    #[serde(default)]
    pub purchase_price: f64,
    #[serde(default)]
    pub current_value: f64,
    #[serde(default)]
    pub place_of_purchase: String,
    #[serde(default)]
    pub purchase_date: String,
    #[serde(default)]
    pub storage_location: String,
    #[serde(default)]
    pub last_service_date: String,
    #[serde(default)]
    pub goes_well_with: String,
    #[serde(default)]
    pub historical_background: String,
    #[serde(default)]
    pub wishlist: bool,
    #[serde(default)]
    pub wishlist_notes: String,
    #[serde(default)]
    pub wishlist_spotted_at: String,
    #[serde(default)]
    pub wishlist_spotted_price: f64,
    #[serde(default, serialize_with = "serialize_tags")]
    pub tags: String, // comma-separated internally, serialized as array
    #[serde(default)]
    pub images: Vec<String>,
    #[serde(default)]
    pub created_at: String,
    #[serde(default)]
    pub updated_at: String,
}

// Custom serializer: split comma-separated tags into an array for the frontend
fn serialize_tags<S>(tags: &str, serializer: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    let arr: Vec<&str> = tags.split(',').map(|t| t.trim()).filter(|t| !t.is_empty()).collect();
    arr.serialize(serializer)
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectionStats {
    pub total_items: i64,
    pub total_spent: f64,
    pub total_current_value: f64,
    pub locomotive_count: i64,
    pub rolling_stock_count: i64,
    pub total_wishlist: i64,
    pub total_trash: i64,
    pub overdue_service: i64,
    #[serde(default)]
    pub wishlist_count: i64,
    #[serde(default)]
    pub by_subcategory: serde_json::Value,
    #[serde(default)]
    pub by_category: serde_json::Value,
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
fn get_item(state: State<AppState>, id: String) -> Result<CatalogItem, String> {
    state.db.lock().map_err(|e| e.to_string())?.get_item(&id)
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
fn import_zip_backup(state: State<AppState>, zip_path: String) -> Result<String, String> {
    let bytes = std::fs::read(&zip_path).map_err(|e| format!("Cannot read file: {}", e))?;
    state.db.lock().map_err(|e| e.to_string())?.import_from_zip(&bytes)
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
    "{\"status\":\"ok\",\"version\":\"1.4.1\"}".into()
}

#[tauri::command]
fn get_upload_dir() -> String {
    let home = std::env::var("HOME").unwrap_or_else(|_| ".".into());
    #[cfg(target_os = "macos")]
    { format!("{}/Library/Application Support/train-depot/uploads", home) }
    #[cfg(target_os = "windows")]
    { format!("{}/train-depot/uploads", std::env::var("APPDATA").unwrap_or_else(|_| ".".into())) }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    { format!("{}/.local/share/train-depot/uploads", home) }
}

#[tauri::command]
fn read_upload_file(filename: String) -> Result<String, String> {
    let home = std::env::var("HOME").unwrap_or_else(|_| ".".into());
    #[cfg(target_os = "macos")]
    let upload_dir = format!("{}/Library/Application Support/train-depot/uploads", home);
    #[cfg(target_os = "windows")]
    let upload_dir = format!("{}/train-depot/uploads", std::env::var("APPDATA").unwrap_or_else(|_| ".".into()));
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    let upload_dir = format!("{}/.local/share/train-depot/uploads", home);

    let path = std::path::Path::new(&upload_dir).join(&filename);
    let data = std::fs::read(&path).map_err(|e| format!("Cannot read file: {}", e))?;
    use base64::Engine;
    let b64 = base64::engine::general_purpose::STANDARD.encode(&data);
    // Detect MIME type from extension
    let ext = std::path::Path::new(&filename)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("jpg")
        .to_lowercase();
    let mime = match ext.as_str() {
        "png" => "image/png",
        "gif" => "image/gif",
        "webp" => "image/webp",
        _ => "image/jpeg",
    };
    Ok(format!("data:{};base64,{}", mime, b64))
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
            get_item,
            create_item,
            update_item,
            delete_item,
            get_stats,
            get_tags,
            export_data,
            import_data,
            import_zip_backup,
            auth_status,
            change_password,
            remove_password,
            health_check,
            get_upload_dir,
            read_upload_file,
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
