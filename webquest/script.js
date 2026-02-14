// ─────────────────────────────────────────────
// VERSION DU STOCKAGE
// ↑ Incrémente ce numéro quand les niveaux changent
//   pour purger automatiquement les sauvegardes obsolètes.
// ─────────────────────────────────────────────
const STORAGE_VERSION = '2';

(function migrateStorage() {
    const saved = localStorage.getItem('wq_storage_version');
    if (saved !== STORAGE_VERSION) {
        // Purge uniquement les clés WebQuest (code + progression)
        const toDelete = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('code_level_') || key === 'completedLevels' || key === 'totalXP')) {
                toDelete.push(key);
            }
        }
        toDelete.forEach(k => localStorage.removeItem(k));
        localStorage.setItem('wq_storage_version', STORAGE_VERSION);
        console.info(`[WebQuest] Storage migré vers v${STORAGE_VERSION} — ${toDelete.length} clé(s) purgée(s).`);
    }
})();

// ─────────────────────────────────────────────
// LOADER
// ─────────────────────────────────────────────
function hideLoader() {
    const screen = document.getElementById('loading-screen');
    if (!screen) return;
    screen.classList.add('loader-fade-out');
    screen.addEventListener('transitionend', () => screen.remove(), { once: true });
}

// ─────────────────────────────────────────────
// ÉTAT
// ─────────────────────────────────────────────
let currentLevel = -1;
let completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
let totalXP = parseInt(localStorage.getItem('totalXP') || '0');
let currentFile = 'html';
let activeError = null;
let codeStates = { html: '', css: '', js: '' };
let editor = null;
let editorReady = false;
let modelChangeDisposable = null; // pour éviter les listeners en double

// ─────────────────────────────────────────────
// MONACO
// ─────────────────────────────────────────────
require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.41.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('code-editor'), {
        value: '',
        language: 'html',
        theme: 'vs-dark',
        automaticLayout: true,
        fontFamily: 'Space Mono, monospace',
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 10, bottom: 10 },
    });

    editorReady = true;
    initApp();
    setTimeout(hideLoader,1000)
});

// ─────────────────────────────────────────────
// LISTENER SAUVEGARDE AUTO (sans doublon)
// ─────────────────────────────────────────────
function attachSaveListener() {
    if (!editor) return;
    // Dispose l'ancien listener avant d'en créer un nouveau
    if (modelChangeDisposable) {
        modelChangeDisposable.dispose();
        modelChangeDisposable = null;
    }
    modelChangeDisposable = editor.onDidChangeModelContent(() => {
        if (editorReady) {
            codeStates[currentFile] = editor.getValue();
            saveCurrentCode();
        }
    });
}

// ─────────────────────────────────────────────
// CHANGEMENT D'ONGLET
// ─────────────────────────────────────────────
function switchFile(file) {
    if (editor && editorReady) {
        codeStates[currentFile] = editor.getValue();
    }
    currentFile = file;

    const langMap = { html: 'html', css: 'css', js: 'javascript' };

    if (editor) {
        // Disposer l'ancien model pour éviter les fuites mémoire
        const oldModel = editor.getModel();
        const newModel = monaco.editor.createModel(codeStates[file] || '', langMap[file] || 'plaintext');
        editor.setModel(newModel);
        if (oldModel) oldModel.dispose();

        attachSaveListener();
    }
}

// ─────────────────────────────────────────────
// PERSISTANCE
// ─────────────────────────────────────────────
function saveCurrentCode() {
    if (!levels[currentLevel] || !editor || !editorReady) return;
    const levelId = levels[currentLevel].id;
    const value = editor.getValue();
    codeStates[currentFile] = value;
    localStorage.setItem(`code_level_${levelId}_${currentFile}`, value);
}

function saveAllFiles() {
    if (!levels[currentLevel]) return;
    if (editor && editorReady) {
        codeStates[currentFile] = editor.getValue();
    }
    const levelId = levels[currentLevel].id;
    Object.entries(codeStates).forEach(([file, code]) => {
        localStorage.setItem(`code_level_${levelId}_${file}`, code);
    });
}

function loadSavedCode(levelIndex) {
    const level = levels[levelIndex];
    const saved = {};
    ['html', 'css', 'js'].forEach(file => {
        const stored = localStorage.getItem(`code_level_${level.id}_${file}`);
        saved[file] = stored !== null ? stored : (level.exercise.starterCode[file] || '');
    });
    return saved;
}

function clearSavedCode(levelIndex) {
    const level = levels[levelIndex];
    ['html', 'css', 'js'].forEach(file => {
        localStorage.removeItem(`code_level_${level.id}_${file}`);
    });
}

// ─────────────────────────────────────────────
// ERREURS IFRAME
// ─────────────────────────────────────────────
window.addEventListener('message', (event) => {
    if (event.data?.type === 'iframeError') {
        activeError = event.data;
        showFeedback(`❌ Erreur JS : ${event.data.message} (ligne ${event.data.line ?? '?'})`, 'error');
    }
});

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
function initApp() {
    renderLevelNav();
    updateProgress();
    setupEditorTabs();
    loadLevel(getLastUnlockedLevelIndex());
}

window.addEventListener('DOMContentLoaded', () => {
    if (editorReady) initApp();
});

// ─────────────────────────────────────────────
// NAVIGATION NIVEAUX
// ─────────────────────────────────────────────
function renderLevelNav() {
    const nav = document.getElementById('level-nav');
    nav.innerHTML = '';

    levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.className = 'level-btn';
        button.textContent = `${level.id}. ${level.shortTitle}`;

        if (completedLevels.includes(level.id)) button.classList.add('completed');
        if (index === currentLevel)               button.classList.add('active');
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

    updateNextButtonState();
}

function goToNextLevel() {
    const level = levels[currentLevel];
    if (!completedLevels.includes(level.id)) {
        showFeedback("❌ Vous devez valider ce niveau avant de continuer.", 'error');
        return;
    }
    if (currentLevel >= levels.length - 1) {
        showFeedback("🎉 Vous êtes déjà au dernier niveau !", 'success');
        return;
    }
    saveAllFiles();
    loadLevel(currentLevel + 1);
}

function updateNextButtonState() {
    const btn = document.getElementById('next-level-btn');
    if (!btn || !levels[currentLevel]) return;
    btn.style.display  = levels[currentLevel].id === levels.length ? 'none' : '';
    btn.disabled       = !completedLevels.includes(levels[currentLevel].id);
}

// ─────────────────────────────────────────────
// CHARGEMENT D'UN NIVEAU
// ─────────────────────────────────────────────
function loadLevel(index) {
    // BUG FIX : on permettait de recharger le même niveau, provoquant des
    // sauvegardes erronées et la réinitialisation de l'état.
    if (index === currentLevel) return;

    saveAllFiles();
    currentLevel = index;
    const level = levels[index];

    document.getElementById('lesson-title').textContent        = level.title;
    document.getElementById('lesson-content').innerHTML         = level.lesson;
    document.getElementById('exercise-description').innerHTML   = level.exercise.description;

    codeStates  = loadSavedCode(index);
    currentFile = 'html';

    // Onglets éditeur : HTML actif
    document.querySelectorAll('.editor-tabs .tab').forEach(t => {
        t.classList.toggle('active', t.dataset.file === 'html');
        t.setAttribute('aria-selected', t.dataset.file === 'html' ? 'true' : 'false');
    });

    // Monaco : nouveau model HTML
    if (editor && editorReady) {
        const oldModel = editor.getModel();
        const newModel = monaco.editor.createModel(codeStates.html, 'html');
        editor.setModel(newModel);
        if (oldModel) oldModel.dispose();
        attachSaveListener();
    }

    // Bouton API visible seulement à partir du niveau 10
    const apiBtn = document.getElementById('api-btn');
    if (apiBtn) apiBtn.style.display = level.id > 9 ? '' : 'none';

    updateNextButtonState();
    updateSaveIndicator(index);

    document.getElementById('preview').srcdoc = '';
    hideFeedback();
    renderLevelNav();

    // Remonter en haut dans chaque panneau (la page ne scroll plus)
    const lessonBody = document.getElementById('lesson-body');
    const exercisePanel = document.querySelector('.exercise-panel');
    if (lessonBody)    lessonBody.scrollTop    = 0;
    if (exercisePanel) exercisePanel.scrollTop = 0;
}

// ─────────────────────────────────────────────
// INDICATEUR DE SAUVEGARDE
// ─────────────────────────────────────────────
function updateSaveIndicator(levelIndex) {
    const level  = levels[levelIndex];
    const hasSave = ['html', 'css', 'js'].some(file => {
        const stored = localStorage.getItem(`code_level_${level.id}_${file}`);
        return stored !== null && stored !== level.exercise.starterCode[file];
    });

    let indicator = document.getElementById('save-indicator');
    if (!indicator) {
        indicator = document.createElement('span');
        indicator.id = 'save-indicator';
        document.getElementById('lesson-title').insertAdjacentElement('afterend', indicator);
    }

    if (hasSave) {
        indicator.textContent          = '💾 Progression sauvegardée';
        indicator.style.background     = 'rgba(0,255,136,0.12)';
        indicator.style.color          = 'var(--accent)';
        indicator.style.border         = '1px solid var(--accent)';
        indicator.style.opacity        = '1';
    } else {
        indicator.textContent          = '✨ Code de départ';
        indicator.style.background     = 'rgba(255,170,0,0.08)';
        indicator.style.color          = 'var(--warning)';
        indicator.style.border         = '1px solid var(--warning)';
        indicator.style.opacity        = '0.75';
    }
}

// ─────────────────────────────────────────────
// GUARD ERROREUR IFRAME
// ─────────────────────────────────────────────
const errorGuard = `
<script>
(function () {
    window.__HAS_ERROR__ = false;
    window.__ERROR_INFO__ = null;
    function reportError(data) {
        window.__HAS_ERROR__ = true;
        window.__ERROR_INFO__ = data;
        window.parent.postMessage({ type: 'iframeError', ...data }, '*');
    }
    const prevOnError = window.onerror;
    window.onerror = function (message, source, line, column, error) {
        reportError({ message, line, column, stack: error ? error.stack : null });
        if (typeof prevOnError === 'function') return prevOnError(message, source, line, column, error);
        return false;
    };
    window.addEventListener('unhandledrejection', function (event) {
        reportError({ message: event.reason?.message || 'Promise rejetée', stack: event.reason?.stack || null });
    });
})();
<\/script>`;

// ─────────────────────────────────────────────
// ONGLETS ÉDITEUR
// ─────────────────────────────────────────────
function setupEditorTabs() {
    const tabs = document.querySelectorAll('.editor-tabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchFile(tab.dataset.file);
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
        });
    });
}

// ─────────────────────────────────────────────
// EXÉCUTION
// ─────────────────────────────────────────────
function runCode() {
    activeError = null;
    if (editor && editorReady) {
        codeStates[currentFile] = editor.getValue();
    }
    saveCurrentCode();

    const { html = '', css = '', js = '' } = codeStates;

    // Remplace <link rel="stylesheet" href="style.css"> par un vrai <style>
    // Remplace <script src="script.js"></script>       par un vrai <script>
    // Les deux formes href="./style.css" ou href="style.css" sont gérées.
    let processedHTML = html
        .replace(
            /<link\b[^>]*\bhref=["']\.?\/?(style\.css)["'][^>]*>/gi,
            `<style>${css}</style>`
        )
        .replace(
            /<script\b[^>]*\bsrc=["']\.?\/?(script\.js)["'][^>]*><\/script>/gi,
            `<script>${js}<\/script>`
        );

    const fullHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
${errorGuard}
</head>
<body>
${processedHTML}
</body>
</html>`;

    const iframe = document.getElementById('preview');
    try {
        iframe.srcdoc = fullHTML;
    } catch (e) {
        try {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open(); doc.write(fullHTML); doc.close();
        } catch (err) {
            showFeedback("❌ Erreur lors de l'exécution", 'error');
            console.error(err);
        }
    }

    updateSaveIndicator(currentLevel);
    setTimeout(()=>{
        validateLevel()
        document.getElementById('preview').scrollIntoView({behavior:'smooth'})
    }, 300);
}

// ─────────────────────────────────────────────
// RESET
// ─────────────────────────────────────────────
function resetCode() {
    if (!confirm('Remettre le code de départ ? Votre progression sur ce niveau sera perdue.')) return;
    clearSavedCode(currentLevel);
    const level = levels[currentLevel];
    codeStates = { ...level.exercise.starterCode };
    if (editor && editorReady) editor.setValue(codeStates[currentFile] || '');
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

    const iframe = document.getElementById('preview');

    // BUG FIX : accès à contentWindow peut lever en cross-origin — on protège
    let iframeWindow;
    try {
        iframeWindow = iframe.contentWindow;
    } catch (_) { iframeWindow = null; }

    if (iframeWindow?.__HAS_ERROR__) {
        showFeedback("❌ Erreur JS : " + iframeWindow.__ERROR_INFO__.message, 'error');
        return;
    }

    saveCurrentCode();

    let iframeDoc;
    try {
        iframeDoc = iframe.contentDocument || iframeWindow?.document;
    } catch (e) {
        showFeedback("❌ Exécutez votre code d'abord (▶)", 'error');
        return;
    }

    if (!iframeDoc?.body) {
        showFeedback("❌ Exécutez votre code d'abord (▶)", 'error');
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
        } else {
            showFeedback(result.message, 'error');
        }
    } catch (err) {
        showFeedback("❌ Erreur de validation : " + err.message, 'error');
        console.error('Validation error:', err);
    }
    updateNextButtonState();
}

// ─────────────────────────────────────────────
// FEEDBACK
// ─────────────────────────────────────────────
function showFeedback(message, type) {
    const fb = document.getElementById('feedback');
    fb.textContent = message;
    fb.className = `feedback ${type} show`;
}

function hideFeedback() {
    document.getElementById('feedback').className = 'feedback';
}

// ─────────────────────────────────────────────
// PROGRESSION
// ─────────────────────────────────────────────
function updateProgress() {
    const pct = (completedLevels.length / levels.length) * 100;
    document.getElementById('progress-fill').style.width  = `${pct}%`;
    document.getElementById('progress-text').textContent  = `Niveau ${completedLevels.length}/${levels.length}`;
    document.getElementById('score').textContent          = totalXP;
}

function getLastUnlockedLevelIndex() {
    if (completedLevels.length === 0) return 0;
    const maxId = Math.max(...completedLevels);
    const nextIdx = levels.findIndex(l => l.id === maxId) + 1;
    return nextIdx >= levels.length ? levels.length - 1 : nextIdx;
}

// ─────────────────────────────────────────────
// RACCOURCIS CLAVIER
// ─────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'Enter' || e.key === 's')) {
        e.preventDefault();
        runCode();
    }
    // Échap ferme la modale API
    if (e.key === 'Escape') closeApiLogs();
});

// ─────────────────────────────────────────────
// MODAL API LOGS
// ─────────────────────────────────────────────
let logsInterval = null;

function openApiLogs() {
    document.getElementById('api-logs-modal').classList.remove('hidden');
    fetchLogs();
    logsInterval = setInterval(fetchLogs, 2000);
}

function closeApiLogs() {
    document.getElementById('api-logs-modal').classList.add('hidden');
    clearInterval(logsInterval);
    logsInterval = null;
}

function colorizeLogs(logs) {
    return logs.map(line => {
        const match = line.match(/Status\s(\d{3})/);
        if (!match) return line;
        const code = parseInt(match[1], 10);
        const cls = code >= 500 ? 'status-5xx'
                  : code >= 400 ? 'status-4xx'
                  : code >= 300 ? 'status-3xx'
                  : 'status-2xx';
        return line.replace(`Status ${code}`, `Status <span class="log-status ${cls}">${code}</span>`);
    }).join('<br>');
}

async function fetchLogs() {
    const output = document.getElementById('api-logs-output');
    try {
        const res  = await fetch('/api/logs');
        const data = await res.json();
        if (!data.logs) {
            output.textContent = "Aucun logs pour le moment";
            return;
        }
        output.innerHTML  = colorizeLogs(data.logs);
        output.scrollTop  = output.scrollHeight;
    } catch (e) {
        output.textContent = "❌ Impossible de charger les logs API";
    }
}