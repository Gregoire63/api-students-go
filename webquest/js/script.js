/* ─────────────────────────────────────────────────────────────
   WebQuest – script.js
   ↑ Incrémente STORAGE_VERSION quand les niveaux/exercices changent
     pour invalider les sauvegardes obsolètes des élèves.
───────────────────────────────────────────────────────────── */
'use strict';

const STORAGE_VERSION = '3';
const STORAGE_PREFIX  = 'wq_';

// ─── Migration localStorage ────────────────────────────────
(function migrateStorage() {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}version`);
    if (saved === STORAGE_VERSION) return;

    const toDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
            key.startsWith('code_level_') ||
            key === 'completedLevels'     ||
            key === 'totalXP'
        )) toDelete.push(key);
    }
    toDelete.forEach(k => localStorage.removeItem(k));
    localStorage.setItem(`${STORAGE_PREFIX}version`, STORAGE_VERSION);

    if (toDelete.length) {
        console.info(`[WebQuest] Storage migré → v${STORAGE_VERSION}. ${toDelete.length} clé(s) purgée(s).`);
    }
})();

// ─── Écran de chargement ───────────────────────────────────
function hideLoader() {
    const screen = document.getElementById('loading-screen');
    if (!screen) return;
    screen.classList.add('loader-fade-out');
    screen.addEventListener('transitionend', () => screen.remove(), { once: true });
}

// ─── État global ───────────────────────────────────────────
let currentLevel          = -1;
let completedLevels       = _parseJSON(localStorage.getItem('completedLevels'), []);
let totalXP               = _parseInt(localStorage.getItem('totalXP'), 0);
let currentFile           = 'html';
let activeError           = null;
let codeStates            = { html: '', css: '', js: '' };
let editor                = null;
let editorReady           = false;
let modelChangeDisposable = null;

// ─── Utilitaires de parsing sûrs ──────────────────────────
function _parseJSON(str, fallback) {
    try { return str ? JSON.parse(str) : fallback; }
    catch { return fallback; }
}
function _parseInt(str, fallback) {
    const n = parseInt(str, 10);
    return isNaN(n) ? fallback : n;
}

// ─── Monaco ───────────────────────────────────────────────
require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.41.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('code-editor'), {
        value:               '',
        language:            'html',
        theme:               'vs-dark',
        automaticLayout:     true,
        fontFamily:          '"Space Mono", monospace',
        fontSize:            14,
        minimap:             { enabled: false },
        scrollBeyondLastLine: false,
        padding:             { top: 10, bottom: 10 },
        tabSize:             4,
        wordWrap:            'on',
        renderWhitespace:    'selection',
    });

    editorReady = true;
    initApp();
    setTimeout(hideLoader, 900);
});

// ─── Listener sauvegarde auto (sans doublon) ──────────────
function attachSaveListener() {
    if (!editor) return;
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

// ─── Changement d'onglet ──────────────────────────────────
function switchFile(file) {
    if (editor && editorReady) codeStates[currentFile] = editor.getValue();
    currentFile = file;

    const langMap = { html: 'html', css: 'css', js: 'javascript' };

    if (editor) {
        const oldModel = editor.getModel();
        const newModel = monaco.editor.createModel(codeStates[file] || '', langMap[file] || 'plaintext');
        editor.setModel(newModel);
        if (oldModel) oldModel.dispose();
        attachSaveListener();
    }
}

// ─── Persistance ──────────────────────────────────────────
function _levelKey(levelId, file) {
    return `code_level_${levelId}_${file}`;
}

function saveCurrentCode() {
    if (!levels[currentLevel] || !editor || !editorReady) return;
    const levelId = levels[currentLevel].id;
    codeStates[currentFile] = editor.getValue();
    try {
        localStorage.setItem(_levelKey(levelId, currentFile), codeStates[currentFile]);
    } catch (e) {
        console.warn('[WebQuest] localStorage plein :', e);
    }
}

function saveAllFiles() {
    if (!levels[currentLevel]) return;
    if (editor && editorReady) codeStates[currentFile] = editor.getValue();
    const levelId = levels[currentLevel].id;
    Object.entries(codeStates).forEach(([file, code]) => {
        try { localStorage.setItem(_levelKey(levelId, file), code); }
        catch (e) { console.warn('[WebQuest] localStorage plein :', e); }
    });
}

function loadSavedCode(levelIndex) {
    const level  = levels[levelIndex];
    const saved  = {};
    ['html', 'css', 'js'].forEach(file => {
        const stored = localStorage.getItem(_levelKey(level.id, file));
        saved[file]  = stored !== null ? stored : (level.exercise.starterCode[file] || '');
    });
    return saved;
}

function clearSavedCode(levelIndex) {
    const level = levels[levelIndex];
    ['html', 'css', 'js'].forEach(file => {
        localStorage.removeItem(_levelKey(level.id, file));
    });
}

// ─── Erreurs iframe ───────────────────────────────────────
window.addEventListener('message', (event) => {
    // Sécurité : on n'accepte les messages que de la même origine
    if (event.source !== document.getElementById('preview')?.contentWindow) return;
    if (event.data?.type === 'iframeError') {
        activeError = event.data;
        showFeedback(`❌ Erreur JS : ${event.data.message}`, 'error');
    }
});

// ─── Init ─────────────────────────────────────────────────
function initApp() {
    renderLevelNav();
    updateProgress();
    setupEditorTabs();
    loadLevel(getLastUnlockedLevelIndex());
}

// DOMContentLoaded : Monaco charge en async, initApp est appelé dans le callback.
// Ce listener sert de filet de sécurité si Monaco est déjà prêt.
document.addEventListener('DOMContentLoaded', () => {
    if (editorReady) initApp();
    document.getElementById('api-logs-modal').addEventListener('click', (event)=>{
        const modal = document.getElementById('api-logs-modal');
        if (modal && !modal.classList.contains('hidden') && event.target === event.currentTarget) closeApiLogs();
    })    
});

// ─── Navigation niveaux ───────────────────────────────────
function renderLevelNav() {
    const nav = document.getElementById('level-nav');
    nav.innerHTML = '';

    const fragment = document.createDocumentFragment();

    levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.className   = 'level-btn';
        button.textContent = `${level.id}. ${level.shortTitle}`;
        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', `Niveau ${level.id} : ${level.shortTitle}`);

        if (completedLevels.includes(level.id)) button.classList.add('completed');
        if (index === currentLevel)              button.classList.add('active');

        const isLocked = index > 0 && !completedLevels.includes(levels[index - 1].id);
        if (isLocked) {
            button.classList.add('locked');
            button.disabled = true;
            button.setAttribute('aria-disabled', 'true');
        }

        button.addEventListener('click', () => {
            if (!button.classList.contains('locked')) {
                saveAllFiles();
                loadLevel(index);
            }
        });

        fragment.appendChild(button);
    });

    nav.appendChild(fragment);
    updateNextButtonState();
}

function goToNextLevel() {
    const level = levels[currentLevel];
    if (!completedLevels.includes(level.id)) {
        showFeedback('❌ Vous devez valider ce niveau avant de continuer.', 'error');
        return;
    }
    if (currentLevel >= levels.length - 1) {
        showFeedback('🎉 Vous êtes déjà au dernier niveau !', 'success');
        return;
    }
    saveAllFiles();
    loadLevel(currentLevel + 1);
}

function updateNextButtonState() {
    const btn = document.getElementById('next-level-btn');
    if (!btn || !levels[currentLevel]) return;
    const isLast     = levels[currentLevel].id === levels[levels.length - 1].id;
    const isComplete = completedLevels.includes(levels[currentLevel].id);
    btn.style.display    = isLast ? 'none' : '';
    btn.disabled         = !isComplete;
    btn.setAttribute('aria-disabled', String(!isComplete));
}

// ─── Chargement d'un niveau ───────────────────────────────
function loadLevel(index) {
    if (index === currentLevel) return;

    saveAllFiles();
    currentLevel = index;
    const level  = levels[index];

    document.getElementById('lesson-title').textContent       = level.title;
    document.getElementById('lesson-content').innerHTML        = level.lesson;
    document.getElementById('exercise-description').innerHTML  = level.exercise.description;

    // Mettre à jour le titre de la page pour le contexte
    document.title = `${level.title} – WebQuest`;

    codeStates  = loadSavedCode(index);
    currentFile = level.activeCode?level.activeCode:'html';
    // Onglets : HTML actif
    document.querySelectorAll('.editor-tabs .tab').forEach(t => {
        const isHTML = t.dataset.file === currentFile;
        t.classList.toggle('active', isHTML);
        t.setAttribute('aria-selected', String(isHTML));
    });

    // Monaco : nouveau model HTML
    if (editor && editorReady) {
        const oldModel = editor.getModel();
        const newModel = monaco.editor.createModel(codeStates[currentFile], currentFile==="js"?"javascript": currentFile);
        editor.setModel(newModel);
        if (oldModel) oldModel.dispose();
        attachSaveListener();
    }

    // Bouton API : visible à partir du niveau 10
    const apiBtn = document.getElementById('api-btn');
    if (apiBtn) apiBtn.style.display = level.id > 10 ? '' : 'none';

    updateNextButtonState();
    updateSaveIndicator(index);

    document.getElementById('preview').srcdoc = '';
    hideFeedback();
    renderLevelNav();

    // Scroll en haut dans chaque panneau
    const lessonBody    = document.getElementById('lesson-body');
    const exercisePanel = document.querySelector('.exercise-panel');
    if (lessonBody)    lessonBody.scrollTop    = 0;
    if (exercisePanel) exercisePanel.scrollTop = 0;
}

// ─── Indicateur de sauvegarde ─────────────────────────────
function updateSaveIndicator(levelIndex) {
    const level   = levels[levelIndex];
    const hasSave = ['html', 'css', 'js'].some(file => {
        const stored = localStorage.getItem(_levelKey(level.id, file));
        return stored !== null && stored !== (level.exercise.starterCode[file] || '');
    });

    let indicator = document.getElementById('save-indicator');
    if (!indicator) {
        indicator    = document.createElement('span');
        indicator.id = 'save-indicator';
        document.getElementById('lesson-title')
                .insertAdjacentElement('afterend', indicator);
    }

    if (hasSave) {
        indicator.textContent      = '💾 Progression sauvegardée';
        indicator.style.background = 'rgba(0,255,136,0.12)';
        indicator.style.color      = 'var(--accent)';
        indicator.style.border     = '1px solid var(--accent)';
        indicator.style.opacity    = '1';
    } else {
        indicator.textContent      = '✨ Code de départ';
        indicator.style.background = 'rgba(255,170,0,0.08)';
        indicator.style.color      = 'var(--warning)';
        indicator.style.border     = '1px solid var(--warning)';
        indicator.style.opacity    = '0.75';
    }
}

// ─── Guard erreur iframe ──────────────────────────────────
const errorGuard = `<script>
(function () {
    'use strict';
    window.__HAS_ERROR__  = false;
    window.__ERROR_INFO__ = null;

    function reportError(data) {
        window.__HAS_ERROR__  = true;
        window.__ERROR_INFO__ = data;
        try {
            window.parent.postMessage({ type: 'iframeError', ...data }, window.location.origin || '*');
        } catch (_) {}
    }

    const prev = window.onerror;
    window.onerror = function (message, source, line, column, error) {
        reportError({ message, line, column, stack: error ? error.stack : null });
        return typeof prev === 'function' ? prev(message, source, line, column, error) : false;
    };

    window.addEventListener('unhandledrejection', function (e) {
        reportError({
            message: e.reason?.message || 'Promise rejetée',
            stack:   e.reason?.stack   || null
        });
    });
})();
<\/script>`;

// ─── Onglets éditeur ──────────────────────────────────────
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

// ─── Exécution ────────────────────────────────────────────
function runCode() {
    activeError = null;
    if (editor && editorReady) codeStates[currentFile] = editor.getValue();
    saveCurrentCode();

    const { html = '', css = '', js = '' } = codeStates;

    // Remplacer les imports externes par le contenu des onglets
    const processedHTML = html
        .replace(/<link\b[^>]*\bhref=["']\.?\/?style\.css["'][^>]*>/gi,  `<style>${css}</style>`)
        .replace(/<script\b[^>]*\bsrc=["']\.?\/?script\.js["'][^>]*><\/script>/gi, `<script>${js}<\/script>`);

    const fullHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
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

    document.getElementById('preview').scrollIntoView({behavior:'smooth'})
    // Délai suffisant pour que l'iframe charge et exécute le JS
    setTimeout(()=>{
        validateLevel()
    }, 700);
}

// ─── Reset ────────────────────────────────────────────────
function resetCode() {
    if (!confirm('Remettre le code de départ ? Votre progression sur ce niveau sera perdue.')) return;
    clearSavedCode(currentLevel);
    const level = levels[currentLevel];
    codeStates  = {
        html: level.exercise.starterCode.html || '',
        css:  level.exercise.starterCode.css  || '',
        js:   level.exercise.starterCode.js   || '',
    };
    if (editor && editorReady) editor.setValue(codeStates[currentFile]);
    document.getElementById('preview').srcdoc = '';
    hideFeedback();
    updateSaveIndicator(currentLevel);
}

// ─── Validation ───────────────────────────────────────────
function validateLevel() {
    if (activeError) {
        showFeedback('❌ Erreur dans votre code : ' + activeError.message, 'error');
        return;
    }

    const iframe = document.getElementById('preview');
    let iframeWindow = null;
    try { iframeWindow = iframe.contentWindow; } catch (_) {}

    if (iframeWindow?.__HAS_ERROR__) {
        showFeedback('❌ Erreur JS : ' + iframeWindow.__ERROR_INFO__.message, 'error');
        return;
    }

    saveCurrentCode();

    let iframeDoc = null;
    try {
        iframeDoc = iframe.contentDocument || iframeWindow?.document;
    } catch (e) {
        showFeedback('❌ Exécutez votre code d\'abord (▶)', 'error');
        return;
    }

    if (!iframeDoc?.body) {
        showFeedback('❌ Exécutez votre code d\'abord (▶)', 'error');
        return;
    }

    const level = levels[currentLevel];
    try {
        const result = level.exercise.validation(iframeDoc);
        if (result.success) {
            if (!completedLevels.includes(level.id)) {
                completedLevels.push(level.id);
                totalXP += level.xp;
                try {
                    localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
                    localStorage.setItem('totalXP', String(totalXP));
                } catch (e) {
                    console.warn('[WebQuest] Impossible de sauvegarder la progression :', e);
                }
            }
            showFeedback(result.message, 'success');
            updateProgress();
            renderLevelNav();
        } else {
            showFeedback(result.message, 'error');
        }
    } catch (err) {
        showFeedback('❌ Erreur de validation : ' + err.message, 'error');
        console.error('[WebQuest] Validation error:', err);
    }

    updateNextButtonState();
}

// ─── Feedback ─────────────────────────────────────────────
function showFeedback(message, type) {
    const fb = document.getElementById('feedback');
    fb.textContent = message;
    fb.className   = `feedback ${type} show`;
}

function hideFeedback() {
    document.getElementById('feedback').className = 'feedback';
}

// ─── Progression ──────────────────────────────────────────
function updateProgress() {
    const pct  = Math.round((completedLevels.length / levels.length) * 100);
    const fill = document.getElementById('progress-fill');
    const text = document.getElementById('progress-text');
    const pbar = fill?.closest('[role="progressbar"]');

    if (fill) fill.style.width         = `${pct}%`;
    if (text) text.textContent         = `Niveau ${completedLevels.length}/${levels.length}`;
    if (pbar) pbar.setAttribute('aria-valuenow', String(pct));

    const score = document.getElementById('score');
    if (score) score.textContent = totalXP;
}

function getLastUnlockedLevelIndex() {
    if (completedLevels.length === 0) return 0;
    const maxId   = Math.max(...completedLevels);
    const nextIdx = levels.findIndex(l => l.id === maxId) + 1;
    return Math.min(nextIdx, levels.length - 1);
}

// ─── Raccourcis clavier ───────────────────────────────────
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'Enter' || e.key === 's')) {
        e.preventDefault();
        runCode();
    }
    if (e.key === 'Escape') {
        const modal = document.getElementById('api-logs-modal');
        if (modal && !modal.classList.contains('hidden')) closeApiLogs();
    }
});

// ─── Modal API Logs ───────────────────────────────────────
let logsInterval = null;

function openApiLogs() {
    const modal = document.getElementById('api-logs-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.removeAttribute('hidden');
    fetchLogs();
    logsInterval = setInterval(fetchLogs, 2000);
}

function closeApiLogs() {
    const modal = document.getElementById('api-logs-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    clearInterval(logsInterval);
    logsInterval = null;
}

function colorizeLogs(logs) {
    return logs.map(line => {
        const match = line.match(/Status\s(\d{3})/);
        if (!match) return _escapeHTML(line);
        const code = parseInt(match[1], 10);
        const cls  = code >= 500 ? 'status-5xx'
                   : code >= 400 ? 'status-4xx'
                   : code >= 300 ? 'status-3xx'
                   : 'status-2xx';
        return _escapeHTML(line).replace(
            `Status ${code}`,
            `Status <span class="log-status ${cls}">${code}</span>`
        );
    }).join('<br>');
}

// Échappe le HTML pour éviter les injections dans les logs
function _escapeHTML(str) {
    return str
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#x27;');
}

async function fetchLogs() {
    const output = document.getElementById('api-logs-output');
    if (!output) return;
    try {
        const res  = await fetch('/api/logs', { credentials: 'same-origin' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data.logs) || data.logs.length === 0) {
            output.textContent = 'Aucun log pour le moment.';
            return;
        }
        output.innerHTML = colorizeLogs(data.logs);
        output.scrollTop = output.scrollHeight;
    } catch (e) {
        output.textContent = '❌ Impossible de charger les logs API.';
    }
}