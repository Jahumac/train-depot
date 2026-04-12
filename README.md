# Train Depot

A self-hosted digital catalog for managing your model train collection. Built with zero external dependencies using only Node.js built-in modules.

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green) ![License](https://img.shields.io/badge/License-MIT-blue) ![Version](https://img.shields.io/badge/Version-1.0.0-gold)

## Features

- **Collection management** &mdash; full CRUD for locomotives and rolling stock with multiple photos per item
- **Hierarchical categories** &mdash; Steam (Pre-Grouping, LNER, LMS, Southern, GWR, BR), Diesel, Multiple Units, Rolling Stock by era
- **Configurable** &mdash; app name, tagline, currency symbol, and service interval are all editable from the Settings page
- **Smart auto-fill** &mdash; built-in reference database of 36 well-known models; start typing a name and select to auto-populate manufacturer, livery, history, category, and "goes well with" suggestions
- **Auto-suggest** &mdash; fuzzy-matching suggestions for manufacturer, livery, and place of purchase fields, with Levenshtein-lite typo tolerance
- **"Goes well with" chips** &mdash; era-appropriate compatibility suggestions per subcategory, clickable to append
- **Sorting** &mdash; sort your collection by name, price, manufacturer, date added, or service date
- **Service tracking** &mdash; overdue/due-soon badges based on configurable service interval
- **Dark mode** &mdash; toggle between light and dark themes with localStorage persistence
- **Green & gold theme** &mdash; heritage-inspired colour scheme throughout
- **Stats dashboard** &mdash; total spend, locomotive count, rolling stock count, per-subcategory breakdowns
- **Image upload** &mdash; drag-and-drop or click to upload, multi-image per item, 10 MB limit per file
- **Search** &mdash; full-text search across name, manufacturer, livery, history, and compatibility fields
- **Backup & export** &mdash; JSON backup/restore and CSV export of your full catalogue
- **Print-friendly** &mdash; clean print stylesheet for printing your collection
- **Responsive** &mdash; works on desktop and mobile
- **Zero dependencies** &mdash; no npm packages required; runs on Node.js built-in modules only

## Quick Start

```bash
# Clone the repository
git clone https://github.com/jahumac/train-depot.git
cd train-depot

# Start the server
npm start
```

Open [http://localhost:8005](http://localhost:8005) in your browser.

## Docker

```bash
docker build -t train-depot .
docker run -d \
  -p 8005:8005 \
  -v train-depot-data:/app/data \
  -v train-depot-uploads:/app/data/uploads \
  --name train-depot \
  train-depot
```

An Unraid container template is included in the `unraid/` folder.

## Requirements

- **Node.js 18+** (uses `crypto.randomUUID()`)
- No other dependencies

## Project Structure

```
train-depot/
├── server.js                 # HTTP server, API routes, static file serving
├── database.js               # JSON-file database layer (CRUD, search, stats, settings)
├── seed.js                   # Seeds sample items across all categories (optional)
├── package.json
├── start.sh                  # Quick-start shell script
├── Dockerfile                # Docker container configuration
├── data/
│   └── catalog.json          # Database file (auto-created on first run)
└── static/
    ├── index.html            # Single-page app shell
    ├── css/
    │   └── styles.css        # Green & gold theme with dark mode + print styles
    └── js/
        ├── app.js            # Frontend SPA logic
        └── reference-db.js   # Reference database of known models
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/settings` | Get app settings (name, tagline, currency, etc.) |
| `PUT` | `/api/settings` | Update app settings |
| `GET` | `/api/categories` | List all categories and subcategories |
| `GET` | `/api/items` | List all items (supports `?search=`, `?category=`, `?subcategory=`) |
| `GET` | `/api/items/:id` | Get a single item by ID |
| `POST` | `/api/items` | Create a new item |
| `PUT` | `/api/items/:id` | Update an item |
| `DELETE` | `/api/items/:id` | Delete an item |
| `POST` | `/api/upload` | Upload images (multipart/form-data) |
| `GET` | `/api/stats` | Collection statistics |
| `GET` | `/api/export` | Export full database as JSON |
| `POST` | `/api/import` | Import/restore from JSON backup |

## Scripts

```bash
npm start      # Start the server on port 8005
npm run seed   # Populate the database with sample data
npm run dev    # Start with --watch for auto-restart on changes (Node 18.11+)
```

The port can be changed by setting the `PORT` environment variable: `PORT=9000 npm start`

## License

MIT
