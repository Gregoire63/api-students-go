// Définition de tous les niveaux du jeu
const levels = [
    {
        id: 1,
        title: "🌟 HTML - Les Bases",
        xp: 100,
        lesson: `
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
        `,
        exercise: {
            description: "Créez une page HTML avec un titre h1 'Bienvenue' et un paragraphe décrivant qui vous êtes.",
            starterCode: {
                html: `<!DOCTYPE html>
<html>
<head>
    <title>Ma première page</title>
</head>
<body>
    <!-- Écrivez votre code ici -->
    
</body>
</html>`,
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
        lesson: `
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
        `,
        exercise: {
            description: "Stylisez votre page : titre en bleu, paragraphe avec fond jaune et padding de 10px.",
            starterCode: {
                html: `<!DOCTYPE html>
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
        lesson: `
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
        `,
        exercise: {
            description: "Créez 3 liens : un vers Google, un vers Wikipedia, et un vers MDN. Stylez-les pour qu'ils soient verts et deviennent oranges au survol.",
            starterCode: {
                html: `<!DOCTYPE html>
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
</html>`,
                css: '',
                js: ''
            },
            validation: (doc) => {
                const links = doc.querySelectorAll('a');
                if (links.length < 3) return { success: false, message: "❌ Il faut au moins 3 liens" };
                
                const firstLinkStyle = window.getComputedStyle(links[0]);
                const hasGreen = firstLinkStyle.color.includes('0, 128, 0') || firstLinkStyle.color === 'green';
                
                if (!hasGreen) return { success: false, message: "❌ Les liens doivent être verts" };
                
                const stylesheets = doc.styleSheets;

                let hoverFound = false;
                for (let sheet of stylesheets) {
                    for (let rule of sheet.cssRules) {
                        if (rule.selectorText && rule.selectorText.includes('a:hover')) {
                            hoverFound = true;
                        }
                    }
                }

                if (!hoverFound)  return { success: false, message: "❌ La couleur des liens doit changer au survol" };
                  
                
                return { success: true, message: "🎉 Bravo ! La navigation web n'a plus de secret !" };
            }
        }
    },
    {
        id: 4,
        title: "📋 Les Formulaires",
        xp: 200,
        lesson: `
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
        `,
        exercise: {
            description: "Créez un formulaire d'inscription avec : nom, email, mot de passe, et un bouton. Tous les champs doivent être obligatoires (required).",
            starterCode: {
                html: `<!DOCTYPE html>
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
</html>`,
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
        lesson: `
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
        `,
        exercise: {
            description: "Créez une fonction qui affiche 'Hello World!' dans la console quand la page se charge. Utilisez console.log().",
            starterCode: {
                html: `<!DOCTYPE html>
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
</html>`,
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
        title: "✨ JavaScript avancé (ES6+)",
        xp: 300,
        lesson: `
        <h3>JavaScript moderne (ES6+)</h3>
        <p>Depuis ES6, JavaScript a introduit de nombreuses fonctionnalités modernes qui rendent le code plus lisible et puissant.</p>
        
        <h3> Modules (import / export)</h3>
        <p>Permettent de séparer le code en fichiers réutilisables :</p>
        <pre><code>// math.js
export function add(a, b) { return a + b; }

// main.js
import { add } from './math.js';
console.log(add(2, 3)); // 5</code></pre>
        
        <h3> Fonctions fléchées</h3>
        <p>Syntaxe courte pour les fonctions :</p>
        <pre><code>const salut = name => "Bonjour " + name;
console.log(salut("Alice")); // Bonjour Alice</code></pre>
        
        <h3> Destructuring</h3>
        <p>Extraire des valeurs d’objets ou tableaux :</p>
        <pre><code>// Objet
const user = { nom: "Alice", age: 25 };
const { nom, age } = user;
console.log(nom, age); // Alice 25

// Tableau
const arr = [1, 2, 3];
const [a, b] = arr;
console.log(a, b); // 1 2</code></pre>
        
        <h3> Template literals</h3>
        <p>Concaténation plus simple avec backticks :</p>
        <pre><code>const name = "Bob";
console.log(\`Bonjour \${name}\`); // Bonjour Bob</code></pre>
        
        <h3> Spread / Rest operator (...) </h3>
        <pre><code>// Spread pour copier un tableau
const arr1 = [1, 2];
const arr2 = [...arr1, 3];
console.log(arr2); // [1, 2, 3]

// Rest pour fonction
function sum(...nums) {
    return nums.reduce((acc, n) => acc + n, 0);
}
console.log(sum(1,2,3,4)); // 10</code></pre>
        
        <h3> Async / Await</h3>
        <p>Syntaxe moderne pour les promesses :</p>
        <pre><code>async function getData() {
    try {
        const res = await fetch('https://jsonplaceholder.typicode.com/posts');
        const data = await res.json();
        console.log(data);
    } catch (err) {
        console.error(err);
    }
}</code></pre>
        
        <h3> Map, Filter, Reduce</h3>
        <pre><code>const nums = [1,2,3,4,5];

// map → transformer
const doubled = nums.map(n => n*2);
console.log(doubled); // [2,4,6,8,10]

// filter → filtrer
const evens = nums.filter(n => n%2===0);
console.log(evens); // [2,4]

// reduce → réduire à une seule valeur
const sum = nums.reduce((acc, n) => acc + n, 0);
console.log(sum); // 15</code></pre>
    `,
    exercise: {
        description: `
            Créez un petit script qui fait les actions suivantes :<br/>
            1. Déclarez un tableau de nombres [1,2,3,4,5].<br/>
            2. Utilisez <code>map</code> pour doubler chaque nombre.<br/>
            3. Filtrez les nombres pairs avec <code>filter</code>.<br/>
            4. Réduisez le tableau filtré pour obtenir la somme totale avec <code>reduce</code>.<br/>
            5. Affichez le résultat avec <code>console.log</code>.<br/>
            <br/>
            Bonus : utilisez une fonction fléchée et des template literals pour afficher le résultat.
        `,
        starterCode: {
            html: `<!DOCTYPE html>
<html>
<head>
    <title>JS Moderne</title>
</head>
<body>
    <h1>Ouvrez la console</h1>
    
    <script>
        // Écrivez votre code JavaScript ici
        
    </script>
</body>
</html>`,
            css: '',
            js: ''
        },
        validation: (doc) => {
            const script = doc.querySelector('script');
            if (!script) return { success: false, message: "❌ Script manquant" };
            
            const code = script.textContent;

            const usesMap = code.includes('.map(');
            const usesFilter = code.includes('.filter(');
            const usesReduce = code.includes('.reduce(');
            const usesArrow = code.includes('=>');
            const usesTemplate = code.includes('`') && code.includes('${');

            if (!usesMap) return { success: false, message: "❌ Utilisez map() pour doubler les nombres" };
            if (!usesFilter) return { success: false, message: "❌ Utilisez filter() pour garder les nombres pairs" };
            if (!usesReduce) return { success: false, message: "❌ Utilisez reduce() pour obtenir la somme" };
            
            return { success: true, message: "🎉 Bravo ! Vous maîtrisez les bases de JavaScript moderne ES6+" };
        }
    }
},
    {
        id: 7,
        title: "🖱️ Le DOM - Manipulation",
        xp: 250,
        lesson: `<h3>Qu'est-ce que le DOM ?</h3> 
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
</pre>` ,
    exercise: {
        description: `
                Créer une fonction pour changer le contenu du texte. <br/>
                Créer une autre fonction pour changer son style. <br/>
                Les deux fonctions doivent être appelées au clic. <br/>
        `,
        starterCode: {
            html: `<!DOCTYPE html>
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
</html>`,
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
        id: 8,
        title: "🎯 Les Événements",
        xp: 250,
        lesson: `
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
        `,
        exercise: {
            description: "Créez 3 boutons de couleurs différentes. Quand on clique sur un bouton, la couleur du texte doit prendre sa couleur.",
            starterCode: {
                html: `<!DOCTYPE html>
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
</html>`,
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
        id: 9,
        title: "🔄 Fetch API - Requêtes",
        xp: 300,
        lesson: `
        <h3>Qu'est-ce que Fetch ?</h3>
        <p>
            <strong>Fetch</strong> est une fonction JavaScript qui permet d'envoyer des requêtes HTTP pour 
            récupérer ou envoyer des données depuis/vers une API. Cela signifie que ton code peut communiquer 
            avec un serveur, obtenir des informations et les afficher dynamiquement dans ta page web.
        </p>

        <h3>Comment utiliser l'URL dans Fetch ?</h3>
        <p>
            Pour que Fetch fonctionne, tu dois lui fournir l'URL de l'API à laquelle tu veux accéder. 
            Cette URL indique au navigateur où envoyer la requête.
        </p>
        <br/>
        <h4>💡 Astuce</h4>
        <p style="font-style: italic; ">
            Dans notre exercice, l'API est au même endroit que le code front, 
            donc il n'est <strong>pas nécessaire</strong> de passer une URL complète. 
            Tu peux simplement utiliser le chemin relatif, comme <code>/api/posts</code>.
        </p>
            <h3>Requête GET simple</h3>
            <pre><code>fetch('/api/posts')
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
        const response = await fetch('/api/posts');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Erreur:', error);
    }
}</code></pre>

            <h3>Requête POST</h3>
            <pre><code>fetch('/api/login', {
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
<h3>💡 Astuces pour l'exercice</h3>

<ul>
    <li>Pour créer un élément en JavaScript, utilisez <code>document.createElement()</code>.</li>
    <li>Pour modifier le texte d’un élément, utilisez <code>textContent</code>.</li>
    <li>Pour ajouter un élément dans un autre, utilisez <code>appendChild()</code>.</li>
    <li>Les données reçues de l’API seront un tableau → utilisez <code>forEach()</code> pour parcourir les posts.</li>
</ul>

<pre><code>// Exemple de création d’un élément
let li = document.createElement("li");
li.textContent = "Mon texte";
document.querySelector("ul").appendChild(li);</code></pre>
        `,
        exercise: {
            description: "Créez un bouton qui charge la liste des posts depuis l'API (GET /posts) et les affiche dans une liste ul/li.",
            starterCode: {
                html: `<!DOCTYPE html>
<html>
<head>
    <title>Fetch API</title>
</head>
<body>
    <h1>Liste des posts</h1>
    <button id="charger">Charger les posts</button>
    <ul id="posts-list"></ul>
    
    <script>
        // 1. Sélectionnez le bouton et la liste
        // 2. Ajoutez un événement click
        // 3. Faites un fetch GET vers /posts
        // 4. Affichez chaque post dans un <li>
        
    </script>
</body>
</html>`,
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
        id: 10,
        title: "🔐 Authentification",
        xp: 350,
        lesson: `
            <h3>Les Cookies</h3>
            <p>Les cookies stockent des données côté client. Ils sont automatiquement envoyés avec chaque requête au serveur.</p>
            
            <h3>Cookies avec credentials</h3>
            <pre><code>fetch('/api/login', {
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
            <pre><code>fetch('/api/posts', {
    credentials: 'include'  // Envoie le cookie automatiquement
});</code></pre>
        `,
        exercise: {
            description: "Créez un formulaire de connexion. Envoyez les données à POST /login avec credentials: 'include'. Affichez le message de succès ou d'erreur.",
            starterCode: {
                html: `<!DOCTYPE html>
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
        // 1. Sélectionnez le formulaire
        // 2. Écoutez l'événement submit
        // 3. Faites un fetch POST /login avec credentials: 'include'
        // 4. Affichez le résultat dans #message
        
        // Aide : utilisez e.preventDefault() pour empêcher le rechargement
        // Comptes test : student@test.com / password
    </script>
</body>
</html>`,
                css: '',
                js: ''
            },
            validation: (doc) => {
                const form = doc.getElementById('login-form');
                const message = doc.getElementById('message');
                const email = doc.getElementById('email');
                const password = doc.getElementById('password');

                if (!form || !message || !email || !password) {
                    return { success: false, message: "❌ Tous les éléments du formulaire doivent être présents (#login-form, #email, #password, #message)" };
                }

                const script = doc.querySelector('script');
                if (!script) return { success: false, message: "❌ Script manquant" };

                const code = script.textContent;

                // Vérifie fetch POST sur /login avec credentials
                const hasFetchLogin = /fetch\(['"`]\/api\/login['"`],\s*{[^}]*method:\s*['"]POST['"][^}]*credentials:\s*['"]include['"]/s.test(code);
                if (!hasFetchLogin) {
                    return { success: false, message: "❌ Utilisez fetch POST sur /login avec credentials: 'include'" };
                }

                // Vérifie que email et password sont récupérés
                const usesEmail = code.includes('email') || code.includes('document.getElementById(\'email\')');
                const usesPassword = code.includes('password') || code.includes('document.getElementById(\'password\')');
                if (!usesEmail || !usesPassword) {
                    return { success: false, message: "❌ Récupérez et envoyez email et password" };
                }

                // Vérifie présence de e.preventDefault
                if (!code.includes('preventDefault()')) return { success: false, message: "❌ Utilisez e.preventDefault() dans submit" };

                return { success: true, message: "🎉 Parfait ! Formulaire de connexion correct et sécurisé !" };
            }
        }
    },
    {
        id: 11,
        title: "📝 Créer un Post",
        xp: 300,
        lesson: `
            <h3>Créer une ressource</h3>
            <p>Pour créer un post, on envoie une requête POST avec les données en JSON.</p>
            
            <h3>Exemple complet</h3>
            <pre><code>async function createPost(title, content) {
    try {
        const response = await fetch('/api/posts', {
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
        `,
        exercise: {
            description: "Créez un formulaire pour créer un post (titre + contenu). Envoyez-le à POST /posts. Vous devez être connecté (niveau précédent) !",
            starterCode: {
                html: `<!DOCTYPE html>
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
        // 1. Écoutez le submit du formulaire
        // 2. Récupérez title et content
        // 3. Faites un fetch POST /posts avec credentials
        // 4. Affichez le résultat
        
    </script>
</body>
</html>`,
                css: '',
                js: ''
            },
            validation: (doc) => {
                const form = doc.getElementById('post-form');
                const title = doc.getElementById('title');
                const content = doc.getElementById('content');
                const result = doc.getElementById('result');

                if (!form || !title || !content || !result) {
                    return { success: false, message: "❌ Tous les éléments du formulaire doivent être présents (#post-form, #title, #content, #result)" };
                }

                // Vérifier le script
                const script = doc.querySelector('script');
                if (!script) return { success: false, message: "❌ Script manquant" };

                const code = script.textContent;

                // Vérifie fetch POST avec credentials
                const hasFetch = /fetch\(.+,\s*{[^}]*method:\s*['"]POST['"][^}]*credentials:\s*['"]include['"]/s.test(code);
                if (!hasFetch) return { success: false, message: "❌ Utilisez fetch avec method: 'POST' et credentials: 'include'" };

                // Vérifie que title et content sont bien envoyés
                const sendsTitle = code.includes('title') || code.includes('document.getElementById(\'title\')');
                const sendsContent = code.includes('content') || code.includes('document.getElementById(\'content\')');
                if (!sendsTitle || !sendsContent) return { success: false, message: "❌ Récupérez et envoyez le titre et le contenu du formulaire" };

                // Vérifie présence de .catch
                if (!code.includes('catch')) return { success: false, message: "❌ Gérez les erreurs avec .catch()" };

                return { success: true, message: "🎉 Parfait ! Votre formulaire crée bien un post avec fetch POST authentifié !" };
            }
        }
    },
    {
        id: 12,
        title: "🎨 LocalStorage & Session",
        xp: 250,
        lesson: `
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
        `,
        exercise: {
            description: "Créez un compteur de clics. Sauvegardez le nombre dans localStorage pour qu'il persiste au rechargement de la page.",
            starterCode: {
                html: `<!DOCTYPE html>
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
</html>`,
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
        id: 13,
        title: "🚀 Projet Final",
        xp: 500,
        lesson: `
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
        `,
        exercise: {
            description: "Créez une application complète avec login, affichage des posts, création de posts, et déconnexion. Soyez créatif !",
            starterCode: {
                html: `<!DOCTYPE html>
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
        // Écrivez votre code JavaScript ici
        // Utilisez tout ce que vous avez appris !
        
    </script>
</body>
</html>`,
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
];