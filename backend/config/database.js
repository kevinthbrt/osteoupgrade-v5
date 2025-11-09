const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

// Configuration de la base de données
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Créer les tables
function initializeDatabase() {
    // Table des utilisateurs
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('admin', 'premium', 'freemium')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            is_active INTEGER DEFAULT 1
        )
    `);

    // Table des arbres décisionnels
    db.exec(`
        CREATE TABLE IF NOT EXISTS decision_trees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            icon TEXT DEFAULT '🦴',
            data TEXT NOT NULL,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // Table des tests orthopédiques
    db.exec(`
        CREATE TABLE IF NOT EXISTS ortho_tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            region TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            sensitivity REAL,
            specificity REAL,
            lr_plus REAL,
            lr_minus REAL,
            video_url TEXT,
            test_references TEXT,
            interpretation TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // Table des sessions de diagnostic
    db.exec(`
        CREATE TABLE IF NOT EXISTS diagnostic_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            tree_id INTEGER NOT NULL,
            tree_name TEXT NOT NULL,
            path TEXT NOT NULL,
            result_title TEXT,
            result_severity TEXT,
            result_description TEXT,
            recommendations TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (tree_id) REFERENCES decision_trees(id)
        )
    `);

    // Table des paramètres
    db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Index pour améliorer les performances
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_user ON diagnostic_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_date ON diagnostic_sessions(created_at);
        CREATE INDEX IF NOT EXISTS idx_ortho_tests_region ON ortho_tests(region);
    `);

    console.log('✅ Base de données initialisée avec succès');
}

module.exports = { db, initializeDatabase };
