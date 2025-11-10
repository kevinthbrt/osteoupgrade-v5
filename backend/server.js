require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');
const { db, initializeDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (pour rate limiter)
app.set('trust proxy', 1);

// Initialiser la base de données
initializeDatabase();

// Middlewares de sécurité
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            frameSrc: ["https://www.youtube.com"],
        }
    }
}));

// CORS pour le frontend React
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limite par IP
});
app.use('/api/', limiter);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Servir les fichiers statiques
app.use(express.static('public'));

// Middleware d'authentification
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.userId || req.session.userStatus !== 'admin') {
        return res.status(403).json({ error: 'Accès admin requis' });
    }
    next();
}

// ==================== ROUTES AUTHENTIFICATION ====================

// Connexion
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email);
        
        if (!user) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        
        // Mettre à jour la date de dernière connexion
        db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
        
        // Créer la session
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.userName = user.name;
        req.session.userStatus = user.status;
        
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            status: user.status
        });
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Inscription
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }
        
        // Vérifier si l'email existe déjà
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = db.prepare(`
            INSERT INTO users (email, password, name, status)
            VALUES (?, ?, ?, 'freemium')
        `).run(email, hashedPassword, name);
        
        res.json({ 
            message: 'Compte créé avec succès',
            userId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Déconnexion
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Déconnecté' });
});

// Obtenir l'utilisateur connecté
app.get('/api/auth/me', requireAuth, (req, res) => {
    const user = db.prepare('SELECT id, email, name, status FROM users WHERE id = ?')
        .get(req.session.userId);
    res.json(user);
});

// ==================== ROUTES UTILISATEURS ====================

// Liste des utilisateurs (admin)
app.get('/api/users', requireAdmin, (req, res) => {
    const users = db.prepare(`
        SELECT id, email, name, status, created_at, last_login, is_active
        FROM users
        ORDER BY created_at DESC
    `).all();
    res.json(users);
});

// Créer un utilisateur (admin)
app.post('/api/users', requireAdmin, async (req, res) => {
    try {
        const { email, password, name, status } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = db.prepare(`
            INSERT INTO users (email, password, name, status)
            VALUES (?, ?, ?, ?)
        `).run(email, hashedPassword, name, status);
        
        res.json({ 
            message: 'Utilisateur créé',
            userId: result.lastInsertRowid
        });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: 'Cet email est déjà utilisé' });
        } else {
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
});

// Modifier un utilisateur (admin)
app.put('/api/users/:id', requireAdmin, async (req, res) => {
    try {
        const { email, password, name, status } = req.body;
        const userId = req.params.id;
        
        let query = 'UPDATE users SET email = ?, name = ?, status = ?';
        let params = [email, name, status];
        
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hashedPassword);
        }
        
        query += ' WHERE id = ?';
        params.push(userId);
        
        db.prepare(query).run(...params);
        
        res.json({ message: 'Utilisateur modifié' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Changer le mot de passe (utilisateur connecté)
app.put('/api/users/:id/password', requireAuth, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { currentPassword, newPassword } = req.body;
        
        // Vérifier que l'utilisateur modifie son propre mot de passe
        if (userId !== req.session.userId) {
            return res.status(403).json({ error: 'Non autorisé' });
        }
        
        // Récupérer l'utilisateur
        const user = db.prepare('SELECT password FROM users WHERE id = ?').get(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        // Vérifier le mot de passe actuel
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
        }
        
        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Mettre à jour
        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, userId);
        
        res.json({ message: 'Mot de passe modifié avec succès' });
    } catch (error) {
        console.error('Erreur changement mot de passe:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Supprimer un utilisateur (admin)
app.delete('/api/users/:id', requireAdmin, (req, res) => {
    const userId = req.params.id;
    
    if (parseInt(userId) === req.session.userId) {
        return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }
    
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    res.json({ message: 'Utilisateur supprimé' });
});

// ==================== ROUTES ARBRES DÉCISIONNELS ====================

// Liste des arbres
app.get('/api/trees', requireAuth, (req, res) => {
    const trees = db.prepare(`
        SELECT id, name, icon, created_at, updated_at
        FROM decision_trees
        ORDER BY name
    `).all();
    res.json(trees);
});

// Détail d'un arbre
app.get('/api/trees/:id', requireAuth, (req, res) => {
    const tree = db.prepare('SELECT * FROM decision_trees WHERE id = ?').get(req.params.id);
    
    if (!tree) {
        return res.status(404).json({ error: 'Arbre non trouvé' });
    }
    
    tree.nodes = JSON.parse(tree.data);
    delete tree.data;
    
    res.json(tree);
});

// Créer un arbre (admin)
app.post('/api/trees', requireAdmin, (req, res) => {
    try {
        const { name, icon, nodes } = req.body;
        
        const result = db.prepare(`
            INSERT INTO decision_trees (name, icon, data, created_by)
            VALUES (?, ?, ?, ?)
        `).run(name, icon || '🦴', JSON.stringify(nodes || []), req.session.userId);
        
        res.json({ 
            message: 'Arbre créé',
            treeId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Erreur création arbre:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Modifier un arbre (admin)
app.put('/api/trees/:id', requireAdmin, (req, res) => {
    try {
        const { name, icon, nodes } = req.body;
        
        db.prepare(`
            UPDATE decision_trees
            SET name = ?, icon = ?, data = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(name, icon, JSON.stringify(nodes), req.params.id);
        
        res.json({ message: 'Arbre modifié' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Supprimer un arbre (admin)
app.delete('/api/trees/:id', requireAdmin, (req, res) => {
    db.prepare('DELETE FROM decision_trees WHERE id = ?').run(req.params.id);
    res.json({ message: 'Arbre supprimé' });
});

// ==================== ROUTES TESTS ORTHOPÉDIQUES ====================

// Liste des tests
app.get('/api/tests', requireAuth, (req, res) => {
    const { region } = req.query;
    
    let query = 'SELECT * FROM ortho_tests';
    let params = [];
    
    if (region) {
        query += ' WHERE region = ?';
        params.push(region);
    }
    
    query += ' ORDER BY region, name';
    
    const tests = db.prepare(query).all(...params);
    res.json(tests);
});

// Détail d'un test
app.get('/api/tests/:id', requireAuth, (req, res) => {
    const test = db.prepare('SELECT * FROM ortho_tests WHERE id = ?').get(req.params.id);
    
    if (!test) {
        return res.status(404).json({ error: 'Test non trouvé' });
    }
    
    res.json(test);
});

// Créer un test (admin)
app.post('/api/tests', requireAdmin, (req, res) => {
    try {
        const { region, name, description, sensitivity, specificity, lr_plus, lr_minus, video_url, test_references, interpretation } = req.body;
        
        const result = db.prepare(`
            INSERT INTO ortho_tests (region, name, description, sensitivity, specificity, lr_plus, lr_minus, video_url, test_references, interpretation, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(region, name, description, sensitivity, specificity, lr_plus, lr_minus, video_url, test_references, interpretation, req.session.userId);
        
        res.json({ 
            message: 'Test créé',
            testId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Erreur création test:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Modifier un test (admin)
app.put('/api/tests/:id', requireAdmin, (req, res) => {
    try {
        const { region, name, description, sensitivity, specificity, lr_plus, lr_minus, video_url, test_references, interpretation } = req.body;
        
        db.prepare(`
            UPDATE ortho_tests
            SET region = ?, name = ?, description = ?, sensitivity = ?, specificity = ?, 
                lr_plus = ?, lr_minus = ?, video_url = ?, test_references = ?, interpretation = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(region, name, description, sensitivity, specificity, lr_plus, lr_minus, video_url, test_references, interpretation, req.params.id);
        
        res.json({ message: 'Test modifié' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Supprimer un test (admin)
app.delete('/api/tests/:id', requireAdmin, (req, res) => {
    db.prepare('DELETE FROM ortho_tests WHERE id = ?').run(req.params.id);
    res.json({ message: 'Test supprimé' });
});

// ==================== ROUTES SESSIONS DE DIAGNOSTIC ====================

// Enregistrer une session de diagnostic
app.post('/api/diagnostics', requireAuth, (req, res) => {
    try {
        const { tree_id, tree_name, path, result_title, result_severity, result_description, recommendations } = req.body;
        
        const result = db.prepare(`
            INSERT INTO diagnostic_sessions (user_id, tree_id, tree_name, path, result_title, result_severity, result_description, recommendations)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            req.session.userId,
            tree_id,
            tree_name,
            JSON.stringify(path),
            result_title,
            result_severity,
            result_description,
            JSON.stringify(recommendations)
        );
        
        res.json({ 
            message: 'Diagnostic enregistré',
            diagnosticId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Erreur enregistrement diagnostic:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Liste des diagnostics d'un utilisateur
app.get('/api/diagnostics', requireAuth, (req, res) => {
    const diagnostics = db.prepare(`
        SELECT * FROM diagnostic_sessions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
    `).all(req.session.userId);
    
    diagnostics.forEach(d => {
        d.path = JSON.parse(d.path);
        d.recommendations = JSON.parse(d.recommendations);
    });
    
    res.json(diagnostics);
});

// Statistiques (admin)
app.get('/api/stats', requireAdmin, (req, res) => {
    const stats = {
        totalUsers: db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').get().count,
        totalDiagnostics: db.prepare('SELECT COUNT(*) as count FROM diagnostic_sessions').get().count,
        totalTrees: db.prepare('SELECT COUNT(*) as count FROM decision_trees').get().count,
        totalTests: db.prepare('SELECT COUNT(*) as count FROM ortho_tests').get().count,
        
        usersByStatus: db.prepare(`
            SELECT status, COUNT(*) as count
            FROM users
            WHERE is_active = 1
            GROUP BY status
        `).all(),
        
        diagnosticsByTree: db.prepare(`
            SELECT tree_name, COUNT(*) as count
            FROM diagnostic_sessions
            GROUP BY tree_name
            ORDER BY count DESC
            LIMIT 10
        `).all(),
        
        recentDiagnostics: db.prepare(`
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM diagnostic_sessions
            WHERE created_at >= DATE('now', '-30 days')
            GROUP BY DATE(created_at)
            ORDER BY date
        `).all(),
        
        newUsersLast30Days: db.prepare(`
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM users
            WHERE created_at >= DATE('now', '-30 days')
            GROUP BY DATE(created_at)
            ORDER BY date
        `).all()
    };
    
    res.json(stats);
});

// ==================== ROUTES PARAMÈTRES ====================

// Obtenir un paramètre
app.get('/api/settings/:key', requireAuth, (req, res) => {
    const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key);
    res.json(setting ? { value: setting.value } : null);
});

// Modifier un paramètre (admin)
app.put('/api/settings/:key', requireAdmin, (req, res) => {
    const { value } = req.body;
    
    db.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(req.params.key, value);
    
    res.json({ message: 'Paramètre enregistré' });
});

// ==================== EXPORT PDF ====================
const PDFDocument = require('pdfkit');

app.get('/api/diagnostics/:id/pdf', requireAuth, (req, res) => {
    try {
        const diagnostic = db.prepare(`
            SELECT ds.*, u.name as user_name, u.email as user_email
            FROM diagnostic_sessions ds
            JOIN users u ON ds.user_id = u.id
            WHERE ds.id = ? AND ds.user_id = ?
        `).get(req.params.id, req.session.userId);
        
        if (!diagnostic) {
            return res.status(404).json({ error: 'Diagnostic non trouvé' });
        }
        
        diagnostic.recommendations = JSON.parse(diagnostic.recommendations);
        
        // Créer le PDF
        const doc = new PDFDocument({ margin: 50 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=diagnostic-${diagnostic.id}.pdf`);
        
        doc.pipe(res);
        
        // En-tête
        doc.fontSize(24).fillColor('#4A90E2').text('OsteoUpgrade', { align: 'center' });
        doc.fontSize(12).fillColor('#7B8794').text('Rapport de Diagnostic Ostéopathique', { align: 'center' });
        doc.moveDown(2);
        
        // Informations patient
        doc.fontSize(16).fillColor('#2C3E50').text('Informations', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#000');
        doc.text(`Praticien : ${diagnostic.user_name}`);
        doc.text(`Date : ${new Date(diagnostic.created_at).toLocaleDateString('fr-FR', { 
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        })}`);
        doc.text(`Zone examinée : ${diagnostic.tree_name}`);
        doc.moveDown(2);
        
        // Résultat
        doc.fontSize(16).fillColor('#2C3E50').text('Résultat du Diagnostic', { underline: true });
        doc.moveDown(0.5);
        
        // Titre du résultat avec couleur selon sévérité
        let titleColor = '#27AE60'; // success
        if (diagnostic.result_severity === 'warning') titleColor = '#F39C12';
        if (diagnostic.result_severity === 'danger') titleColor = '#E74C3C';
        
        doc.fontSize(14).fillColor(titleColor).text(diagnostic.result_title);
        doc.moveDown(0.5);
        
        doc.fontSize(11).fillColor('#000').text(diagnostic.result_description, { align: 'justify' });
        doc.moveDown(2);
        
        // Recommandations
        doc.fontSize(16).fillColor('#2C3E50').text('Recommandations', { underline: true });
        doc.moveDown(0.5);
        
        diagnostic.recommendations.forEach((rec, index) => {
            doc.fontSize(11).fillColor('#000').text(`${index + 1}. ${rec}`, { indent: 20 });
            doc.moveDown(0.3);
        });
        
        doc.moveDown(3);
        
        // Pied de page
        doc.fontSize(9).fillColor('#7B8794').text(
            'Ce document est généré automatiquement par OsteoUpgrade et ne constitue pas un document médical officiel.',
            { align: 'center' }
        );
        
        doc.end();
    } catch (error) {
        console.error('Erreur génération PDF:', error);
        res.status(500).json({ error: 'Erreur lors de la génération du PDF' });
    }
});

// ==================== ROUTE PAR DÉFAUT ====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🦴 OsteoUpgrade v3.0 démarré sur le port ${PORT}`);
    console.log(`📱 Accès : http://localhost:${PORT}`);
    console.log(`\n👤 Admin : ${process.env.ADMIN_EMAIL}`);
    console.log(`🔑 Password : ${process.env.ADMIN_PASSWORD}\n`);
});
