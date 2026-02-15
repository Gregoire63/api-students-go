# 🎮 WebQuest — Apprendre le développement web frontend

> Plateforme interactive d'apprentissage du développement web : HTML, CSS, JavaScript, API REST et authentification JWT — directement dans le navigateur, sans aucune installation.

[![Go](https://img.shields.io/badge/Backend-Go%201.21+-00ADD8?style=flat-square&logo=go)](https://golang.org)
[![Déployé sur Render](https://img.shields.io/badge/Déployé%20sur-Render-46E3B7?style=flat-square&logo=render)](https://webquest.onrender.com)
[![Licence MIT](https://img.shields.io/badge/Licence-MIT-green?style=flat-square)](LICENSE)

---

## 🌐 Démo en ligne

**[webquest.onrender.com](https://webquest.onrender.com)**

---

## 📸 Aperçu

| Cours & Exercice | Éditeur Monaco | Console API |
|:---:|:---:|:---:|
| Interface dual-panel avec cours à gauche et éditeur à droite | Éditeur Monaco avec coloration syntaxique HTML/CSS/JS | Console en temps réel des requêtes HTTP |

---

## ✨ Fonctionnalités

- **15 niveaux progressifs** du HTML basique jusqu'à l'authentification JWT
- **Éditeur Monaco** intégré (le même que VS Code) avec coloration syntaxique
- **Aperçu en direct** — le code s'exécute dans une iframe isolée
- **Validation automatique** — chaque exercice vérifie le code de l'élève
- **Progression sauvegardée** — localStorage avec gestion de version (reset auto si les niveaux changent)
- **API REST réelle** — serveur Go avec JWT, bcrypt, CRUD complet
- **Console API** — visualisation en temps réel des requêtes HTTP (niveaux 10+)
- **Design cyberpunk** — interface immersive thème terminal
- **Responsive** — adapté tablette et mobile

### Niveaux disponibles

| # | Titre | Compétences |
|---|-------|-------------|
| 1 | Structure Web | HTML, CSS, JS — fichiers séparés |
| 2 | HTML Bases | Balises sémantiques, attributs |
| 3 | CSS Bases | Sélecteurs, box model, couleurs |
| 4 | Liens & Navigation | `<a>`, ancres, états `:hover` |
| 5 | Formulaires | Inputs, validation HTML5, labels |
| 6 | JavaScript Introduction | Variables, fonctions, console |
| 7 | JavaScript ES6+ | Arrow functions, map/filter/reduce, destructuring |
| 8 | DOM | querySelector, classList, createElement |
| 9 | Événements | addEventListener, délégation |
| 10 | Comprendre les API | REST, JSON, requêtes HTTP |
| 11 | Fetch API | GET/POST avec async/await, try/catch |
| 12 | Authentification JWT | Login, cookies HttpOnly, `/api/me` |
| 13 | Créer des données | POST avec validation, feedback UX |
| 14 | localStorage | Persistance, sérialisation JSON |
| 15 | Application complète | Mini-app CRUD full-stack |

---

## 🏗️ Architecture

```
webquest/
├── main.go              # Serveur Go (API + fichiers statiques)
├── db.json              # Base de données JSON (générée au démarrage)
├── build_version.txt    # Version des assets (cache-busting en local)
├── go.mod / go.sum
└── webquest/            # Frontend statique servi par Go
    ├── index.html       # App principale (version injectée par Go)
    ├── style.css        # Styles globaux
    ├── script.js        # Logique frontend
    ├── levels.js        # Définition des 15 niveaux
    ├── 404.html         # Page d'erreur personnalisée
    ├── dashboard.html   # Page post-connexion
    ├── logo.webp
    ├── box-model.webp
    ├── communication-CS.webp
    └── og-image.webp    # Image Open Graph (partage réseaux sociaux)
```

### Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | Go 1.21+ (stdlib `net/http`) |
| Authentification | JWT (golang-jwt/jwt v5) + bcrypt |
| Base de données | JSON file (db.json, sync.RWMutex) |
| Frontend | HTML / CSS / JavaScript vanilla |
| Éditeur | Monaco Editor v0.41 (CDN) |
| Fonts | Press Start 2P + Space Mono (Google Fonts) |
| Hébergement | Render.com |

---

## 🚀 Installation locale

### Prérequis

- [Go 1.21+](https://golang.org/dl/)
- Git

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-nom/webquest.git
cd webquest

# 2. Installer les dépendances Go
go mod download

# 3. (Optionnel) Définir une version locale pour le cache-busting
echo "dev-$(date +%Y%m%d)" > build_version.txt

# 4. Lancer le serveur
go run main.go
```

L'application est accessible sur **http://localhost:3000**

La base de données `db.json` est créée automatiquement au premier démarrage avec deux comptes de test.

---

## ⚙️ Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `JWT_SECRET` | Clé secrète pour signer les tokens JWT | `dev_secret_...` *(⚠️ à changer en prod)* |
| `APP_VERSION` | Version des assets (cache-busting) | Lecture de `build_version.txt`, puis `dev` |
| `ALLOWED_ORIGINS` | Origines CORS autorisées (séparées par des virgules) | localhost:3000, 5500, 8080... |
| `PORT` | Port d'écoute | `:3000` *(hardcodé, modifier dans le code si besoin)* |

### Exemple de configuration production

```bash
JWT_SECRET=votre-secret-aleatoire-minimum-32-caracteres
APP_VERSION=2025-02-14-001
ALLOWED_ORIGINS=https://webquest.onrender.com
```

> **Générer un JWT_SECRET sécurisé :**
> ```bash
> openssl rand -hex 32
> ```

---

## 🚢 Déploiement sur Render

### Étapes

1. **Connecter le dépôt GitHub** à [render.com](https://render.com)
2. **Créer un Web Service** avec les paramètres :

| Paramètre | Valeur |
|-----------|--------|
| Environment | Go |
| Build Command | `go build -o webquest-server .` |
| Start Command | `./webquest-server` |
| Instance Type | Free |

3. **Ajouter les variables d'environnement** dans *Environment* :
   - `JWT_SECRET` → valeur générée avec `openssl rand -hex 32`
   - `APP_VERSION` → ex: `2025-02-14-001`
   - `ALLOWED_ORIGINS` → `https://votre-app.onrender.com`

4. **Déployer**

> **Note Render :** Le plan gratuit met l'instance en veille après 15 minutes d'inactivité. Le premier chargement peut prendre 30-60 secondes.

### Cache-busting en production

À chaque déploiement, mettre à jour `APP_VERSION` dans les variables Render (ex: `2025-02-14-002`). Go injectera automatiquement `?v=2025-02-14-002` dans les URLs de `style.css`, `script.js` et `levels.js` — forçant tous les navigateurs à recharger les assets.

---

## 🔌 API Reference

Base URL : `https://webquest.onrender.com/api`

### Authentification

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/register` | Non | Créer un compte |
| POST | `/login` | Non | Se connecter (renvoie un cookie JWT + token) |
| POST | `/logout` | Non | Se déconnecter (expire le cookie) |
| GET | `/me` | ✅ | Profil de l'utilisateur connecté |

### Posts

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/posts` | Non | Liste de tous les posts |
| POST | `/posts` | ✅ | Créer un post |
| GET | `/posts/:id` | ✅ | Détail d'un post |
| PUT | `/posts/:id` | ✅ Auteur ou Admin | Modifier un post |
| DELETE | `/posts/:id` | ✅ Auteur ou Admin | Supprimer un post |

### Exemples

```bash
# Connexion
curl -X POST https://webquest.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"password"}' \
  -c cookies.txt

# Récupérer le profil (avec cookie)
curl https://webquest.onrender.com/api/me -b cookies.txt

# Créer un post
curl -X POST https://webquest.onrender.com/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Mon post","content":"Contenu"}' \
  -b cookies.txt
```

### Format des réponses

```json
// Utilisateur
{ "id": 1, "email": "student@test.com", "role": "student" }

// Post
{ "id": 1, "title": "Mon post", "content": "Contenu", "userId": 2 }

// Erreur
{ "error": "Token manquant" }
```

### Codes HTTP

| Code | Signification |
|------|---------------|
| 200 | OK |
| 201 | Ressource créée |
| 400 | Données invalides |
| 401 | Non authentifié |
| 403 | Accès refusé (pas l'auteur) |
| 404 | Ressource introuvable |
| 409 | Conflit (email déjà utilisé) |
| 500 | Erreur serveur |

### Comptes de test

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `admin@test.com` | `password` | admin |
| `student@test.com` | `password` | student |

---

## 🔒 Sécurité

- **JWT** signé HS256, expiration 24h, lu depuis variable d'environnement
- **Bcrypt** (cost=10) pour le hash des mots de passe
- **HttpOnly cookies** — tokens inaccessibles depuis JavaScript
- **CORS** strict — liste blanche configurable par variable d'environnement
- **Security headers** sur toutes les réponses : `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`
- **Anti timing-attack** — délai constant sur les erreurs de login (énumération email impossible)
- **Élévation de rôle** bloquée — impossible de s'inscrire en `admin` via l'API
- **Validation JWT** — vérification explicite de l'algorithme de signature
- **Logs épurés** — les mots de passe ne sont jamais loggés

---

## 🗂️ Structure des fichiers

### `main.go`

```
main.go
├── Configuration       (JWT, CORS, version)
├── Middlewares         (logging, CORS, auth, security headers)
├── Routing             (SPA catchall, 404, assets)
├── Handlers API        (register, login, logout, me, posts)
└── Utilitaires         (respondJSON, hashPassword, DB I/O)
```

### `webquest/script.js`

```
script.js
├── STORAGE_VERSION     (migration localStorage automatique)
├── hideLoader()        (écran de chargement)
├── Monaco setup        (éditeur avec gestion mémoire)
├── Persistance         (saveCurrentCode, loadSavedCode)
├── Navigation          (renderLevelNav, loadLevel)
├── runCode()           (injection CSS/JS, iframe)
├── validateLevel()     (validation par niveau)
└── API Logs modal      (fetch /api/logs, colorisation)
```

---

## 🛠️ Développement

### Ajouter un niveau

Dans `webquest/levels.js`, ajouter un objet dans le tableau `levels` :

```javascript
{
    id: 16,
    shortTitle: "Mon niveau",
    title: "Titre complet du niveau",
    xp: 200,
    lesson: `<h3>Cours HTML...</h3>`,
    exercise: {
        description: `Description de l'exercice...`,
        starterCode: {
            html: `<!-- Code HTML de départ -->`,
            css:  `/* CSS de départ */`,
            js:   `// JS de départ`
        },
        validation: (doc) => {
            // Vérifications sur le DOM de l'iframe
            const el = doc.querySelector('h1');
            if (!el) return { success: false, message: "❌ Il manque un h1" };
            return { success: true, message: "🎉 Bravo !" };
        }
    }
}
```

Puis **incrémenter `STORAGE_VERSION`** dans `script.js` pour que les anciens caches des élèves soient invalidés.

### Reset du cache élèves

Deux méthodes :
1. **Incrémenter `STORAGE_VERSION`** dans `script.js` → reset automatique au prochain chargement
2. **Changer `APP_VERSION`** dans les variables Render → force le rechargement des assets JS/CSS

---

## 👤 Auteur

Projet créé dans le cadre d'un cours de développement web frontend.

---

*Construit avec Go, Monaco Editor, et beaucoup de CSS cyberpunk. 🟢*
