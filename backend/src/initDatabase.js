require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db, initializeDatabase } = require('../config/database');

// Initialiser la base de données
initializeDatabase();

// Créer l'admin principal
async function createAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL || 'kevin.thubert@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'osteoupgrade97';
    const adminName = process.env.ADMIN_NAME || 'Kevin Thubert';
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO users (email, password, name, status)
        VALUES (?, ?, ?, 'admin')
    `);
    
    try {
        stmt.run(adminEmail, hashedPassword, adminName);
        console.log(`✅ Admin créé : ${adminEmail}`);
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            console.log('ℹ️  Admin déjà existant');
        } else {
            throw error;
        }
    }
}

// Créer des utilisateurs de test
async function createTestUsers() {
    const testUsers = [
        {
            email: 'premium@test.com',
            password: 'test123',
            name: 'Dr. Martin Dubois',
            status: 'premium'
        },
        {
            email: 'freemium@test.com',
            password: 'test123',
            name: 'Dr. Sophie Laurent',
            status: 'freemium'
        }
    ];

    const stmt = db.prepare(`
        INSERT OR IGNORE INTO users (email, password, name, status)
        VALUES (?, ?, ?, ?)
    `);

    for (const user of testUsers) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        try {
            stmt.run(user.email, hashedPassword, user.name, user.status);
            console.log(`✅ Utilisateur test créé : ${user.email}`);
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                console.log(`ℹ️  Utilisateur déjà existant : ${user.email}`);
            }
        }
    }
}

// Insérer les arbres décisionnels par défaut
function insertDefaultTrees() {
    const trees = require('./defaultTrees.json');
    
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO decision_trees (id, name, icon, data, created_by)
        VALUES (?, ?, ?, ?, 1)
    `);

    trees.forEach(tree => {
        try {
            stmt.run(tree.id, tree.name, tree.icon, JSON.stringify(tree.nodes));
            console.log(`✅ Arbre créé : ${tree.name}`);
        } catch (error) {
            console.log(`ℹ️  Arbre déjà existant : ${tree.name}`);
        }
    });
}

// Insérer les tests orthopédiques par défaut
function insertDefaultTests() {
    const tests = require('./defaultTests.json');
    
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO ortho_tests (
            id, region, name, description, sensitivity, specificity, 
            lr_plus, lr_minus, video_url, test_references, interpretation, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    tests.forEach(test => {
        try {
            stmt.run(
                test.id,
                test.region,
                test.name,
                test.description,
                test.sensitivity,
                test.specificity,
                test.lrPlus,
                test.lrMinus,
                test.videoUrl,
                test.references,
                test.interpretation
            );
            console.log(`✅ Test créé : ${test.name}`);
        } catch (error) {
            console.log(`ℹ️  Test déjà existant : ${test.name}`);
        }
    });
}

// Insérer les paramètres par défaut
function insertDefaultSettings() {
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
    `);

    stmt.run('freemium_tree_id', '1');
    console.log('✅ Paramètres par défaut créés');
}

// Exécuter l'initialisation
async function initialize() {
    try {
        console.log('🚀 Initialisation de la base de données...\n');
        
        await createAdminUser();
        await createTestUsers();
        insertDefaultTrees();
        insertDefaultTests();
        insertDefaultSettings();
        
        console.log('\n✅ Initialisation terminée avec succès !');
        console.log('\n📝 Compte admin :');
        console.log(`   Email : ${process.env.ADMIN_EMAIL}`);
        console.log(`   Password : ${process.env.ADMIN_PASSWORD}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation :', error);
        process.exit(1);
    }
}

initialize();
