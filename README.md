# 🦴 OsteoUpgrade v3.0

Application web professionnelle d'aide au diagnostic ostéopathique avec arbres décisionnels interactifs.

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Node](https://img.shields.io/badge/Node.js-14%2B-green)

---

## ✨ Fonctionnalités

### Pour les Ostéopathes
- 🌳 **Arbres décisionnels interactifs** - Navigation guidée
- 🏥 **Tests orthopédiques** - Base de données avec vidéos
- 📄 **Export PDF** - Génération automatique de rapports
- 👤 **Multi-utilisateurs** - Admin, Premium, Freemium

### Pour les Administrateurs
- 🔧 **Panneau d'administration complet**
- 📝 **Éditeur d'arbres** - Interface visuelle
- ✅ **Gestion des tests** - Sélection par checkbox
- 👥 **Gestion des utilisateurs**

---

## 🚀 Installation Rapide

```bash
# Backend
cd backend
npm install
npm run init-db
npm start

# Frontend (nouveau terminal)
cd frontend
npm install
npm start
```

### Connexion admin (démo)
Créez un compte via l'API de seed ou via l'interface d’administration (mot de passe non public).


---

## 📁 Structure

```
osteoupgrade-final/
├── backend/           # API Node.js + Express
│   ├── server.js
│   └── config/
└── frontend/          # React App
    └── src/
        ├── components/
        └── api.js
```

---

## 🛠️ Technologies

**Backend:** Node.js, Express, SQLite, bcrypt, PDFKit  
**Frontend:** React 18, Hooks, Fetch API, CSS3

---

## 📝 Licence

MIT - © 2025 OsteoUpgrade - Kevin Thubert
