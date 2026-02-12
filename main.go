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
	"os/exec"
	"runtime"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Stockage des logs
const MAX_LOGS = 200
var (
	logBuffer []string
	logMu     sync.Mutex
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

// Initialisation
func init() {
	db = &Database{
		Users: []User{},
		Posts: []Post{},
	}
	loadDatabase()
}

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

		var logs string

		if r.Method == "POST" || r.Method == "PUT" {
			body, _ := io.ReadAll(r.Body)
			r.Body = io.NopCloser(strings.NewReader(string(body)))

			logs = fmt.Sprintf("[%s] %s\nBody: %s",
				r.Method,
				r.URL.Path,
				string(body),
			)

		} else {
			logs = fmt.Sprintf("[%s] %s",
				r.Method,
				r.URL.Path,
			)
		}

		addLog(logs)
		fmt.Print(logs)

		next(lrw, r)

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

		statusLog := fmt.Sprintf("Status %d", lrw.statusCode)

		addLog(statusLog)
		statusColor.Print(statusLog)
	}
}

func authIfNeeded(next http.HandlerFunc, protectedMethods ...string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Vérifie si la méthode doit être protégée
		needsAuth := false
		for _, m := range protectedMethods {
			if r.Method == m {
				needsAuth = true
				break
			}
		}

		if needsAuth {
			// Si la méthode est protégée, applique l'authMiddleware
			authMiddleware(next)(w, r)
			return
		}

		// Sinon, on passe directement au handler
		next(w, r)
	}
}

func openBrowser(url string) {
	var err error

	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin": // macOS
		err = exec.Command("open", url).Start()
	}

	if err != nil {
		log.Println("Impossible d'ouvrir le navigateur :", err)
	}
}

func main() {
	mux := http.NewServeMux()

    fs := http.FileServer(http.Dir("./webquest"))
	mux.Handle("/", fs)
	mux.HandleFunc("/api/register", loggingMiddleware(corsMiddleware(handleRegister)))
	mux.HandleFunc("/api/login", loggingMiddleware(corsMiddleware(handleLogin)))
	mux.HandleFunc("/api/logout", loggingMiddleware(corsMiddleware(handleLogout)))
	mux.HandleFunc("/api/me", loggingMiddleware(corsMiddleware(authMiddleware(handleMe))))
    mux.HandleFunc("/api/posts", loggingMiddleware(corsMiddleware(authIfNeeded(handlePosts, "POST"))))
	mux.HandleFunc("/api/posts/", loggingMiddleware(corsMiddleware(authMiddleware(handlePostByID))))
	mux.HandleFunc("/api/logs", corsMiddleware(handleLogs))
	mux.HandleFunc("/api/", loggingMiddleware(corsMiddleware(handleRoot)))


	go func() {
		log.Fatal(http.ListenAndServe(":3000", mux))
	}()
    url := "http://localhost"+PORT
	color.Green("API WebQuest démarrée sur %s\n", url)
	fmt.Println("\nEndpoints :")
	fmt.Println("  POST /register               - Créer un compte")
	fmt.Println("  POST /login                  - Se connecter")
	fmt.Println("  POST /logout                 - Se déconnecter")
	fmt.Println("  GET /me                      - Profil utilisateur")
	fmt.Println("  GET|POST /posts              - Liste des posts|Créer un post")
	fmt.Println("  GET|PUT|DELETE /posts/:id    - Détail d'un post|Modifier un post|Supprimer un post")
	fmt.Println("\nComptes test : admin@test.com / student@test.com  (password)")

    openBrowser(url)

	select {}
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

        for _, allowedOrigin := range allowedOrigins {
            if origin == allowedOrigin {
                w.Header().Set("Access-Control-Allow-Origin", origin)
                break
            }
        }

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
	addLog("[EXPLAIN] " + fmt.Sprintf(format, a...))
}

// Handlers

func handleLogs(w http.ResponseWriter, r *http.Request) {
	logMu.Lock()
	defer logMu.Unlock()

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"logs": logBuffer,
	})
}

func handleRoot(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, map[string]string{
		"message": "API WebQuest - Apprendre le Frontend",
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

    userCopy := *foundUser
    userCopy.Password = ""

    respondJSON(w, http.StatusOK, map[string]interface{}{
        "token": tokenString,
        "user":  userCopy,
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
		// 🔐 PROTÉGÉ : auth requise
		userIDHeader := r.Header.Get("X-User-ID")
		if userIDHeader == "" {
			respondJSON(w, http.StatusUnauthorized, map[string]string{
				"error": "Authentification requise",
			})
			return
		}

		var post Post
		if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
			logExplain("Impossible de lire les données du post")
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Données invalides"})
			return
		}

		db.mu.Lock()
		defer db.mu.Unlock()

		post.ID = len(db.Posts) + 1
		fmt.Sscanf(userIDHeader, "%d", &post.UserID)
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

func addLog(message string) {
	logMu.Lock()
	defer logMu.Unlock()

	timestamp := time.Now().Format("15:04:05")
	entry := fmt.Sprintf("[%s] %s", timestamp, message)

	fmt.Println(entry) // console Render

	logBuffer = append(logBuffer, entry)

	// Garder seulement les MAX_LOGS dernières lignes
	if len(logBuffer) > MAX_LOGS {
		logBuffer = logBuffer[len(logBuffer)-MAX_LOGS:]
	}
}