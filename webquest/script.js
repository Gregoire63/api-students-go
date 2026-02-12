// État de l'application
let currentLevel = -1;
let completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
let totalXP = parseInt(localStorage.getItem('totalXP') || '0');
let currentFile = 'html';
let activeError = null
let codeStates = {
    html: '',
    css: '',
    js: ''
};

// ─────────────────────────────────────────────
// PERSISTANCE DU CODE
// ─────────────────────────────────────────────

/**
 * Sauvegarde le code de l'onglet actif dans localStorage
 * Clé : "code_level_{id}_{file}"  ex: "code_level_3_css"
 */
function saveCurrentCode() {
    const levelId = levels[currentLevel].id;
    const value = document.getElementById('code-editor').value;
    codeStates[currentFile] = value;
    localStorage.setItem(`code_level_${levelId}_${currentFile}`, value);
}

/**
 * Sauvegarde les trois fichiers d'un coup (utile au changement de niveau)
 */
function saveAllFiles() {
    if(!levels[currentLevel]) return
    const levelId = levels[currentLevel].id;
    Object.entries(codeStates).forEach(([file, code]) => {
        localStorage.setItem(`code_level_${levelId}_${file}`, code);
    });
}

/**
 * Charge le code sauvegardé pour un niveau donné.
 * Si aucune sauvegarde, retourne le starterCode du niveau.
 */
function loadSavedCode(levelIndex) {
    const level = levels[levelIndex];
    const saved = {};

    ['html', 'css', 'js'].forEach(file => {
        const key = `code_level_${level.id}_${file}`;
        const stored = localStorage.getItem(key);
        // On ne restaure que si la valeur existe ET n'est pas vide
        saved[file] = (stored !== null) ? stored : level.exercise.starterCode[file];
    });

    return saved;
}

/**
 * Remet le code d'un niveau à son état initial et efface la sauvegarde
 */
function clearSavedCode(levelIndex) {
    const level = levels[levelIndex];
    ['html', 'css', 'js'].forEach(file => {
        localStorage.removeItem(`code_level_${level.id}_${file}`);
    });
}

// ─────────────────────────────────────────────
// GESTION DES ERREURS IFRAME
// ─────────────────────────────────────────────

window.addEventListener('message', (event) => {
    if (event.data?.type === 'iframeError') {
        activeError = event.data;
        showFeedback(
            `❌ Erreur JS : ${event.data.message} (ligne ${event.data.line ?? '?'})`,
            'error'
        );
    }
});


// Initialisation au chargement
window.addEventListener('DOMContentLoaded', () => {
    renderLevelNav();
    loadLevel(getLastUnlockedLevelIndex());
    updateProgress();
    setupEditorTabs();
    enableTabInEditor(); 

       // Sauvegarde automatique toutes les 3 secondes pendant la frappe
    const editor = document.getElementById('code-editor');
    let saveTimeout = null;
    editor.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveCurrentCode();
        }, 1000); // délai 1s après la dernière frappe
    });
});

// Rendre la navigation des niveaux
function renderLevelNav() {
    const nav = document.getElementById('level-nav');
    nav.innerHTML = '';
    
    levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.className = 'level-btn';
        button.textContent = `${level.id}. ${level.title.split(' ')[0]}`;
        
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
                saveAllFiles();
                loadLevel(index);
            }
        });
        
        nav.appendChild(button);
    });
}

// Charger un niveau
function loadLevel(index) {
    // Sauvegarder l'éditeur avant de quitter le niveau courant
    if (index !== currentLevel) {
        saveAllFiles();
    } else return

    currentLevel = index;
    const level = levels[index];

    // Mettre à jour l'interface
    document.getElementById('lesson-title').textContent = level.title;
    document.getElementById('lesson-content').innerHTML  = level.lesson;
    document.getElementById('exercise-description').innerHTML = level.exercise.description;

    // Charger le code sauvegardé (ou le starterCode si rien de sauvegardé)
    codeStates = loadSavedCode(index);

    // Afficher l'onglet HTML par défaut
    currentFile = 'html';
    document.querySelectorAll('.editor-tabs .tab').forEach(t => {
        t.classList.toggle('active', t.dataset.file === 'html');
    });
    document.getElementById('code-editor').value = codeStates.html;

    // Indiquer si une sauvegarde existe
    updateSaveIndicator(index);

    // Réinitialiser l'aperçu et le feedback
    document.getElementById('preview').srcdoc = '';
    hideFeedback();

    // Mettre à jour la navigation
    renderLevelNav();
}

// ─────────────────────────────────────────────
// INDICATEUR DE SAUVEGARDE
// ─────────────────────────────────────────────

function updateSaveIndicator(levelIndex) {
    const level = levels[levelIndex];
    const hasSave = ['html', 'css', 'js'].some(file => {
        const stored = localStorage.getItem(`code_level_${level.id}_${file}`);
        // Considéré comme "modifié" seulement si différent du starterCode
        return stored !== null && stored !== level.exercise.starterCode[file];
    });

    let indicator = document.getElementById('save-indicator');
    if (!indicator) {
        // Créer l'indicateur s'il n'existe pas encore
        indicator = document.createElement('span');
        indicator.id = 'save-indicator';
        indicator.style.cssText = `
            font-size: 11px;
            padding: 3px 10px;
            border-radius: 20px;
            margin-left: 10px;
            vertical-align: middle;
            transition: opacity 0.3s;
        `;
        const title = document.getElementById('lesson-title');
        title.insertAdjacentElement('afterend', indicator);
    }

    if (hasSave) {
        indicator.textContent   = '💾 Progression sauvegardée';
        indicator.style.background = 'rgba(0,255,136,0.15)';
        indicator.style.color      = 'var(--accent)';
        indicator.style.border     = '1px solid var(--accent)';
        indicator.style.opacity    = '1';
    } else {
        indicator.textContent   = '✨ Code de départ';
        indicator.style.background = 'rgba(255,170,0,0.1)';
        indicator.style.color      = 'var(--warning)';
        indicator.style.border     = '1px solid var(--warning)';
        indicator.style.opacity    = '0.7';
    }
}

const errorGuard = `
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
`;

// Configuration des onglets de l'éditeur
function setupEditorTabs() {
    const tabs = document.querySelectorAll('.editor-tabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {

            saveCurrentCode();

            // Changer de fichier
            // Changer de fichier
            currentFile = tab.dataset.file;
            document.getElementById('code-editor').value = codeStates[currentFile];

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

// Exécuter le code
function runCode() {
    activeError = null;
    saveCurrentCode();
    // Sauvegarder le code courant
    codeStates[currentFile] = document.getElementById('code-editor').value;

    const html = codeStates.html || '';
    const css = codeStates.css || '';
    const js = codeStates.js || '';

    const fullHTML = `
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
`;

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
    updateSaveIndicator(currentLevel);
}

// ─────────────────────────────────────────────
// RESET
// ─────────────────────────────────────────────

function resetCode() {
    if (!confirm('Remettre le code de départ ? Votre progression sur ce niveau sera perdue.')) return;

    clearSavedCode(currentLevel);

    const level = levels[currentLevel];
    codeStates = { ...level.exercise.starterCode };
    document.getElementById('code-editor').value = codeStates[currentFile];
    document.getElementById('preview').srcdoc = '';
    hideFeedback();
    updateSaveIndicator(currentLevel);
}

// ─────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────

function validateLevel() {
    if (activeError) {
        showFeedback("❌ Erreur dans votre code : " + activeError.message, 'error');
        return;
    }

    saveCurrentCode();

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

    const level = levels[currentLevel];
    try {
        const result = level.exercise.validation(iframeDoc);

        if (result.success) {
            if (!completedLevels.includes(level.id)) {
                completedLevels.push(level.id);
                totalXP += level.xp;
                localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
                localStorage.setItem('totalXP', totalXP.toString());
            }

            showFeedback(result.message, 'success');
            updateProgress();
            renderLevelNav();

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
    feedback.className = `feedback ${type} show`;
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
    
    document.getElementById('progress-fill').style.width = `${percentage}%`;
    document.getElementById('progress-text').textContent = `Niveau ${completed}/${total}`;
    document.getElementById('score').textContent = totalXP;
}

function getLastUnlockedLevelIndex() {
    if (completedLevels.length === 0) {
        return 0;
    }

    // Récupérer le plus grand id validé
    const maxCompletedId = Math.max(...completedLevels);

    // Trouver l'index correspondant
    const nextLevelIndex = levels.findIndex(l => l.id === maxCompletedId) + 1;

    // Si tous les niveaux sont complétés → rester sur le dernier
    if (nextLevelIndex >= levels.length) {
        return Math.max(0,levels.length - 1);
    }

    return nextLevelIndex;
}

function enableTabInEditor() {
    const editor = document.getElementById('code-editor');

    editor.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            e.preventDefault();

            const start = this.selectionStart;
            const end = this.selectionEnd;

            if (e.shiftKey) {
                // Désindentation (Shift + Tab)
                const before = this.value.substring(start - 4, start);
                if (before === "    ") {
                    this.setRangeText(
                        "",
                        start - 4,
                        start,
                        "end"
                    );
                }
            } else {
                // Indentation
                this.setRangeText(
                    "    ",   // ou "\t"
                    start,
                    end,
                    "end"
                );
            }
        }
    });
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
});


let logsInterval = null;

function openApiLogs() {
    const modal = document.getElementById('api-logs-modal');
    modal.classList.remove('hidden');

    fetchLogs(); // chargement immédiat

    logsInterval = setInterval(fetchLogs, 2000); // refresh auto
}

function closeApiLogs() {
    const modal = document.getElementById('api-logs-modal');
    modal.classList.add('hidden');

    clearInterval(logsInterval);
    logsInterval = null;
}
function colorizeLogs(logs) {
    return logs.map(line => {
        const match = line.match(/Status\s(\d{3})/);

        if (!match) return line;

        const code = parseInt(match[1], 10);
        let cssClass = '';

        if (code >= 500) cssClass = 'status-5xx';
        else if (code >= 400) cssClass = 'status-4xx';
        else if (code >= 300) cssClass = 'status-3xx';
        else if (code >= 200) cssClass = 'status-2xx';

        return line.replace(
            `Status ${code}`,
            `Status <span class="log-status ${cssClass}">${code}</span>`
        );
    }).join('<br>');
}
async function fetchLogs() {
    try {
        const res = await fetch('/api/logs');
        const data = await res.json();

        const output = document.getElementById('api-logs-output');

        if(!data.logs) return         document.getElementById('api-logs-output').textContent =
            "Aucun logs pour le moment";
            
        output.innerHTML = colorizeLogs(data.logs);

        // auto-scroll en bas
        output.scrollTop = output.scrollHeight;

    } catch (e) {
        document.getElementById('api-logs-output').textContent =
            "❌ Impossible de charger les logs API";
    }
}