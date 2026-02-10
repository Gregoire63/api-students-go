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
    <title>WebQuest - Apprendre le Frontend</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header avec progression -->
    <header class="game-header">
        <div class="container">
            <h1>WebQuest</h1>
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill"></div>
                <span class="progress-text" id="progress-text">Niveau 0/12</span>
            </div>
            <div class="score">
                <span id="score">0</span> XP
            </div>
        </div>
    </header>

    <main class="container">
        <!-- Menu de navigation des niveaux -->
        <nav class="level-nav" id="level-nav">
            <!-- Généré dynamiquement par JS -->
        </nav>

        <!-- Zone de contenu du niveau -->
        <div class="level-container">
            <div class="lesson-panel" id="lesson-panel">
                <h2 id="lesson-title">Chargement...</h2>
                <div id="lesson-content"></div>
            </div>

            <div class="exercise-panel">
                <h3>Mission</h3>
                <div id="exercise-description"></div>
                
                <div class="code-editor">
                    <div class="editor-tabs">
                        <button class="tab active" data-file="html">index.html</button>
                        <button class="tab" data-file="css">style.css</button>
                        <button class="tab" data-file="js">script.js</button>
                    </div>
                    <textarea id="code-editor" spellcheck="false"></textarea>
                </div>

                <div class="editor-actions">
                    <button onclick="runCode()" class="btn-primary">▶ Exécuter</button>
                    <button onclick="resetCode()" class="btn-secondary">Reset</button>
                    <button onclick="validateLevel()" class="btn-success">✓ Valider</button>
                </div>

                <div class="preview-panel">
                    <h4>Aperçu</h4>
                    <iframe id="preview"></iframe>
                </div>

                <div id="feedback" class="feedback"></div>
            </div>
        </div>
    </main>

    <script src="levels.js"></script>
    <script src="script.js"></script>
</body>
</html>`
	indexCSS := `:root {
    --bg-primary: #0a0e27;
    --bg-secondary: #1a1f3a;
    --bg-tertiary: #252b4a;
    --accent: #00ff88;
    --accent-glow: rgba(0, 255, 136, 0.3);
    --text: #e0e0e0;
    --text-dim: #a0a0a0;
    --error: #ff4444;
    --success: #00ff88;
    --warning: #ffaa00;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Space Mono', monospace;
    background: var(--bg-primary);
    color: var(--text);
    line-height: 1.6;
    overflow-x: hidden;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header */
.game-header {
    background: var(--bg-secondary);
    padding: 20px 0;
    border-bottom: 3px solid var(--accent);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 5px 20px rgba(0, 255, 136, 0.2);
}

.game-header .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
}

.game-header h1 {
    font-family: 'Press Start 2P', cursive;
    font-size: 24px;
    color: var(--accent);
    text-shadow: 0 0 10px var(--accent-glow);
    white-space: nowrap;
}

.progress-bar {
    flex: 1;
    height: 30px;
    background: var(--bg-primary);
    border: 2px solid var(--accent);
    border-radius: 15px;
    position: relative;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), #00cc66);
    transition: width 0.5s ease;
    box-shadow: 0 0 20px var(--accent-glow);
}

.progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: bold;
    text-shadow: 0 0 5px #000;
    font-size: 12px;
}

.score {
    font-family: 'Press Start 2P', cursive;
    font-size: 18px;
    color: var(--accent);
    padding: 10px 20px;
    background: var(--bg-primary);
    border: 2px solid var(--accent);
    border-radius: 10px;
    white-space: nowrap;
}

/* Navigation niveaux */
.level-nav {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 15px;
    margin: 30px 0;
}

.level-btn {
    padding: 15px;
    background: var(--bg-secondary);
    border: 2px solid var(--bg-tertiary);
    color: var(--text-dim);
    cursor: pointer;
    border-radius: 10px;
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    transition: all 0.3s;
    position: relative;
}

.level-btn:hover:not(.locked) {
    border-color: var(--accent);
    transform: translateY(-3px);
    box-shadow: 0 5px 15px var(--accent-glow);
}

.level-btn.active {
    background: var(--accent);
    color: var(--bg-primary);
    font-weight: bold;
    border-color: var(--accent);
}

.level-btn.completed {
    border-color: var(--success);
    background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
}

.level-btn.completed::after {
    content: '✓';
    position: absolute;
    top: 5px;
    right: 10px;
    color: var(--success);
    font-size: 18px;
}

.level-btn.locked {
    opacity: 0.4;
    cursor: not-allowed;
}

/* Conteneur du niveau */
.level-container {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 30px;
    margin-bottom: 40px;
}

/* Panneau de leçon */
.lesson-panel {
    background: var(--bg-secondary);
    padding: 30px;
    border-radius: 15px;
    border: 2px solid var(--bg-tertiary);
    max-height: 100%;
    overflow-y: auto;
}

.lesson-panel h2 {
    color: var(--accent);
    margin-bottom: 20px;
    font-size: 24px;
}

.lesson-panel h3 {
    color: var(--accent);
    margin: 25px 0 15px 0;
    font-size: 18px;
}

.lesson-panel code {
    background: var(--bg-primary);
    padding: 2px 6px;
    border-radius: 4px;
    color: var(--accent);
    font-size: 14px;
}

.lesson-panel pre {
    background: var(--bg-primary);
    padding: 15px;
    border-radius: 8px;
    overflow-x: auto;
    border-left: 3px solid var(--accent);
    margin: 15px 0;
}

.lesson-panel pre code {
    background: none;
    padding: 0;
}

.lesson-panel ul, .lesson-panel ol {
    margin-left: 20px;
    margin-bottom: 15px;
}

.lesson-panel li {
    margin-bottom: 8px;
}

/* Panneau d'exercice */
.exercise-panel {
    background: var(--bg-secondary);
    padding: 30px;
    border-radius: 15px;
    border: 2px solid var(--bg-tertiary);
}

.exercise-panel h3 {
    color: var(--accent);
    margin-bottom: 15px;
    font-size: 20px;
}

#exercise-description {
    margin-bottom: 20px;
    padding: 15px;
    background: var(--bg-primary);
    border-radius: 8px;
    border-left: 3px solid var(--warning);
}

/* Éditeur de code */
.code-editor {
    margin: 20px 0;
}

.editor-tabs {
    display: flex;
    gap: 5px;
    margin-bottom: -2px;
}

.editor-tabs .tab {
    padding: 10px 20px;
    background: var(--bg-tertiary);
    border: 2px solid var(--bg-tertiary);
    border-bottom: none;
    color: var(--text-dim);
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    font-family: 'Space Mono', monospace;
    transition: all 0.2s;
}

.editor-tabs .tab:hover {
    background: var(--bg-secondary);
}

.editor-tabs .tab.active {
    background: var(--bg-primary);
    border-color: var(--accent);
    color: var(--accent);
}

#code-editor {
    width: 100%;
    min-height: 300px;
    background: var(--bg-primary);
    color: var(--text);
    border: 2px solid var(--accent);
    border-radius: 0 8px 8px 8px;
    padding: 15px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 14px;
    line-height: 1.5;
    resize: vertical;
}

/* Actions de l'éditeur */
.editor-actions {
    display: flex;
    gap: 10px;
    margin: 20px 0;
}

.btn-primary, .btn-secondary, .btn-success {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: bold;
}

.btn-primary {
    background: var(--accent);
    color: var(--bg-primary);
}

.btn-primary:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 20px var(--accent-glow);
}

.btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text);
}

.btn-secondary:hover {
    background: var(--bg-secondary);
}

.btn-success {
    background: var(--success);
    color: var(--bg-primary);
}

.btn-success:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 20px rgba(0, 255, 136, 0.4);
}

/* Aperçu */
.preview-panel {
    margin-top: 20px;
}

.preview-panel h4 {
    color: var(--accent);
    margin-bottom: 10px;
}

#preview {
    width: 100%;
    min-height: 300px;
    background: white;
    border: 2px solid var(--accent);
    border-radius: 8px;
}

/* Feedback */
.feedback {
    margin-top: 20px;
    padding: 15px;
    border-radius: 8px;
    display: none;
}

.feedback.show {
    display: block;
    animation: slideIn 0.3s ease;
}

.feedback.success {
    background: rgba(0, 255, 136, 0.2);
    border: 2px solid var(--success);
    color: var(--success);
}

.feedback.error {
    background: rgba(255, 68, 68, 0.2);
    border: 2px solid var(--error);
    color: var(--error);
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Scrollbar personnalisée */
::-webkit-scrollbar {
    width: 12px;
}

::-webkit-scrollbar-track {
    background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
    background: var(--accent);
    border-radius: 6px;
}

::-webkit-scrollbar-thumb:hover {
    background: #00cc66;
}

@media (max-width: 1024px) {
    .level-container {
        grid-template-columns: 1fr;
    }
    
    .game-header h1 {
        font-size: 16px;
    }
}`
indexJS := `// État de l'application
let currentLevel = 0;
let completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
let totalXP = parseInt(localStorage.getItem('totalXP') || '0');
let currentFile = 'html';
let activeError = null
let codeStates = {
    html: '',
    css: '',
    js: ''
};

window.addEventListener('message', (event) => {
    console.log(event)
    if (event.data?.type === 'iframeError') {
        activeError = event.data;
        showFeedback(
            ` + "`" + `❌ Erreur JS : ${event.data.message} (ligne ${event.data.line ?? '?'})` + "`" + `,
            'error'
        );
    }
});

// Initialisation au chargement
window.addEventListener('DOMContentLoaded', () => {
    renderLevelNav();
    loadLevel(0);
    updateProgress();
    setupEditorTabs();
});

// Rendre la navigation des niveaux
function renderLevelNav() {
    const nav = document.getElementById('level-nav');
    nav.innerHTML = '';
    
    levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.className = 'level-btn';
        button.textContent = ` + "`" + `${level.id}. ${level.title.split(' ')[0]}` + "`" + `;
        
        // État du niveau
        if (completedLevels.includes(level.id)) {
            button.classList.add('completed');
        }
        if (index === currentLevel) {
            button.classList.add('active');
        }
        if (index > 0 && !completedLevels.includes(levels[index - 1].id)) {
            button.classList.add('locked');
            button.disabled = true;
        }
        
        button.addEventListener('click', () => {
            if (!button.classList.contains('locked')) {
                loadLevel(index);
            }
        });
        
        nav.appendChild(button);
    });
}

// Charger un niveau
function loadLevel(index) {
    currentLevel = index;
    const level = levels[index];
    
    // Mettre à jour l'interface
    document.getElementById('lesson-title').textContent = level.title;
    document.getElementById('lesson-content').innerHTML = level.lesson;
    document.getElementById('exercise-description').innerHTML = level.exercise.description;
    
    // Charger le code de départ
    codeStates = { ...level.exercise.starterCode };
    document.getElementById('code-editor').value = codeStates.html;
    
    // Réinitialiser l'aperçu
    document.getElementById('preview').srcdoc = '';
    hideFeedback();
    
    // Mettre à jour la navigation
    renderLevelNav();
}

const errorGuard = ` + "`" + `
<script>
(function () {
    window.__HAS_ERROR__ = false;
    window.__ERROR_INFO__ = null;

    function reportError(data) {
        window.__HAS_ERROR__ = true;
        window.__ERROR_INFO__ = data;
        window.parent.postMessage({
            type: 'iframeError',
            ...data
        }, '*');
    }

    const previousOnError = window.onerror;

    window.onerror = function (message, source, line, column, error) {
        reportError({
            message,
            line,
            column,
            stack: error ? error.stack : null
        });

        // 🔁 laisser les autres handlers agir
        if (typeof previousOnError === 'function') {
            return previousOnError(message, source, line, column, error);
        }

        return false; // ❗ important
    };

    window.addEventListener('unhandledrejection', function (event) {
        reportError({
            message: event.reason?.message || 'Promise rejetée',
            stack: event.reason?.stack || null
        });
    });
})();
<\/script>
` + "`" + `;

// Configuration des onglets de l'éditeur
function setupEditorTabs() {
    const tabs = document.querySelectorAll('.editor-tabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Sauvegarder le code actuel
            codeStates[currentFile] = document.getElementById('code-editor').value;
            
            // Changer de fichier
            currentFile = tab.dataset.file;
            document.getElementById('code-editor').value = codeStates[currentFile];
            
            // Mettre à jour l'interface
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

// Exécuter le code
function runCode() {
    activeError = null;

    // Sauvegarder le code courant
    codeStates[currentFile] = document.getElementById('code-editor').value;

    const html = codeStates.html || '';
    const css = codeStates.css || '';
    const js = codeStates.js || '';

    const fullHTML = ` + "`" + `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
    ${css}
    </style>
</head>
<body>

${html}


<script>
${js}
</script>

</body>
</html>
` + "`" + `;

    const iframe = document.getElementById('preview');

    try {
        iframe.srcdoc = fullHTML;
    } catch (error) {
        try {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write(fullHTML);
            doc.close();
        } catch (err) {
            showFeedback("❌ Erreur lors de l'exécution du code", 'error');
            console.error(err);
        }
    }
}

// Réinitialiser le code
function resetCode() {
    const level = levels[currentLevel];
    codeStates = { ...level.exercise.starterCode };
    document.getElementById('code-editor').value = codeStates[currentFile];
    document.getElementById('preview').srcdoc = '';
    hideFeedback();
}

// Valider le niveau
function validateLevel() {
    if(activeError) {
        console.log(activeError)
        showFeedback("❌ Erreur dans votre code :"+activeError.message, 'error');
        return;
    }

    // Sauvegarder le code actuel
    codeStates[currentFile] = document.getElementById('code-editor').value;
    
    // Récupérer l'iframe et son document
    const iframe = document.getElementById('preview');
    let iframeDoc;
    
    try {
        iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    } catch (error) {
        showFeedback("❌ Erreur d'accès à l'aperçu. Exécutez votre code d'abord (bouton ▶)", 'error');
        return;
    }
    
    if (!iframeDoc || !iframeDoc.body) {
        showFeedback("❌ Exécutez votre code d'abord (bouton ▶)", 'error');
        return;
    }
    
    // Valider avec la fonction du niveau
    const level = levels[currentLevel];
    try {
        const result = level.exercise.validation(iframeDoc);
        
        if (result.success) {
            // Niveau réussi !
            if (!completedLevels.includes(level.id)) {
                completedLevels.push(level.id);
                totalXP += level.xp;
                localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
                localStorage.setItem('totalXP', totalXP.toString());
            }
            
            showFeedback(result.message, 'success');
            updateProgress();
            renderLevelNav();
            
            // Passer au niveau suivant automatiquement après 2 secondes
            setTimeout(() => {
                if (currentLevel < levels.length - 1) {
                    loadLevel(currentLevel + 1);
                }
            }, 2000);
        } else {
            showFeedback(result.message, 'error');
        }
    } catch (error) {
        showFeedback("❌ Erreur de validation : " + error.message, 'error');
        console.error('Validation error:', error);
    }
}

// Afficher un feedback
function showFeedback(message, type) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = ` + "`" + `feedback ${type} show` + "`" + `;
}

// Cacher le feedback
function hideFeedback() {
    const feedback = document.getElementById('feedback');
    feedback.className = 'feedback';
}

// Mettre à jour la barre de progression
function updateProgress() {
    const completed = completedLevels.length;
    const total = levels.length;
    const percentage = (completed / total) * 100;
    
    document.getElementById('progress-fill').style.width = ` + "`" + `${percentage}%` + "`" + `;
    document.getElementById('progress-text').textContent = ` + "`" + `Niveau ${completed}/${total}` + "`" + `;
    document.getElementById('score').textContent = totalXP;
}

// Raccourcis clavier
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter pour exécuter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
    }
    
    // Ctrl/Cmd + S pour sauvegarder (exécuter)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        runCode();
    }
});`
	levels := `// Définition de tous les niveaux du jeu
const levels = [
    {
        id: 1,
        title: "🌟 HTML - Les Bases",
        xp: 100,
        lesson: ` + "`" + `
            <h3>Qu'est-ce que le HTML ?</h3>
            <p>HTML (HyperText Markup Language) est le langage de balisage utilisé pour créer des pages web. Il structure le contenu grâce à des balises.</p>
            
            <h3>Structure de base</h3>
            <pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;title&gt;Ma page&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;h1&gt;Mon titre&lt;/h1&gt;
    &lt;p&gt;Mon paragraphe&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>

            <h3>Balises importantes</h3>
            <ul>
                <li><code>&lt;h1&gt;</code> à <code>&lt;h6&gt;</code> : Titres (du plus au moins important)</li>
                <li><code>&lt;p&gt;</code> : Paragraphe</li>
                <li><code>&lt;div&gt;</code> : Conteneur générique</li>
                <li><code>&lt;span&gt;</code> : Conteneur inline</li>
                <li><code>&lt;a href="..."&gt;</code> : Lien</li>
                <li><code>&lt;img src="..." alt="..."&gt;</code> : Image</li>
            </ul>
        ` + "`" + `,
        exercise: {
            description: "Créez une page HTML avec un titre h1 'Bienvenue' et un paragraphe décrivant qui vous êtes.",
            starterCode: {
                html: ` + "`" + `<!DOCTYPE html>
<html>
<head>
    <title>Ma première page</title>
</head>
<body>
    <!-- Écrivez votre code ici -->
    
</body>
</html>` + "`" + `,
                css: '',
                js: ''
            },
            validation: (doc) => {
                const h1 = doc.querySelector('h1');
                const p = doc.querySelector('p');
                if (!h1) return { success: false, message: "❌ Il manque un titre h1" };
                if (!p) return { success: false, message: "❌ Il manque un paragraphe" };
                return { success: true, message: "🎉 Parfait ! Vous maîtrisez les bases du HTML !" };
            }
        }
    },
    {
        id: 2,
        title: "🎨 CSS - Styliser vos pages",
        xp: 150,
        lesson: ` + "`" + `
            <h3>Qu'est-ce que le CSS ?</h3>
            <p>CSS (Cascading Style Sheets) permet de styliser vos pages HTML : couleurs, tailles, positions, etc.</p>
            
            <h3>Comment ajouter du CSS ?</h3>
            <p>Trois méthodes :</p>
            <ul>
                <li><strong>Inline</strong> : <code>&lt;p style="color: red;"&gt;</code></li>
                <li><strong>Interne</strong> : dans une balise <code>&lt;style&gt;</code></li>
                <li><strong>Externe</strong> : fichier .css séparé</li>
            </ul>

            <h3>Sélecteurs de base</h3>
            <pre><code>/* Par élément */
p { color: blue; }

/* Par classe */
.ma-classe { font-size: 20px; }

/* Par ID */
#mon-id { background: yellow; }

/* Combinaison */
div.container p { margin: 10px; }</code></pre>

            <h3>Propriétés courantes</h3>
            <ul>
                <li><code>color</code> : couleur du texte</li>
                <li><code>background-color</code> : couleur de fond</li>
                <li><code>font-size</code> : taille du texte</li>
                <li><code>margin</code> : marge extérieure</li>
                <li><code>padding</code> : marge intérieure</li>
                <li><code>border</code> : bordure</li>
            </ul>
        ` + "`" + `,
        exercise: {
            description: "Stylisez votre page : titre en bleu, paragraphe avec fond jaune et padding de 10px.",
            starterCode: {
                html: ` + "`" + `<!DOCTYPE html>
<html>
<head>
    <title>CSS Basics</title>
    <style>
        /* Ajoutez votre CSS ici */
        
    </style>
</head>
<body>
    <h1>Mon Titre</h1>
    <p>Mon paragraphe de texte</p>
</body>
</html>` + "`" + `,
                css: '',
                js: ''
            },
            validation: (doc) => {
                const h1 = doc.querySelector('h1');
                const p = doc.querySelector('p');
                
                if (!h1 || !p) return { success: false, message: "❌ Éléments HTML manquants" };
                
                const h1Style = window.getComputedStyle(h1);
                const pStyle = window.getComputedStyle(p);
                
                const isH1Blue = h1Style.color === 'rgb(0, 0, 255)' || h1Style.color === 'blue';
                const hasBgColor = pStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';
                const hasPadding = parseInt(pStyle.padding) > 0;
                
                if (!isH1Blue) return { success: false, message: "❌ Le titre doit être bleu" };
                if (!hasBgColor) return { success: false, message: "❌ Le paragraphe doit avoir un fond coloré" };
                if (!hasPadding) return { success: false, message: "❌ Le paragraphe doit avoir du padding" };
                
                return { success: true, message: "🎉 Excellent ! Le CSS n'a plus de secret pour vous !" };
            }
        }
    },
    {
        id: 3,
        title: "🔗 Les Liens et Navigation",
        xp: 100,
        lesson: ` + "`" + `
            <h3>Créer des liens</h3>
            <p>La balise <code>&lt;a&gt;</code> permet de créer des liens :</p>
            <pre><code>&lt;a href="https://google.com"&gt;Aller sur Google&lt;/a&gt;
&lt;a href="#section"&gt;Ancre locale&lt;/a&gt;
&lt;a href="page2.html"&gt;Page 2&lt;/a&gt;</code></pre>

            <h3>Attributs importants</h3>
            <ul>
                <li><code>href</code> : URL de destination</li>
                <li><code>target="_blank"</code> : ouvrir dans un nouvel onglet</li>
                <li><code>title</code> : texte au survol</li>
            </ul>

            <h3>Styliser les liens</h3>
            <pre><code>a {
    color: blue;
    text-decoration: none;
}

a:hover {
    color: red;
    text-decoration: underline;
}</code></pre>
        ` + "`" + `,
        exercise: {
            description: "Créez 3 liens : un vers Google, un vers Wikipedia, et un vers MDN. Stylez-les pour qu'ils soient verts et deviennent oranges au survol.",
            starterCode: {
                html: ` + "`" + `<!DOCTYPE html>
<html>
<head>
    <style>
        /* Votre CSS ici */
        
    </style>
</head>
<body>
    <h1>Mes liens favoris</h1>
    <!-- Ajoutez vos 3 liens ici -->
    
</body>
</html>` + "`" + `,
                css: '',
                js: ''
            },
            validation: (doc) => {
                const links = doc.querySelectorAll('a');
                if (links.length < 3) return { success: false, message: "❌ Il faut au moins 3 liens" };
                
                const firstLinkStyle = window.getComputedStyle(links[0]);
                const hasGreen = firstLinkStyle.color.includes('0, 128, 0') || firstLinkStyle.color === 'green';
                
                if (!hasGreen) return { success: false, message: "❌ Les liens doivent être verts" };
                
                return { success: true, message: "🎉 Bravo ! La navigation web n'a plus de secret !" };
            }
        }
    },
    {
        id: 4,
        title: "📋 Les Formulaires",
        xp: 200,
        lesson: ` + "`" + `
            <h3>Créer un formulaire</h3>
            <p>Les formulaires permettent de collecter des données utilisateur.</p>
            
            <pre><code>&lt;form&gt;
    &lt;label for="nom"&gt;Nom :&lt;/label&gt;
    &lt;input type="text" id="nom" name="nom"&gt;
    
    &lt;label for="email"&gt;Email :&lt;/label&gt;
    &lt;input type="email" id="email" name="email"&gt;
    
    &lt;button type="submit"&gt;Envoyer&lt;/button&gt;
&lt;/form&gt;</code></pre>

            <h3>Types d'input</h3>
            <ul>
                <li><code>text</code> : texte simple</li>
                <li><code>email</code> : email (validation auto)</li>
                <li><code>password</code> : mot de passe masqué</li>
                <li><code>number</code> : nombre</li>
                <li><code>checkbox</code> : case à cocher</li>
                <li><code>radio</code> : bouton radio</li>
            </ul>

            <h3>Attributs importants</h3>
            <ul>
                <li><code>required</code> : champ obligatoire</li>
                <li><code>placeholder</code> : texte d'aide</li>
                <li><code>value</code> : valeur par défaut</li>
            </ul>
        ` + "`" + `,
        exercise: {
            description: "Créez un formulaire d'inscription avec : nom, email, mot de passe, et un bouton. Tous les champs doivent être obligatoires (required).",
            starterCode: {
                html: ` + "`" + `<!DOCTYPE html>
<html>
<head>
    <style>
        form {
            max-width: 400px;
            margin: 20px auto;
        }
        input {
            width: 100%;
            padding: 8px;
            margin: 5px 0 15px 0;
        }
    </style>
</head>
<body>
    <h1>Formulaire d'inscription</h1>
    <!-- Créez votre formulaire ici -->
    
</body>
</html>` + "`" + `,
                css: '',
                js: ''
            },
            validation: (doc) => {
                const form = doc.querySelector('form');
                if (!form) return { success: false, message: "❌ Il manque un formulaire" };
                
                const inputs = form.querySelectorAll('input[required]');
                const button = form.querySelector('button[type="submit"]');
                
                if (inputs.length < 3) return { success: false, message: "❌ Il faut au moins 3 champs obligatoires" };
                if (!button) return { success: false, message: "❌ Il manque un bouton submit" };
                
                return { success: true, message: "🎉 Parfait ! Vous savez créer des formulaires !" };
            }
        }
    },
    {
        id: 5,
        title: "⚡ JavaScript - Introduction",
        xp: 200,
        lesson: ` + "`" + `
            <h3>Qu'est-ce que JavaScript ?</h3>
            <p>JavaScript rend vos pages interactives. Il s'exécute dans le navigateur.</p>
            
            <h3>Variables</h3>
            <pre><code>let nom = "Alice";
const age = 25;
var ville = "Paris";  // Ancienne syntaxe

console.log(nom);  // Affiche dans la console</code></pre>

            <h3>Types de données</h3>
            <ul>
                <li><strong>String</strong> : <code>"Texte"</code></li>
                <li><strong>Number</strong> : <code>42</code></li>
                <li><strong>Boolean</strong> : <code>true</code> ou <code>false</code></li>
                <li><strong>Array</strong> : <code>[1, 2, 3]</code></li>
                <li><strong>Object</strong> : <code>{ nom: "Alice" }</code></li>
            </ul>

            <h3>Fonctions</h3>
            <pre><code>function direBonjour(nom) {
    return "Bonjour " + nom;
}

console.log(direBonjour("Bob"));  // Bonjour Bob</code></pre>
        ` + "`" + `,
        exercise: {
            description: "Créez une fonction qui affiche 'Hello World!' dans la console quand la page se charge. Utilisez console.log().",
            starterCode: {
                html: ` + "`" + `<!DOCTYPE html>
<html>
<head>
    <title>JS Basics</title>
</head>
<body>
    <h1>Ouvrez la console du navigateur (F12)</h1>
    
    <script>
        // Écrivez votre code JavaScript ici
        
    </script>
</body>
</html>` + "`" + `,
                css: '',
                js: ''
            },
            validation: (doc) => {
                // On vérifie que le script existe
                const script = doc.querySelector('script');
                if (!script) return { success: false, message: "❌ Pas de balise script trouvée" };
                
                const hasConsoleLog = script.textContent.includes('console.log');
                if (!hasConsoleLog) return { success: false, message: "❌ Utilisez console.log() pour afficher un message" };
                
                return { success: true, message: "🎉 Bravo ! Vous avez écrit votre premier JavaScript !" };
            }
        }
    },
{
    id: 6,
    title: "🖱️ Le DOM - Manipulation",
    xp: 250,
    lesson: ` + "`" + `<h3>Qu'est-ce que le DOM ?</h3> 
<p>Le DOM (Document Object Model) est la représentation de votre page HTML que JavaScript peut manipuler.</p> 
<h3>Sélectionner des éléments</h3> 
<pre>
<code>// Par ID 
let element = document.getElementById('mon-id'); 

// Par classe 
let elements = document.getElementsByClassName('ma-classe'); 

// Avec querySelector (recommandé) 
let el = document.querySelector('.ma-classe'); 
let tous = document.querySelectorAll('p');</code>
</pre> 
<h3>Modifier le contenu</h3> 
<pre>
<code>let titre = document.querySelector('h1'); 
titre.textContent = "Nouveau titre"; 
titre.innerHTML = "&lt;strong&gt;Gras&lt;/strong&gt;";

// Modifier le style 
titre.style.color = "red"; 
titre.style.fontSize = "30px";</code>
</pre> 
<h3>Ajouter/Supprimer des classes</h3> 
<pre>
<code>element.classList.add('active'); 
element.classList.remove('hidden'); 
element.classList.toggle('visible');</code>
</pre>` + "`" + ` ,
    exercise: {
        description: ` + "`" + `
                Créer une fonction pour changer le contenu du texte. <br/>
                Créer une autre fonction pour changer son style. <br/>
                Les deux fonctions doivent être appelées au clic. <br/>
        ` + "`" + `,
        starterCode: {
            html: ` + "`" + `<!DOCTYPE html>
<html>
<head>
    <title>DOM - Fonctions</title>
    <style>
        #texte {
            cursor: pointer;
            transition: all 0.3s ease;
        }
    </style>
</head>
<body>

    <p id="texte" onclick="changerTexte(); changerStyle();">
        Cliquez sur ce texte
    </p>

    <script>
        function changerTexte() {
            // Sélectionnez le paragraphe
            // Changez le texte affiché
        }

        function changerStyle() {
            // Sélectionnez le paragraphe
            // Changez son style (couleur, taille, etc.)
        }
    </script>

</body>
</html>` + "`" + `,
            css: '',
            js: ''
        },
        validation: (doc) => {
            const texte = doc.getElementById('texte');
            const script = doc.querySelector('script');

            if (!texte) {
                return { success: false, message: "❌ Le paragraphe avec l'id 'texte' est manquant" };
            }

            if (!script.textContent.includes('function changerTexte')) {
                return { success: false, message: "❌ La fonction changerTexte() est manquante" };
            }

            if (!script.textContent.includes('function changerStyle')) {
                return { success: false, message: "❌ La fonction changerStyle() est manquante" };
            }

            if (!script.textContent.includes('textContent')) {
                return { success: false, message: "❌ Utilisez textContent pour modifier le texte" };
            }

            if (!script.textContent.match(/style\./)) {
                return { success: false, message: "❌ Modifiez le style du texte en JavaScript" };
            }

            if (!script.textContent.includes('getElementById')) {
                return { success: false, message: "❌ Utilisez getElementById()" };
            }

            return {
                success: true,
                message: "🎉 Bravo ! Vous avez séparé le contenu et le style comme un pro 👌"
            };
        }
    }
},
    {
        id: 7,
        title: "🎯 Les Événements",
        xp: 250,
        lesson: ` + "`" + `
            <h3>Qu'est-ce qu'un événement ?</h3>
            <p>Les événements détectent les actions de l'utilisateur : clics, saisie clavier, survol, etc.</p>
            
            <h3>Écouter un événement</h3>
            <pre><code>let bouton = document.querySelector('button');

// Méthode addEventListener (recommandée)
bouton.addEventListener('click', function() {
    alert('Cliqué !');
});

// Version courte avec fonction fléchée
bouton.addEventListener('click', () => {
    console.log('Cliqué !');
});</code></pre>

            <h3>Événements courants</h3>
            <ul>
                <li><code>click</code> : clic de souris</li>
                <li><code>dblclick</code> : double-clic</li>
                <li><code>mouseenter</code> : survol</li>
                <li><code>mouseleave</code> : fin survol</li>
                <li><code>keydown</code> : touche pressée</li>
                <li><code>submit</code> : soumission de formulaire</li>
                <li><code>input</code> : saisie dans un champ</li>
            </ul>

            <h3>L'objet event</h3>
            <pre><code>element.addEventListener('click', (e) => {
    console.log(e.target);  // L'élément cliqué
    e.preventDefault();      // Empêcher l'action par défaut
});</code></pre>
        ` + "`" + `,
        exercise: {
            description: "Créez 3 boutons de couleurs différentes. Quand on clique sur un bouton, la couleur du texte doit prendre sa couleur.",
            starterCode: {
                html: ` + "`" + `<!DOCTYPE html>
<html>
<head>
    <style>
        button {
            padding: 20px;
            margin: 10px;
            font-size: 16px;
            cursor: pointer;
            border: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h1>Changeur de couleur</h1>
    <button id="rouge" style="background: red; color: white;">Rouge</button>
    <button id="vert" style="background: green; color: white;">Vert</button>
    <button id="bleu" style="background: blue; color: white;">Bleu</button>
    
    <script>
        // Ajoutez des événements click sur les 3 boutons
        // Chaque bouton change le backgroundColor du body
        
    </script>
</body>
</html>` + "`" + `,
                css: '',
                js: ''
            },
            validation: (doc) => {
                const buttons = doc.querySelectorAll('button');
                if (buttons.length < 3) return { success: false, message: "❌ Il faut 3 boutons" };
                
                const script = doc.querySelector('script');
                const hasAddEventListener = script.textContent.includes('addEventListener');
                
                if (!hasAddEventListener) return { success: false, message: "❌ Utilisez addEventListener()" };
                
                return { success: true, message: "🎉 Super ! Les événements sont maîtrisés !" };
            }
        }
    },
    {
        id: 8,
        title: "🔄 Fetch API - Requêtes",
        xp: 300,
        lesson: ` + "`" + `
            <h3>Qu'est-ce que Fetch ?</h3>
            <p>Fetch permet de faire des requêtes HTTP pour récupérer ou envoyer des données à une API.</p>
            
            <h3>Requête GET simple</h3>
            <pre><code>fetch('http://localhost:3000/posts')
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Erreur:', error);
    });</code></pre>

            <h3>Avec async/await (moderne)</h3>
            <pre><code>async function getPosts() {
    try {
        const response = await fetch('http://localhost:3000/posts');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Erreur:', error);
    }
}</code></pre>

            <h3>Requête POST</h3>
            <pre><code>fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: 'test@test.com',
        password: 'password'
    })
})
.then(response => response.json())
.then(data => console.log(data));</code></pre>
        ` + "`" + `,
        exercise: {
            description: "Créez un bouton qui charge la liste des posts depuis l'API (GET /posts) et les affiche dans une liste ul/li.",
            starterCode: {
                html: ` + "`" + `<!DOCTYPE html>
<html>
<head>
    <title>Fetch API</title>
</head>
<body>
    <h1>Liste des posts</h1>
    <button id="charger">Charger les posts</button>
    <ul id="posts-list"></ul>
    
    <script>
        const API_URL = 'http://localhost:3000';
        
        // 1. Sélectionnez le bouton et la liste
        // 2. Ajoutez un événement click
        // 3. Faites un fetch GET vers /posts
        // 4. Affichez chaque post dans un <li>
        
    </script>
</body>
</html>` + "`" + `,
                css: '',
                js: ''
            },
            validation: (doc) => {
                const button = doc.getElementById('charger');
                const list = doc.getElementById('posts-list');
                
                if (!button || !list) return { success: false, message: "❌ Éléments manquants" };
                
                const script = doc.querySelector('script');
                const hasFetch = script.textContent.includes('fetch');
                console.log(script.textContent, script.textContent.includes('fetch'))
                
                if (!hasFetch) return { success: false, message: "❌ Utilisez fetch() pour appeler l'API" };
                
                return { success: true, message: "🎉 Bravo ! Vous savez faire des requêtes API !" };
            }
        }
    },
    {
        id: 9,
        title: "🔐 Authentification",
        xp: 350,
        lesson: ` + "`" + `
            <h3>Les Cookies</h3>
            <p>Les cookies stockent des données côté client. Ils sont automatiquement envoyés avec chaque requête au serveur.</p>
            
            <h3>Cookies avec credentials</h3>
            <pre><code>fetch('http://localhost:3000/login', {
    method: 'POST',
    credentials: 'include',  // Important !
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: 'student@test.com',
        password: 'password'
    })
});</code></pre>

            <h3>JWT - JSON Web Token</h3>
            <p>Un JWT est un token sécurisé qui contient les informations de l'utilisateur. Notre API utilise les JWT.</p>
            
            <h3>Flow d'authentification</h3>
            <ol>
                <li>L'utilisateur envoie email/password</li>
                <li>Le serveur vérifie et renvoie un JWT</li>
                <li>Le JWT est stocké (cookie ou localStorage)</li>
                <li>Chaque requête inclut le JWT pour prouver l'identité</li>
            </ol>

            <h3>Requête authentifiée</h3>
            <pre><code>fetch('http://localhost:3000/posts', {
    credentials: 'include'  // Envoie le cookie automatiquement
});</code></pre>
        ` + "`" + `,
        exercise: {
            description: "Créez un formulaire de connexion. Envoyez les données à POST /login avec credentials: 'include'. Affichez le message de succès ou d'erreur.",
            starterCode: {
                html: ` + "`" + `<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <style>
        form { max-width: 300px; margin: 50px auto; }
        input { width: 100%; padding: 10px; margin: 10px 0; }
        button { width: 100%; padding: 10px; }
        #message { margin-top: 20px; padding: 10px; }
    </style>
</head>
<body>
    <form id="login-form">
        <h2>Connexion</h2>
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="password" placeholder="Password" required>
        <button type="submit">Se connecter</button>
    </form>
    <div id="message"></div>
    
    <script>
        const API_URL = 'http://localhost:3000';
        
        // 1. Sélectionnez le formulaire
        // 2. Écoutez l'événement submit
        // 3. Faites un fetch POST /login avec credentials: 'include'
        // 4. Affichez le résultat dans #message
        
        // Aide : utilisez e.preventDefault() pour empêcher le rechargement
        // Comptes test : student@test.com / password
    </script>
</body>
</html>` + "`" + `,
                css: '',
                js: ''
            },
            validation: (doc) => {
                const form = doc.getElementById('login-form');
                const message = doc.getElementById('message');
                
                if (!form || !message) return { success: false, message: "❌ Éléments manquants" };
                
                const script = doc.querySelector('script');
                const hasCredentials = script.textContent.includes("credentials: 'include'");
                const hasPreventDefault = script.textContent.includes('preventDefault');
                
                if (!hasCredentials) return { success: false, message: "❌ Ajoutez credentials: 'include' dans fetch()" };
                if (!hasPreventDefault) return { success: false, message: "❌ Utilisez e.preventDefault()" };
                
                return { success: true, message: "🎉 Parfait ! L'authentification est maîtrisée !" };
            }
        }
    },
    {
        id: 10,
        title: "📝 Créer un Post",
        xp: 300,
        lesson: ` + "`" + `
            <h3>Créer une ressource</h3>
            <p>Pour créer un post, on envoie une requête POST avec les données en JSON.</p>
            
            <h3>Exemple complet</h3>
            <pre><code>async function createPost(title, content) {
    try {
        const response = await fetch('http://localhost:3000/posts', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        });
        
        if (!response.ok) {
            throw new Error('Erreur HTTP');
        }
        
        const data = await response.json();
        console.log('Post créé:', data);
    } catch (error) {
        console.error('Erreur:', error);
    }
}</code></pre>

            <h3>Récupérer les valeurs d'un formulaire</h3>
            <pre><code>const title = document.getElementById('title').value;
const content = document.getElementById('content').value;</code></pre>
        ` + "`" + `,
        exercise: {
            description: "Créez un formulaire pour créer un post (titre + contenu). Envoyez-le à POST /posts. Vous devez être connecté (niveau précédent) !",
            starterCode: {
                html: ` + "`" + `<!DOCTYPE html>
<html>
<head>
    <title>Créer un Post</title>
    <style>
        form { max-width: 500px; margin: 50px auto; }
        input, textarea { width: 100%; padding: 10px; margin: 10px 0; }
        button { width: 100%; padding: 10px; }
    </style>
</head>
<body>
    <form id="post-form">
        <h2>Créer un Post</h2>
        <input type="text" id="title" placeholder="Titre" required>
        <textarea id="content" rows="5" placeholder="Contenu" required></textarea>
        <button type="submit">Publier</button>
    </form>
    <div id="result"></div>
    
    <script>
        const API_URL = 'http://localhost:3000';
        
        // 1. Écoutez le submit du formulaire
        // 2. Récupérez title et content
        // 3. Faites un fetch POST /posts avec credentials
        // 4. Affichez le résultat
        
    </script>
</body>
</html>` + "`" + `,
                css: '',
                js: ''
            },
            validation: (doc) => {
                const form = doc.getElementById('post-form');
                const title = doc.getElementById('title');
                const content = doc.getElementById('content');
                
                if (!form || !title || !content) return { success: false, message: "❌ Formulaire incomplet" };
                
                const script = doc.querySelector('script');
                const hasPostMethod = script.textContent.includes("method: 'POST'");
                
                if (!hasPostMethod) return { success: false, message: "❌ Utilisez method: 'POST'" };
                
                return { success: true, message: "🎉 Génial ! Vous savez créer des ressources !" };
            }
        }
    },
    {
        id: 11,
        title: "🎨 LocalStorage & Session",
        xp: 250,
        lesson: ` + "`" + `
            <h3>Web Storage API</h3>
            <p>Le navigateur offre deux types de stockage local :</p>
            
            <h3>localStorage</h3>
            <p>Stockage permanent (jusqu'à suppression manuelle)</p>
            <pre><code>// Écrire
localStorage.setItem('nom', 'Alice');
localStorage.setItem('user', JSON.stringify({ id: 1, nom: 'Bob' }));

// Lire
let nom = localStorage.getItem('nom');
let user = JSON.parse(localStorage.getItem('user'));

// Supprimer
localStorage.removeItem('nom');
localStorage.clear();  // Tout supprimer</code></pre>

            <h3>sessionStorage</h3>
            <p>Identique à localStorage mais supprimé à la fermeture du navigateur</p>
            <pre><code>sessionStorage.setItem('token', 'abc123');
let token = sessionStorage.getItem('token');</code></pre>

            <h3>Cas d'usage</h3>
            <ul>
                <li>Sauvegarder les préférences utilisateur</li>
                <li>Stocker un token JWT</li>
                <li>Garder l'état d'une application</li>
                <li>Cache de données</li>
            </ul>
        ` + "`" + `,
        exercise: {
            description: "Créez un compteur de clics. Sauvegardez le nombre dans localStorage pour qu'il persiste au rechargement de la page.",
            starterCode: {
                html: ` + "`" + `<!DOCTYPE html>
<html>
<head>
    <title>Compteur Persistent</title>
    <style>
        body { text-align: center; margin-top: 100px; font-size: 24px; }
        button { padding: 20px 40px; font-size: 20px; margin: 20px; }
    </style>
</head>
<body>
    <h1>Compteur de clics</h1>
    <p>Clics : <span id="counter">0</span></p>
    <button id="increment">+1</button>
    <button id="reset">Reset</button>
    
    <script>
        // 1. Au chargement, récupérez le compteur depuis localStorage
        // 2. Affichez-le
        // 3. Incrémentez au clic et sauvegardez
        // 4. Reset remet à 0 et sauvegarde
        
    </script>
</body>
</html>` + "`" + `,
                css: '',
                js: ''
            },
            validation: (doc) => {
                const counter = doc.getElementById('counter');
                const incrementBtn = doc.getElementById('increment');
                const resetBtn = doc.getElementById('reset');
                
                if (!counter || !incrementBtn || !resetBtn) return { success: false, message: "❌ Éléments manquants" };
                
                const script = doc.querySelector('script');
                const hasLocalStorage = script.textContent.includes('localStorage');
                const hasGetItem = script.textContent.includes('getItem');
                const hasSetItem = script.textContent.includes('setItem');
                
                if (!hasLocalStorage) return { success: false, message: "❌ Utilisez localStorage" };
                if (!hasGetItem || !hasSetItem) return { success: false, message: "❌ Utilisez getItem() et setItem()" };
                
                return { success: true, message: "🎉 Excellent ! Le stockage local est maîtrisé !" };
            }
        }
    },
    {
        id: 12,
        title: "🚀 Projet Final",
        xp: 500,
        lesson: ` + "`" + `
            <h3>Application Complète</h3>
            <p>Félicitations ! Vous avez toutes les compétences pour créer une vraie application web.</p>
            
            <h3>Ce que vous savez faire</h3>
            <ul>
                <li>✅ Structurer du HTML sémantique</li>
                <li>✅ Styliser avec CSS</li>
                <li>✅ Manipuler le DOM avec JavaScript</li>
                <li>✅ Gérer les événements utilisateur</li>
                <li>✅ Faire des requêtes API avec Fetch</li>
                <li>✅ S'authentifier avec JWT/Cookies</li>
                <li>✅ Créer, modifier, supprimer des ressources</li>
                <li>✅ Stocker des données localement</li>
            </ul>

            <h3>Votre mission finale</h3>
            <p>Créez une mini application de gestion de tâches (TODO list) :</p>
            <ol>
                <li>Formulaire de connexion</li>
                <li>Affichage des posts de l'utilisateur</li>
                <li>Formulaire pour créer un nouveau post</li>
                <li>Bouton de déconnexion</li>
                <li>Style CSS personnalisé</li>
            </ol>

            <h3>Points bonus</h3>
            <ul>
                <li>Bouton pour supprimer un post (DELETE /posts/:id)</li>
                <li>Édition d'un post (PUT /posts/:id)</li>
                <li>Animation CSS</li>
                <li>Design responsive</li>
            </ul>
        ` + "`" + `,
        exercise: {
            description: "Créez une application complète avec login, affichage des posts, création de posts, et déconnexion. Soyez créatif !",
            starterCode: {
                html: ` + "`" + `<!DOCTYPE html>
<html>
<head>
    <title>Mon App</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; }
        /* Ajoutez votre CSS ici */
        
    </style>
</head>
<body>
    <!-- Créez votre application ici -->
    <!-- Pensez à : login, liste posts, formulaire création, logout -->
    
    <script>
        const API_URL = 'http://localhost:3000';
        
        // Écrivez votre code JavaScript ici
        // Utilisez tout ce que vous avez appris !
        
    </script>
</body>
</html>` + "`" + `,
                css: '',
                js: ''
            },
            validation: (doc) => {
                const script = doc.querySelector('script');
                
                // Vérifications de base
                const hasFetch = script.textContent.includes('fetch');
                const hasCredentials = script.textContent.includes('credentials');
                const hasAddEventListener = script.textContent.includes('addEventListener');
                
                if (!hasFetch) return { success: false, message: "❌ Utilisez fetch() pour les requêtes API" };
                if (!hasCredentials) return { success: false, message: "❌ N'oubliez pas credentials: 'include'" };
                if (!hasAddEventListener) return { success: false, message: "❌ Gérez les événements avec addEventListener()" };
                
                return { success: true, message: "🏆 FÉLICITATIONS ! Vous avez terminé WebQuest ! Vous êtes maintenant un(e) développeur(se) frontend !" };
            }
        }
    }
];`
	// Fichier README pour guider les élèves
	readme := `# WebQuest - Frontend

Bienvenue dans **WebQuest**, votre plateforme pour apprendre le **frontend** en pratique !  
Ce projet contient tous les niveaux, exercices et un éditeur de code en direct pour vous entraîner avec **HTML, CSS et JavaScript**.

---

## Description

WebQuest est une application web éducative qui vous permet :  

- De lire les leçons et consignes pour chaque niveau.
- D’écrire et tester votre code directement dans le navigateur.
- De visualiser le résultat de votre code dans un aperçu en direct (iframe).
- De recevoir un **feedback instantané** si une erreur JavaScript survient.
- De valider vos exercices et suivre votre progression avec un **score XP**.

Chaque niveau contient :  

- **Leçon** : la théorie ou l’explication du concept.
- **Exercice** : le code à compléter ou à corriger.
- **Validation automatique** : le système vérifie votre solution et vous indique si elle est correcte.

---

## Prérequis

Pour lancer le projet sur votre ordinateur, vous aurez besoin de :  

- Un navigateur moderne (Chrome, Firefox, Edge…)
- Un éditeur de texte ou IDE (Visual Studio Code recommandé)
- Un serveur local simple pour ouvrir ` + "`" + `index.html` + "`" + ` (Live Server, Python HTTP server, etc.)

---

## Installation & lancement

1. **Cloner ou télécharger le projet**  
   Assurez-vous d’avoir tous les fichiers du dossier ` + "`" + `frontend` + "`" + `.

2. **Ouvrir ` + "`" + `ndex.html` + "`" + ` dans votre navigateur**  

    Méthode recommandée :  
   - Ouvrez Visual Studio Code.
   - Faites un clic droit sur ` + "`" + `index.html` + "`" + ` → **"Open with Live Server"**  
   - Sinon, ouvrez un serveur local dans le terminal :
     ` + "```" + `bash
     # Si Python est installé
     python -m http.server 5500
     ` + "```" + `
     Puis allez sur ` + "`" + `http://localhost:5500` + "`" + `.

---

## Utilisation

1. Cliquez sur un niveau dans la barre de navigation pour voir la leçon et l’exercice.
2. Écrivez votre code dans l’éditeur (HTML, CSS, JS).
3. Cliquez sur **▶ Exécuter** pour voir le rendu dans l’aperçu.
4. Si votre code contient une erreur, un message s’affichera dans le feedback.
5. Cliquez sur **Valider le niveau** pour vérifier votre solution et gagner des XP.

---

## Astuces

- Vous pouvez naviguer entre les fichiers HTML, CSS et JS grâce aux onglets de l’éditeur.
- Les erreurs JS sont détectées automatiquement et affichées en temps réel.
- Votre progression est sauvegardée automatiquement dans le **localStorage** du navigateur.

---

## Comptes de démonstration

- **Admin** : ` + "`" + `admin@test.com` + "`" + ` / ` + "`" + `password` + "`" + `
- **Étudiant** : ` + "`" + `student@test.com` + "`" + ` / ` + "`" + `password` + "`" + `

---

Profitez de l’apprentissage et amusez-vous à coder ! 🎉`

	// Écrire les fichiers
	files := map[string]string{
		"index.html": indexHTML,
		"README.md":  readme,
		"style.css":  indexCSS,
		"script.js":  indexJS,
		"levels.js":  levels,
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

		if r.Method == "POST" || r.Method == "PUT" {
			body, _ := io.ReadAll(r.Body)
			r.Body = io.NopCloser(strings.NewReader(string(body)))
			fmt.Printf("[%s] %s\nBody: %s\n", r.Method, r.URL.Path, string(body))
		} else {
			fmt.Printf("[%s] %s\n", r.Method, r.URL.Path)
		}

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

		statusColor.Printf("Status: %d\n\n", lrw.statusCode)
	}
}

func main() {
	generateFrontend()
	// Routes publiques
	http.HandleFunc("/register", loggingMiddleware(corsMiddleware(handleRegister)))
	http.HandleFunc("/login", loggingMiddleware(corsMiddleware(handleLogin)))
	http.HandleFunc("/logout", loggingMiddleware(corsMiddleware(handleLogout)))

	http.HandleFunc("/me", loggingMiddleware(corsMiddleware(authMiddleware(handleMe))))
	http.HandleFunc("/posts", loggingMiddleware(corsMiddleware(handlePosts)))
	http.HandleFunc("/posts/", loggingMiddleware(corsMiddleware(authMiddleware(handlePostByID))))

	// Route de test
	http.HandleFunc("/", loggingMiddleware(corsMiddleware(handleRoot)))

	fmt.Println("API WebQuest démarrée sur http://localhost" + PORT)
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
	fmt.Println("Comptes de démo:")
	fmt.Println("   Admin    : admin@test.com / password")
	fmt.Println("   Student  : student@test.com / password")
	fmt.Println("Ouvrez frontend/index.html dans votre navigateur")
	fmt.Println("   (Utilisez Live Server ou un serveur local)")

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
	fmt.Printf("[EXPLAIN] "+format+"\n", a...)
}

// Handlers
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