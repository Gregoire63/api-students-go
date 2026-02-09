# TD : Créer une Interface Web pour une API REST avec Authentification

## 🎯 Objectif du TD

Vous allez créer une interface web (HTML/CSS/JavaScript) qui communique avec une API REST. Cette API gère des utilisateurs et des posts, avec un système d'authentification JWT.

**Durée estimée** : 2-3 heures

---

## 📋 Prérequis

- Connaissances de base en HTML/CSS
- Notions de JavaScript
- Un navigateur web moderne (Chrome, Firefox, Edge)
- L'API fournie (`api.exe`) qui doit être lancée

---

## 🚀 Étape 0 : Démarrage de l'API

1. Placez le fichier `api.exe` dans un dossier
2. Double-cliquez dessus ou lancez-le depuis un terminal :
   ```
   api.exe
   ```
3. Vous devriez voir :
   ```
   🚀 API démarrée sur http://localhost:3000
   ```

**Comptes de test disponibles** :
- Admin : `admin@test.com` / `password`
- Student : `student@test.com` / `password`

---

## 📚 Présentation de l'API

L'API expose les endpoints suivants :

### Routes publiques (sans authentification)
- `POST /register` - Créer un compte
- `POST /login` - Se connecter
- `POST /logout` - Se déconnecter

### Routes protégées (nécessitent un token JWT)
- `GET /me` - Récupérer son profil
- `GET /posts` - Liste de tous les posts
- `POST /posts` - Créer un post
- `GET /posts/:id` - Récupérer un post
- `PUT /posts/:id` - Modifier un post
- `DELETE /posts/:id` - Supprimer un post

---

## 🔧 Étape 1 : Structure HTML de base

Créez un fichier `index.html` et commencez par la structure de base :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Students</title>
    <style>
        /* On ajoutera le CSS plus tard */
    </style>
</head>
<body>
    <div class="container">
        <h1>API Students</h1>
        
        <!-- Zone de connexion/inscription -->
        <div id="auth-section">
            <h2>Se connecter</h2>
            <!-- Formulaire à créer -->
        </div>

        <!-- Zone de l'application (cachée au départ) -->
        <div id="app-section" class="hidden">
            <h2>Bienvenue !</h2>
            <!-- Contenu à créer -->
        </div>
    </div>

    <script>
        // Votre code JavaScript ici
    </script>
</body>
</html>
```

---

## 🎨 Étape 2 : Ajouter le CSS

Ajoutez ces styles dans la balise `<style>` pour avoir une interface simple :

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    background: #f5f5f5;
    padding: 20px;
}

.container {
    max-width: 800px;
    margin: 0 auto;
}

.card {
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    color: #555;
}

input, textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

button {
    background: #4a90e2;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background: #357abd;
}

.hidden {
    display: none !important;
}

.alert {
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 15px;
}

.alert-success {
    background: #d4edda;
    color: #155724;
}

.alert-error {
    background: #f8d7da;
    color: #721c24;
}
```

---

## 📝 Étape 3 : Créer le formulaire de connexion

Dans la section `#auth-section`, ajoutez :

```html
<div class="card">
    <h2>Se connecter</h2>
    
    <div id="alert-container"></div>
    
    <form onsubmit="login(event)">
        <div class="form-group">
            <label>Email</label>
            <input type="email" id="login-email" required value="admin@test.com">
        </div>
        <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" id="login-password" required value="password">
        </div>
        <button type="submit">Se connecter</button>
    </form>
</div>
```

---

## 💻 Étape 4 : Comprendre fetch() et les appels API

### Concept : fetch()

`fetch()` est la fonction JavaScript moderne pour faire des requêtes HTTP. Elle retourne une **Promise**.

**Syntaxe de base** :
```javascript
fetch('http://localhost:3000/endpoint', {
    method: 'POST',              // GET, POST, PUT, DELETE
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)   // Données à envoyer
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));
```

**Avec async/await (plus lisible)** :
```javascript
async function maFonction() {
    try {
        const response = await fetch('http://localhost:3000/endpoint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}
```

---

## 🔐 Étape 5 : Implémenter la fonction login()

Dans la balise `<script>`, ajoutez :

```javascript
const API_URL = 'http://localhost:3000';
let authToken = null;  // Pour stocker le token JWT
let currentUser = null;

async function login(event) {
    event.preventDefault();  // Empêche le rechargement de la page
    
    // 1. Récupérer les valeurs du formulaire
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        // 2. Envoyer la requête à l'API
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        // 3. Récupérer la réponse
        const data = await response.json();
        
        // 4. Vérifier si la connexion a réussi
        if (response.ok) {
            // Succès !
            authToken = data.token;
            localStorage.setItem('token', authToken);  // Sauvegarder le token
            
            showApp(data.user);  // Fonction à créer
            showAlert('Connexion réussie !', 'success');
        } else {
            // Erreur (mauvais mot de passe, etc.)
            showAlert(data.error || 'Erreur de connexion', 'error');
        }
    } catch (error) {
        // Erreur réseau ou serveur non disponible
        showAlert('Erreur : le serveur ne répond pas', 'error');
    }
}

// Fonction utilitaire pour afficher des messages
function showAlert(message, type) {
    const container = document.getElementById('alert-container');
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => container.innerHTML = '', 3000);
}
```

### 🧠 Explications détaillées :

**1. event.preventDefault()**
- Normalement, un formulaire recharge la page
- Cette ligne empêche ce comportement

**2. fetch() avec async/await**
- `async` permet d'utiliser `await`
- `await` attend que la promesse se résolve

**3. Gestion de la réponse**
- `response.ok` → true si code HTTP 200-299
- `response.json()` → convertit la réponse en objet JavaScript

**4. localStorage**
- Permet de sauvegarder des données dans le navigateur
- `localStorage.setItem('clé', 'valeur')` → sauvegarder
- `localStorage.getItem('clé')` → récupérer
- `localStorage.removeItem('clé')` → supprimer

---

## 🏠 Étape 6 : Créer la zone de l'application

Modifiez la section `#app-section` :

```html
<div id="app-section" class="hidden">
    <div class="card">
        <h2>Profil</h2>
        <p><strong>Email:</strong> <span id="user-email"></span></p>
        <p><strong>Rôle:</strong> <span id="user-role"></span></p>
        <button onclick="logout()">Se déconnecter</button>
    </div>
    
    <div class="card">
        <h2>Liste des posts</h2>
        <div id="posts-container">
            <p>Chargement...</p>
        </div>
    </div>
</div>
```

Ajoutez ces fonctions JavaScript :

```javascript
function showApp(user) {
    currentUser = user;
    
    // Cacher la section de connexion
    document.getElementById('auth-section').classList.add('hidden');
    
    // Afficher la section application
    document.getElementById('app-section').classList.remove('hidden');
    
    // Remplir les infos utilisateur
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-role').textContent = user.role;
    
    // Charger les posts
    loadPosts();
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('token');
    
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('app-section').classList.add('hidden');
    
    showAlert('Déconnexion réussie', 'success');
}
```

---

## 📋 Étape 7 : Charger les posts

Ajoutez cette fonction pour récupérer les posts depuis l'API :

```javascript
async function loadPosts() {
    try {
        const response = await fetch(`${API_URL}/posts`, {
            headers: {
                'Authorization': `Bearer ${authToken}`  // Envoyer le token JWT
            }
        });
        
        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        document.getElementById('posts-container').innerHTML = 
            '<p style="color: red;">Erreur lors du chargement</p>';
    }
}

function displayPosts(posts) {
    const container = document.getElementById('posts-container');
    
    if (posts.length === 0) {
        container.innerHTML = '<p>Aucun post</p>';
        return;
    }
    
    // Créer le HTML pour chaque post
    container.innerHTML = posts.map(post => `
        <div style="background: #f8f9fa; padding: 15px; margin-bottom: 10px; border-radius: 4px;">
            <h3>${post.title}</h3>
            <p>${post.content}</p>
        </div>
    `).join('');
}
```

### 🧠 Concepts importants :

**Authorization: Bearer {token}**
- C'est le standard pour envoyer un JWT
- "Bearer" signifie "porteur" (celui qui porte le token)
- L'API vérifie ce token pour authentifier la requête

**map() et join()**
- `map()` transforme chaque élément d'un tableau
- `join('')` concatène tous les éléments en une seule chaîne

---

## ✍️ Exercice 1 : Créer un post

**À vous de jouer !**

1. Ajoutez un formulaire dans `#app-section` :

```html
<div class="card">
    <h2>Créer un post</h2>
    <form onsubmit="createPost(event)">
        <div class="form-group">
            <label>Titre</label>
            <input type="text" id="post-title" required>
        </div>
        <div class="form-group">
            <label>Contenu</label>
            <textarea id="post-content" required></textarea>
        </div>
        <button type="submit">Publier</button>
    </form>
</div>
```

2. Créez la fonction `createPost()` :

**Aide** :
- Utilisez `fetch()` avec `method: 'POST'`
- Endpoint : `/posts`
- N'oubliez pas le header `Authorization`
- Après succès, appelez `loadPosts()` pour rafraîchir la liste

<details>
<summary>💡 Solution</summary>

```javascript
async function createPost(event) {
    event.preventDefault();
    
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    
    try {
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ title, content })
        });
        
        if (response.ok) {
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
            loadPosts();
            showAlert('Post créé !', 'success');
        } else {
            showAlert('Erreur', 'error');
        }
    } catch (error) {
        showAlert('Erreur réseau', 'error');
    }
}
```
</details>

---

## 🗑️ Exercice 2 : Supprimer un post

**Objectif** : Ajouter un bouton "Supprimer" sur chaque post (seulement si c'est le vôtre)

**Étapes** :

1. Modifiez `displayPosts()` pour ajouter un bouton si `post.userId === currentUser.id`
2. Créez une fonction `deletePost(id)`
3. Utilisez `method: 'DELETE'` et l'endpoint `/posts/${id}`

<details>
<summary>💡 Solution</summary>

```javascript
function displayPosts(posts) {
    const container = document.getElementById('posts-container');
    
    if (posts.length === 0) {
        container.innerHTML = '<p>Aucun post</p>';
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div style="background: #f8f9fa; padding: 15px; margin-bottom: 10px; border-radius: 4px;">
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            ${post.userId === currentUser.id ? `
                <button onclick="deletePost(${post.id})" style="background: #dc3545;">
                    Supprimer
                </button>
            ` : ''}
        </div>
    `).join('');
}

async function deletePost(id) {
    if (!confirm('Supprimer ce post ?')) return;
    
    try {
        const response = await fetch(`${API_URL}/posts/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            loadPosts();
            showAlert('Post supprimé', 'success');
        }
    } catch (error) {
        showAlert('Erreur', 'error');
    }
}
```
</details>

---

## 🔄 Exercice 3 : Persister la connexion

**Problème** : Si on recharge la page, on est déconnecté !

**Objectif** : Utiliser localStorage pour garder la session

Ajoutez cette fonction au chargement de la page :

```javascript
window.onload = async () => {
    authToken = localStorage.getItem('token');
    
    if (authToken) {
        // Vérifier si le token est encore valide
        const user = await checkAuth();
        
        if (user) {
            showApp(user);
        } else {
            localStorage.removeItem('token');
        }
    }
};

async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        return response.ok ? await response.json() : null;
    } catch (error) {
        return null;
    }
}
```

---

## 🎓 Exercice 4 : Inscription (Bonus)

Créez un système d'onglets pour basculer entre connexion et inscription.

**Indices** :
- Utilisez deux formulaires
- Cachez l'un ou l'autre avec la classe `.hidden`
- Endpoint : `POST /register`
- Corps : `{ email, password, role }`

---

## 📊 Concepts clés à retenir

### 1. **Fetch API**
```javascript
fetch(url, options)
    .then(response => response.json())
    .then(data => { /* utiliser data */ })
    .catch(error => { /* gérer erreur */ });
```

### 2. **Async/Await**
```javascript
async function maFonction() {
    const response = await fetch(url);
    const data = await response.json();
}
```

### 3. **JWT (JSON Web Token)**
- Token généré lors de la connexion
- Contient les infos de l'utilisateur (cryptées)
- Envoyé dans le header `Authorization: Bearer {token}`
- Permet à l'API de savoir qui fait la requête

### 4. **localStorage**
- Stockage persistant dans le navigateur
- Survit au rechargement de la page
- Limité à ~5-10 MB
- Stocke uniquement des chaînes de caractères

### 5. **CRUD avec REST**
- **C**reate → POST
- **R**ead → GET
- **U**pdate → PUT
- **D**elete → DELETE

---

## 🐛 Debugging : Erreurs courantes

### Erreur CORS
```
Access to fetch at 'http://localhost:3000' has been blocked by CORS policy
```
**Solution** : L'API doit être lancée. Vérifiez que `api.exe` tourne.

### Token manquant
```json
{"error": "Token manquant"}
```
**Solution** : Ajoutez le header `Authorization: Bearer ${authToken}`

### Serveur ne répond pas
```
Failed to fetch
```
**Solution** : Vérifiez que `api.exe` est bien lancé sur le port 3000

---

## ✅ Checklist finale

- [ ] Connexion fonctionnelle
- [ ] Affichage du profil
- [ ] Liste des posts affichée
- [ ] Création de posts
- [ ] Suppression de ses propres posts
- [ ] Déconnexion
- [ ] Session persistante (localStorage)
- [ ] Gestion des erreurs
- [ ] Inscription (bonus)
- [ ] Modification de posts (bonus)

---

## 🚀 Pour aller plus loin

1. **Modifier un post** : Ajoutez un bouton "Modifier" qui remplit le formulaire
2. **Filtrer les posts** : Ajouter un champ de recherche
3. **Pagination** : N'afficher que 10 posts à la fois
4. **Validation** : Vérifier les champs côté client
5. **Messages de chargement** : Afficher "Chargement..." pendant les requêtes
6. **Améliorer le design** : Ajouter plus de CSS

---

## 📚 Ressources

- [Documentation MDN sur Fetch](https://developer.mozilla.org/fr/docs/Web/API/Fetch_API)
- [localStorage](https://developer.mozilla.org/fr/docs/Web/API/Window/localStorage)
- [Async/Await](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/async_function)
- [JWT.io](https://jwt.io/) - Décodeur de JWT

---

## 🎉 Félicitations !

Vous avez créé une application web complète qui communique avec une API REST, gère l'authentification et effectue des opérations CRUD !

**Compétences acquises** :
- ✅ Communication client-serveur
- ✅ Authentification JWT
- ✅ Gestion d'état avec localStorage
- ✅ Manipulation du DOM
- ✅ Programmation asynchrone
- ✅ Architecture REST
