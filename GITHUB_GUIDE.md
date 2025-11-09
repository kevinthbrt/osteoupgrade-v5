# 📦 GUIDE GITHUB - OsteoUpgrade

## 🎯 POURQUOI GITHUB ?

✅ **Sauvegarde** - Votre code est sécurisé en ligne  
✅ **Historique** - Revenez en arrière si erreur  
✅ **Collaboration** - Travaillez à plusieurs  
✅ **Continuité** - Continuez même si la conversation s'arrête  

---

## 🚀 PREMIÈRE FOIS - CRÉER LE REPO

### 1. Créer un compte GitHub (si pas déjà fait)

Allez sur https://github.com et créez un compte gratuit.

### 2. Créer un nouveau repository

1. Connectez-vous sur GitHub
2. Cliquez sur le **+** en haut à droite
3. **New repository**
4. Nom : `osteoupgrade-v3`
5. Description : `Application d'aide au diagnostic ostéopathique`
6. **Private** (si vous voulez que ce soit privé)
7. **Ne cochez RIEN d'autre** (pas de README, pas de .gitignore)
8. Cliquez **Create repository**

### 3. Initialiser Git localement

Ouvrez PowerShell dans le dossier du projet :

```powershell
cd C:\Users\kevin\Desktop\osteoupgrade-final

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - OsteoUpgrade v3.0"

# Lier au repo GitHub (remplacez VOTRE-USERNAME)
git remote add origin https://github.com/VOTRE-USERNAME/osteoupgrade-v3.git

# Pousser le code
git push -u origin main
```

**Note :** Si Git demande vos identifiants :
- Username : votre username GitHub
- Password : utilisez un **Personal Access Token** (pas votre mot de passe)

Pour créer un token :
1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. Cochez "repo"
5. Copiez le token et utilisez-le comme mot de passe

---

## 💾 SAUVEGARDER VOS MODIFICATIONS

Chaque fois que vous modifiez du code :

```powershell
cd C:\Users\kevin\Desktop\osteoupgrade-final

# Voir ce qui a changé
git status

# Ajouter les modifications
git add .

# Créer un commit avec un message
git commit -m "Description de ce que vous avez fait"

# Pousser sur GitHub
git push
```

### Exemples de messages de commit :

```bash
git commit -m "Ajout du panneau admin"
git commit -m "Correction du bug de connexion"
git commit -m "Ajout de l'arbre Lombaire"
git commit -m "Amélioration de l'interface"
```

---

## ⏮️ REVENIR EN ARRIÈRE

### Voir l'historique

```bash
git log
```

### Revenir au commit précédent

```bash
# Annuler les dernières modifications (non commitées)
git checkout .

# Revenir au commit précédent (committé)
git reset --hard HEAD~1

# Revenir à un commit spécifique
git reset --hard COMMIT_ID
```

---

## 🌿 BRANCHES (AVANCÉ)

Pour tester sans risque :

```bash
# Créer une nouvelle branche
git checkout -b feature-nouvelle-fonctionnalite

# Travailler dessus, commit, etc.
git add .
git commit -m "Ajout de la fonctionnalité"

# Revenir sur main
git checkout main

# Fusionner la branche
git merge feature-nouvelle-fonctionnalite
```

---

## 📥 RÉCUPÉRER DEPUIS GITHUB

Si vous travaillez sur un autre PC ou avec quelqu'un d'autre :

```bash
# Cloner le repo
git clone https://github.com/VOTRE-USERNAME/osteoupgrade-v3.git

# Récupérer les dernières modifications
git pull
```

---

## 🔑 FICHIERS SENSIBLES

**IMPORTANT :** Le fichier `.env` contient des secrets et ne doit PAS être sur GitHub.

Il est déjà dans `.gitignore`, donc Git l'ignore automatiquement.

Si vous travaillez avec quelqu'un, créez un fichier `.env.example` :

```bash
# backend/.env.example
PORT=3000
ADMIN_EMAIL=votre@email.com
ADMIN_PASSWORD=votre-mot-de-passe
SESSION_SECRET=changez-moi-en-production
```

---

## 📋 COMMANDES UTILES

```bash
# Statut actuel
git status

# Historique
git log --oneline

# Différences
git diff

# Annuler les modifications non commitées
git checkout .

# Voir les branches
git branch

# Changer de branche
git checkout nom-branche

# Supprimer une branche
git branch -d nom-branche
```

---

## 🎯 WORKFLOW RECOMMANDÉ

**Tous les jours :**

1. **Commencer** :
   ```bash
   git pull  # Récupérer les dernières modifications
   ```

2. **Travailler** :
   - Modifier le code
   - Tester

3. **Sauvegarder** :
   ```bash
   git add .
   git commit -m "Description des changements"
   git push
   ```

**En cas d'erreur :**

```bash
git log  # Trouver le bon commit
git reset --hard COMMIT_ID  # Revenir en arrière
```

---

## 🆘 AIDE

**Problème avec Git ?**

```bash
# Forcer la mise à jour (ATTENTION : écrase les modifications locales)
git fetch origin
git reset --hard origin/main
```

**Conflit lors d'un merge ?**

1. Ouvrez les fichiers en conflit
2. Cherchez les marqueurs `<<<<<<<`, `=======`, `>>>>>>>`
3. Éditez manuellement
4. `git add .` puis `git commit`

---

## 🎉 C'EST TOUT !

Maintenant votre code est sauvegardé sur GitHub ! 🦴

Vous pouvez continuer à tout moment, même si cette conversation s'arrête.

**Lien de votre repo :** https://github.com/VOTRE-USERNAME/osteoupgrade-v3
