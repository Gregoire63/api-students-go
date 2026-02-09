package main

import (
	"github.com/fatih/color"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
	"path/filepath"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Configuration
const (
	JWT_SECRET = "votre_secret_super_securise_changez_moi"
	PORT       = ":3000"
)

// Structures de données
type User struct {
	ID       int    `json:"id"`
	Email    string `json:"email"`
	Password string `json:"password,omitempty"`
	Role     string `json:"role"`
}

type Post struct {
	ID      int    `json:"id"`
	Title   string `json:"title"`
	Content string `json:"content"`
	UserID  int    `json:"userId"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type Database struct {
	Users []User `json:"users"`
	Posts []Post `json:"posts"`
	mu    sync.RWMutex
}

var db *Database

// Claims JWT personnalisés
type Claims struct {
	UserID int    `json:"userId"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func generateFrontend() {
	// Chemin du dossier à créer à côté de l'exécutable
	dir := "frontend"

	// Créer le dossier s'il n'existe pas
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		err := os.Mkdir(dir, 0755)
		if err != nil {
			log.Fatal("Impossible de créer le dossier frontend :", err)
		}
	}

	// Fichier index.html avec un TD de connexion et affichage des posts
	indexHTML := `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Students - Interface</title>
    <link rel="stylesheet" href="/style.css">
    <script src="/script.js"></script>
</head>
<body>
    <div class="container">
        <!-- Section Non connecté -->
        <div id="auth-section">
            <div class="card">
                <div class="tabs">
                    <button class="tab active" onclick="switchAuthTab('login')">Connexion</button>
                    <button class="tab" onclick="switchAuthTab('register')">Inscription</button>
                </div>

                <div id="alert-container"></div>

                <!-- Formulaire de connexion -->
                <div id="login-form">
                    <h2>Se connecter</h2>
                    <form onsubmit="login(event)">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="login-email" required placeholder="demo@example.com">
                        </div>
                        <div class="form-group">
                            <label>Mot de passe</label>
                            <input type="password" id="login-password" required placeholder="password123">
                        </div>
                        <button type="submit">Se connecter</button>
                    </form>
                    <p style="margin-top: 15px; color: #666;">
                    </p>
                </div>

                <!-- Formulaire d'inscription -->
                <div id="register-form" class="hidden">
                    <h2>Créer un compte</h2>
                    <form onsubmit="register(event)">
                        <div class="form-group">
                            <label>Nom</label>
                            <input type="text" id="register-name" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="register-email" required>
                        </div>
                        <div class="form-group">
                            <label>Mot de passe</label>
                            <input type="password" id="register-password" required>
                        </div>
                        <button type="submit">S'inscrire</button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Section Connecté -->
        <div id="app-section" class="hidden">
            <!-- Profil utilisateur -->
            <div class="card">
                <div class="user-info">
                    <h3>Profil</h3>
                    <p id="user-name"></p>
                    <p id="user-email"></p>
                </div>
                <button class="secondary" onclick="logout()">Se déconnecter</button>
            </div>

            <!-- Créer un post -->
            <div class="card">
                <h2>Créer un post</h2>
                <div id="post-alert-container"></div>
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
                    <button type="button" class="secondary" onclick="cancelEdit()">Annuler</button>
                </form>
            </div>

            <!-- Liste des posts -->
            <div class="card">
                <h2>Tous les posts</h2>
                <div id="posts-container">
                    <div class="loading">Chargement...</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
	indexCSS := `* {
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

h1 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
}

.card {
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 20px;
}

h2 {
    margin-bottom: 15px;
    color: #333;
    font-size: 18px;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    color: #555;
    font-size: 14px;
}

input, textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

input:focus, textarea:focus {
    outline: none;
    border-color: #4a90e2;
}

textarea {
    resize: vertical;
    min-height: 80px;
}

button {
    background: #4a90e2;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

button:hover {
    background: #357abd;
}

button.secondary {
    background: #6c757d;
    margin-left: 10px;
}

button.secondary:hover {
    background: #5a6268;
}

button.danger {
    background: #dc3545;
}

button.danger:hover {
    background: #c82333;
}

.tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.tab {
    padding: 8px 16px;
    background: #e9ecef;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.tab.active {
    background: #4a90e2;
    color: white;
}

.hidden {
    display: none !important;
}

.post-item {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 10px;
    border-left: 3px solid #4a90e2;
}

.post-item h3 {
    margin-bottom: 8px;
    font-size: 16px;
    color: #333;
}

.post-item p {
    color: #666;
    margin-bottom: 10px;
    font-size: 14px;
}

.post-actions {
    display: flex;
    gap: 8px;
}

.post-actions button {
    padding: 6px 12px;
    font-size: 13px;
}

.user-info {
    background: #e9ecef;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 15px;
}

.user-info p {
    margin: 5px 0;
    color: #333;
    font-size: 14px;
}

.alert {
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 15px;
    font-size: 14px;
}

.alert-success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.alert-error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.info {
    color: #666;
    font-size: 13px;
    margin-top: 10px;
}`
indexJS := `const API_URL = 'http://localhost:3000';
let currentUser = null;
let editingPostId = null;

// Vérifier si l'utilisateur est connecté au chargement
window.onload = async () => {
    const user = await checkAuth();
    if (user) {
        showApp(user);
        loadPosts();
    }
};

// Vérifier l'authentification
async function checkAuth() {
    try {
        const response = await fetch(` + "`" + `${API_URL}/me` + "`" + `, {
            credentials: 'include'
        });
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        return null;
    }
}

// Changer d'onglet auth
function switchAuthTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'login') {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
    } else {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    }
}

// Inscription
async function register(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(` + "`" + `${API_URL}/register` + "`" + `, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Inscription réussie ! Vous pouvez vous connecter.', 'success');
            switchAuthTab('login');
            document.getElementById('login-email').value = email;
        } else {
            showAlert(data.error || 'Erreur lors de l\'inscription', 'error');
        }
    } catch (error) {
        showAlert('Erreur de connexion au serveur', 'error');
    }
}

// Connexion
async function login(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        console.log(API_URL)
        const response = await fetch(` + "`" + `${API_URL}/login` + "`" + `, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showApp(data.user);
            loadPosts();
        } else {
            showAlert(data.error || 'Erreur de connexion', 'error');
        }
    } catch (error) {
        showAlert('Erreur de connexion au serveur', 'error');
    }
}

// Déconnexion
async function logout() {
    try {
        await fetch(` + "`" + `${API_URL}/logout` + "`" + `, {
            method: 'POST',
            credentials: 'include'
        });
        currentUser = null;
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('app-section').classList.add('hidden');
        showAlert('Déconnexion réussie', 'success');
    } catch (error) {
        showAlert('Erreur lors de la déconnexion', 'error');
    }
}

// Afficher l'application
function showApp(user) {
    currentUser = user;
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('app-section').classList.remove('hidden');
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;
}

// Charger les posts
async function loadPosts() {
    try {
        const response = await fetch(` + "`" + `${API_URL}/posts` + "`" + `, {
            credentials: 'include'
        });
        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        document.getElementById('posts-container').innerHTML = 
            '<p style="color: red;">Erreur lors du chargement des posts</p>';
    }
}

// Afficher les posts
function displayPosts(posts) {
    const container = document.getElementById('posts-container');
    
    if (posts.length === 0) {
        container.innerHTML = '<p style="color: #666;">Aucun post pour le moment</p>';
        return;
    }

    container.innerHTML = posts.map(post => ` + "`" + `
        <div class="post-item">
            <h3>${escapeHtml(post.title)}</h3>
            <p>${escapeHtml(post.content)}</p>
            ${post.userId === currentUser.id ? ` + "`" + `
                <div class="post-actions">
                    <button onclick="editPost(${post.id})">Modifier</button>
                    <button class="danger" onclick="deletePost(${post.id})">Supprimer</button>
                </div>
            ` + "`" + ` : ''}
        </div>
    ` + "`" + `).join('');
}

// Créer un post
async function createPost(event) {
    event.preventDefault();
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;

    const url = editingPostId 
        ? ` + "`" + `${API_URL}/posts/${editingPostId}` + "`" + ` 
        : ` + "`" + `${API_URL}/posts` + "`" + `;
    const method = editingPostId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ title, content })
        });

        if (response.ok) {
            showPostAlert(editingPostId ? 'Post modifié !' : 'Post créé !', 'success');
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
            editingPostId = null;
            loadPosts();
        } else {
            const data = await response.json();
            showPostAlert(data.error || 'Erreur', 'error');
        }
    } catch (error) {
        showPostAlert('Erreur de connexion', 'error');
    }
}

// Modifier un post
async function editPost(id) {
    try {
        const response = await fetch(` + "`" + `${API_URL}/posts/${id}` + "`" + `, {
            credentials: 'include'
        });
        const post = await response.json();
        
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-content').value = post.content;
        editingPostId = id;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showPostAlert('Mode édition activé', 'success');
    } catch (error) {
        showPostAlert('Erreur lors du chargement du post', 'error');
    }
}

// Annuler l'édition
function cancelEdit() {
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    editingPostId = null;
    showPostAlert('Édition annulée', 'success');
}

// Supprimer un post
async function deletePost(id) {
    if (!confirm('Voulez-vous vraiment supprimer ce post ?')) return;

    try {
        const response = await fetch(` + "`" + `${API_URL}/posts/${id}` + "`" + `, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            showPostAlert('Post supprimé', 'success');
            loadPosts();
        } else {
            showPostAlert('Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        showPostAlert('Erreur de connexion', 'error');
    }
}

// Afficher une alerte
function showAlert(message, type) {
    const container = document.getElementById('alert-container');
    container.innerHTML = ` + "`" + `<div class="alert alert-${type}">${message}</div>` + "`" + `;
    setTimeout(() => container.innerHTML = '', 5000);
}

function showPostAlert(message, type) {
    const container = document.getElementById('post-alert-container');
    container.innerHTML = ` + "`" + `<div class="alert alert-${type}">${message}</div>` + "`" + `;
    setTimeout(() => container.innerHTML = '', 5000);
}

// Échapper HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}`
	// Fichier README pour guider les élèves
	readme := `# TD API et Auth
Ce mini-site interagit avec l'API Go locale.

## Objectifs pédagogiques
1. Se connecter via l'API (login)
2. Voir la liste des posts (requête GET)
3. Comprendre le rôle des cookies et token JWT
4. Modifier le front pour créer un post, afficher son profil, etc.

## Instructions
1. Lancer le serveur Go : go run main.go
2. Ouvrir frontend/index.html dans le navigateur
3. Suivre les boutons et instructions pour explorer l'API`

	// Écrire les fichiers
	files := map[string]string{
		"index.html": indexHTML,
		"README.md":  readme,
		"style.css":  indexCSS,
		"script.js":  indexJS,
	}

	for name, content := range files {
		path := filepath.Join(dir, name)
		err := os.WriteFile(path, []byte(content), 0644)
		if err != nil {
			log.Fatal("Impossible de créer le fichier", path, ":", err)
		}
	}
	log.Println("✅ Frontend pédagogique généré dans le dossier", dir)
}

// Initialisation
func init() {
	db = &Database{
		Users: []User{},
		Posts: []Post{},
	}
	loadDatabase()
}

func loggingMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			next(w, r)
			return
		}
		// Pour récupérer le status code, on wrap le ResponseWriter
		lrw := &loggingResponseWriter{ResponseWriter: w, statusCode: 200}

		// Lire le body pour POST/PUT
		if r.Method == "POST" || r.Method == "PUT" {
			body, _ := io.ReadAll(r.Body)
			r.Body = io.NopCloser(strings.NewReader(string(body))) // reset pour le handler
			fmt.Printf("[%s] %s\nBody: %s\n", r.Method, r.URL.Path, string(body))
		} else {
			fmt.Printf("[%s] %s\n", r.Method, r.URL.Path)
		}

		next(lrw, r)

		// Colorer le status
		var statusColor *color.Color
		switch {
		case lrw.statusCode >= 500:
			statusColor = color.New(color.FgRed).Add(color.Bold)
		case lrw.statusCode >= 400:
			statusColor = color.New(color.FgHiRed)
		case lrw.statusCode >= 300:
			statusColor = color.New(color.FgYellow)
		default:
			statusColor = color.New(color.FgGreen)
		}

		statusColor.Printf("Status: %d\n\n", lrw.statusCode)
	}
}

type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (lrw *loggingResponseWriter) WriteHeader(code int) {
	lrw.statusCode = code
	lrw.ResponseWriter.WriteHeader(code)
}

func main() {
	generateFrontend()
	// Routes publiques
	http.HandleFunc("/register", loggingMiddleware(corsMiddleware(handleRegister)))
	http.HandleFunc("/login", loggingMiddleware(corsMiddleware(handleLogin)))
	http.HandleFunc("/logout", loggingMiddleware(corsMiddleware(handleLogout)))

	http.HandleFunc("/me", loggingMiddleware(corsMiddleware(authMiddleware(handleMe))))
	http.HandleFunc("/posts", loggingMiddleware(corsMiddleware(authMiddleware(handlePosts))))
	http.HandleFunc("/posts/", loggingMiddleware(corsMiddleware(authMiddleware(handlePostByID))))

	// Route de test
	http.HandleFunc("/", loggingMiddleware(corsMiddleware(handleRoot)))

	fmt.Println("API démarrée sur http://localhost" + PORT)
	fmt.Println("Endpoints disponibles:")
	fmt.Println("   POST   /register    - Créer un compte")
	fmt.Println("   POST   /login       - Se connecter")
	fmt.Println("   POST   /logout      - Se déconnecter")
	fmt.Println("   GET    /me          - Profil utilisateur")
	fmt.Println("   GET    /posts       - Liste des posts")
	fmt.Println("   POST   /posts       - Créer un post")
	fmt.Println("   GET    /posts/:id   - Détail d'un post")
	fmt.Println("   PUT    /posts/:id   - Modifier un post")
	fmt.Println("   DELETE /posts/:id   - Supprimer un post")
	fmt.Println("")
	fmt.Println("Comptes de démo:")
	fmt.Println("   Admin    : admin@test.com / password")
	fmt.Println("   Student  : student@test.com / password")

	log.Fatal(http.ListenAndServe(PORT, nil))
}

// Middleware CORS
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		
		allowedOrigins := []string{
            "http://localhost:3000",
			"http://localhost:5500",
            "http://127.0.0.1:5500",
            "http://localhost:8080",
            "http://127.0.0.1:8080",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
        }

        // Vérifie si l'origine est dans la liste blanche
        for _, allowedOrigin := range allowedOrigins {
            if origin == allowedOrigin {
                w.Header().Set("Access-Control-Allow-Origin", origin)
                break
            }
        }

        // Si l'origine n'est pas dans la liste blanche, utilise une origine par défaut (ou refuse)
        if w.Header().Get("Access-Control-Allow-Origin") == "" {
            w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5501")
        }
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

// Middleware d'authentification
func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var tokenString string
		logExplain("Middleware auth : vérification de la présence d'un token")
		cookie, err := r.Cookie("token")
		if err == nil {
			tokenString = cookie.Value
			logExplain("Token trouvé dans le cookie")
		} else {
			authHeader := r.Header.Get("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
				logExplain("Token trouvé dans l'en-tête Authorization")
			}
		}

		if tokenString == "" {
			logExplain("Aucun token trouvé, accès refusé")
			respondJSON(w, http.StatusUnauthorized, map[string]string{
				"error": "Token manquant",
			})
			return
		}

		logExplain("Décodage du token JWT pour vérifier l'authentification")
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(JWT_SECRET), nil
		})

		if err != nil || !token.Valid {
			logExplain("Le token est invalide ou expiré, accès refusé")
			respondJSON(w, http.StatusUnauthorized, map[string]string{
				"error": "Token invalide",
			})
			return
		}
		logExplain("Token valide, extraction des informations utilisateur : ID=%d, Email=%s, Role=%s",
			claims.UserID, claims.Email, claims.Role)
		r.Header.Set("X-User-ID", fmt.Sprintf("%d", claims.UserID))
		r.Header.Set("X-User-Email", claims.Email)
		r.Header.Set("X-User-Role", claims.Role)
		logExplain("Passage au handler suivant avec les informations utilisateur ajoutées aux headers")

		next(w, r)
	}
}

func logExplain(format string, a ...interface{}) {
	fmt.Printf("[EXPLAIN] "+format+"\n", a...)
}

// Handlers
func handleRoot(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, map[string]string{
		"message": "API REST avec authentification JWT",
		"version": "1.0.0",
	})
}

func handleRegister(w http.ResponseWriter, r *http.Request) {
	logExplain("Nouvelle requête : /register, méthode %s", r.Method)
	if r.Method != "POST" {
		logExplain("La méthode n'est pas POST, impossible de créer un compte")
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Méthode non autorisée"})
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logExplain("Impossible de lire les données envoyées")
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Données invalides"})
		return
	}
	if req.Email == "" || req.Password == "" {
		logExplain("Les informations sont incomplètes : email ou mot de passe manquant")
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Email et mot de passe requis"})
		return
	}

	if req.Role == "" {
		req.Role = "student"
		logExplain("Aucun rôle fourni, rôle par défaut 'student' assigné")
	}

	db.mu.Lock()
	defer db.mu.Unlock()

	logExplain("On vérifie si l'email n'existe pas déjà en base")
	for _, user := range db.Users {
		if user.Email == req.Email {
			respondJSON(w, http.StatusConflict, map[string]string{"error": "Email déjà utilisé"})
			return
		}
	}

	newUser := User{
		ID:       len(db.Users) + 1,
		Email:    req.Email,
		Password: hashPassword(req.Password),
		Role:     req.Role,
	}
	logExplain("Mot de passe hashé avant d'être stockage en base de donnée")
	db.Users = append(db.Users, newUser)
	saveDatabase()
	logExplain("Compte créé avec succès, stocké dans la base de données")
	newUser.Password = ""
	respondJSON(w, http.StatusCreated, newUser)
	logExplain("Réponse de réussite envoyée au client")
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	logExplain("Nouvelle requête : /login, méthode %s", r.Method)
	if r.Method != "POST" {
		logExplain("La méthode n'est pas POST, impossible de se connecter")
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Méthode non autorisée"})
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logExplain("Impossible de lire les données envoyées")
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Données invalides"})
		return
	}

	db.mu.RLock()
	defer db.mu.RUnlock()

	logExplain("On vérifie sur l'email existe dans la base de donnée")
	var foundUser *User
	for i := range db.Users {
		if db.Users[i].Email == req.Email {
			foundUser = &db.Users[i]
			break
		}
	}

	if foundUser == nil {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Aucun compte avec cet email"})
		return
	}
	err := bcrypt.CompareHashAndPassword(
		[]byte(foundUser.Password),
		[]byte(req.Password),
	)
	logExplain("Le mot de passe est comparé à celui qui est hashé en base de données")
	if err != nil {
		fmt.Println("bcrypt FAIL :", err)
		respondJSON(w, http.StatusUnauthorized, map[string]string{
			"error": "Mot de passe incorrect",
		})
		return
	}

	logExplain("Génération d'un token d'identification")
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID: foundUser.ID,
		Email:  foundUser.Email,
		Role:   foundUser.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}
	logExplain("Token JWT créé avec une durée de vie limité et envoyé dans un cookie sécurisé")
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(JWT_SECRET))
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Erreur serveur"})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Expires:  expirationTime,
		HttpOnly: true,
		Path:     "/",
		Secure: true,
		SameSite: http.SameSiteNoneMode,
	})

	foundUser.Password = ""
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"token": tokenString,
		"user":  foundUser,
	})
	logExplain("Connexion réussie, réponse envoyée au client")
}

func handleLogout(w http.ResponseWriter, r *http.Request) {
	logExplain("Nouvelle requête : /logout, méthode %s", r.Method)
	if r.Method != "POST" {
		logExplain("La méthode n'est pas POST, impossible de se déconnecter")
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Méthode non autorisée"})
		return
	}

	logExplain("Suppression du cookie d'authentification pour déconnexion")
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Expires:  time.Now().Add(-1 * time.Hour),
		HttpOnly: true,
		Path:     "/",
	})

	respondJSON(w, http.StatusOK, map[string]string{"message": "Déconnexion réussie"})
	logExplain("Déconnexion réussie, réponse envoyée au client")
}

func handleMe(w http.ResponseWriter, r *http.Request) {
	logExplain("Nouvelle requête : /me, méthode %s", r.Method)
	if r.Method != "GET" {
		logExplain("La méthode n'est pas GET, impossible de récupérer le profil")
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Méthode non autorisée"})
		return
	}

	email := r.Header.Get("X-User-Email")
	logExplain("Recherche de l'utilisateur avec email : %s", email)

	db.mu.RLock()
	defer db.mu.RUnlock()

	for _, user := range db.Users {
		if user.Email == email {
			logExplain("Utilisateur trouvé, envoi du profil sans le mot de passe")
			user.Password = ""
			respondJSON(w, http.StatusOK, user)
			return
		}
	}
	logExplain("Utilisateur non trouvé")
	respondJSON(w, http.StatusNotFound, map[string]string{"error": "Utilisateur non trouvé"})
}

func handlePosts(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	logExplain("Nouvelle requête : /posts, méthode %s, utilisateur ID=%s", r.Method, userID)
	switch r.Method {
	case "GET":
		logExplain("Récupération de tous les posts depuis la base")
		db.mu.RLock()
		defer db.mu.RUnlock()
		respondJSON(w, http.StatusOK, db.Posts)

	case "POST":
		logExplain("Création d'un nouveau post")
		var post Post
		if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
			logExplain("Impossible de lire les données du post")
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Données invalides"})
			return
		}

		db.mu.Lock()
		defer db.mu.Unlock()

		post.ID = len(db.Posts) + 1
		fmt.Sscanf(userID, "%d", &post.UserID)
		db.Posts = append(db.Posts, post)
		saveDatabase()
		logExplain("Post ajouté à la base avec ID=%d", post.ID)
		respondJSON(w, http.StatusCreated, post)

	default:
		logExplain("Méthode non autorisée sur /posts")
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Méthode non autorisée"})
	}
}

func handlePostByID(w http.ResponseWriter, r *http.Request) {
	id := 0
	fmt.Sscanf(strings.TrimPrefix(r.URL.Path, "/posts/"), "%d", &id)

	if id == 0 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "ID invalide"})
		return
	}

	userID := 0
	fmt.Sscanf(r.Header.Get("X-User-ID"), "%d", &userID)
	logExplain("Nouvelle requête : /posts/%d, méthode %s, utilisateur ID=%d", id, r.Method, userID)
	switch r.Method {
	case "GET":
		logExplain("Recherche du post avec ID=%d", id)
		db.mu.RLock()
		defer db.mu.RUnlock()

		for _, post := range db.Posts {
			if post.ID == id {
				respondJSON(w, http.StatusOK, post)
				return
			}
		}
		logExplain("Post non trouvé")
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "Post non trouvé"})

	case "PUT":
		logExplain("Modification du post avec ID=%d", id)
		var updatedPost Post
		if err := json.NewDecoder(r.Body).Decode(&updatedPost); err != nil {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Données invalides"})
			return
		}

		db.mu.Lock()
		defer db.mu.Unlock()

		for i, post := range db.Posts {
			if post.ID == id {
				if post.UserID != userID {
					logExplain("L'utilisateur n'est pas autorisé à modifier ce post")
					respondJSON(w, http.StatusForbidden, map[string]string{"error": "Accès refusé"})
					return
				}
				db.Posts[i].Title = updatedPost.Title
				db.Posts[i].Content = updatedPost.Content
				saveDatabase()
				logExplain("Post mis à jour")
				respondJSON(w, http.StatusOK, db.Posts[i])
				return
			}
		}
		logExplain("Post non trouvé")
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "Post non trouvé"})

	case "DELETE":
		logExplain("Suppression du post avec ID=%d", id)
		db.mu.Lock()
		defer db.mu.Unlock()

		for i, post := range db.Posts {
			if post.ID == id {
				if post.UserID != userID {
					logExplain("L'utilisateur n'est pas autorisé à supprimer ce post")
					respondJSON(w, http.StatusForbidden, map[string]string{"error": "Accès refusé"})
					return
				}
				db.Posts = append(db.Posts[:i], db.Posts[i+1:]...)
				saveDatabase()
				logExplain("Post supprimé")
				respondJSON(w, http.StatusOK, map[string]string{"message": "Post supprimé"})
				return
			}
		}
		logExplain("Post non trouvé")
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "Post non trouvé"})

	default:
		logExplain("Méthode non autorisée sur /posts/%d", id)
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Méthode non autorisée"})
	}
}

// Utilitaires
func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func loadDatabase() {
	file, err := os.Open("db.json")
	if err != nil {
		// Fichier n'existe pas, on initialise avec des données de démo
		adminHash := hashPassword("password")
		studentHash := hashPassword("password")
		db.Users = []User{
			{
				ID:       1,
				Email:    "admin@test.com",
				Password: adminHash,
				Role:     "admin",
			},
			{
				ID:       2,
				Email:    "student@test.com",
				Password: studentHash,
				Role:     "student",
			},
		}
		db.Posts = []Post{
			{ID: 1, Title: "Premier post", Content: "Contenu du premier post", UserID: 1},
		}
		saveDatabase()
		return
	}
	defer file.Close()

	data, _ := io.ReadAll(file)
	json.Unmarshal(data, db)
}

func saveDatabase() {
	data, _ := json.MarshalIndent(db, "", "  ")
	os.WriteFile("db.json", data, 0644)
}

func hashPassword(password string) string {
    hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        log.Fatal("Impossible de hasher le mot de passe :", err)
    }
    return string(hashed)
}