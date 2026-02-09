# API Students - Documentation Enseignant

## 📦 Contenu du package

Vous devez fournir aux élèves :

1. **api.exe** - Le serveur API (compiler depuis main.go)
2. **TD_API_Client.md** - Le support de TD pour les élèves
3. **index.html** (optionnel) - La correction complète

---

## 🔧 Compilation de l'API

### Prérequis
- Go 1.21+ installé

### Étapes
1. Créer le projet :
```bash
go mod init api-students
go mod tidy
```

2. Compiler pour Windows :
```bash
go build -o api.exe main.go
```

3. Compiler pour d'autres OS (si nécessaire) :
```bash
# macOS
GOOS=darwin GOARCH=amd64 go build -o api-macos main.go

# Linux
GOOS=linux GOARCH=amd64 go build -o api-linux main.go
```

---

## 📚 Utilisation en cours

### Avant le TD

1. Distribuez `api.exe` et `TD_API_Client.md` aux élèves
2. Demandez-leur de créer un dossier de travail
3. Ils doivent lancer `api.exe` avant de commencer

### Pendant le TD

**Durée estimée** : 2-3h

**Progression suggérée** :
1. **0-30min** : Structure HTML et CSS (Étapes 1-2)
2. **30min-1h** : Comprendre fetch() et implémenter login() (Étapes 3-5)
3. **1h-1h30** : Affichage de l'application et des posts (Étapes 6-7)
4. **1h30-2h** : Exercice 1 - Créer un post
5. **2h-2h30** : Exercice 2 - Supprimer un post
6. **2h30-3h** : Exercices 3-4 (Bonus)

### Points de vigilance

- **CORS** : Les élèves doivent ouvrir index.html directement (pas via un serveur local comme Live Server au début)
- **Token JWT** : Expliquer le concept de bearer token
- **localStorage** : Bien montrer les DevTools → Application → Local Storage
- **async/await** : Comparer avec les .then() si besoin

---

## 🎯 Objectifs pédagogiques

### Compétences techniques
- Communication HTTP avec fetch()
- Gestion asynchrone (async/await)
- Manipulation du DOM
- Stockage local (localStorage)
- Authentification JWT

### Concepts web
- Architecture client-serveur
- API REST
- CRUD
- Authentification/Autorisation
- Sécurité (tokens)

---

## 📋 Comptes de test

L'API crée automatiquement deux comptes :
- **Admin** : `admin@test.com` / `password`
- **Student** : `student@test.com` / `password`

Les élèves peuvent aussi s'inscrire via l'API.

---

## 🐛 Problèmes courants

### L'API ne démarre pas
- Port 3000 déjà utilisé → Tuer le processus ou modifier PORT dans main.go
- Fichier db.json corrompu → Le supprimer, il sera recréé

### CORS bloqué
- Ouvrir index.html directement (file://)
- Ou utiliser l'extension "CORS Unblock" sur Chrome

### Token invalide
- Le token expire après 24h
- Supprimer localStorage et se reconnecter

### Posts non visibles
- Vérifier que le token est bien envoyé dans le header
- Vérifier la console pour les erreurs

---

## 📊 Évaluation suggérée

### Critères de notation

**Connexion/Déconnexion (4 points)**
- [ ] Formulaire de connexion fonctionnel (2pts)
- [ ] Gestion des erreurs (1pt)
- [ ] Déconnexion (1pt)

**Affichage des posts (3 points)**
- [ ] Récupération des posts (2pts)
- [ ] Affichage correct (1pt)

**Création de post (4 points)**
- [ ] Formulaire fonctionnel (2pts)
- [ ] Envoi à l'API (1pt)
- [ ] Rafraîchissement de la liste (1pt)

**Suppression de post (3 points)**
- [ ] Bouton visible seulement pour ses posts (1pt)
- [ ] Suppression fonctionnelle (2pts)

**Persistance (3 points)**
- [ ] localStorage utilisé (2pts)
- [ ] Session maintenue après reload (1pt)

**Code et bonnes pratiques (3 points)**
- [ ] Code propre et indenté (1pt)
- [ ] Gestion des erreurs (1pt)
- [ ] Nommage des variables (1pt)

**Total : /20**

---

## 📁 Structure des fichiers fournis

```
TD_API/
├── api.exe                  # L'API compilée
├── TD_API_Client.md         # Le support de TD
├── index.html               # Correction (à ne donner qu'à la fin)
└── README_PROF.md           # Ce fichier
```

---

## 💡 Extensions possibles

Pour les élèves avancés :

1. **Inscription** : Ajouter un formulaire d'inscription
2. **Modification** : Permettre de modifier un post
3. **Recherche** : Filtrer les posts par titre
4. **Pagination** : Afficher 5 posts par page
5. **Catégories** : Ajouter des tags aux posts (nécessite modif API)
6. **Upload d'images** : Ajouter des images aux posts (avancé)

---

## 🔐 Sécurité - Points à aborder

1. **Ne jamais stocker de mots de passe en clair**
   - L'API utilise bcrypt

2. **HTTPS en production**
   - localhost:3000 est HTTP (OK pour le TD)
   - En production, utiliser HTTPS

3. **XSS (Cross-Site Scripting)**
   - Toujours échapper le HTML des utilisateurs
   - Voir la fonction `escapeHtml()` dans la correction

4. **Tokens JWT**
   - Expiration après 24h
   - Stocker dans localStorage (simplifié pour le TD)
   - En production, préférer les httpOnly cookies

---

## 📞 Support

En cas de problème technique :

1. Vérifier que `api.exe` tourne
2. Vérifier la console du navigateur (F12)
3. Vérifier l'onglet Network pour voir les requêtes
4. Supprimer `db.json` et relancer l'API

---

## 📝 Notes pour les variantes

### Variante 1 : Sans localStorage (plus simple)
- Retirer l'exercice 3
- L'utilisateur doit se reconnecter à chaque rechargement

### Variante 2 : Avec React (avancé)
- Utiliser create-react-app
- Même logique mais avec des composants
- Durée : 4-5h

### Variante 3 : Avec TypeScript
- Typer les réponses API
- Interfaces pour User, Post, etc.
- Durée : 3-4h

---

Bon TD ! 🚀
