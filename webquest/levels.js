/**
 * Détecte le système d'exploitation de l'utilisateur
 * et affiche la combinaison de touches adaptée pour ouvrir la console du navigateur.
 *
 * Ce code est essentiel pour guider correctement l'utilisateur selon son OS.
 */

// Récupère la chaîne User-Agent du navigateur pour détecter l'OS
const userAgent = window.navigator.userAgent;
// Vérifie si l'utilisateur est sur un appareil Apple (Mac, iPhone, iPad, etc.)
const isMac = /Mac|iPhone|iPad|iPod/i.test(userAgent);
// Vérifie si l'utilisateur est sur Linux
const isLinux = /Linux/i.test(userAgent);
// Récupère l'élément HTML où sera affichée la combinaison de touches
const keyComboElement = isMac?"Cmd + Option + I":isLinux?"Ctrl + Maj + I": "F12"

// Définition de tous les niveaux du jeu
const levels = [
    {
        id: 1,
        shortTitle: "Structure Web",
        title: "Comprendre comment fonctionne un site web",
        xp: 80,
        lesson: `
            <h3>Comment fonctionne un site web ?</h3>
            <p>
                Un site web fonctionne grâce à <strong>trois technologies principales</strong> :
            </p>
            <ul>
                <li><strong>HTML</strong> → structure le contenu (texte, images, boutons…)</li>
                <li><strong>CSS</strong> → gère l'apparence (couleurs, tailles, mise en page…)</li>
                <li><strong>JavaScript</strong> → ajoute l'interactivité (clics, animations…)</li>
            </ul>

            <h3>Comparaison simple</h3>
            <ul>
                <li>HTML = le squelette </li>
                <li>CSS = les vêtements </li>
                <li>JS = le cerveau </li>
            </ul>

            <h3>Structure d'un fichier HTML</h3>
            <pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;title&gt;Titre de la page&lt;/title&gt;

    &lt;!-- CSS externe --&gt;
    &lt;link rel="stylesheet" href="style.css"&gt;
&lt;/head&gt;
&lt;body&gt;

    &lt;h1&gt;Bonjour&lt;/h1&gt;
    &lt;p&gt;Bienvenue sur ma page&lt;/p&gt;

    &lt;!-- JavaScript externe --&gt;
    &lt;script src="script.js"&gt;&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;
</code></pre>

            <h3>Où placer le CSS et le JS ?</h3>
            <ul>
                <li><strong>CSS</strong> → dans &lt;head&gt; (avant le contenu)</li>
                <li><strong>JS</strong> → avant &lt;/body&gt; (après le contenu)</li>
            </ul>

            <h3>Pourquoi cette organisation ?</h3>
            <p>
                <strong>CSS en premier</strong> : Le style s'applique pendant le chargement de la page, évitant un "flash" de contenu non stylé.<br/>
                <strong>JS en dernier</strong> : JavaScript peut manipuler les éléments HTML, donc il faut qu'ils existent déjà !
            </p>

            <h3>⚠️ Tout peut être dans le HTML… mais</h3>
            <p>
                Oui, on <strong>peut</strong> écrire CSS et JS directement dans le HTML :
            </p>
            <pre><code>&lt;style&gt;
p { color: red; }
&lt;/style&gt;

&lt;script&gt;
console.log("Hello");
&lt;/script&gt;
</code></pre>

            <p>
                Mais en pratique professionnelle :
            </p>
            <ul>
                <li>HTML séparé</li>
                <li>CSS dans un fichier <code>.css</code></li>
                <li>JS dans un fichier <code>.js</code></li>
                <li><strong>Pourquoi ?</strong> Réutilisabilité, maintenance, performance</li>
            </ul>

            <h3>Structure typique d'un projet</h3>
            <pre><code>mon-site/
 ├── index.html
 ├── css/
 │   └── style.css
 ├── js/
 │   └── script.js
 └── images/
     └── logo.png
</code></pre>

            <h3>Balises HTML fréquentes</h3>
            <ul>
                <li><code>&lt;h1&gt; à &lt;h6&gt;</code> → Titres (h1 le plus important)</li>
                <li><code>&lt;p&gt;</code> → Paragraphe</li>
                <li><code>&lt;img&gt;</code> → Image</li>
                <li><code>&lt;a&gt;</code> → Lien hypertexte</li>
                <li><code>&lt;div&gt;</code> → Conteneur générique</li>
                <li><code>&lt;button&gt;</code> → Bouton cliquable</li>
                <li><code>&lt;input&gt;</code> → Champ de saisie</li>
            </ul>

            <h3>Exemple avec texte + image</h3>
            <pre><code>&lt;h1&gt;Mon site&lt;/h1&gt;
&lt;p&gt;Voici une image :&lt;/p&gt;
&lt;img src="https://via.placeholder.com/150" alt="Image exemple"&gt;
&lt;a href="https://google.com"&gt;Cliquez ici&lt;/a&gt;
</code></pre>

            <h3>💡 Astuce Pro</h3>
            <p>Utilisez toujours l'attribut <code>alt</code> sur les images pour l'accessibilité et le <a href="https://fr.wikipedia.org/wiki/Optimisation_pour_les_moteurs_de_recherche">SEO</a> !</p>
        `,
        exercise: {
            description: `
                Créez une page correctement structurée avec :<br/>
                - Un fichier CSS externe lié<br/>
                - Un fichier JavaScript externe lié
            `,
            starterCode: {
                html: `<!DOCTYPE html>
<html>
<head>
    <title>Introduction au Web</title>
    <!-- Liez votre CSS ici avec <link> -->
</head>
<body>
    <main>
        <section>
            <article class="card">
                <img src="logo.webp" alt="Logo" class="card-icon">
                <h2 class="card-title">Cours de Web moderne</h2>
                    <p class="card-description">
                        Découvrez les fondamentaux du développement web moderne avec HTML5, CSS3 et JavaScript.
                        Ce cours vous guidera à travers la création de pages web sémantiques, le stylisme responsive,
                        et l’ajout d’interactivité pour des expériences utilisateur dynamiques.
                        Idéal pour débutants comme pour ceux qui veulent consolider leurs bases !
                    </p>
            </article>
        </section>
    </main>

    <!-- Liez votre JavaScript ici avec <script src="..."> -->
</body>
</html>`,
                css: `body {
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    background-color: #f5f5f5;
}

main {
    width: 100%;
    max-width: 1200px;
    padding: 20px;
}

section {
    display: flex;
    justify-content: center;
}

.card {
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    width: 300px;
    text-align: center;
}

.card-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 15px;
}

.card-title {
    color: #333;
    margin: 0 0 10px 0;
}

.card-description {
    color: #666;
    font-size: 14px;
    line-height: 1.5;
}
`,
                js: `// Ajoutez un console.log pour vérifier que JS fonctionne
console.log("Hello World!");
`
            },
            validation: (doc) => {
                const link = doc.querySelector('body style');
                const script = doc.querySelector('body script');

                if (!link) return { success: false, message: "❌ Le fichier CSS externe n'est pas lié (utilisez <link rel='stylesheet' href='...'>)" };
                if (!script) return { success: false, message: "❌ Le fichier JavaScript externe n'est pas lié (utilisez <script src='...'></script>)" };

                return { success: true, message: "🎉 Parfait ! Vous comprenez la structure d'un site web !" };
            }
        }
    },
    {
        id: 2,
        title: "HTML - Les Bases",
        shortTitle: "HTML",
        xp: 100,
        lesson: `
            <h3>Qu'est-ce que le HTML ?</h3>
            <p>HTML (HyperText Markup Language) est le langage de balisage utilisé pour créer des pages web. Il structure le contenu grâce à des balises.</p>
            
            <h3>Structure de base</h3>
            <pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="fr"&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
    &lt;title&gt;Ma page&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;h1&gt;Mon titre&lt;/h1&gt;
    &lt;p&gt;Mon paragraphe&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>

            <h3>Les balises importantes expliquées</h3>
            <ul>
                <li><code>&lt;!DOCTYPE html&gt;</code> → Indique que c'est du HTML5</li>
                <li><code>&lt;html lang="fr"&gt;</code> → Définit la langue (important pour SEO)</li>
                <li><code>&lt;meta charset="UTF-8"&gt;</code> → Supporte les accents</li>
                <li><code>&lt;meta name="viewport"...&gt;</code> → Adapte la page aux mobiles</li>
            </ul>

            <h3>Balises de contenu</h3>
            <ul>
                <li><code>&lt;h1&gt;</code> à <code>&lt;h6&gt;</code> : Titres (du plus au moins important)</li>
                <li><code>&lt;p&gt;</code> : Paragraphe</li>
                <li><code>&lt;strong&gt;</code> : Texte important (gras)</li>
                <li><code>&lt;em&gt;</code> : Texte accentué (italique)</li>
                <li><code>&lt;br&gt;</code> : Retour à la ligne</li>
                <li><code>&lt;hr&gt;</code> : Ligne horizontale</li>
            </ul>

            <h3>Balises de structure</h3>
            <ul>
                <li><code>&lt;div&gt;</code> : Conteneur bloc générique</li>
                <li><code>&lt;span&gt;</code> : Conteneur inline</li>
                <li><code>&lt;header&gt;</code> : En-tête de page</li>
                <li><code>&lt;footer&gt;</code> : Pied de page</li>
                <li><code>&lt;nav&gt;</code> : Navigation</li>
                <li><code>&lt;section&gt;</code> : Section de contenu</li>
                <li><code>&lt;article&gt;</code> : Article autonome</li>
            </ul>

            <h3>Balises multimédia</h3>
            <ul>
                <li><code>&lt;a href="https://google.com" target="_blank"&gt;Google&lt;/a&gt;</code> : Contient un lien vers une page, <code>target="_blank"</code> indique d'ouvrir le lien dans un nouvel onglet.</li>
                <li><code>&lt;img src="chemin/vers/image.jpg" alt="Description"&gt;</code> : Affiche une image. L’attribut <code>alt</code> permet de fournir une description à l'image lorsque celle-ci ne fonctionne pas.</li>
                <li><code>&lt;audio controls&gt;&lt;source src="audio.mp3" type="audio/mpeg"&gt;&lt;/audio&gt;</code> : Intègre un lecteur audio.</li>
                <li><code>&lt;video controls&gt;&lt;source src="video.mp4" type="video/mp4"&gt;&lt;/video&gt;</code> : Intègre une vidéo.</li>
                <li><code>&lt;figure&gt;</code> et <code>&lt;figcaption&gt;</code> : Pour associer une légende à une image ou un média.</li>
            </ul>

            <h3>Balises de liste</h3>
            <ul>
                <li><code>&lt;ul&gt;</code> : Liste à puces (non ordonnée).</li>
                <li><code>&lt;ol&gt;</code> : Liste numérotée (ordonnée).</li>
                <li><code>&lt;li&gt;</code> : Élément d’une liste.</li>
            </ul>

            <h3>Balises de tableau</h3>
            <ul>
                <li><code>&lt;table&gt;</code> : Crée un tableau.</li>
                <li><code>&lt;tr&gt;</code> : Ligne du tableau.</li>
                <li><code>&lt;td&gt;</code> : Cellule de données.</li>
                <li><code>&lt;th&gt;</code> : Cellule d’en-tête.</li>
            </ul>

            <h3>Balises de formulaire</h3>
            <ul>
                <li><code>&lt;form&gt;</code> : Conteneur pour un formulaire.</li>
                <li><code>&lt;input type="text"&gt;</code> : Champ de texte.</li>
                <li><code>&lt;label&gt;</code> : Étiquette pour un champ.</li>
                <li><code>&lt;button&gt;</code> : Bouton cliquable.</li>
                <li><code>&lt;textarea&gt;</code> : Zone de texte multi-lignes.</li>
                <li><code>&lt;select&gt;</code> et <code>&lt;option&gt;</code> : Liste déroulante.</li>
            </ul>
                        <h3>Les commentaires en HTML</h3>
            <p>
                Les commentaires permettent d’ajouter des notes dans le code.
                <strong>Ils ne sont PAS affichés dans la page</strong>.
            </p>

            <h4>Syntaxe</h4>
            <pre><code>&lt;!-- Ceci est un commentaire HTML --&gt;</code></pre>

            <h4>Exemple</h4>
            <pre><code>&lt;body&gt;
    &lt;!-- Titre principal --&gt;
    &lt;h1&gt;Bienvenue&lt;/h1&gt;

    &lt;!-- Balise html qui ne sera pas affiché
    &lt;p&gt;Mon premier site web&lt;/p&gt;
    --&gt;
&lt;/body&gt;
</code></pre>
            <h3>💡 Bonnes pratiques</h3>
            <ul>
                <li>Un seul <code>&lt;h1&gt;</code> par page</li>
                <li>Toujours ajouter <code>alt</code> aux images</li>
                <li>Indenter correctement votre code</li>
                <li>Utiliser des noms de classe descriptifs</li>
                <li>Commenter ce qui n’est pas évident</li>
            </ul>
        `,
        exercise: {
            description: `Créez une page HTML avec :<br/>
    - Un titre h1 « Bienvenue »<br/>
    - Un sous-titre h2<br/>
    - Un paragraphes avec une description<br/>
    - Du texte en gras avec <strong><br/>
    - Une image de votre choix (utilisez <img> avec un attribut alt)`,
            starterCode: {
                html: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Ma première page</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Écrivez votre code ici :
         - h1 : Bienvenue sur mon site
         - h2 : Un sous-titre de votre choix
         - p : Un paragraphe
         - Utilisez <strong> pour mettre un mot en gras
         - Utilisez <img> pour ajouter une image
    -->

    <script src="script.js"></script>
</body>
</html>`,
                css: '',
                js: ''
            },
            validation: (doc) => {
                const h1 = doc.querySelector('h1');
                const h2 = doc.querySelector('h2');
                const p = doc.querySelector('p');
                const strong = doc.querySelector('strong');
                const images = doc.querySelectorAll('img');
                
                if (!h1) return { success: false, message: "❌ Il manque un titre h1" };
                if (!h2) return { success: false, message: "❌ Il manque un sous-titre h2" };
                if (!p) return { success: false, message: "❌ Il manque un paragraphe p" };
                if (!strong) return { success: false, message: "❌ Utilisez <strong> pour mettre du texte en gras" };
                const hasImageWithAlt = Array.from(images).some(img => img.hasAttribute('alt') && img.alt.trim() !== '');
                if (!hasImageWithAlt) return { success: false, message: "❌ Il manque une image avec un attribut alt" };
                
                return { success: true, message: "🎉 Parfait ! Vous maîtrisez les bases du HTML !" };
            }
        }
    },
    {
        id: 3,
        shortTitle: "CSS",
        title: "CSS - Styliser vos pages",
        xp: 150,
        lesson: `
            <h3>Qu'est-ce que le CSS ?</h3>
            <p>CSS (Cascading Style Sheets) permet de styliser vos pages HTML : couleurs, tailles, positions, animations, etc.</p>
            
            <h3>Comment ajouter du CSS ?</h3>
            <p>Trois méthodes (par ordre de priorité) :</p>
            <ul>
                <li><strong>Inline</strong> : <code>&lt;p style="color: red;"&gt;</code> (priorité max, à éviter)</li>
                <li><strong>Interne</strong> : dans une balise <code>&lt;style&gt;</code> dans le <code>&lt;head&gt;</code></li>
                <li><strong>Externe</strong> : fichier .css séparé (recommandé)</li>
            </ul>

            <h3>Sélecteurs CSS</h3>
            <pre><code>/* Par élément */
p { color: blue; }

/* Par classe (réutilisable) */
.ma-classe { font-size: 20px; }

/* Par ID (unique) */
#mon-id { background: yellow; }

/* Combinaison */
div.container p { margin: 10px; }

/* Pseudo-classes */
a:hover { color: red; }
button:active { transform: scale(0.95); }</code></pre>

            <h3>Classe vs ID</h3>
            <ul>
                <li><strong>Classe (.)</strong> : Peut être réutilisée plusieurs fois</li>
                <li><strong>ID (#)</strong> : Unique, une seule fois par page</li>
            </ul>

            <h3>Propriétés courantes</h3>
            <h4>Texte</h4>
            <ul>
                <li><code>color</code> : couleur du texte</li>
                <li><code>font-size</code> : taille du texte (px, em, rem)</li>
                <li><code>font-weight</code> : épaisseur (bold, normal, 100-900)</li>
                <li><code>text-align</code> : alignement (left, center, right)</li>
                <li><code>line-height</code> : hauteur de ligne</li>
            </ul>

            <h4>Boîte</h4>
            <ul>
                <li><code>background-color</code> : couleur de fond</li>
                <li><code>margin</code> : marge extérieure (espace autour)</li>
                <li><code>padding</code> : marge intérieure (espace dedans)</li>
                <li><code>border</code> : bordure (width style color)</li>
                <li><code>border-radius</code> : coins arrondis</li>
                <li><code>width / height</code> : dimensions</li>
            </ul>

            <h3>Le Box Model</h3>
            <img src="box-model.webp" style="width: 80%; border-radius:3px; min-width: 150px; max-width: 300px;">

            <h3>Couleurs en CSS</h3>
            <pre><code>/* Nom de couleur */
color: red;

/* Hexadécimal */
color: #FF5733;

/* RGB */
color: rgb(255, 87, 51);

/* RGBA (avec transparence) */
color: rgba(255, 87, 51, 0.5);</code></pre>

            <h3>💡 Astuce : Unités</h3>
            <ul>
                <li><code>px</code> : Pixels (fixe)</li>
                <li><code>%</code> : Pourcentage (relatif au parent)</li>
                <li><code>em</code> : Relatif à la taille du parent</li>
                <li><code>rem</code> : Relatif à la taille racine (html)</li>
                <li><code>vh/vw</code> : Viewport height/width (1vh = 1% de la hauteur)</li>
            </ul>
        `,
        exercise: {
            description: `
                Stylisez votre page avec les règles suivantes :<br/>
                 - Titre (h1) : couleur bleue, taille 32px<br/>
                 - Paragraphe : fond jaune, padding 20px, coins arrondis (border-radius)<br/>
                 - Utilisez une classe CSS (pas de style inline !)<br/>
            `,
            starterCode: {
                html: `<!DOCTYPE html>
<html>
<head>
    <title>CSS Basics</title>
    <link rel="stylesheet" href="style.css">
    <style>
        /* Ajoutez votre CSS ici ou dans le fichier css */
        
        h1 {
            /* Stylisez le titre */
        }
        
        .paragraphe-jaune {
            /* Stylisez le paragraphe avec une classe */
        }
    </style>
</head>
<body>
    <h1>Mon Titre</h1>
    <p class="paragraphe-jaune">Mon paragraphe de texte avec du style</p>

    <script src="script.js"></script>
</body>
</html>`,
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
                const hasPadding = parseInt(pStyle.padding) >= 15;
                const hasClass = p.classList.length > 0;
                
                if (!isH1Blue) return { success: false, message: "❌ Le titre doit être bleu" };
                if (!hasBgColor) return { success: false, message: "❌ Le paragraphe doit avoir un fond coloré" };
                if (!hasPadding) return { success: false, message: "❌ Le paragraphe doit avoir du padding (min 15px)" };
                if (!hasClass) return { success: false, message: "❌ Utilisez une classe CSS pour le paragraphe" };
                
                return { success: true, message: "🎉 Excellent ! Le CSS n'a plus de secret pour vous !" };
            }
        }
    },
    {
        id: 4,
        title: "Les Liens et Navigation",
        shortTitle: "Liens",
        xp: 100,
        lesson: `
            <h3>Créer des liens</h3>
            <p>La balise <code>&lt;a&gt;</code> (anchor = ancre) permet de créer des liens hypertextes :</p>
            <pre><code>&lt;a href="https://google.com"&gt;Aller sur Google&lt;/a&gt;
&lt;a href="#section"&gt;Ancre locale (scroll vers #section)&lt;/a&gt;
&lt;a href="page2.html"&gt;Page 2 du site&lt;/a&gt;
&lt;a href="mailto:contact@site.com"&gt;Envoyer un email&lt;/a&gt;
&lt;a href="tel:+33123456789"&gt;Appeler&lt;/a&gt;</code></pre>

            <h3>Attributs importants</h3>
            <ul>
                <li><code>href</code> : URL de destination (required)</li>
                <li><code>target="_blank"</code> : ouvrir dans un nouvel onglet</li>
                <li><code>title</code> : texte au survol (tooltip)</li>
                <li><code>download</code> : télécharger au lieu d'ouvrir</li>
                <li><code>rel="noopener"</code> : sécurité pour target="_blank"</li>
            </ul>

            <h3>Ancres internes</h3>
            <p>Les ancres permettent de naviguer dans la même page :</p>
            <pre><code>&lt;!-- Le lien --&gt;
&lt;a href="#section-contact"&gt;Aller au contact&lt;/a&gt;

&lt;!-- La destination (plus bas dans la page) --&gt;
&lt;section id="section-contact"&gt;
    &lt;h2&gt;Contact&lt;/h2&gt;
&lt;/section&gt;</code></pre>

            <h3>Styliser les liens</h3>
            <pre><code>/* État normal */
a {
    color: blue;
    text-decoration: none;
    transition: color 0.3s;
}

/* Au survol */
a:hover {
    color: red;
    text-decoration: underline;
}

/* Lien visité */
a:visited {
    color: purple;
}

/* Lien actif (pendant le clic) */
a:active {
    color: orange;
}</code></pre>

            <h3>💡 Les 4 états d'un lien (dans l'ordre !)</h3>
            <ol>
                <li><code>a:link</code> → lien normal non visité</li>
                <li><code>a:visited</code> → lien déjà visité</li>
                <li><code>a:hover</code> → survol de la souris</li>
                <li><code>a:active</code> → pendant le clic</li>
            </ol>
            <p><strong>⚠️ Respectez cet ordre sinon ça ne marche pas !</strong></p>

            <h3>Boutons stylisés</h3>
            <pre><code>a.button {
    display: inline-block;
    padding: 12px 24px;
    background: #007bff;
    color: white;
    border-radius: 5px;
    text-decoration: none;
}

a.button:hover {
    background: #0056b3;
}</code></pre>
        `,
        exercise: {
            description: `
                Créez une page avec :<br/>
                 - 3 liens vers Google, Wikipedia et GitHub<br/>
                 - Les liens doivent être <strong>verts</strong> par défaut<br/>
                 - Les liens deviennent <strong>oranges</strong> au survol (:hover)<br/>
                 - Pas de soulignement (text-decoration: none)<br/>
                 - Au moins un des liens s'ouvre dans un nouvel onglet<br/>
            `,
            starterCode: {
                html: `<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="style.css">
    <style>
        /* Votre CSS ici ou dans le fichier css*/
        a {
            /* Style par défaut */
        }
        
        a:hover {
            /* Style au survol */
        }
    </style>
</head>
<body>
    <h1>Mes liens favoris</h1>
    <nav>
        <!-- Ajoutez vos 3 liens ici -->
    </nav>

    <script src="script.js"></script>
</body>
</html>`,
                css: '',
                js: ''
            },
            validation: (doc) => {
                const links = doc.querySelectorAll('a');
                if (links.length < 3) return { success: false, message: "❌ Il faut au moins 3 liens" };
                
                const hasTargetBlank = Array.from(links).some(link => link.target === '_blank');
                if (!hasTargetBlank) return { success: false, message: "❌ Un des liens doit avoir target='_blank'" };
                
                const firstLinkStyle = window.getComputedStyle(links[0]);
                const hasGreen = firstLinkStyle.color.includes('0, 128, 0') || 
                                 firstLinkStyle.color === 'green' ||
                                 firstLinkStyle.color.includes('34, 139, 34');
                
                if (!hasGreen) return { success: false, message: "❌ Les liens doivent être verts" };
                
                const stylesheets = doc.styleSheets;
                let hoverFound = false;
                for (let sheet of stylesheets) {
                    try {
                        for (let rule of sheet.cssRules) {
                            if (rule.selectorText && rule.selectorText.includes('a:hover')) {
                                hoverFound = true;
                            }
                        }
                    } catch(e) {}
                }

                if (!hoverFound) return { success: false, message: "❌ Ajoutez un style a:hover pour changer la couleur au survol" };
                  
                return { success: true, message: "🎉 Bravo ! La navigation web n'a plus de secret !" };
            }
        }
    },
    {
        id: 5,
        shortTitle: "Formulaires",
        title: "Les Formulaires",
        xp: 200,
        lesson: `
            <h3>Créer un formulaire</h3>
            <p>Les formulaires permettent de collecter des données utilisateur.</p>
            
            <pre><code>&lt;form action="/submit" method="POST"&gt;
    &lt;label for="nom"&gt;Nom :&lt;/label&gt;
    &lt;input type="text" id="nom" name="nom" required&gt;
    
    &lt;label for="email"&gt;Email :&lt;/label&gt;
    &lt;input type="email" id="email" name="email" required&gt;
    
    &lt;button type="submit"&gt;Envoyer&lt;/button&gt;
&lt;/form&gt;</code></pre>

            <h3>Attributs du formulaire</h3>
            <ul>
                <li><code>action</code> : URL où envoyer les données</li>
                <li><code>method</code> : GET (URL) ou POST (corps de requête)</li>
                <li><code>enctype</code> : Pour upload de fichiers (multipart/form-data)</li>
            </ul>

            <h3>Types d'input</h3>
            <table id="table-t-l">
                <tr>
                    <th>Type</th>
                    <th>Description</th>
                </tr>
                <tr>
                    <td><code>text</code></td>
                    <td>Texte simple</td>
                </tr>
                <tr>
                    <td><code>email</code></td>
                    <td>Email (validation auto)</td>
                </tr>
                <tr>
                    <td><code>password</code></td>
                    <td>Mot de passe masqué</td>
                </tr>
                <tr>
                    <td><code>number</code></td>
                    <td>Nombre (avec min/max)</td>
                </tr>
                <tr>
                    <td><code>date</code></td>
                    <td>Sélecteur de date</td>
                </tr>
                <tr>
                    <td><code>checkbox</code></td>
                    <td>Case à cocher (multiple)</td>
                </tr>
                <tr>
                    <td><code>radio</code></td>
                    <td>Bouton radio (un seul choix)</td>
                </tr>
                <tr>
                    <td><code>file</code></td>
                    <td>Upload de fichier</td>
                </tr>
                <tr>
                    <td><code>tel</code></td>
                    <td>Numéro de téléphone</td>
                </tr>
                <tr>
                    <td><code>url</code></td>
                    <td>URL web</td>
                </tr>
            </table>

            <h3>Attributs importants</h3>
            <ul>
                <li><code>required</code> : champ obligatoire</li>
                <li><code>placeholder</code> : texte d'aide</li>
                <li><code>value</code> : valeur par défaut</li>
                <li><code>min / max</code> : pour les nombres</li>
                <li><code>minlength / maxlength</code> : longueur texte</li>
                <li><code>pattern</code> : regex de validation</li>
                <li><code>disabled</code> : désactive le champ</li>
                <li><code>readonly</code> : lecture seule</li>
            </ul>

            <h3>Select et Textarea</h3>
            <pre><code>&lt;!-- Liste déroulante --&gt;
&lt;select name="pays" required&gt;
    &lt;option value=""&gt;Choisissez...&lt;/option&gt;
    &lt;option value="fr"&gt;France&lt;/option&gt;
    &lt;option value="be"&gt;Belgique&lt;/option&gt;
&lt;/select&gt;

&lt;!-- Zone de texte multiligne --&gt;
&lt;textarea name="message" rows="5" cols="30"&gt;&lt;/textarea&gt;</code></pre>

            <h3>Labels - Pourquoi c'est important</h3>
            <pre><code>&lt;!-- Bonne pratique --&gt;
&lt;label for="email"&gt;Email :&lt;/label&gt;
&lt;input type="email" id="email" name="email"&gt;

&lt;!-- ❌ Mauvais --&gt;
Email : &lt;input type="email" name="email"&gt;</code></pre>
            <p><strong>Avantages du label :</strong> Accessibilité, clic sur le label = focus sur l'input</p>

            <h3>💡 Validation HTML5</h3>
            <pre><code>&lt;input type="email" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"&gt;</code></pre>
            <p>Le contenu du pattern est une <a href="https://fr.wikipedia.org/wiki/Expression_r%C3%A9guli%C3%A8re">expression régulière</a> qui va définir une règle sur le format de donnée attendue.</p>
        `,
        exercise: {
            description: `
                Créez un formulaire d'inscription avec :<br/>
                 - Nom (texte, obligatoire)<br/>
                 - Email (email, obligatoire)<br/>
                 - Mot de passe (password, obligatoire, min 6 caractères)<br/>
                 - Age (number, min 18, max 99)<br/>
                 - Un bouton submit<br/>
                 - Tous les champs doivent avoir un <code>label</code>
            `,
            starterCode: {
                html: `<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Formulaire d'inscription</h1>
    <form>
        <!-- Créez vos champs ici avec leurs labels -->
        
    </form>
    <script src="script.js"></script>
</body>
</html>`,
                css: `form {
    max-width: 400px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ddd;
}
input, button {
    width: 100%;
    padding: 8px;
    margin: 5px 0 15px 0;
}
label {
    font-weight: bold;
}`,
                js: ''
            },
            validation: (doc) => {
                const form = doc.querySelector('form');
                if (!form) return { success: false, message: "❌ Il manque un formulaire" };
                
                const labels = form.querySelectorAll('label');
                const inputs = form.querySelectorAll('input[required]');
                const button = form.querySelector('button[type="submit"]');
                const email = form.querySelector('input[type="email"]');
                const password = form.querySelector('input[type="password"]');
                const number = form.querySelector('input[type="number"]');
                
                if (labels.length < 3) return { success: false, message: "❌ Tous les champs doivent avoir un label" };
                if (inputs.length < 3) return { success: false, message: "❌ Il faut au moins 3 champs obligatoires" };
                if (!button) return { success: false, message: "❌ Il manque un bouton submit" };
                if (!email) return { success: false, message: "❌ Il manque un champ email" };
                if (!password) return { success: false, message: "❌ Il manque un champ password" };
                
                return { success: true, message: "🎉 Parfait ! Vous savez créer des formulaires complets !" };
            }
        }
    },
    {
        id: 6,
        shortTitle: "JavaScript Bases",
        title: "⚡ JavaScript - Introduction",
        xp: 200,
        lesson: `
            <h3>Qu'est-ce que JavaScript ?</h3>
            <p>JavaScript rend vos pages interactives. Il s'exécute dans le navigateur (côté client) et peut aussi tourner sur serveur avec Node.js.</p>
            
            <h3>Variables</h3>
            <pre><code>// let → peut changer
let nom = "Alice";
nom = "Bob";  // OK

// const → constante, ne peut pas changer
const age = 25;
age = 26;  // ❌ Erreur !

// var → ancienne syntaxe (à éviter)
var ville = "Paris";</code></pre>

            <h3>Quand utiliser let ou const ?</h3>
            <ul>
                <li><strong>const</strong> par défaut (95% du temps)</li>
                <li><strong>let</strong> seulement si la valeur change (compteur, accumulation...)</li>
                <li><strong>var</strong> jamais (problèmes de scope)</li>
            </ul>

            <h3>Types de données</h3>
            <pre><code>// String (chaîne de caractères)
const prenom = "Alice";
const phrase = 'Bonjour';
const template = \`Hello \${prenom}\`;  // Template literal

// Number (nombre)
const age = 25;
const prix = 19.99;

// Boolean (vrai/faux)
const estMajeur = true;
const estConnecte = false;

// Array (tableau)
const nombres = [1, 2, 3, 4, 5];
const fruits = ["pomme", "banane", "orange"];

// Object (objet)
const personne = {
    nom: "Alice",
    age: 25,
    ville: "Paris"
};

// undefined / null
let valeur;  // undefined
const vide = null;</code></pre>

            <h3>Opérateurs</h3>
            <pre><code>// Arithmétiques
let a = 10 + 5;   // 15
let b = 10 - 5;   // 5
let c = 10 * 5;   // 50
let d = 10 / 5;   // 2
let e = 10 % 3;   // 1 (modulo = reste)

// Comparaison
5 === 5     // true (strictement égal)
5 == "5"    // true (égal avec conversion)
5 !== 3     // true (différent)
5 > 3       // true
5 <= 5      // true

// Logiques
true && true   // true (ET)
true || false  // true (OU)
!true          // false (NON)</code></pre>

            <h3>💡 === vs ==</h3>
            <pre><code>5 == "5"   // true (conversion automatique)
5 === "5"  // false (types différents)

// Toujours utiliser === (strictement égal)
</code></pre>

            <h3>Fonctions</h3>
            <pre><code>// Déclaration classique
function direBonjour(nom) {
    return "Bonjour " + nom;
}

// Appel de fonction
console.log(direBonjour("Bob"));  // Bonjour Bob

// Fonction fléchée (moderne)
const saluer = (nom) => {
    return \`Hello \${nom}\`;
};

// Version courte
const saluerCourt = nom => \`Hello \${nom}\`;

// Fonction sans paramètre
const direHello = () => console.log("Hello");</code></pre>

            <h3>Console.log - Votre meilleur ami</h3>
            <pre><code>console.log("Message simple");
console.log("Valeur:", age);
console.log({ nom, age });  // Affiche l'objet
console.error("Erreur !");
console.warn("Attention !");</code></pre>

            <h3>Conditions</h3>
            <pre><code>const age = 20;

if (age >= 18) {
    console.log("Majeur");
} else if (age >= 16) {
    console.log("Presque majeur");
} else {
    console.log("Mineur");
}

// Ternaire (version courte)
const statut = age >= 18 ? "Majeur" : "Mineur";</code></pre>

            <h3>Boucles</h3>
            <pre><code>// For classique
for (let i = 0; i < 5; i++) {
    console.log(i);
}

// For...of (parcourir un tableau)
const fruits = ["pomme", "banane"];
for (const fruit of fruits) {
    console.log(fruit);
}

// While
let i = 0;
while (i < 5) {
    console.log(i);
    i++;
}</code></pre>
        `,
        exercise: {
            description: `
                Créez un script qui :<br/>
                 - Déclare une constante <code>nom</code> avec votre prénom<br/>
                 - Déclare une constante <code>age</code> avec votre âge<br/>
                 - Crée une fonction <code>afficherInfo()</code> qui affiche "Bonjour [nom], vous avez [age] ans" dans la console<br/>
                 - Appelle cette fonction<br/>
                 - Ouvrez la console du navigateur pour voir le résultat !
            `,
            starterCode: {
                html: `<!DOCTYPE html>
<html>
<head>
    <title>JS Basics</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Ouvrez la console (${keyComboElement})</h1>
    <p>Sinon tu peux faire clique droit « <code>Inpecter l'élément</code> »</p>
    
    <script src="script.js"></script>
</body>
</html>`,
                css: `#key-combo {
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
}`,
                js: `// Écrivez votre code JavaScript ici

// 1. Déclarez vos constantes nom et age

// 2. Créez la fonction afficherInfo()

// 3. Appelez la fonction
`
            },
            validation: (doc) => {
                const script = doc.querySelector('body script');
                if (!script) return { success: false, message: "❌ Pas de balise script trouvée" };
                
                const code = script.textContent;
                const hasConst = code.includes('const');
                const hasFunction = code.includes('function') || code.includes('=>');
                const hasConsoleLog = code.includes('console.log');
                
                if (!hasConst) return { success: false, message: "❌ Utilisez const pour déclarer vos variables" };
                if (!hasFunction) return { success: false, message: "❌ Créez une fonction" };
                if (!hasConsoleLog) return { success: false, message: "❌ Utilisez console.log() pour afficher un message" };
                
                return { success: true, message: "🎉 Bravo ! Vous avez écrit votre premier JavaScript !" };
            }
        }
    },
    {
        id: 7,
        shortTitle: "JavaScript ES6+",
        title: "JavaScript avancé (ES6+)",
        xp: 300,
        lesson: `
            <h3>JavaScript moderne (ES6+)</h3>
            <p>Depuis ES6 (2015), JavaScript a introduit de nombreuses fonctionnalités modernes qui rendent le code plus lisible et puissant.</p>
            
            <h3> Modules (import / export)</h3>
            <p>Permettent de séparer le code en fichiers réutilisables :</p>
            <pre><code>// math.js
export function add(a, b) { return a + b; }
export const PI = 3.14159;

// main.js
import { add, PI } from './math.js';
console.log(add(2, 3)); // 5
console.log(PI);        // 3.14159

// Export par défaut
export default function multiply(a, b) {
    return a * b;
}

import multiply from './math.js';</code></pre>
            
            <h3> Fonctions fléchées</h3>
            <p>Syntaxe courte pour les fonctions :</p>
            <pre><code>// Fonction classique
function add(a, b) {
    return a + b;
}

// Fonction fléchée
const add = (a, b) => {
    return a + b;
};

// Version ultra-courte (return implicite)
const add = (a, b) => a + b;

// Un seul paramètre → pas besoin de parenthèses
const double = x => x * 2;

// Pas de paramètre → parenthèses vides obligatoires
const sayHello = () => console.log("Hello");</code></pre>

            <h3>⚠️ Différence importante</h3>
            <ul>
                <li>Fonction classique : a son propre <code>this</code></li>
                <li>Fonction fléchée : hérite du <code>this</code> parent</li>
            </ul>
            
            <h3> Destructuring (Déstructuration)</h3>
            <p>Extraire des valeurs d'objets ou tableaux :</p>
            <pre><code>// Objet
const user = { nom: "Alice", age: 25, ville: "Paris" };
const { nom, age } = user;
console.log(nom, age); // Alice 25

// Renommer
const { nom: prenom } = user;
console.log(prenom); // Alice

// Valeur par défaut
const { pays = "France" } = user;
console.log(pays); // France

// Tableau
const arr = [1, 2, 3, 4, 5];
const [premier, deuxieme] = arr;
console.log(premier, deuxieme); // 1 2

// Ignorer des valeurs
const [a, , c] = arr;
console.log(a, c); // 1 3

// Rest
const [first, ...reste] = arr;
console.log(reste); // [2, 3, 4, 5]</code></pre>
            
            <h3> Template literals (Chaînes de caractères)</h3>
            <p>Concaténation plus simple avec backticks :</p>
            <pre><code>// Ancienne méthode (à éviter)
const message = "Bonjour " + nom + ", vous avez " + age + " ans";

// Nouvelle méthode (ES6+)
const message = \`Bonjour \${nom}, vous avez \${age} ans\`;

// Multi-lignes
const html = \`
    &lt;div&gt;
        &lt;h1&gt;\${titre}&lt;/h1&gt;
        &lt;p&gt;\${texte}&lt;/p&gt;
    &lt;/div&gt;
\`;

// Expressions
const total = \`Prix total: \${prix * quantite}€\`;</code></pre>
            
            <h3> Spread / Rest operator (...)</h3>
            <pre><code>// Spread → "étaler" un tableau/objet
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];
console.log(arr2); // [1, 2, 3, 4, 5]

// Copier un tableau
const copie = [...arr1];

// Fusionner des tableaux
const fusion = [...arr1, ...arr2];

// Objets
const user = { nom: "Alice", age: 25 };
const fullUser = { ...user, ville: "Paris" };
console.log(fullUser); // { nom: "Alice", age: 25, ville: "Paris" }

// Rest → "rassembler" des arguments
function sum(...nombres) {
    return nombres.reduce((acc, n) => acc + n, 0);
}
console.log(sum(1, 2, 3, 4)); // 10</code></pre>
            
            <h3> Async / Await</h3>
            <p>Syntaxe moderne pour les promesses :</p>
            <pre><code>// Ancienne méthode (Promises)
fetch('https://api.example.com/data')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

// Nouvelle méthode (async/await)
async function getData() {
    try {
        const response = await fetch('https://api.example.com/data');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}

// Version courte avec fonction fléchée
const getData = async () => {
    const response = await fetch('https://api.example.com/data');
    return await response.json();
};</code></pre>
            
            <h3> Map, Filter, Reduce</h3>
            <p>Méthodes pour manipuler les tableaux :</p>
            <pre><code>const nombres = [1, 2, 3, 4, 5];

// map → transformer chaque élément
const doubles = nombres.map(n => n * 2);
console.log(doubles); // [2, 4, 6, 8, 10]

// filter → garder certains éléments
const pairs = nombres.filter(n => n % 2 === 0);
console.log(pairs); // [2, 4]

// reduce → réduire à une seule valeur
const somme = nombres.reduce((acc, n) => acc + n, 0);
console.log(somme); // 15

// Chaîner les méthodes
const resultat = nombres
    .filter(n => n > 2)    // [3, 4, 5]
    .map(n => n * 2)       // [6, 8, 10]
    .reduce((a, b) => a + b); // 24
console.log(resultat); // 24</code></pre>

            <h3> Autres méthodes utiles</h3>
            <pre><code>// find → trouver un élément
const users = [
    { id: 1, nom: "Alice" },
    { id: 2, nom: "Bob" }
];
const user = users.find(u => u.id === 2);
console.log(user); // { id: 2, nom: "Bob" }

// some → au moins un élément correspond
const hasAdult = users.some(u => u.age >= 18);

// every → tous les éléments correspondent
const allAdults = users.every(u => u.age >= 18);

// includes → contient une valeur
const fruits = ["pomme", "banane"];
console.log(fruits.includes("pomme")); // true</code></pre>

            <h3>💡 Conseil Pro</h3>
            <p>Ces méthodes (map, filter, reduce) sont plus lisibles et évitent les bugs liés aux boucles <code>for</code>. Privilégiez-les !</p>
        `,
        exercise: {
            description: `
                Créez un script qui fait les actions suivantes :<br/>
                 - Déclarez un tableau de nombres <code>[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]</code><br/>
                 - Utilisez <code>map</code> pour doubler chaque nombre<br/>
                 - Utilisez <code>filter</code> pour garder seulement les nombres pairs<br/>
                 - Utilisez <code>reduce</code> pour calculer la somme totale<br/>
                 - Affichez le résultat avec <code>console.log</code> et un template literal (<code>\`\`</code>)<br/>
                 - Utilisez une fonction fléchée pour chaque méthode
            `,
            starterCode: {
                html: `<!DOCTYPE html>
<html>
<head>
    <title>JS Moderne</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Ouvrez la console (${keyComboElement})</h1>
    <p>Sinon tu peux faire clique droit « <code>Inpecter l'élément</code> »</p>
    <br/>
    <p>Résultat attendu : "La somme des nombres pairs doublés est : 60"</p>
    
    <script src="script.js"></script>
</body>
</html>`,
                css: '',
                js: `// Écrivez votre code JavaScript ici
        
// 1. Déclarez votre tableau
const nombres = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 2. Utilisez map, filter et reduce (chaînez-les !)

// 3. Affichez avec un template literal`
            },
            validation: (doc) => {
                const script = doc.querySelector('body script');
                if (!script) return { success: false, message: "❌ Script manquant" };
                
                const code = script.textContent;
                const usesMap = code.includes('.map(');
                const usesFilter = code.includes('.filter(');
                const usesReduce = code.includes('.reduce(');
                const usesArrow = code.includes('=>');
                const usesTemplate = code.includes('`') && code.includes('${');

                if (!usesMap) return { success: false, message: "❌ Utilisez .map() pour doubler les nombres" };
                if (!usesFilter) return { success: false, message: "❌ Utilisez .filter() pour garder les nombres pairs" };
                if (!usesReduce) return { success: false, message: "❌ Utilisez .reduce() pour calculer la somme" };
                if (!usesArrow) return { success: false, message: "❌ Utilisez des fonctions fléchées (=>) " };
                if (!usesTemplate) return { success: false, message: "❌ Utilisez un template literal (`${variable}`) pour afficher" };
                
                return { success: true, message: "🎉 Excellent ! Vous maîtrisez JavaScript ES6+ !" };
            }
        }
    },
    {
        id: 8,
        shortTitle: "DOM",
        title: "🖱️ Le DOM - Manipulation",
        xp: 250,
        lesson: `
            <h3>Qu'est-ce que le DOM ?</h3> 
            <p>Le DOM (Document Object Model) est la représentation de votre page HTML que JavaScript peut manipuler. Chaque élément HTML devient un objet JavaScript.</p>

            <h3>Visualisation du DOM</h3>
            <pre><code>document
└── html
    ├── head
    │   └── title
    └── body
        ├── h1
        └── p</code></pre>
            
            <h3> Sélectionner des éléments</h3> 
            <pre><code>// Par ID (unique)
let element = document.getElementById('mon-id');

// Par classe (tous les éléments)
let elements = document.getElementsByClassName('ma-classe');

// Par balise
let paragraphes = document.getElementsByTagName('p');

// querySelector (CSS selector - RECOMMANDÉ)
let premier = document.querySelector('.ma-classe');      // Premier élément
let tous = document.querySelectorAll('p');               // Tous les p
let complexe = document.querySelector('div.container > p:first-child');</code></pre>

            <h3>💡 querySelector vs getElementById</h3>
            <ul>
                <li><code>getElementById</code> → Plus rapide mais limité</li>
                <li><code>querySelector</code> → Plus flexible, syntaxe CSS</li>
            </ul>

            <h3> Modifier le contenu</h3> 
            <pre><code>let titre = document.querySelector('h1');

// Modifier le texte (sécurisé)
titre.textContent = "Nouveau titre";

// Modifier le HTML (⚠️ attention XSS)
titre.innerHTML = "&lt;strong&gt;Gras&lt;/strong&gt;";

// Différence
element.textContent = "&lt;b&gt;Test&lt;/b&gt;";  // Affiche: <b>Test</b>
element.innerHTML = "&lt;b&gt;Test&lt;/b&gt;";    // Affiche: Test en gras</code></pre>

            <h3> Modifier les attributs</h3>
            <pre><code>let image = document.querySelector('img');

// Lire un attribut
let src = image.getAttribute('src');

// Modifier un attribut
image.setAttribute('src', 'nouvelle-image.jpg');
image.setAttribute('alt', 'Description');

// Supprimer un attribut
image.removeAttribute('title');

// Propriétés directes (plus simple)
image.src = 'image.jpg';
image.alt = 'Photo';

let lien = document.querySelector('a');
lien.href = 'https://google.com';
lien.target = '_blank';</code></pre>

            <h3> Modifier le style</h3> 
            <pre><code>let titre = document.querySelector('h1');

// Style inline (une propriété à la fois)
titre.style.color = "red";
titre.style.fontSize = "30px";
titre.style.backgroundColor = "yellow";

// ⚠️ Camel case en JavaScript !
// CSS: background-color → JS: backgroundColor
// CSS: font-size → JS: fontSize

// Récupérer le style calculé
let styles = window.getComputedStyle(titre);
console.log(styles.color);
console.log(styles.fontSize);</code></pre>

            <h3> Classes CSS (MÉTHODE RECOMMANDÉE)</h3>
            <pre><code>let element = document.querySelector('.box');

// Ajouter une classe
element.classList.add('active');
element.classList.add('visible', 'highlight');  // Plusieurs à la fois

// Supprimer une classe
element.classList.remove('hidden');

// Basculer (toggle) une classe
element.classList.toggle('dark-mode');  // Ajoute si absent, retire si présent

// Vérifier si a une classe
if (element.classList.contains('active')) {
    console.log('Élément actif !');
}

// Remplacer une classe
element.classList.replace('old-class', 'new-class');</code></pre>

            <h3>💡 Style inline vs Classes CSS</h3>
            <table>
                <tr>
                    <th style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Style inline</th>
                    <th style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Classes CSS</th>
                </tr>
                <tr>
                    <td style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">❌ Mélange JS et CSS</td>
                    <td style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);text-align: end;">Séparation des préoccupations</td>
                </tr>
                <tr>
                    <td style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-block: 7px;">❌ Difficile à maintenir</td>
                    <td style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); text-align: end;">Facile à modifier</td>
                </tr>
                <tr>
                    <td>Utile pour valeurs dynamiques</td>
                    <td style="text-align: end;">Réutilisable</td>
                </tr>
            </table>

            <h3> Créer et supprimer des éléments</h3>
            <pre><code>// Créer un élément
let div = document.createElement('div');
div.textContent = "Nouvelle div";
div.classList.add('box');

// Ajouter dans le DOM
document.body.appendChild(div);               // À la fin
element.prepend(div);                         // Au début
element.insertBefore(div, autreElement);      // Avant un élément

// Supprimer un élément
element.remove();                             // Méthode moderne
element.parentNode.removeChild(element);      // Ancienne méthode</code></pre>

            <h3> Navigation dans le DOM</h3>
            <pre><code>let element = document.querySelector('.item');

// Parents
element.parentElement;       // Parent direct
element.closest('.container'); // Premier parent correspondant au sélecteur

// Enfants
element.children;            // Enfants directs
element.firstElementChild;   // Premier enfant
element.lastElementChild;    // Dernier enfant

// Frères et sœurs
element.nextElementSibling;  // Élément suivant
element.previousElementSibling; // Élément précédent</code></pre>

            <h3>💡 Conseil Pro</h3>
            <p>Préférez <code>classList</code> à <code>style</code> pour modifier l'apparence. Gardez votre CSS dans des fichiers .css !</p>
        ` ,
        exercise: {
            description: `
                Créez deux fonctions JavaScript :<br/>
                 - <code>changerTexte()</code> : Change le texte du paragraphe en "Texte modifié par JavaScript !"<br/>
                 - <code>changerStyle()</code> : Modifie la couleur, la taille et ajoute une classe CSS au paragraphe<br/>
                 - Les deux fonctions s'exécutent au clic sur le paragraphe<br/>
                 - Utilisez <code>getElementById</code> pour sélectionner l'élément<br/>
                 - Utilisez <code>classList.add()</code> pour la classe CSS
            `,
            starterCode: {
                html: `<!DOCTYPE html>
<html>
<head>
    <title>DOM - Manipulation</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <h1>Manipulation du DOM</h1>
    <p id="texte" onclick="changerTexte(); changerStyle();">
        Cliquez sur ce texte pour le modifier
    </p>

    <script src="script.js"></script>
</body>
</html>`,
                css: `#texte {
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 20px;
    border: 2px solid #ddd;
}

.highlight {
    background: yellow;
    border-color: orange;
}`,
                js: `function changerTexte() {
    // Sélectionnez le paragraphe avec getElementById
    // Changez son textContent
}

function changerStyle() {
    // Sélectionnez le paragraphe
    // Modifiez sa couleur (style.color)
    // Modifiez sa taille (style.fontSize)
    // Ajoutez la classe 'highlight' (classList.add)
}`
            },
            validation: (doc) => {
                const texte = doc.getElementById('texte');
                const script = doc.querySelector('body script');

                // 1. Vérifie la présence du paragraphe avec l'id 'texte'
                if (!texte) {
                    return { success: false, message: "❌ Le paragraphe avec l'id 'texte' est manquant" };
                }

                // 2. Vérifie que le script existe
                if (!script) {
                    return { success: false, message: "❌ Le script JavaScript est manquant" };
                }

                const scriptContent = script.textContent;

                // 3. Vérifie la présence des deux fonctions
                if (!scriptContent.includes('function changerTexte()') || !scriptContent.includes('function changerStyle()')) {
                    return { success: false, message: "❌ Les fonctions changerTexte() et changerStyle() doivent être définies" };
                }

                // 4. Vérifie que changerTexte() modifie bien le textContent
                const textContentRegex = /\.textContent\s*=\s*["'`]Texte modifié par JavaScript !["'`]/;
                if (!textContentRegex.test(scriptContent)) {
                    return { success: false, message: "❌ changerTexte() doit définir le texte sur 'Texte modifié par JavaScript !'" };
                }

                // 5. Vérifie que changerStyle() modifie la couleur ET la taille
                const hasColorChange = scriptContent.match(/\.style\.color\s*=/);
                const hasSizeChange = scriptContent.match(/\.style\.fontSize\s*=/);
                if (!hasColorChange || !hasSizeChange) {
                    return { success: false, message: "❌ changerStyle() doit modifier la couleur ET la taille du texte" };
                }

                // 6. Vérifie l'ajout de classe avec classList.add
                if (!scriptContent.includes('.classList.add(')) {
                    return { success: false, message: "❌ changerStyle() doit ajouter une classe avec classList.add()" };
                }

                // 7. Vérifie que getElementById('texte') est utilisé
                if (!scriptContent.match(/\.getElementById\(["'`]texte["'`]\)/)) {
                    return { success: false, message: "❌ Utilisez getElementById('texte') pour sélectionner l'élément" };
                }

                // 8. Vérifie que les fonctions sont appelées au clic
                const onclickContent = texte.getAttribute('onclick');
                if (!onclickContent || !onclickContent.includes('changerTexte()') || !onclickContent.includes('changerStyle()')) {
                    return { success: false, message: "❌ Les fonctions doivent être appelées au clic sur le paragraphe" };
                }

                // 9. Vérifie que le paragraphe a bien un attribut onclick
                if (!texte.hasAttribute('onclick')) {
                    return { success: false, message: "❌ Le paragraphe doit avoir un attribut onclick" };
                }

                return {
                    success: true,
                    message: "🎉 Parfait ! Vous maîtrisez la manipulation du DOM comme un pro !"
                };
            }
        }
    },
    {
        id: 9,
        shortTitle: "Événements",
        title: "Les Événements",
        xp: 250,
        lesson: `
            <h3>Qu'est-ce qu'un événement ?</h3>
            <p>Les événements détectent les actions de l'utilisateur : clics, saisie clavier, survol, etc. JavaScript peut "écouter" ces événements et réagir.</p>
            
            <h3> Écouter un événement</h3>
            <pre><code>let bouton = document.querySelector('button');

// Méthode addEventListener (RECOMMANDÉE)
bouton.addEventListener('click', function() {
    alert('Cliqué !');
});

// Version courte avec fonction fléchée
bouton.addEventListener('click', () => {
    console.log('Cliqué !');
});

// Ancienne méthode (à éviter)
bouton.onclick = function() {
    console.log('Clic');
};</code></pre>

            <h3>💡 Pourquoi addEventListener ?</h3>
            <ul>
                <li>Peut ajouter plusieurs écouteurs sur le même élément</li>
                <li>Peut supprimer un écouteur spécifique</li>
                <li>Plus de contrôle (phase de capture/bouillonnement)</li>
            </ul>

            <h3> Événements de souris</h3>
            <pre><code>element.addEventListener('click', () => {});        // Clic simple
element.addEventListener('dblclick', () => {});      // Double-clic
element.addEventListener('mouseenter', () => {});    // Entrée de la souris
element.addEventListener('mouseleave', () => {});    // Sortie de la souris
element.addEventListener('mousemove', () => {});     // Déplacement souris
element.addEventListener('mousedown', () => {});     // Bouton pressé
element.addEventListener('mouseup', () => {});       // Bouton relâché</code></pre>

            <h3> Événements clavier</h3>
            <pre><code>// Sur tout le document
document.addEventListener('keydown', (e) => {
    console.log('Touche pressée:', e.key);
});

document.addEventListener('keyup', (e) => {
    console.log('Touche relâchée:', e.key);
});

// Sur un input spécifique
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        console.log('Enter pressé !');
    }
});</code></pre>

            <h3> Événements de formulaire</h3>
            <pre><code>let form = document.querySelector('form');
let input = document.querySelector('input');

// Soumission du formulaire
form.addEventListener('submit', (e) => {
    e.preventDefault();  // Empêche le rechargement
    console.log('Formulaire soumis');
});

// Saisie dans un input
input.addEventListener('input', (e) => {
    console.log('Valeur actuelle:', e.target.value);
});

// Focus / Blur
input.addEventListener('focus', () => {
    console.log('Input sélectionné');
});

input.addEventListener('blur', () => {
    console.log('Input quitté');
});

// Changement de valeur (après blur)
input.addEventListener('change', () => {
    console.log('Valeur modifiée');
});</code></pre>

            <h3> L'objet event (e)</h3>
            <pre><code>element.addEventListener('click', (e) => {
    // L'élément cliqué
    console.log(e.target);
    
    // Position du clic
    console.log(e.clientX, e.clientY);
    
    // Empêcher l'action par défaut
    e.preventDefault();
    
    // Stopper la propagation
    e.stopPropagation();
    
    // Type d'événement
    console.log(e.type);  // 'click'
    
    // Touches spéciales pressées
    console.log(e.ctrlKey);  // Ctrl pressé ?
    console.log(e.shiftKey); // Shift pressé ?
    console.log(e.altKey);   // Alt pressé ?
});</code></pre>

            <h3> event.target vs event.currentTarget</h3>
            <pre><code>document.querySelector('.parent').addEventListener('click', (e) => {
    console.log(e.target);        // L'élément réellement cliqué
    console.log(e.currentTarget); // L'élément qui écoute (parent)
});</code></pre>

            <h3> Délégation d'événements</h3>
            <p>Technique pour gérer plusieurs éléments avec un seul écouteur :</p>
            <pre><code>&lt;ul id="liste"&gt;
    &lt;li&gt;Item 1&lt;/li&gt;
    &lt;li&gt;Item 2&lt;/li&gt;
    &lt;li&gt;Item 3&lt;/li&gt;
&lt;/ul&gt;

// ❌ Mauvais (un écouteur par élément)
document.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
        console.log('Cliqué');
    });
});

// Bon (un seul écouteur sur le parent)
document.getElementById('liste').addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
        console.log('Item cliqué:', e.target.textContent);
    }
});</code></pre>

            <h3> Supprimer un écouteur</h3>
            <pre><code>// Fonction nommée (required pour removeEventListener)
function handleClick() {
    console.log('Clic');
}

// Ajouter
button.addEventListener('click', handleClick);

// Supprimer
button.removeEventListener('click', handleClick);

// ⚠️ Ne fonctionne PAS avec les fonctions anonymes
button.addEventListener('click', () => {}); // Impossible à supprimer</code></pre>

            <h3> Événements de page</h3>
            <pre><code>// Page chargée (DOM prêt)
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé !');
});

// Tout chargé (images incluses)
window.addEventListener('load', () => {
    console.log('Page complète chargée');
});

// Avant fermeture
window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = ''; // Chrome
});</code></pre>

            <h3>💡 Bonnes pratiques</h3>
            <ul>
                <li>Utilisez <code>addEventListener</code> (pas onclick)</li>
                <li>Nommez vos fonctions pour pouvoir les supprimer</li>
                <li>Utilisez la délégation pour les listes dynamiques</li>
                <li>N'oubliez pas <code>e.preventDefault()</code> sur les formulaires</li>
            </ul>
        `,
        exercise: {
            description: `
                Créez une interface de changement de thème :<br/>
                 - 3 boutons : Rouge, Vert, Bleu<br/>
                 - Quand on clique sur un bouton, le fond du <code>body</code> prend la couleur du bouton<br/>
                 - Utilisez <code>addEventListener</code> sur chaque bouton<br/>
                 - Utilisez <code>document.body.style.backgroundColor</code><br/>
                 - Bonus : Ajoutez un effet de transition CSS
            `,
            starterCode: {
                html: `<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Changeur de couleur de fond</h1>
    <p>Cliquez sur un bouton pour changer la couleur du fond</p>
    
    <button id="rouge">Rouge</button>
    <button id="vert">Vert</button>
    <button id="bleu">Bleu</button>
        
    <script src="script.js"></script>
</body>
</html>`,
                css: `body {
    padding: 20px;
}

button {
    padding: 20px 40px;
    margin: 10px;
    font-size: 18px;
    cursor: pointer;
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: bold;
}

#rouge { background: #e74c3c; }
#vert { background: #27ae60; }
#bleu { background: #3498db; }

button:hover {
    opacity: 0.8;
}`,
                js: `// Sélectionnez les 3 boutons
        
// Ajoutez un addEventListener sur chaque bouton
// Qui change le backgroundColor du body`
            },
            validation: (doc) => {
                const buttons = doc.querySelectorAll('button');
                if (buttons.length < 3) return { success: false, message: "❌ Il faut 3 boutons" };
                
                const script = doc.querySelector('body script');
                const code = script.textContent;
                
                const hasAddEventListener = code.includes('addEventListener');
                const hasBackgroundColor = code.includes('backgroundColor') || code.includes('background-color');
                const hasQuerySelector = code.includes('querySelector') || code.includes('getElementById');
                
                if (!hasQuerySelector) return { success: false, message: "❌ Sélectionnez les boutons avec querySelector ou getElementById" };
                if (!hasAddEventListener) return { success: false, message: "❌ Utilisez addEventListener('click', ...)" };
                if (!hasBackgroundColor) return { success: false, message: "❌ Modifiez backgroundColor du body" };
                
                return { success: true, message: "🎉 Parfait ! Les événements sont maîtrisés !" };
            }
        }
    },
    {
    id: 10,
    shortTitle: "API",
    title: "Comprendre ce qu'est une API",
    xp: 120,
    lesson: `
        <h3>Qu'est-ce qu'une API ?</h3>
        <p>
            Une <strong>API</strong> (Application Programming Interface) est un 
            <strong>pont de communication</strong> entre deux applications.
        </p>
        <p>
            Elle permet à un programme de demander des données ou des services 
            à un autre programme.
        </p>

        <h3>Exemple simple</h3>
        <p>
            Imaginez un restaurant :
        </p>
        <ul>
            <li>Vous = le client (navigateur)</li>
            <li>Le serveur = l'API</li>
            <li>La cuisine = le serveur / base de données</li>
        </ul>
        <p>
            Vous ne parlez pas directement à la cuisine.  
            Vous passez par le serveur qui transmet votre demande.
        </p>

        <h3>Dans le web</h3>
        <p>
            Une API permet au navigateur de communiquer avec un serveur.
        </p>

        <pre><code>
// Le navigateur demande des données
fetch("https://api.monsite.com/users")
</code></pre>

        <p>
            Le serveur répond généralement en <strong>JSON</strong> :
        </p>

        <pre><code>
{
    "id": 1,
    "name": "Alice"
}
</code></pre>

        <h3>À quoi servent les API ?</h3>
        <ul>
            <li>Récupérer des données (utilisateurs, produits…)</li>
            <li>Envoyer des données (formulaires, messages…)</li>
            <li>Se connecter à des services externes</li>
        </ul>

        <h3>Exemples d'utilisation</h3>
        <ul>
            <li>Afficher la météo</li>
            <li>Afficher une carte</li>
            <li>Connexion avec un compte</li>
            <li>Paiement en ligne</li>
        </ul>

        <h3>Comment fonctionne une API ?</h3>
        <ul>
            <li>1. Le client envoie une requête</li>
            <li>2. Le serveur traite la demande</li>
            <li>3. Le serveur renvoie une réponse</li>
        </ul>

        <h3>Types de requêtes courantes</h3>
        <ul>
            <li><strong>GET</strong> → Lire des données</li>
            <li><strong>POST</strong> → Envoyer des données</li>
            <li><strong>PUT / PATCH</strong> → Modifier</li>
            <li><strong>DELETE</strong> → Supprimer</li>
        </ul>

        <h3>Bonne pratique</h3>
        <p>
            Une API permet de <strong>séparer le front-end et le back-end</strong>.
        </p>
        <ul>
            <li>Front → Interface utilisateur</li>
            <li>Back → Logique + données</li>
        </ul>
    `,
    exercise: {
        description: `
            Cette page simule l'utilisation d'une API :<br/>
                1. Un bouton déclenche un évènement<br/>
                2. Une fonction dans le script JavaScript se déclenche et fait appel à une api<br/>
                3. La requête prend du temps à arriver, un log est écrit dans la console à son arrivé !
        `,
        starterCode: {
            html: `<!DOCTYPE html>
<html>
<head>
    <title>Test API</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- 
        Code pour animation de chargement
        Pour trouver vos propres composant 
        https://uiverse.io/loaders
    -->
    <div class="loader">
        <div class="loader__bar"></div>
        <div class="loader__bar"></div>
        <div class="loader__bar"></div>
        <div class="loader__bar"></div>
        <div class="loader__bar"></div>
        <div class="loader__ball"></div>
    </div>
    <button id="btn">Appeler API</button>

    <script src="script.js"></script>
</body>
</html>`,
            css: `/* From Uiverse.io by Nawsome */ 
.loader {
   display: none;
   position: absolute;
   left: 50%;
    top: 50%;
transform: translate(-50%,-50%);
  width: 75px;
  height: 100px;
}

.loader__bar {
  position: absolute;
  bottom: 0;
  width: 10px;
  height: 50%;
  background: rgb(0, 0, 0);
  transform-origin: center bottom;
  box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
}

.loader__bar:nth-child(1) {
  left: 0px;
  transform: scale(1, 0.2);
  -webkit-animation: barUp1 4s infinite;
  animation: barUp1 4s infinite;
}

.loader__bar:nth-child(2) {
  left: 15px;
  transform: scale(1, 0.4);
  -webkit-animation: barUp2 4s infinite;
  animation: barUp2 4s infinite;
}

.loader__bar:nth-child(3) {
  left: 30px;
  transform: scale(1, 0.6);
  -webkit-animation: barUp3 4s infinite;
  animation: barUp3 4s infinite;
}

.loader__bar:nth-child(4) {
  left: 45px;
  transform: scale(1, 0.8);
  -webkit-animation: barUp4 4s infinite;
  animation: barUp4 4s infinite;
}

.loader__bar:nth-child(5) {
  left: 60px;
  transform: scale(1, 1);
  -webkit-animation: barUp5 4s infinite;
  animation: barUp5 4s infinite;
}

.loader__ball {
  position: absolute;
  bottom: 10px;
  left: 0;
  width: 10px;
  height: 10px;
  background: rgb(44, 143, 255);
  border-radius: 50%;
  -webkit-animation: ball624 4s infinite;
  animation: ball624 4s infinite;
}

@keyframes ball624 {
  0% {
    transform: translate(0, 0);
  }

  5% {
    transform: translate(8px, -14px);
  }

  10% {
    transform: translate(15px, -10px);
  }

  17% {
    transform: translate(23px, -24px);
  }

  20% {
    transform: translate(30px, -20px);
  }

  27% {
    transform: translate(38px, -34px);
  }

  30% {
    transform: translate(45px, -30px);
  }

  37% {
    transform: translate(53px, -44px);
  }

  40% {
    transform: translate(60px, -40px);
  }

  50% {
    transform: translate(60px, 0);
  }

  57% {
    transform: translate(53px, -14px);
  }

  60% {
    transform: translate(45px, -10px);
  }

  67% {
    transform: translate(37px, -24px);
  }

  70% {
    transform: translate(30px, -20px);
  }

  77% {
    transform: translate(22px, -34px);
  }

  80% {
    transform: translate(15px, -30px);
  }

  87% {
    transform: translate(7px, -44px);
  }

  90% {
    transform: translate(0, -40px);
  }

  100% {
    transform: translate(0, 0);
  }
}

@-webkit-keyframes barUp1 {
  0% {
    transform: scale(1, 0.2);
  }

  40% {
    transform: scale(1, 0.2);
  }

  50% {
    transform: scale(1, 1);
  }

  90% {
    transform: scale(1, 1);
  }

  100% {
    transform: scale(1, 0.2);
  }
}

@keyframes barUp1 {
  0% {
    transform: scale(1, 0.2);
  }

  40% {
    transform: scale(1, 0.2);
  }

  50% {
    transform: scale(1, 1);
  }

  90% {
    transform: scale(1, 1);
  }

  100% {
    transform: scale(1, 0.2);
  }
}

@-webkit-keyframes barUp2 {
  0% {
    transform: scale(1, 0.4);
  }

  40% {
    transform: scale(1, 0.4);
  }

  50% {
    transform: scale(1, 0.8);
  }

  90% {
    transform: scale(1, 0.8);
  }

  100% {
    transform: scale(1, 0.4);
  }
}

@keyframes barUp2 {
  0% {
    transform: scale(1, 0.4);
  }

  40% {
    transform: scale(1, 0.4);
  }

  50% {
    transform: scale(1, 0.8);
  }

  90% {
    transform: scale(1, 0.8);
  }

  100% {
    transform: scale(1, 0.4);
  }
}

@-webkit-keyframes barUp3 {
  0% {
    transform: scale(1, 0.6);
  }

  100% {
    transform: scale(1, 0.6);
  }
}

@keyframes barUp3 {
  0% {
    transform: scale(1, 0.6);
  }

  100% {
    transform: scale(1, 0.6);
  }
}

@-webkit-keyframes barUp4 {
  0% {
    transform: scale(1, 0.8);
  }

  40% {
    transform: scale(1, 0.8);
  }

  50% {
    transform: scale(1, 0.4);
  }

  90% {
    transform: scale(1, 0.4);
  }

  100% {
    transform: scale(1, 0.8);
  }
}

@keyframes barUp4 {
  0% {
    transform: scale(1, 0.8);
  }

  40% {
    transform: scale(1, 0.8);
  }

  50% {
    transform: scale(1, 0.4);
  }

  90% {
    transform: scale(1, 0.4);
  }

  100% {
    transform: scale(1, 0.8);
  }
}

@-webkit-keyframes barUp5 {
  0% {
    transform: scale(1, 1);
  }

  40% {
    transform: scale(1, 1);
  }

  50% {
    transform: scale(1, 0.2);
  }

  90% {
    transform: scale(1, 0.2);
  }

  100% {
    transform: scale(1, 1);
  }
}

@keyframes barUp5 {
  0% {
    transform: scale(1, 1);
  }

  40% {
    transform: scale(1, 1);
  }

  50% {
    transform: scale(1, 0.2);
  }

  90% {
    transform: scale(1, 0.2);
  }

  100% {
    transform: scale(1, 1);
  }
}`,
            js: `const btn = document.getElementById("btn");

btn.addEventListener("click", () => {
    const loader = document.getElementsByClassName("loader")[0]
    if(loader) loader.style.display = "unset"
    // Méthode JavaScript pour lancer du code au bout d'un certain temps
    // Temps exprimé en miliseconde, donc ici 5000 revient à 5 secondes
    setTimeout(()=>{
        if(loader) loader.style.display = "none"
        console.log("Requête API");
    }, 5000)
    
});`
        },
        validation: (doc) => {
            const button = doc.querySelector('button');
            const script = doc.querySelector('body script');

            if (!button) return { success: false, message: "❌ Il manque un bouton" };
            if (!script) return { success: false, message: "❌ Le fichier JavaScript externe n'est pas lié" };

            return { success: true, message: "Vous avez simulé un appel API !" };
        }
    }
},
    {
        id: 11,
        shortTitle: "Fetch API",
        title: "Fetch API - Requêtes",
        xp: 300,
        lesson: `
            <h3>Qu'est-ce que Fetch ?</h3>
            <p>
                <strong>Fetch</strong> est une fonction JavaScript moderne qui permet d'envoyer des requêtes HTTP pour 
                récupérer ou envoyer des données depuis/vers une API (serveur). C'est la base de toute application web interactive.
            </p>

            <h3>Communication Client-Serveur</h3>
            <img style="width: 80%; border-radius: 5px;" src="/communication-CS.webp"/>

            <h3> Requête GET simple</h3>
            <p>Récupérer des données depuis une API :</p>
            <pre><code>// Avec .then()
fetch('https://api.example.com/posts')
    .then(response => response.json())  // Convertir en JSON
    .then(data => {
        console.log(data);  // Faire quelque chose avec les données
    })
    .catch(error => {
        console.error('Erreur:', error);
    });</code></pre>

            <h3> Avec async/await (RECOMMANDÉ)</h3>
            <pre><code>async function getPosts() {
    try {
        const response = await fetch('https://api.example.com/posts');
        
        // Vérifier si la requête a réussi
        if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Erreur:', error);
    }
}</code></pre>

            <h3> Requête POST (Créer des données)</h3>
            <pre><code>async function createPost(title, content) {
    try {
        const response = await fetch('https://api.example.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        });
        
        const data = await response.json();
        console.log('Post créé:', data);
        return data;
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Utilisation
createPost('Mon titre', 'Mon contenu');</code></pre>

            <h3> Requête PUT (Modifier)</h3>
            <pre><code>async function updatePost(id, newData) {
    const response = await fetch(\`https://api.example.com/posts/\${id}\`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newData)
    });
    
    return await response.json();
}</code></pre>

            <h3> Requête DELETE (Supprimer)</h3>
            <pre><code>async function deletePost(id) {
    const response = await fetch(\`https://api.example.com/posts/\${id}\`, {
        method: 'DELETE'
    });
    
    if (response.ok) {
        console.log('Post supprimé');
    }
}</code></pre>

            <h3> Headers personnalisés</h3>
            <pre><code>fetch('https://api.example.com/data', {
    headers: {
        'Authorization': 'Bearer mon-token-jwt',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});</code></pre>

            <h3> Gérer les erreurs</h3>
            <pre><code>async function fetchWithErrorHandling(url) {
    try {
        const response = await fetch(url);
        
        // Vérifier le statut HTTP
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Ressource non trouvée');
            } else if (response.status === 500) {
                throw new Error('Erreur serveur');
            } else {
                throw new Error(\`Erreur HTTP: \${response.status}\`);
            }
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur:', error.message);
        throw error;
    }
}</code></pre>

            <h3> Codes HTTP importants</h3>
            <table class="http-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Signification</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="success"><td>200</td><td>OK - Succès</td></tr>
                    <tr class="success"><td>201</td><td>Created - Ressource créée</td></tr>
                    <tr class="client-error"><td>400</td><td>Bad Request - Requête invalide</td></tr>
                    <tr class="client-error"><td>401</td><td>Unauthorized - Non authentifié</td></tr>
                    <tr class="client-error"><td>404</td><td>Not Found - Ressource introuvable</td></tr>
                    <tr class="server-error"><td>500</td><td>Server Error - Erreur serveur</td></tr>
                </tbody>
            </table>

            <h3> Afficher les données dans le DOM</h3>
            <pre><code>async function displayPosts() {
    const posts = await fetch('/api/posts').then(r => r.json());
    const container = document.getElementById('posts');
    
    posts.forEach(post => {
        const div = document.createElement('div');
        div.innerHTML = \`
            &lt;h3&gt;\${post.title}&lt;/h3&gt;
            &lt;p&gt;\${post.content}&lt;/p&gt;
        \`;
        container.appendChild(div);
    });
}</code></pre>

            <h3>💡 Bonnes pratiques</h3>
            <ul>
                <li>Toujours utiliser <code>try/catch</code> avec async/await</li>
                <li>Vérifier <code>response.ok</code> avant de parser le JSON</li>
                <li>Afficher un message de chargement pendant la requête</li>
                <li>Gérer les erreurs pour l'utilisateur</li>
                <li>Ne jamais exposer de tokens/secrets dans le front-end</li>
            </ul>

            <h3>💡 Astuces pour l'exercice</h3>
            <ul>
                <li>Pour créer un élément : <code>document.createElement('li')</code></li>
                <li>Pour modifier le texte : <code>element.textContent = 'Mon texte'</code></li>
                <li>Pour ajouter dans le DOM : <code>parent.appendChild(element)</code></li>
                <li>Les posts sont un tableau → utilisez <code>forEach()</code></li>
            </ul>

            <h3>Exemple complet</h3>
            <pre><code>// Créer un élément pour chaque post
posts.forEach(post => {
    const li = document.createElement('li');
    li.textContent = \`\${post.title} - \${post.content}\`;
    document.getElementById('liste').appendChild(li);
});</code></pre>
        `,
        exercise: {
            description: `
                Créez une interface de chargement de posts :<br/>
                 - Remplir une liste &lt;ul&gt; pour afficher les posts<br/>
                 - Au clic, faites un <code>fetch GET</code> vers <code>/posts</code><br/>
                 - Affichez chaque post dans un &lt;li&gt; avec son titre et contenu<br/>
                 - Utilisez <code>async/await</code> et <code>try/catch</code><br/>
                 - Affichez un message d'erreur si la requête échoue
            `,
            starterCode: {
                html: `<!DOCTYPE html>
<html>
<head>
    <title>Fetch API</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Liste des posts</h1>
    <button id="charger">Charger les posts</button>
    <ul id="posts-list"></ul>
        
    <script src="script.js"></script>
</body>
</html>`,
                css: `body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 50px auto;
    padding: 20px;
}

button {
    padding: 12px 24px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}

button:hover {
    background: #2980b9;
}

#posts-list {
    margin-top: 20px;
}

#posts-list li {
    background: #f8f9fa;
    padding: 15px;
    margin: 10px 0;
    border-left: 4px solid #3498db;
    list-style: none;
}

.error {
    color: red;
    padding: 10px;
    background: #fee;
    border-radius: 5px;
}`,
                js: `// 1. Sélectionnez le bouton et la liste
const button = document.getElementById('charger');
const liste = document.getElementById('posts-list');

// 2. Ajoutez un événement click sur le bouton

// 3. Créez une fonction async pour charger les posts

// 4. Dans la fonction :
//    - Faites un fetch GET vers '/posts'
//    - Récupérez les données avec .json()
//    - Parcourez les posts avec forEach
//    - Créez un <li> pour chaque post
//    - Ajoutez le <li> dans la liste`
            },
            validation: (doc) => {
                const button = doc.getElementById('charger');
                const list = doc.getElementById('posts-list');
                
                if (!button || !list) return { success: false, message: "❌ Éléments button ou liste manquants" };
                
                const script = doc.querySelector('body script');
                const code = script.textContent;
                
                const hasFetch = code.includes('fetch');
                const hasAsync = code.includes('async');
                const hasTryCatch = code.includes('try') && code.includes('catch');
                const hasAddEventListener = code.includes('addEventListener') || button.getAttribute('onclick');;
                const hasCreateElement = code.includes('createElement');
                
                if (!hasFetch) return { success: false, message: "❌ Utilisez fetch() pour appeler l'API" };
                if (!hasAsync) return { success: false, message: "❌ Utilisez async/await pour les requêtes asynchrones" };
                if (!hasTryCatch) return { success: false, message: "❌ Utilisez try/catch pour gérer les erreurs" };
                if (!hasAddEventListener) return { success: false, message: "❌ Ajoutez un addEventListener sur le bouton" };
                if (!hasCreateElement) return { success: false, message: "❌ Créez des éléments <li> avec createElement" };
                
                return { success: true, message: "🎉 Excellent ! Vous savez faire des requêtes API !" };
            }
        }
    },
    {
        id: 12,
        shortTitle: "Authentification",
        title: "Authentification JWT",
        xp: 350,
        lesson: `
            <h3>Qu'est-ce que l'authentification ?</h3>
            <p>
                L'authentification permet de vérifier l'identité d'un utilisateur. Sur le web, on utilise principalement 
                des <strong>tokens JWT</strong> (JSON Web Tokens) ou des <strong>cookies</strong>.
            </p>

            <h3> Les Cookies</h3>
            <p>
                Les cookies stockent des données côté client. Ils sont automatiquement envoyés avec chaque requête au serveur.
            </p>
            
            <h3> Cookies avec credentials</h3>
            <p>Pour que les cookies soient envoyés avec fetch, utilisez <code>credentials: 'include'</code> :</p>
            <pre><code>fetch('/api/login', {
    method: 'POST',
    credentials: 'include',  // ⚠️ IMPORTANT !
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: 'student@test.com',
        password: 'password'
    })
});</code></pre>

            <h3> JWT - JSON Web Token</h3>
            <p>Un JWT est un token sécurisé qui contient les informations de l'utilisateur encodées.</p>
            
            <h4>Structure d'un JWT :</h4>
            <pre><code>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOjEsImVtYWlsIjoic3R1ZGVudEB0ZXN0LmNvbSJ9.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

↑           ↑                    ↑
Header    Payload              Signature
</code></pre>

            <h3> Flow d'authentification</h3>
            <pre><code>1. Utilisateur → POST /login (email + password)
                ↓
2. Serveur vérifie les credentials
                ↓
3. Serveur crée un JWT et le renvoie (ou le met dans un cookie)
                ↓
4. Client stocke le JWT (localStorage ou cookie)
                ↓
5. Chaque requête inclut le JWT dans les headers ou cookies
                ↓
6. Serveur vérifie le JWT à chaque requête
</code></pre>

            <h3> Exemple complet de login</h3>
            <pre><code>async function login(email, password) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            credentials: 'include',  // Envoie et reçoit les cookies
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Login échoué');
        }

        const data = await response.json();
        console.log('Connecté:', data);
        
        // Rediriger vers la page principale
        window.location.href = '/dashboard';
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Email ou mot de passe incorrect');
    }
}</code></pre>

            <h3> Requête authentifiée</h3>
            <pre><code>// Le cookie est automatiquement envoyé avec credentials
async function getPosts() {
    const response = await fetch('/api/posts', {
        credentials: 'include'  // Envoie le cookie JWT
    });
    
    return await response.json();
}</code></pre>

            <h3> Gérer les erreurs d'authentification</h3>
            <pre><code>async function fetchProtectedResource(url) {
    try {
        const response = await fetch(url, {
            credentials: 'include'
        });
        
        if (response.status === 401) {
            // Non authentifié
            alert('Vous devez vous connecter');
            window.location.href = '/login';
            return;
        }
        
        if (response.status === 403) {
            // Non autorisé
            alert('Accès refusé');
            return;
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}</code></pre>

            <h3> Déconnexion</h3>
            <pre><code>async function logout() {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        // Rediriger vers la page de login
        window.location.href = '/login';
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}</code></pre>

            <h3> Vérifier si l'utilisateur est connecté</h3>
            <pre><code>async function checkAuth() {
    try {
        const response = await fetch('/api/me', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const user = await response.json();
            console.log('Utilisateur connecté:', user);
            return user;
        } else {
            console.log('Non connecté');
            return null;
        }
    } catch (error) {
        console.error('Erreur:', error);
        return null;
    }
}

// Au chargement de la page
window.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    
    if (!user) {
        // Rediriger vers login si pas connecté
        window.location.href = '/login';
    }
});</code></pre>

            <h3> Récupérer les valeurs d'un formulaire</h3>
            <pre><code>// Méthode 1 : Avec les IDs
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;

// Méthode 2 : Avec FormData
const form = document.getElementById('login-form');
const formData = new FormData(form);
const email = formData.get('email');
const password = formData.get('password');

// Méthode 3 : Empêcher le submit et récupérer
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    login(email, password);
});</code></pre>

            <h3>💡 Sécurité - Bonnes pratiques</h3>
            <ul>
                <li>Toujours utiliser HTTPS en production</li>
                <li>Les cookies httpOnly ne sont pas accessibles en JavaScript (plus sécurisés)</li>
                <li>Ne jamais stocker de mots de passe en clair</li>
                <li>Les JWT expirent après un certain temps</li>
                <li>Toujours valider les données côté serveur</li>
                <li>❌ Ne jamais exposer de secrets/tokens dans le code front-end</li>
            </ul>

            <h3>Comptes de test disponibles</h3>
            <pre><code>Admin:   admin@test.com / password
Student: student@test.com / password</code></pre>
        `,
        exercise: {
            description: `
                Créez un formulaire de connexion complet :<br/>
                 - Formulaire avec email et password (inputs obligatoires)<br/>
                 - Bouton submit<br/>
                 - Au submit : empêcher le rechargement (<code>e.preventDefault()</code>)<br/>
                 - Récupérer les valeurs des inputs<br/>
                 - Envoyer à <code>POST /login</code> avec <code>credentials: 'include'</code><br/>
                 - Afficher un message de succès ou d'erreur dans un div #message<br/>
                 - Gérer les erreurs avec try/catch<br/><br/>
                 <strong>Compte test :</strong> student@test.com / password
            `,
            starterCode: {
                html: `<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <form id="login-form">
        <h2>Connexion</h2>
        
        <input type="email" id="email" placeholder="Email" required value="student@test.com">
        <input type="password" id="password" placeholder="Mot de passe" required value="password">
        
        <button type="submit">Se connecter</button>
        
        <div class="info">
            Compte test :<br/>
            student@test.com / password
        </div>
        
        <div id="message"></div>
    </form>

    <script src="script.js"></script>
</body>
</html>`,
                css: `body {
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

form {
    background: white;
    max-width: 400px;
    width: 100%;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

h2 {
    margin: 0 0 30px 0;
    color: #333;
}

input {
    width: 100%;
    padding: 12px;
    margin: 10px 0;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
}

input:focus {
    outline: none;
    border-color: #667eea;
}

button {
    width: 100%;
    padding: 12px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 10px;
}

button:hover {
    background: #5568d3;
}

#message {
    margin-top: 20px;
    padding: 10px;
    border-radius: 5px;
    text-align: center;
}

.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.info {
    margin-top: 15px;
    font-size: 12px;
    color: #666;
    text-align: center;
}`,
                js: `// 1. Sélectionnez le formulaire et les éléments
const form = document.getElementById('login-form');
const messageDiv = document.getElementById('message');

// 2. Écoutez l'événement submit
form.addEventListener('submit', async (e) => {
    // Empêcher le rechargement de la page
    e.preventDefault();
    
    // 3. Récupérer les valeurs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // 4. Appeler la fonction login
    await login(email, password);
});

// 5. Créez la fonction login async
async function login(email, password) {
    try {
        // Faire la requête POST vers /login
        // avec credentials: 'include'
        // N'oubliez pas Content-Type: application/json
        // et JSON.stringify dans le body
        
        // Vérifier response.ok
        
        // Afficher le message de succès ou d'erreur
        
    } catch (error) {
        // Gérer l'erreur
        messageDiv.textContent = 'Erreur de connexion';
        messageDiv.className = 'error';
    }
}`
            },
            validation: (doc) => {
                const form = doc.getElementById('login-form');
                const message = doc.getElementById('message');
                const email = doc.getElementById('email');
                const password = doc.getElementById('password');

                if (!form || !message || !email || !password) {
                    return { success: false, message: "❌ Tous les éléments du formulaire doivent être présents" };
                }

                const script = doc.querySelector('body script');
                if (!script) return { success: false, message: "❌ Script manquant" };

                const code = script.textContent;

                // Vérifie fetch POST avec credentials
                const hasFetchLogin = /fetch\(.+\/api\/login['"`],?\s*{[^}]*method:\s*['"]POST['"][^}]*credentials:\s*['"]include['"]/s.test(code);
                if (!hasFetchLogin) {
                    return { success: false, message: "❌ Utilisez fetch POST sur /login avec credentials: 'include'" };
                }

                // Vérifie que email et password sont récupérés
                const usesEmail = code.includes('email') && (code.includes('getElementById') || code.includes('.value'));
                const usesPassword = code.includes('password') && (code.includes('getElementById') || code.includes('.value'));
                if (!usesEmail || !usesPassword) {
                    return { success: false, message: "❌ Récupérez et envoyez email et password depuis les inputs" };
                }

                // Vérifie preventDefault
                if (!code.includes('preventDefault()')) {
                    return { success: false, message: "❌ Utilisez e.preventDefault() dans le submit" };
                }

                // Vérifie try/catch
                if (!code.includes('try') || !code.includes('catch')) {
                    return { success: false, message: "❌ Utilisez try/catch pour gérer les erreurs" };
                }

                return { success: true, message: "🎉 Parfait ! Formulaire de connexion sécurisé et fonctionnel !" };
            }
        }
    },
    {
        id: 13,
        shortTitle: "Créer des données",
        title: "Créer un Post (CRUD)",
        xp: 300,
        lesson: `
            <h3>CRUD - Create, Read, Update, Delete</h3>
            <p>
                Les opérations CRUD sont les 4 actions de base sur des données :
            </p>
            <ul>
                <li><strong>Create</strong> → Créer (POST)</li>
                <li><strong>Read</strong> → Lire (GET)</li>
                <li><strong>Update</strong> → Modifier (PUT/PATCH)</li>
                <li><strong>Delete</strong> → Supprimer (DELETE)</li>
            </ul>

            <h3> Créer une ressource (POST)</h3>
            <p>Pour créer un post, on envoie une requête POST avec les données en JSON.</p>
            
            <h3>Exemple complet</h3>
            <pre><code>async function createPost(title, content) {
    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            credentials: 'include',  // Important pour l'auth
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        });
        
        // Vérifier le statut
        if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        
        const data = await response.json();
        console.log('Post créé:', data);
        return data;
        
    } catch (error) {
        console.error('Erreur:', error);
        throw error;
    }
}

// Utilisation
createPost('Mon titre', 'Mon contenu');</code></pre>

            <h3> Récupérer les valeurs d'un formulaire</h3>
            <pre><code>// HTML
&lt;form id="post-form"&gt;
    &lt;input type="text" id="title" required&gt;
    &lt;textarea id="content" required&gt;&lt;/textarea&gt;
    &lt;button type="submit"&gt;Publier&lt;/button&gt;
&lt;/form&gt;

// JavaScript
document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Récupérer les valeurs
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    
    // Créer le post
    try {
        const post = await createPost(title, content);
        alert('Post créé avec succès !');
        
        // Vider le formulaire
        e.target.reset();
        
    } catch (error) {
        alert('Erreur lors de la création');
    }
});</code></pre>

            <h3> Validation côté client</h3>
            <pre><code>function validateForm(title, content) {
    // Vérifier que les champs ne sont pas vides
    if (!title || !content) {
        return { valid: false, error: 'Tous les champs sont requis' };
    }
    
    // Vérifier la longueur
    if (title.length < 3) {
        return { valid: false, error: 'Le titre doit faire au moins 3 caractères' };
    }
    
    if (content.length < 10) {
        return { valid: false, error: 'Le contenu doit faire au moins 10 caractères' };
    }
    
    return { valid: true };
}

// Utilisation
const validation = validateForm(title, content);
if (!validation.valid) {
    alert(validation.error);
    return;
}</code></pre>

            <h3> Afficher un message de succès</h3>
            <pre><code>function showMessage(message, type = 'success') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = type;
    
    // Disparaître après 3 secondes
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = '';
    }, 3000);
}

// Utilisation
showMessage('Post créé avec succès !', 'success');
showMessage('Erreur lors de la création', 'error');</code></pre>

            <h3> Désactiver le bouton pendant l'envoi</h3>
            <pre><code>async function handleSubmit(e) {
    e.preventDefault();
    
    const button = e.target.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    
    // Désactiver le bouton
    button.disabled = true;
    button.textContent = 'Envoi en cours...';
    
    try {
        await createPost(title, content);
        showMessage('Post créé !', 'success');
    } catch (error) {
        showMessage('Erreur', 'error');
    } finally {
        // Réactiver le bouton
        button.disabled = false;
        button.textContent = originalText;
    }
}</code></pre>

            <h3> Recharger la liste après création</h3>
            <pre><code>async function createAndRefresh() {
    const post = await createPost(title, content);
    
    // Recharger la liste des posts
    await loadPosts();
    
    // Ou ajouter juste le nouveau post
    addPostToDOM(post);
}

function addPostToDOM(post) {
    const liste = document.getElementById('posts-list');
    const li = document.createElement('li');
    li.innerHTML = \`
        &lt;h3&gt;\${post.title}&lt;/h3&gt;
        &lt;p&gt;\${post.content}&lt;/p&gt;
    \`;
    liste.prepend(li);  // Ajouter au début
}</code></pre>

            <h3> Gestion d'erreurs complète</h3>
            <pre><code>async function createPost(title, content) {
    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });
        
        const data = await response.json();
        
        // Gérer les différentes erreurs
        if (response.status === 401) {
            throw new Error('Vous devez être connecté');
        }
        
        if (response.status === 400) {
            throw new Error(data.error || 'Données invalides');
        }
        
        if (!response.ok) {
            throw new Error('Erreur serveur');
        }
        
        return data;
        
    } catch (error) {
        console.error('Erreur:', error);
        throw error;
    }
}</code></pre>

            <h3>💡 Bonnes pratiques</h3>
            <ul>
                <li>Valider les données avant d'envoyer</li>
                <li>Désactiver le bouton pendant l'envoi</li>
                <li>Afficher un feedback visuel (succès/erreur)</li>
                <li>Vider le formulaire après succès</li>
                <li>Gérer toutes les erreurs possibles</li>
                <li>Utiliser try/catch pour les requêtes</li>
            </ul>

            <h3>Structure complète d'un formulaire</h3>
            <pre><code>// 1. Écouter le submit
form.addEventListener('submit', handleSubmit);

// 2. Fonction de gestion
async function handleSubmit(e) {
    e.preventDefault();
    
    // 3. Récupérer les valeurs
    const data = getFormData();
    
    // 4. Valider
    if (!validate(data)) return;
    
    // 5. Désactiver le bouton
    toggleButton(true);
    
    try {
        // 6. Envoyer
        await createPost(data);
        
        // 7. Succès
        showSuccess();
        form.reset();
        
    } catch (error) {
        // 8. Erreur
        showError(error.message);
        
    } finally {
        // 9. Réactiver le bouton
        toggleButton(false);
    }
}</code></pre>
        `,
        exercise: {
            description: `
                Créez un formulaire de création de post complet :<br/>
                 - Formulaire avec titre (input) et contenu (textarea)<br/>
                 - Bouton submit<br/>
                 - Au submit : récupérer les valeurs<br/>
                 - Envoyer à <code>POST /posts</code> avec <code>credentials: 'include'</code><br/>
                 - Afficher le résultat dans un div #result<br/>
                 - Vider le formulaire après succès<br/>
                 - Gérer les erreurs (try/catch)<br/>
                 - Désactiver le bouton pendant l'envoi<br/><br/>
                 - <strong>Note :</strong> Vous devez être connecté (niveau précédent)
            `,
            starterCode: {
                html: `<!DOCTYPE html>
<html>
<head>
    <title>Créer un Post</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Créer un Post</h1>
    
    <form id="post-form">
        <label for="title">Titre :</label>
        <input type="text" id="title" placeholder="Titre du post" required>
        
        <label for="content">Contenu :</label>
        <textarea id="content" placeholder="Contenu du post" required></textarea>
        
        <button type="submit">Publier</button>
    </form>
    
    <div id="result"></div>
        
    <script src="script.js"></script>
</body>
</html>`,
                css: `body {
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 50px auto;
    padding: 20px;
}

form {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

input, textarea {
    width: 100%;
    padding: 12px;
    margin: 10px 0 20px 0;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    font-family: Arial, sans-serif;
}

input:focus, textarea:focus {
    outline: none;
    border-color: #3498db;
}

textarea {
    min-height: 120px;
    resize: vertical;
}

button {
    width: 100%;
    padding: 12px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
}

button:hover:not(:disabled) {
    background: #2980b9;
}

button:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
}

#result {
    margin-top: 20px;
    padding: 15px;
    border-radius: 5px;
    text-align: center;
}

.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}`,
                js: `// 1. Sélectionnez le formulaire et le div result
const form = document.getElementById('post-form');
const resultDiv = document.getElementById('result');

// 2. Écoutez le submit
form.addEventListener('submit', async (e) => {
    // Empêcher le rechargement
    
    // Récupérer les valeurs
    
    // Appeler createPost
});

// 3. Fonction pour créer un post
async function createPost(title, content) {
    try {
        // Faire la requête POST vers /posts
        
        // Vérifier response.ok
        
        // Afficher le succès
        
        // Vider le formulaire
        
    } catch (error) {
        // Afficher l'erreur
    }
}`
            },
            validation: (doc) => {
                const form = doc.getElementById('post-form');
                const title = doc.getElementById('title');
                const content = doc.getElementById('content');
                const result = doc.getElementById('result');

                if (!form || !title || !content || !result) {
                    return { success: false, message: "❌ Tous les éléments HTML doivent être présents" };
                }

                const script = doc.querySelector('body script');
                if (!script) {
                    return { success: false, message: "❌ Script manquant" };
                }

                const code = script.textContent;

                // 1️⃣ Vérifie submit listener
                if (!/addEventListener\s*\(\s*['"]submit['"]/.test(code)) {
                    return { success: false, message: "❌ Vous devez écouter l'événement submit" };
                }

                // 2️⃣ Vérifie preventDefault
                if (!code.includes('preventDefault()')) {
                    return { success: false, message: "❌ Utilisez e.preventDefault()" };
                }

                // 3️⃣ Vérifie récupération .value
                if (!/\.value/.test(code)) {
                    return { success: false, message: "❌ Vous devez récupérer les valeurs avec .value" };
                }

                // 4️⃣ Vérifie fetch POST vers /posts
                const hasFetch = /fetch\s*\(\s*['"`].*\/posts['"`]\s*,\s*{[^}]*method\s*:\s*['"]POST['"]/s.test(code);
                if (!hasFetch) {
                    return { success: false, message: "❌ Utilisez fetch avec method: 'POST' vers /posts" };
                }

                // 5️⃣ Vérifie credentials include
                if (!/credentials\s*:\s*['"]include['"]/.test(code)) {
                    return { success: false, message: "❌ Ajoutez credentials: 'include'" };
                }

                // 6️⃣ Vérifie JSON.stringify avec title et content
                if (!/JSON\.stringify\s*\(\s*{[^}]*title[^}]*content[^}]*}\s*\)/s.test(code)) {
                    return { success: false, message: "❌ Vous devez envoyer title et content en JSON" };
                }

                // 7️⃣ Vérifie try/catch
                if (!/try\s*{/.test(code) || !/catch\s*\(/.test(code)) {
                    return { success: false, message: "❌ Utilisez try/catch pour gérer les erreurs" };
                }

                // 8️⃣ Vérifie manipulation du DOM pour afficher résultat
                if (!/resultDiv|#result|textContent|innerHTML/.test(code)) {
                    return { success: false, message: "❌ Affichez un message dans #result" };
                }

                // 9️⃣ Vérifie reset du formulaire
                if (!/\.reset\s*\(/.test(code)) {
                    return { success: false, message: "❌ Vous devez vider le formulaire après succès" };
                }

                // 🔟 Vérifie désactivation bouton
                if (!/\.disabled\s*=/.test(code)) {
                    return { success: false, message: "❌ Désactivez le bouton pendant l'envoi" };
                }

                return {
                    success: true,
                    message: "🎉 Parfait ! Formulaire complet, sécurisé et professionnel !"
                };
            }
        }
    },
    {
        id: 14,
        shortTitle: "Local Storage",
        title: "LocalStorage & SessionStorage",
        xp: 250,
        lesson: `
            <h3>Web Storage API</h3>
            <p>
                Le navigateur offre deux types de stockage local pour sauvegarder des données côté client :
                <strong>localStorage</strong> et <strong>sessionStorage</strong>.
            </p>

            <h3> localStorage</h3>
            <p>Stockage <strong>permanent</strong> (reste après fermeture du navigateur)</p>
            <pre><code>// Écrire une valeur
localStorage.setItem('nom', 'Alice');
localStorage.setItem('age', '25');

// Lire une valeur
let nom = localStorage.getItem('nom');
console.log(nom);  // "Alice"

// Supprimer une valeur
localStorage.removeItem('nom');

// Tout supprimer
localStorage.clear();</code></pre>

            <h3> Stocker des objets</h3>
            <p>localStorage ne peut stocker que des <strong>chaînes de caractères</strong>. Pour les objets, utilisez JSON :</p>
            <pre><code>// Sauvegarder un objet
const user = { id: 1, nom: 'Bob', age: 30 };
localStorage.setItem('user', JSON.stringify(user));

// Récupérer un objet
const userString = localStorage.getItem('user');
const user = JSON.parse(userString);
console.log(user.nom);  // "Bob"

// Sauvegarder un tableau
const fruits = ['pomme', 'banane', 'orange'];
localStorage.setItem('fruits', JSON.stringify(fruits));

// Récupérer un tableau
const fruitsString = localStorage.getItem('fruits');
const fruits = JSON.parse(fruitsString);
console.log(fruits[0]);  // "pomme"</code></pre>

            <h3> sessionStorage</h3>
            <p>Identique à localStorage mais <strong>supprimé à la fermeture du navigateur</strong></p>
            <pre><code>// Même API que localStorage
sessionStorage.setItem('token', 'abc123');
let token = sessionStorage.getItem('token');
sessionStorage.removeItem('token');
sessionStorage.clear();</code></pre>

            <h3>Différences localStorage vs sessionStorage</h3>
            <table>
                <tr>
                    <th>Caractéristique</th>
                    <th>localStorage</th>
                    <th>sessionStorage</th>
                </tr>
                <tr>
                    <td>Durée</td>
                    <td>Permanent</td>
                    <td>Session (fermé avec l'onglet)</td>
                </tr>
                <tr>
                    <td>Partagé entre onglets</td>
                    <td>Oui</td>
                    <td>❌ Non (isolé par onglet)</td>
                </tr>
                <tr>
                    <td>Capacité</td>
                    <td>~5-10 MB</td>
                    <td>~5-10 MB</td>
                </tr>
            </table>

            <h3> Cas d'usage</h3>
            <h4>localStorage :</h4>
            <ul>
                <li>Préférences utilisateur (thème, langue)</li>
                <li>Token JWT (si pas de httpOnly cookie)</li>
                <li>Panier d'achat</li>
                <li>Données de formulaire (sauvegarde automatique)</li>
                <li>État de l'application</li>
            </ul>

            <h4>sessionStorage :</h4>
            <ul>
                <li>Données temporaires d'une session</li>
                <li>État d'un formulaire multi-étapes</li>
                <li>Token temporaire</li>
            </ul>

            <h3> Vérifier si une clé existe</h3>
            <pre><code>// Méthode 1
if (localStorage.getItem('user') !== null) {
    console.log('User existe');
}

// Méthode 2
if (localStorage.getItem('user')) {
    console.log('User existe');
}

// Méthode 3 (vérifier valeur)
const user = localStorage.getItem('user');
if (user) {
    console.log('User:', user);
} else {
    console.log('Pas d\'utilisateur');
}</code></pre>

            <h3> Exemple : Compteur persistant</h3>
            <pre><code>let compteur = 0;

// Charger le compteur au démarrage
const saved = localStorage.getItem('compteur');
if (saved) {
    compteur = parseInt(saved);
}

// Fonction pour incrémenter
function incrementer() {
    compteur++;
    localStorage.setItem('compteur', compteur);
    afficher();
}

// Fonction pour reset
function reset() {
    compteur = 0;
    localStorage.setItem('compteur', compteur);
    afficher();
}

function afficher() {
    document.getElementById('compteur').textContent = compteur;
}</code></pre>

            <h3> Exemple : Thème sombre/clair</h3>
            <pre><code>// Au chargement
const theme = localStorage.getItem('theme') || 'light';
document.body.classList.add(theme);

// Basculer le thème
function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.classList.remove(currentTheme);
    document.body.classList.add(newTheme);
    
    localStorage.setItem('theme', newTheme);
}</code></pre>

            <h3> Écouter les changements</h3>
            <pre><code>// Écouter les changements dans d'autres onglets
window.addEventListener('storage', (e) => {
    console.log('Clé modifiée:', e.key);
    console.log('Ancienne valeur:', e.oldValue);
    console.log('Nouvelle valeur:', e.newValue);
    
    // Réagir au changement
    if (e.key === 'theme') {
        appliquerTheme(e.newValue);
    }
});</code></pre>

            <h3> Vérifier l'espace disponible</h3>
            <pre><code>// Tester la capacité
function testStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    console.log(\`Espace utilisé: \${(total / 1024).toFixed(2)} KB\`);
}</code></pre>

            <h3>💡 Bonnes pratiques</h3>
            <ul>
                <li>Toujours utiliser try/catch (quota peut être dépassé)</li>
                <li>Utiliser JSON.stringify/parse pour les objets</li>
                <li>Préfixer les clés pour éviter les conflits (<code>app_user</code>)</li>
                <li>Ne pas stocker de données sensibles en clair</li>
                <li>Vérifier si la valeur existe avant de parser</li>
                <li>❌ Ne pas stocker de mots de passe</li>
                <li>❌ Ne pas dépasser 5 MB par domaine</li>
            </ul>

            <h3>⚠️ Sécurité</h3>
            <pre><code>// ❌ MAU VAIS
localStorage.setItem('password', 'secret123');
localStorage.setItem('creditCard', '1234-5678-9012-3456');

// BON
localStorage.setItem('theme', 'dark');
localStorage.setItem('language', 'fr');
localStorage.setItem('token', jwtToken);  // Si pas de httpOnly cookie</code></pre>

            <h3> Exemple avec try/catch</h3>
            <pre><code>function sauvegarder(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            console.error('Quota dépassé !');
        } else {
            console.error('Erreur:', error);
        }
        return false;
    }
}

function charger(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error('Erreur de parsing:', error);
        return null;
    }
}</code></pre>
        `,
        exercise: {
            description: `
                Créez un compteur de clics persistant :<br/>
                 - Afficher "Clics : <span id="counter">0</span>"<br/>
                 - Bouton "+1" pour incrémenter<br/>
                 - Bouton "Reset" pour remettre à 0<br/>
                 - Au chargement de la page, récupérer le compteur depuis localStorage<br/>
                 - À chaque clic, sauvegarder dans localStorage<br/>
                 - Le compteur doit persister après rechargement de la page<br/>
                 - Utiliser <code>localStorage.getItem()</code> et <code>localStorage.setItem()</code>
            `,
            starterCode: {
                html: `<!DOCTYPE html>
<html>
<head>
    <title>Compteur Persistent</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Compteur de clics</h1>
        <p>Clics : <span id="counter">0</span></p>
        <button id="increment">+1</button>
        <button id="reset">Reset</button>
        <p class="info">Le compteur persiste après rechargement !</p>
    </div>
        
    <script src="script.js"></script>
</body>
</html>`,
                css: `body {
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
    background: white;
    padding: 50px;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    text-align: center;
}

h1 {
    margin: 0 0 30px 0;
    color: #333;
}

#counter {
    font-size: 72px;
    font-weight: bold;
    color: #667eea;
    display: block;
    margin: 30px 0;
}

button {
    padding: 15px 40px;
    font-size: 20px;
    margin: 10px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
}

#increment {
    background: #667eea;
    color: white;
}

#increment:hover {
    background: #5568d3;
    transform: scale(1.05);
}

#reset {
    background: #e74c3c;
    color: white;
}

#reset:hover {
    background: #c0392b;
    transform: scale(1.05);
}

.info {
    margin-top: 30px;
    color: #666;
    font-size: 14px;
}`,
                js: `// 1. Sélectionnez les éléments
const counterSpan = document.getElementById('counter');
const incrementBtn = document.getElementById('increment');
const resetBtn = document.getElementById('reset');

// 2. Variable compteur
let compteur = 0;

// 3. Au chargement, récupérer depuis localStorage

// 4. Fonction pour afficher
function afficher() {
    // Mettre à jour le span
}

// 5. Fonction pour incrémenter
incrementBtn.addEventListener('click', () => {
    // Incrémenter
    // Sauvegarder dans localStorage
    // Afficher
});

// 6. Fonction pour reset
resetBtn.addEventListener('click', () => {
    // Remettre à 0
    // Sauvegarder dans localStorage
    // Afficher
});

// 7. Afficher la valeur initiale
afficher();`
            },
            validation: (doc) => {
                const counter = doc.getElementById('counter');
                const incrementBtn = doc.getElementById('increment');
                const resetBtn = doc.getElementById('reset');
                
                if (!counter || !incrementBtn || !resetBtn) {
                    return { success: false, message: "❌ Éléments counter, increment ou reset manquants" };
                }
                
                const script = doc.querySelector('body script');
                const code = script.textContent;
                
                const hasLocalStorage = code.includes('localStorage');
                const hasGetItem = code.includes('getItem');
                const hasSetItem = code.includes('setItem');
                const hasAddEventListener = code.includes('addEventListener');
                
                if (!hasLocalStorage) return { success: false, message: "❌ Utilisez localStorage pour sauvegarder" };
                if (!hasGetItem) return { success: false, message: "❌ Utilisez localStorage.getItem() pour récupérer" };
                if (!hasSetItem) return { success: false, message: "❌ Utilisez localStorage.setItem() pour sauvegarder" };
                if (!hasAddEventListener) return { success: false, message: "❌ Utilisez addEventListener sur les boutons" };
                
                return { success: true, message: "🎉 Parfait ! Le stockage local est maîtrisé !" };
            }
        }
    },
    {
        id: 15,
        shortTitle: "Entrainement",
        title: "Application Complète",
        xp: 500,
        lesson: `
            <h3>Félicitations !</h3>
            <p>Vous avez acquis toutes les compétences pour créer une vraie application web moderne !</p>
            
            <h3>Ce que vous savez faire</h3>
            <ul>
                <li>Structurer du HTML sémantique</li>
                <li>Styliser avec CSS (classes, responsive...)</li>
                <li>Manipuler le DOM avec JavaScript</li>
                <li>Gérer les événements utilisateur</li>
                <li>Utiliser JavaScript moderne (ES6+)</li>
                <li>Faire des requêtes API avec Fetch</li>
                <li>S'authentifier avec JWT/Cookies</li>
                <li>Créer, modifier, supprimer des ressources (CRUD)</li>
                <li>Stocker des données localement (localStorage)</li>
                <li>Gérer les erreurs et le feedback utilisateur</li>
            </ul>

            <h3>Votre mission finale</h3>
            <p>Créez une <strong>mini application de gestion de posts</strong> (blog, réseau social, TODO list...) avec :</p>

            <h4>Fonctionnalités obligatoires :</h4>
            <ol>
                <li><strong>Page de connexion</strong>
                    <ul>
                        <li>Formulaire email/password</li>
                        <li>Validation des champs</li>
                        <li>Gestion des erreurs</li>
                        <li>Redirection après connexion réussie</li>
                    </ul>
                </li>
                
                <li><strong>Page principale (après connexion)</strong>
                    <ul>
                        <li>Afficher le profil utilisateur (nom, email)</li>
                        <li>Liste de tous les posts</li>
                        <li>Formulaire de création de post</li>
                        <li>Bouton de déconnexion</li>
                    </ul>
                </li>
                
                <li><strong>Gestion des posts</strong>
                    <ul>
                        <li>Créer un nouveau post</li>
                        <li>Afficher tous les posts</li>
                        <li>Identifier ses propres posts (badge, couleur...)</li>
                    </ul>
                </li>
                
                <li><strong>Style CSS personnalisé</strong>
                    <ul>
                        <li>Interface propre et moderne</li>
                        <li>Responsive (adapté mobile)</li>
                        <li>Transitions/animations</li>
                    </ul>
                </li>
            </ol>

            <h4>Fonctionnalités bonus (points extra) :</h4>
            <ul>
                <li>Bouton pour supprimer un post (DELETE /posts/:id)</li>
                <li>Édition d'un post (PUT /posts/:id)</li>
                <li>Thème sombre/clair avec localStorage</li>
                <li>Recherche/filtre dans les posts</li>
                <li>Pagination ou scroll infini</li>
                <li>Indicateur de chargement (spinner)</li>
                <li>Confirmation avant suppression</li>
                <li>Compteur de posts</li>
                <li>Animation au chargement des posts</li>
            </ul>

            <h3>Structure recommandée</h3>
            <pre><code>&lt;!-- Section Connexion (cachée si connecté) --&gt;
&lt;div id="login-section"&gt;
    &lt;form id="login-form"&gt;
        &lt;input type="email" id="email" required&gt;
        &lt;input type="password" id="password" required&gt;
        &lt;button type="submit"&gt;Se connecter&lt;/button&gt;
    &lt;/form&gt;
&lt;/div&gt;

&lt;!-- Section Application (cachée si non connecté) --&gt;
&lt;div id="app-section" class="hidden"&gt;
    &lt;!-- Profil --&gt;
    &lt;div id="user-profile"&gt;&lt;/div&gt;
    
    &lt;!-- Formulaire création --&gt;
    &lt;form id="post-form"&gt;
        &lt;input type="text" id="title" required&gt;
        &lt;textarea id="content" required&gt;&lt;/textarea&gt;
        &lt;button type="submit"&gt;Publier&lt;/button&gt;
    &lt;/form&gt;
    
    &lt;!-- Liste des posts --&gt;
    &lt;div id="posts-container"&gt;&lt;/div&gt;
    
    &lt;button id="logout"&gt;Se déconnecter&lt;/button&gt;
&lt;/div&gt;</code></pre>

            <h3>Inspiration de design</h3>
            <ul>
                <li>Utilisez Flexbox ou Grid pour la mise en page</li>
                <li>Palette de couleurs cohérente</li>
                <li>Espacements généreux (padding, margin)</li>
                <li>Coins arrondis (border-radius)</li>
                <li>Ombres légères (box-shadow)</li>
                <li>Transitions sur les hover</li>
            </ul>

            <h3>💡 Conseils techniques</h3>
            <pre><code>// Vérifier si connecté au chargement
window.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    
    if (user) {
        showApp(user);
        loadPosts();
    } else {
        showLogin();
    }
});

// Fonction pour vérifier l'auth
async function checkAuth() {
    try {
        const response = await fetch('/api/me', {
            credentials: 'include'
        });
        return response.ok ? await response.json() : null;
    } catch (error) {
        return null;
    }
}

// Basculer entre login et app
function showApp(user) {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('app-section').classList.remove('hidden');
    displayUserInfo(user);
}

function showLogin() {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('app-section').classList.add('hidden');
}</code></pre>

            <h3>Debugging</h3>
            <ul>
                <li>Ouvrez la console (${keyComboElement}) pour voir les erreurs</li>
                <sub>Sinon tu peux faire clique droit « <code>Inpecter l'élément</code> »</sub>
                <li>Utilisez <code>console.log()</code> pour débugger</li>
                <li>Vérifiez l'onglet Network pour les requêtes</li>
                <li>Vérifiez Application → Cookies pour les tokens</li>
            </ul>

            <h3>Bonus créatif</h3>
            <p>Personnalisez votre app !</p>
            <ul>
                <li>Thème de couleurs unique</li>
                <li>Icônes (FontAwesome, Material Icons...)</li>
                <li>Animations CSS (@keyframes)</li>
                <li>Logo personnalisé</li>
                <li>Messages d'erreur personnalisés</li>
            </ul>

            <h3>Ressources utiles</h3>
            <ul>
                <li><a href="https://developer.mozilla.org/fr/" target="_blank">MDN Web Docs</a></li>
                <li><a href="https://css-tricks.com/" target="_blank">CSS-Tricks</a></li>
                <li><a href="https://flexboxfroggy.com/" target="_blank">Flexbox Froggy</a></li>
                <li><a href="https://cssgridgarden.com/" target="_blank">Grid Garden</a></li>
            </ul>

            <h3>Critères d'évaluation</h3>
            <table>
                <tr>
                    <th>Critère</th>
                    <th>Points</th>
                </tr>
                <tr>
                    <td>Connexion fonctionnelle</td>
                    <td>100 pts</td>
                </tr>
                <tr>
                    <td>Affichage des posts</td>
                    <td>100 pts</td>
                </tr>
                <tr>
                    <td>Création de posts</td>
                    <td>100 pts</td>
                </tr>
                <tr>
                    <td>Design et CSS</td>
                    <td>100 pts</td>
                </tr>
                <tr>
                    <td>Gestion des erreurs</td>
                    <td>50 pts</td>
                </tr>
                <tr>
                    <td>Fonctionnalités bonus</td>
                    <td>50 pts</td>
                </tr>
            </table>

            <h3>Checklist finale</h3>
            <ul>
                <li>☐ Connexion/Déconnexion fonctionnelle</li>
                <li>☐ Affichage du profil utilisateur</li>
                <li>☐ Liste des posts affichée</li>
                <li>☐ Création de posts</li>
                <li>☐ CSS personnalisé et moderne</li>
                <li>☐ Gestion des erreurs (messages clairs)</li>
                <li>☐ Code propre et indenté</li>
                <li>☐ Pas d'erreurs dans la console</li>
                <li>☐ Utilise <code>credentials: 'include'</code></li>
                <li>☐ Utilise <code>async/await</code> et <code>try/catch</code></li>
            </ul>

            <h3>Prêt ? Lancez-vous !</h3>
            <p>
                Vous avez toutes les connaissances nécessaires. Prenez votre temps, testez au fur et à mesure, 
                et n'hésitez pas à consulter les niveaux précédents si besoin.
            </p>
            <p><strong>Bonne chance ! </strong></p>
        `,
        exercise: {
            description: `
                Créez une application complète de gestion de posts :<br/>
                <strong>Page de connexion :</strong><br/>
                 - Formulaire email/password<br/>
                 - Connexion à l'API<br/>
                 - Gestion des erreurs<br/><br/>
                
                <strong>Page principale :</strong><br/>
                 - Affichage du profil utilisateur<br/>
                 - Liste des posts<br/>
                 - Formulaire de création<br/>
                 - Bouton de déconnexion<br/><br/>
                
                <strong>Technique :</strong><br/>
                 - Utilise <code>credentials: 'include'</code><br/>
                 - Gestion des erreurs (try/catch)<br/>
                 - CSS moderne et responsive<br/>
                 - Code propre et commenté<br/><br/>
                
                <strong>Bonus :</strong><br/>
                 - Supprimer un post<br/>
                 - Éditer un post<br/>
                 - Thème sombre<br/>
                 - Animations CSS
            `,
            starterCode: {
                html: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mon App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Section Connexion -->
    <div id="login-section">
        <!-- Créez votre formulaire de connexion ici -->
        
    </div>

    <!-- Section Application -->
    <div id="app-section" class="hidden">
        <!-- Créez votre application ici :
             - Profil utilisateur
             - Formulaire de création de post
             - Liste des posts
             - Bouton déconnexion
        -->
        
    </div>
    <script src="script.js"></script>
</body>
</html>`,
                css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    background: #f5f5f5;
}

.hidden {
    display: none !important;
}

/* Ajoutez votre CSS ici */`,
                js: `// Écrivez votre code JavaScript ici
// Utilisez tout ce que vous avez appris !

// 1. Vérifier si connecté au chargement

// 2. Fonction de connexion

// 3. Fonction pour charger les posts

// 4. Fonction pour créer un post

// 5. Fonction de déconnexion

// N'oubliez pas :
// - credentials: 'include'
// - async/await
// - try/catch
// - Gestion des erreurs`,
            },
            validation: (doc) => {
                const script = doc.querySelector('body script');
                
                if (!script) return { success: false, message: "❌ Script manquant" };
                
                const code = script.textContent;
                
                // Vérifications de base
                const hasFetch = code.includes('fetch');
                const hasCredentials = code.includes('credentials');
                const hasAddEventListener = code.includes('addEventListener');
                const hasAsync = code.includes('async');
                const hasTryCatch = code.includes('try') && code.includes('catch');
                
                if (!hasFetch) return { success: false, message: "❌ Utilisez fetch() pour les requêtes API" };
                if (!hasCredentials) return { success: false, message: "❌ N'oubliez pas credentials: 'include' dans vos fetch()" };
                if (!hasAddEventListener) return { success: false, message: "❌ Gérez les événements avec addEventListener()" };
                if (!hasAsync) return { success: false, message: "❌ Utilisez async/await pour les fonctions asynchrones" };
                if (!hasTryCatch) return { success: false, message: "❌ Gérez les erreurs avec try/catch" };
                
                // Vérifier qu'il y a du contenu HTML
                const hasForm = doc.querySelector('form');
                const hasInputs = doc.querySelectorAll('input').length >= 2;
                
                if (!hasForm) return { success: false, message: "❌ Créez au moins un formulaire" };
                if (!hasInputs) return { success: false, message: "❌ Ajoutez des champs de formulaire (email, password, etc.)" };
                
                return {
                    success: true,
                    message: "FÉLICITATIONS ! Vous avez terminé WebQuest ! Vous êtes maintenant un(e) développeur(se) frontend accompli(e) !"
                };
            }
        }
    }
]