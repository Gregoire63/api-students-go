package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/fatih/color"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// ─── Configuration ────────────────────────────────────────
// JWT_SECRET est lu depuis la variable d'environnement JWT_SECRET.
// Si elle est absente (développement local), on utilise une valeur
// par défaut en affichant un avertissement clair.
func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Println("⚠️  ATTENTION : JWT_SECRET non défini. Utilisez une variable d'environnement en production !")
		secret = "dev_secret_changez_moi_en_production"
	}
	return secret
}

// getAllowedOrigins retourne la liste des origines CORS autorisées.
// En production, définir ALLOWED_ORIGINS="https://webquest.onrender.com"
func getAllowedOrigins() []string {
	env := os.Getenv("ALLOWED_ORIGINS")
	if env != "" {
		parts := strings.Split(env, ",")
		origins := make([]string, 0, len(parts))
		for _, p := range parts {
			p = strings.TrimSpace(p)
			if p != "" {
				origins = append(origins, p)
			}
		}
		return origins
	}
	// Origines autorisées en développement local
	return []string{
		"http://localhost:3000",
		"http://localhost:5500",
		"http://127.0.0.1:5500",
		"http://localhost:8080",
		"http://127.0.0.1:8080",
		"http://localhost:8000",
		"http://127.0.0.1:8000",
	}
}

// getAppVersion retourne la version de l'application pour le cache-busting.
// Priorité : variable d'env APP_VERSION > fichier build_version.txt > "dev"
// Sur Render : définir APP_VERSION dans Environment (ex: "2025-02-14-001")
// En local   : créer un fichier build_version.txt avec le numéro de version
func getAppVersion() string {
	if v := strings.TrimSpace(os.Getenv("APP_VERSION")); v != "" {
		return v
	}
	data, err := os.ReadFile("build_version.txt")
	if err == nil {
		v := strings.TrimSpace(string(data))
		if v != "" {
			return v
		}
	}
	return "dev"
}

const (
	PORT     = ":3000"
	MAX_LOGS = 200
)

// ─── Stockage des logs ────────────────────────────────────
var (
	logBuffer []string
	logMu     sync.Mutex
)

// ─── Structures ───────────────────────────────────────────
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

type Claims struct {
	UserID int    `json:"userId"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// ─── Init ────────────────────────────────────────────────
func init() {
	db = &Database{
		Users: []User{},
		Posts: []Post{},
	}
	loadDatabase()
}

// ─── Logging middleware ───────────────────────────────────
type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (lrw *loggingResponseWriter) WriteHeader(code int) {
	lrw.statusCode = code
	lrw.ResponseWriter.WriteHeader(code)
}

func loggingMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			next(w, r)
			return
		}

		lrw := &loggingResponseWriter{ResponseWriter: w, statusCode: 200}
		var logEntry string

		if r.Method == "POST" || r.Method == "PUT" {
			body, _ := io.ReadAll(r.Body)
			r.Body = io.NopCloser(strings.NewReader(string(body)))
			// Ne pas logger les mots de passe
			logEntry = fmt.Sprintf("[%s] %s", r.Method, r.URL.Path)
		} else {
			logEntry = fmt.Sprintf("[%s] %s", r.Method, r.URL.Path)
		}

		addLog(logEntry)

		next(lrw, r)

		var statusColor *color.Color
		switch {
		case lrw.statusCode >= 500:
			statusColor = color.New(color.FgRed, color.Bold)
		case lrw.statusCode >= 400:
			statusColor = color.New(color.FgHiRed)
		case lrw.statusCode >= 300:
			statusColor = color.New(color.FgYellow)
		default:
			statusColor = color.New(color.FgGreen)
		}

		statusLog := fmt.Sprintf("Status %d", lrw.statusCode)
		addLog(statusLog)
		statusColor.Println(statusLog)
	}
}

// ─── Security headers middleware ──────────────────────────
func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Empêche le clickjacking
		w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		w.Header().Set("Content-Security-Policy", "frame-ancestors 'self'")
		// Empêche le MIME sniffing
		w.Header().Set("X-Content-Type-Options", "nosniff")
		// Force HTTPS (HSTS) — activer seulement si le domaine est entièrement HTTPS
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		// Politique de référent
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		// Permissions
		w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		next.ServeHTTP(w, r)
	})
}

// ─── CORS middleware ──────────────────────────────────────
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	allowedOrigins := getAllowedOrigins()

	return func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		allowed := false
		for _, o := range allowedOrigins {
			if origin == o {
				allowed = true
				break
			}
		}

		if allowed {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}
		// Si l'origine n'est pas dans la liste → pas d'en-tête CORS
		// (le navigateur bloquera la requête, ce qui est le comportement voulu)

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next(w, r)
	}
}

// ─── Auth middleware ──────────────────────────────────────
func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var tokenString string

		logExplain("Auth : recherche du token")
		cookie, err := r.Cookie("token")
		if err == nil {
			tokenString = cookie.Value
			logExplain("Token trouvé dans le cookie")
		} else {
			authHeader := r.Header.Get("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
				logExplain("Token trouvé dans Authorization header")
			}
		}

		if tokenString == "" {
			logExplain("Aucun token → accès refusé")
			respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Token manquant"})
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("méthode de signature inattendue: %v", t.Header["alg"])
			}
			return []byte(getJWTSecret()), nil
		})

		if err != nil || !token.Valid {
			logExplain("Token invalide ou expiré")
			respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Token invalide"})
			return
		}

		logExplain("Token valide — UserID=%d, Email=%s, Role=%s", claims.UserID, claims.Email, claims.Role)
		r.Header.Set("X-User-ID", fmt.Sprintf("%d", claims.UserID))
		r.Header.Set("X-User-Email", claims.Email)
		r.Header.Set("X-User-Role", claims.Role)

		next(w, r)
	}
}

// authIfNeeded applique authMiddleware uniquement pour certaines méthodes HTTP
func authIfNeeded(next http.HandlerFunc, protectedMethods ...string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		for _, m := range protectedMethods {
			if r.Method == m {
				authMiddleware(next)(w, r)
				return
			}
		}
		next(w, r)
	}
}

// ─── Main ────────────────────────────────────────────────
func main() {
	appVersion := getAppVersion()
	color.Cyan("📦 Version : %s\n", appVersion)

	mux := http.NewServeMux()

	// ── Fichiers statiques avec cache-busting ──────────────
	// Structure du dossier webquest/ :
	//   index.html, 404.html, manifest.json, robots.txt, sitemap.xml
	//   css/style.css   js/script.js   js/levels.js   images/*
	staticFS := http.FileServer(http.Dir("./webquest"))

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path

		// ── Fichiers à la racine servis directement ────────
		rootFiles := map[string]string{
			"/robots.txt":   "text/plain; charset=utf-8",
			"/sitemap.xml":  "application/xml; charset=utf-8",
			"/manifest.json": "application/manifest+json; charset=utf-8",
			"/favicon.ico":  "image/x-icon",
		}
		if ct, ok := rootFiles[path]; ok {
			// Chercher dans webquest/ puis dans webquest/images/
			candidates := []string{
				filepath.Join("./webquest", filepath.Clean(path)),
				filepath.Join("./webquest/images", filepath.Base(path)),
			}
			for _, candidate := range candidates {
				if _, err := os.Stat(candidate); err == nil {
					w.Header().Set("Content-Type", ct)
					if path == "/robots.txt" || path == "/sitemap.xml" {
						w.Header().Set("Cache-Control", "public, max-age=86400") // 1 jour
					} else {
						w.Header().Set("Cache-Control", "public, max-age=604800") // 1 semaine
					}
					http.ServeFile(w, r, candidate)
					return
				}
			}
		}

		// ── Assets statiques (css/, js/, images/) ─────────
		// Un "." dans le dernier segment = fichier asset
		if path != "/" && strings.Contains(filepath.Base(path), ".") {
			filePath := filepath.Join("./webquest", filepath.Clean(path))
			if _, err := os.Stat(filePath); os.IsNotExist(err) {
				handle404(w, r, appVersion)
				return
			}
			// Cache long sur les assets versionnés (?v=...) → 1 an
			// Cache court sur les autres assets → 1 heure
			if r.URL.RawQuery != "" {
				w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
			} else {
				w.Header().Set("Cache-Control", "public, max-age=3600")
			}
			staticFS.ServeHTTP(w, r)
			return
		}

		// ── Route SPA → index.html injecté ────────────────
		// ── Vérifie si le chemin existe réellement ────────
		filePath := filepath.Join("./webquest", filepath.Clean(path))
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			handle404(w, r, appVersion)
			return
		}

		// Sinon SPA
		serveIndex(w, r, appVersion)
	})

	// ── Dashboard ─────────────────────────────────────────
	mux.HandleFunc("/dashboard", func(w http.ResponseWriter, r *http.Request) {
		handleDashboard(w, r, appVersion)
	})

	// ── API ───────────────────────────────────────────────
	mux.HandleFunc("/api/register", loggingMiddleware(corsMiddleware(handleRegister)))
	mux.HandleFunc("/api/login",    loggingMiddleware(corsMiddleware(handleLogin)))
	mux.HandleFunc("/api/logout",   loggingMiddleware(corsMiddleware(handleLogout)))
	mux.HandleFunc("/api/me",       loggingMiddleware(corsMiddleware(authMiddleware(handleMe))))
	mux.HandleFunc("/api/posts",    loggingMiddleware(corsMiddleware(authIfNeeded(handlePosts, "POST"))))
	mux.HandleFunc("/api/posts/",   loggingMiddleware(corsMiddleware(authMiddleware(handlePostByID))))
	mux.HandleFunc("/api/logs",     corsMiddleware(handleLogs))
	mux.HandleFunc("/api/",         loggingMiddleware(corsMiddleware(handleAPIRoot)))

	// ── Security headers sur tout ─────────────────────────
	handler := securityHeaders(mux)

	addr := PORT
	color.Green("🚀 WebQuest démarré sur http://localhost%s\n", addr)
	fmt.Println("\nEndpoints disponibles :")
	fmt.Println("  POST   /api/register        - Créer un compte")
	fmt.Println("  POST   /api/login           - Se connecter")
	fmt.Println("  POST   /api/logout          - Se déconnecter")
	fmt.Println("  GET    /api/me              - Profil utilisateur (auth)")
	fmt.Println("  GET    /api/posts           - Liste des posts")
	fmt.Println("  POST   /api/posts           - Créer un post (auth)")
	fmt.Println("  GET    /api/posts/:id       - Détail d'un post")
	fmt.Println("  PUT    /api/posts/:id       - Modifier un post (auth)")
	fmt.Println("  DELETE /api/posts/:id       - Supprimer un post (auth)")
	fmt.Println("\nComptes test : admin@test.com / password | student@test.com / password")

	log.Fatal(http.ListenAndServe(addr, handler))
}

// ─── Handlers ────────────────────────────────────────────

// serveIndex lit index.html et injecte la version dans les URLs des assets.
// Cela force le navigateur à recharger JS/CSS quand APP_VERSION change.
func serveIndex(w http.ResponseWriter, r *http.Request, version string) {
	content, err := os.ReadFile("./webquest/index.html")
	if err != nil {
		handle404(w, r, version)
		return
	}

	html := string(content)

	// Injecter ?v=VERSION dans les liens CSS et JS locaux pour le cache-busting.
	// Couvre les deux structures : fichiers à plat ET sous-dossiers css/ js/
	replacements := []struct{ from, to string }{
		// CSS (racine et sous-dossier css/)
		{`href="style.css"`,       fmt.Sprintf(`href="style.css?v=%s"`, version)},
		{`href="./style.css"`,     fmt.Sprintf(`href="./style.css?v=%s"`, version)},
		{`href="css/style.css"`,   fmt.Sprintf(`href="css/style.css?v=%s"`, version)},
		{`href="./css/style.css"`, fmt.Sprintf(`href="./css/style.css?v=%s"`, version)},
		// JS principal (racine et sous-dossier js/)
		{`src="script.js"`,       fmt.Sprintf(`src="script.js?v=%s"`, version)},
		{`src="./script.js"`,     fmt.Sprintf(`src="./script.js?v=%s"`, version)},
		{`src="js/script.js"`,    fmt.Sprintf(`src="js/script.js?v=%s"`, version)},
		{`src="./js/script.js"`,  fmt.Sprintf(`src="./js/script.js?v=%s"`, version)},
		// Levels JS (racine et sous-dossier js/)
		{`src="levels.js"`,       fmt.Sprintf(`src="levels.js?v=%s"`, version)},
		{`src="./levels.js"`,     fmt.Sprintf(`src="./levels.js?v=%s"`, version)},
		{`src="js/levels.js"`,    fmt.Sprintf(`src="js/levels.js?v=%s"`, version)},
		{`src="./js/levels.js"`,  fmt.Sprintf(`src="./js/levels.js?v=%s"`, version)},
	}
	for _, rep := range replacements {
		html = strings.ReplaceAll(html, rep.from, rep.to)
	}

	// Ajouter une balise meta version pour le debug côté client
	html = strings.ReplaceAll(html,
		`</head>`,
		fmt.Sprintf(`    <meta name="app-version" content="%s">`+"\n</head>", version),
	)

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	// Ne pas cacher index.html — les assets JS/CSS sont cachés via ?v=
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	fmt.Fprint(w, html)
}

// handle404 sert une page d'erreur 404 stylisée.
func handle404(w http.ResponseWriter, r *http.Request, version string) {
	content, err := os.ReadFile("./webquest/404.html")
	if err != nil {
		// Fallback minimal si 404.html manque
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprint(w, `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>404 – WebQuest</title></head><body><h1>404 – Page introuvable</h1><a href="/">Retour à l'accueil</a></body></html>`)
		return
	}
	html := strings.ReplaceAll(string(content), `{{VERSION}}`, version)
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusNotFound)
	fmt.Fprint(w, html)
}

func handleDashboard(w http.ResponseWriter, r *http.Request, version string) {
	content, err := os.ReadFile("./webquest/dashboard.html")
	if err != nil {
		handle404(w, r, version)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprint(w, string(content))
}


func handleLogs(w http.ResponseWriter, r *http.Request) {
	logMu.Lock()
	defer logMu.Unlock()
	respondJSON(w, http.StatusOK, map[string]interface{}{"logs": logBuffer})
}

func handleAPIRoot(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, map[string]string{
		"message": "API WebQuest",
		"version": "1.0.0",
	})
}

func handleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Méthode non autorisée"})
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logExplain("Impossible de décoder le body")
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Données invalides"})
		return
	}

	req.Email    = strings.TrimSpace(strings.ToLower(req.Email))
	req.Password = strings.TrimSpace(req.Password)

	if req.Email == "" || req.Password == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Email et mot de passe requis"})
		return
	}
	if len(req.Password) < 6 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Mot de passe trop court (min 6 caractères)"})
		return
	}
	if req.Role == "" {
		req.Role = "student"
	}
	// Empêcher la création de comptes admin via l'API publique
	if req.Role == "admin" {
		req.Role = "student"
	}

	db.mu.Lock()
	defer db.mu.Unlock()

	for _, user := range db.Users {
		if user.Email == req.Email {
			respondJSON(w, http.StatusConflict, map[string]string{"error": "Email déjà utilisé"})
			return
		}
	}

	logExplain("Création d'un nouveau compte pour %s", req.Email)
	newUser := User{
		ID:       len(db.Users) + 1,
		Email:    req.Email,
		Password: hashPassword(req.Password),
		Role:     req.Role,
	}
	db.Users = append(db.Users, newUser)
	saveDatabase()

	newUser.Password = ""
	logExplain("Compte créé avec succès (ID=%d)", newUser.ID)
	respondJSON(w, http.StatusCreated, newUser)
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Méthode non autorisée"})
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Données invalides"})
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	db.mu.RLock()
	defer db.mu.RUnlock()

	logExplain("Tentative de connexion pour %s", req.Email)
	var foundUser *User
	for i := range db.Users {
		if db.Users[i].Email == req.Email {
			foundUser = &db.Users[i]
			break
		}
	}

	if foundUser == nil {
		// Délai constant pour éviter les timing attacks (énumération d'emails)
		time.Sleep(200 * time.Millisecond)
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Email ou mot de passe incorrect"})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(req.Password))
	logExplain("Comparaison du hash bcrypt")
	if err != nil {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Email ou mot de passe incorrect"})
		return
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID: foundUser.ID,
		Email:  foundUser.Email,
		Role:   foundUser.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(getJWTSecret()))
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Erreur interne"})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Expires:  expirationTime,
		HttpOnly: true,  // Inaccessible depuis JavaScript → protection XSS
		Path:     "/",
		Secure:   true,  // HTTPS uniquement en production
		SameSite: http.SameSiteNoneMode,
	})

	userCopy          := *foundUser
	userCopy.Password  = ""
	logExplain("Connexion réussie pour %s", req.Email)
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"token": tokenString,
		"user":  userCopy,
	})
}

func handleLogout(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Méthode non autorisée"})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		Path:     "/",
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	})

	logExplain("Déconnexion réussie")
	respondJSON(w, http.StatusOK, map[string]string{"message": "Déconnexion réussie"})
}

func handleMe(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Méthode non autorisée"})
		return
	}

	email := r.Header.Get("X-User-Email")
	db.mu.RLock()
	defer db.mu.RUnlock()

	for _, user := range db.Users {
		if user.Email == email {
			user.Password = ""
			respondJSON(w, http.StatusOK, user)
			return
		}
	}
	respondJSON(w, http.StatusNotFound, map[string]string{"error": "Utilisateur non trouvé"})
}

func handlePosts(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		db.mu.RLock()
		defer db.mu.RUnlock()
		respondJSON(w, http.StatusOK, db.Posts)

	case "POST":
		userIDHeader := r.Header.Get("X-User-ID")
		if userIDHeader == "" {
			respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Authentification requise"})
			return
		}

		var post Post
		if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Données invalides"})
			return
		}

		post.Title   = strings.TrimSpace(post.Title)
		post.Content = strings.TrimSpace(post.Content)
		if post.Title == "" || post.Content == "" {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Titre et contenu requis"})
			return
		}

		db.mu.Lock()
		defer db.mu.Unlock()

		post.ID = len(db.Posts) + 1
		fmt.Sscanf(userIDHeader, "%d", &post.UserID)
		db.Posts = append(db.Posts, post)
		saveDatabase()
		logExplain("Post créé (ID=%d) par UserID=%s", post.ID, userIDHeader)
		respondJSON(w, http.StatusCreated, post)

	default:
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Méthode non autorisée"})
	}
}

func handlePostByID(w http.ResponseWriter, r *http.Request) {
	id := 0
	fmt.Sscanf(strings.TrimPrefix(r.URL.Path, "/api/posts/"), "%d", &id)
	if id == 0 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "ID invalide"})
		return
	}

	userID := 0
	fmt.Sscanf(r.Header.Get("X-User-ID"), "%d", &userID)
	userRole := r.Header.Get("X-User-Role")

	switch r.Method {
	case "GET":
		db.mu.RLock()
		defer db.mu.RUnlock()
		for _, post := range db.Posts {
			if post.ID == id {
				respondJSON(w, http.StatusOK, post)
				return
			}
		}
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "Post non trouvé"})

	case "PUT":
		var updatedPost Post
		if err := json.NewDecoder(r.Body).Decode(&updatedPost); err != nil {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Données invalides"})
			return
		}

		db.mu.Lock()
		defer db.mu.Unlock()
		for i, post := range db.Posts {
			if post.ID == id {
				if post.UserID != userID && userRole != "admin" {
					respondJSON(w, http.StatusForbidden, map[string]string{"error": "Accès refusé"})
					return
				}
				db.Posts[i].Title   = strings.TrimSpace(updatedPost.Title)
				db.Posts[i].Content = strings.TrimSpace(updatedPost.Content)
				saveDatabase()
				respondJSON(w, http.StatusOK, db.Posts[i])
				return
			}
		}
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "Post non trouvé"})

	case "DELETE":
		db.mu.Lock()
		defer db.mu.Unlock()
		for i, post := range db.Posts {
			if post.ID == id {
				if post.UserID != userID && userRole != "admin" {
					respondJSON(w, http.StatusForbidden, map[string]string{"error": "Accès refusé"})
					return
				}
				db.Posts = append(db.Posts[:i], db.Posts[i+1:]...)
				saveDatabase()
				respondJSON(w, http.StatusOK, map[string]string{"message": "Post supprimé"})
				return
			}
		}
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "Post non trouvé"})

	default:
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Méthode non autorisée"})
	}
}

// ─── Utilitaires ─────────────────────────────────────────

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("respondJSON error: %v", err)
	}
}

func logExplain(format string, a ...interface{}) {
	addLog("[EXPLAIN] " + fmt.Sprintf(format, a...))
}

func loadDatabase() {
	file, err := os.Open("db.json")
	if err != nil {
		log.Println("db.json introuvable, création avec les données par défaut")
		db.Users = []User{
			{ID: 1, Email: "admin@test.com",   Password: hashPassword("password"), Role: "admin"},
			{ID: 2, Email: "student@test.com", Password: hashPassword("password"), Role: "student"},
		}
		db.Posts = []Post{
			{ID: 1, Title: "Premier post", Content: "Contenu du premier post", UserID: 1},
		}
		saveDatabase()
		return
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		log.Fatal("Erreur lecture db.json :", err)
	}
	if err := json.Unmarshal(data, db); err != nil {
		log.Fatal("Erreur parsing db.json :", err)
	}
	log.Printf("Base de données chargée : %d utilisateurs, %d posts", len(db.Users), len(db.Posts))
}

func saveDatabase() {
	data, err := json.MarshalIndent(db, "", "  ")
	if err != nil {
		log.Println("Erreur sérialisation db :", err)
		return
	}
	if err := os.WriteFile("db.json", data, 0600); err != nil {
		log.Println("Erreur écriture db.json :", err)
	}
}

func hashPassword(password string) string {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Impossible de hasher le mot de passe :", err)
	}
	return string(hashed)
}

func addLog(message string) {
	logMu.Lock()
	defer logMu.Unlock()

	timestamp := time.Now().Format("15:04:05")
	entry     := fmt.Sprintf("[%s] %s", timestamp, message)
	fmt.Println(entry)

	logBuffer = append(logBuffer, entry)
	if len(logBuffer) > MAX_LOGS {
		logBuffer = logBuffer[len(logBuffer)-MAX_LOGS:]
	}
}