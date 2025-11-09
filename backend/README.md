# 🦴 OsteoUpgrade v3.0

Application professionnelle d'aide au diagnostic pour ostéopathes avec base de données, authentification sécurisée et export PDF.

## 🚀 Installation Rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Initialiser la base de données
npm run init-db

# 3. Démarrer le serveur
npm start
```

Accédez à l'application : http://localhost:3000

## 👤 Compte Admin Principal

- **Email** : kevin.thubert@gmail.com
- **Password** : osteoupgrade97
- **Nom** : Kevin Thubert

## ✨ Fonctionnalités

### Version 3.0

- ✅ **Base de données SQLite** - Stockage persistant
- ✅ **Authentification sécurisée** - Passwords hashés + sessions
- ✅ **Export PDF** - Rapports professionnels téléchargeables
- ✅ **Tableau de bord admin** - Statistiques en temps réel
- ✅ **Création de comptes** - Auto-inscription + gestion admin
- ✅ **Historique des diagnostics** - Tous les diagnostics sauvegardés

### Fonctionnalités existantes

- ✅ Arbres décisionnels interactifs par zone
- ✅ Base de données tests orthopédiques avec vidéos
- ✅ Éditeur visuel d'arbres (ZERO code)
- ✅ 3 types de comptes (Admin, Premium, Freemium)
- ✅ Interface responsive mobile/tablet/desktop
- ✅ Drapeaux rouges automatiques

## 📁 Structure

```
osteoupgrade-v3/
├── server.js              # Serveur Express + API
├── package.json          # Configuration npm
├── .env                  # Variables d'environnement
├── database.sqlite       # Base de données (créée après init)
├── config/
│   └── database.js      # Configuration DB
├── src/
│   ├── initDatabase.js  # Script d'initialisation
│   ├── defaultTrees.json
│   └── defaultTests.json
└── public/
    └── index.html       # Interface utilisateur
```

## 🔧 Scripts npm

- `npm start` - Démarrer le serveur
- `npm run dev` - Mode développement (avec nodemon)
- `npm run init-db` - Initialiser/réinitialiser la base de données

## 📊 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Utilisateur connecté

### Utilisateurs (Admin)
- `GET /api/users` - Liste
- `POST /api/users` - Créer
- `PUT /api/users/:id` - Modifier
- `DELETE /api/users/:id` - Supprimer

### Arbres et Tests
- `GET /api/trees` - Liste des arbres
- `GET /api/tests` - Liste des tests
- Plus d'endpoints dans GUIDE_V3.txt

### Diagnostics
- `POST /api/diagnostics` - Enregistrer
- `GET /api/diagnostics` - Historique
- `GET /api/diagnostics/:id/pdf` - Export PDF

### Stats (Admin)
- `GET /api/stats` - Statistiques dashboard

## 🔒 Sécurité

- Passwords hashés avec bcrypt
- Sessions HTTP sécurisées
- Protection CSRF/XSS avec Helmet
- Rate limiting (100 req / 15 min)
- Validation des entrées

## 💾 Sauvegarde

La base de données est dans `database.sqlite`.

Pour sauvegarder : copiez ce fichier
Pour restaurer : remplacez-le et redémarrez le serveur

## 🌐 Déploiement sur Render

### Étapes rapides

1. Poussez le code sur GitHub
2. Sur Render.com, créez un Web Service
3. Build Command : `npm install && npm run init-db`
4. Start Command : `npm start`
5. Ajoutez les variables d'environnement (voir .env)

⚠️ **Important** : Sur Render gratuit, utilisez PostgreSQL pour la persistance des données (SQLite sera réinitialisé à chaque redémarrage).

## 📚 Documentation

- **GUIDE_V3.txt** - Guide complet d'installation et d'utilisation
- **API** - Documentation complète des endpoints dans le guide

## 🆘 Support

Email : kevin.thubert@gmail.com

## 📝 Licence

MIT © 2025 OsteoUpgrade Team - Kevin Thubert

---

**Version**: 3.0.0  
**Dernière mise à jour** : Novembre 2025
