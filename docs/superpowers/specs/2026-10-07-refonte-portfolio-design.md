# Refonte du portfolio — octobre 2026

Spec de conception. Rédigée le 07/10/2026 à partir de la revue du 06/10 et des
décisions prises avec Rayan, puis corrigée après une relecture contradictoire
(exactitude, faisabilité, cohérence). Branche : `refonte-2026-10`.

## 1. Objectif et contraintes

Le portfolio vise d'abord un **recruteur pressé** (30 secondes pour comprendre qui
est Rayan, ce qu'il cherche et ce qu'il sait faire), ensuite un jury d'école.
La refonte corrige les bugs relevés, rend les projets plus probants, clarifie le
premier écran, puis ajoute un guide interactif (« Pix ») et un motion design utile.

Contraintes non négociables :

- **100 % gratuit** : aucune API payante, aucun service tiers nouveau.
- **Site statique sans étape de build** : HTML, CSS et JS servis tels quels.
  Aucune dépendance d'exécution nouvelle. Les outils de développement utilisent
  Node seul (`node --test`, petit serveur local), sans paquet npm.
- **Rien ne bloque la lecture** : le contenu du premier écran est visible au
  premier rendu, avec ou sans JavaScript, quel que soit le temps de chargement
  de Three.js. Le site reste navigable sans JavaScript.
- **Accessibilité** : utilisable au clavier, texte au contraste AA (au moins
  4,5:1, sans arrondi), `prefers-reduced-motion` respecté partout.
- **Hébergement** : Netlify (`madirayanportfolio.netlify.app`) devient l'adresse
  officielle (URL du CV, du QR code et des balises Open Graph). Netlify réécrit
  les liens internes en forme courte (`/mesprojets`, `/contact`), constaté le
  07/10 ; les URL officielles suivent cette forme. GitHub Pages reste un miroir ;
  le couper relève d'un réglage GitHub que Rayan fera lui-même.

### Premier écran

Dans toute la spec, le **premier écran** désigne ces conteneurs : `.hero`
(Accueil), `.page-head` et la première `.project-section` (Projets),
`.contact-inner` (Contact).

## 2. Décisions prises

| Date | Décision |
|---|---|
| 06/10 | AITHAN et Tout Night entrent dans les projets, le site vitrine sort. |
| 06/10 | Rayan refait la vidéo de Sniper et tourne celle d'AITHAN (sur son autre PC). |
| 06/10 | Motion design uniquement s'il montre du contenu ou un état, jamais bloquant. |
| 07/10 | Guide = PNJ en pixel art, activable, parcours et réponses scriptés, sans IA ni son. |
| 07/10 | Le PNJ ne **se déplace** que pendant une visite lancée par le visiteur. Au repos, il se balance, cligne des yeux et suit le curseur du regard. |
| 07/10 | Le « ! » disparaît dès que le visiteur a interagi avec Pix sans finir la visite ; il devient « ? » une fois la visite terminée. |
| 07/10 | Ton de Pix : vouvoiement, avec humour et clins d'œil de jeu vidéo (« Quête accomplie », « +1 XP »). |
| 07/10 | Approche technique : vanilla JS + CSS, sprite SVG, aucune bibliothèque. |
| 07/10 | Textes du parcours et des questions validés (section 6.7). « Disponible immédiatement » confirmé. |

Ordre de livraison : **lot 1** (bugs et hygiène) → **lot 2** (projets) →
**lot 3** (premier écran et lisibilité) → **lot 4** (Pix et motion design).
Chaque lot est livrable seul. Le lot 4 suppose les `id` créés aux lots 2 et 3.

## 3. Lot 1 — Bugs et hygiène

Chaque point donne le défaut, sa cause, le correctif et le critère d'acceptation.

### 3.1 Contenu invisible tant que Three.js n'est pas chargé

- **Défaut** : `.reveal { opacity: 0 }` (`base.css:102`) s'applique sans
  condition. `ui.js` n'ajoute `.in` qu'au `DOMContentLoaded` (`ui.js:6`), qui
  attend l'exécution des scripts module, donc le téléchargement de
  `three.module.js` (1,3 Mo). Sans JS, les pages restent vides. Constaté en
  mobile le 06/10 : titre à demi transparent et paragraphe absent après plus de 3 s.
- **Correctif** :
  - un script classique en ligne dans `<head>` pose la classe `js` sur `<html>` ;
    la règle masquante devient `.js .reveal` ;
  - aucun descendant des conteneurs du premier écran (section 1) ne porte
    `.reveal` ;
  - `ui.js` et `contact.js` s'exécutent immédiatement (ils sont déjà en fin de
    `<body>`), sans attendre `DOMContentLoaded`.
- **Acceptation** : avec JS désactivé, tout le contenu est visible. Avec JS et
  un réseau bridé, le contenu du premier écran est visible dès le premier rendu,
  avant la fin du chargement de Three.js.

### 3.2 Menu mobile

- **Défaut** : sous 720 px, `.nav-links` est en `position: absolute` dans la
  grille de `.navbar`, mais garde `justify-self: center` (`base.css:164`). Le
  menu s'ouvre en panneau de 91 px centré par-dessus le titre (mesuré le 06/10).
  Liens en 12 px (`base.css:260`). Sans JS, les liens sont en `display: none`
  et le menu ne peut pas s'ouvrir : le site n'est plus navigable.
- **Correctif** : dans la media query, `justify-self: stretch` et liens en
  16 px. Le comportement replié ne s'applique qu'avec JS (`.js .nav-links`,
  `.js .nav-links.open`) ; sans JS (`html:not(.js)`), le hamburger est masqué
  et les trois liens restent affichés dans la barre.
- **Acceptation** : à 375 px, le menu ouvert occupe toute la largeur sous la
  barre ; avec JS désactivé, les trois liens sont visibles et cliquables.

### 3.3 Formulaire : le message part comme objet du mail

- **Défaut** : le `<textarea>` porte `name="subject"` (`contact.html:57`) ;
  Formspree utilise ce champ comme objet.
- **Correctif** :
  - le `<textarea>` devient `name="message"`, `id="message"`, avec son
    `<label for>` ;
  - un `<input type="hidden" name="subject" value="Nouveau message depuis le portfolio">`
    garde un objet propre (le nom `subject` est celui que Formspree utilise déjà
    comme objet, comme le défaut le prouve) ;
  - un champ piège `<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" style="display:none">`
    (en `display:none`, il n'est ni focusable ni rempli automatiquement, mais il
    figure dans le `FormData`) ;
  - le texte d'erreur de `contact.js` passe au vouvoiement (« Écrivez-moi
    directement à… »).
- **Acceptation** : le `FormData` du formulaire contient `message`, `subject`
  et `_gotcha` (vérifiable sans rien envoyer).

### 3.4 Lien LinkedIn affiché faux

`contact.html:84` affiche `linkedin.com/in/rayan-madi` alors que le lien pointe
vers `https://www.linkedin.com/in/rayan-madi-/`. Le texte devient
`linkedin.com/in/rayan-madi-`.

### 3.5 Contact et Projets décentrés entre 410 et 820 px

- **Cause** : sous 820 px, `.contact-page` et `.page-head` passent en flex en
  colonne (`contact.css:117`, `projets.css:220`). `.wrap` (`margin: 0 auto`)
  y prend la largeur de son contenu (428 px sur Contact, 357 px sur Projets à
  768 px) au lieu de toute la largeur.
- **Correctif** : `width: 100%` sur `.wrap` dans ces conteneurs. Le canvas de
  ces pages passe à `margin: 16px var(--gut) 0; width: calc(100% - 2 * var(--gut));`
  (`contact.css:123-124`, `projets.css:226-227`, avec `14px` en haut pour
  Projets), comme l'accueil le fait déjà (`accueil.css:266-267`).
- **Acceptation** : à 768 px, le formulaire et l'en-tête Projets occupent la
  largeur utile, et le canvas est centré (écart gauche égal à l'écart droit).

### 3.6 Galaxie au toucher

- **Défaut** : `scene.js:179-185` n'écoute pas `pointercancel` et aucun
  `touch-action` n'est posé. Quand un scroll démarre sur la scène, le navigateur
  annule le pointeur sans `pointerup` : `dragging` reste vrai et la caméra saute
  au geste suivant. L'écouteur `pointerdown` est posé sur `o.host` qui, sur
  Projets et Contact, englobe tout le haut de page, formulaire compris.
- **Correctif** :
  - le glisser devient une option `drag: true`, passée seulement par l'accueil ;
    sur Projets et Contact, la scène est décorative ;
  - à l'accueil, `pointerdown` est écouté sur `#scene-band`, qui reçoit
    `touch-action: pan-y pinch-zoom` ;
  - `pointercancel` (écouté sur `window`) remet `dragging` à faux ; les
    pointeurs non principaux sont ignorés (`if (!e.isPrimary) return`).
- **Acceptation** : à 375 px, un glissé vertical sur la galaxie fait défiler la
  page, un glissé horizontal la fait tourner, le geste suivant ne fait pas
  sauter la caméra, et le zoom à deux doigts reste possible partout.

### 3.7 Lightbox vidéo

- **Défaut** : `aria-modal="true"`, mais le focus ne va pas dans la lightbox et
  n'y reste pas (`video-lightbox.js:10-20`).
- **Correctif** : passer à `<dialog>` avec `showModal()`.
  - **HTML** : `<dialog class="video-lightbox" id="video-lightbox" aria-labelledby="video-lightbox-title">`,
    sans `role`, `aria-modal` ni `aria-hidden`. Le `div` de fond
    `[data-close]` est conservé pour le clic extérieur.
  - **CSS** : `.video-lightbox` perd son `display: none` de base (la feuille du
    navigateur s'en charge) et neutralise les styles par défaut du dialog :
    `position: fixed; inset: 0; width: 100%; height: 100%; max-width: none;
    max-height: none; margin: 0; padding: 22px; border: 0; background:
    transparent; color: inherit; overflow: hidden`.
    `.video-lightbox[open]` est en `display: flex` centré ;
    `.video-lightbox::backdrop` est transparent.
  - **JS** : `showModal()` et `close()` remplacent la classe `.open`. Le
    nettoyage (pause, retrait du `src`, `load()`, rétablissement du défilement,
    retour du focus au déclencheur) se fait dans l'écouteur de l'événement
    `close`, qui se déclenche quelle que soit la cause de fermeture. L'écouteur
    `keydown` Échap actuel est supprimé ; aucun script n'appelle
    `preventDefault()` sur Échap.
- **Acceptation** : au clavier, le focus entre dans la lightbox à l'ouverture
  et n'en sort pas avec Tab. Après Échap, × ou clic sur le fond, la vidéo est
  arrêtée, la page défile de nouveau et le focus revient au bouton déclencheur.

### 3.8 Hygiène

- **Avatar** : `assets/img/bien recadré.PNG` (178 Ko pour un affichage en 42 px)
  devient `assets/img/avatar.webp` en 84×84, et l'ancien fichier est supprimé.
  `profile.webp` n'est plus utilisé que par les prototypes de `proto/` : il est
  conservé avec eux.
- **CV** : le fichier servi devient `assets/cv/Rayan-Madi-CV-alternance.pdf`
  (même nom à l'enregistrement : attribut `download` sans valeur). Les deux
  anciens chemins ont été publics : `cv pour alternance de Rayan.pdf` (lien
  actuel) et `CV-Rayan-Madi.pdf` (lien jusqu'en août, toujours servi). Les deux
  anciens fichiers sont supprimés et redirigés en 301 vers le nouveau dans
  `_redirects` (Netlify). Sur le miroir GitHub Pages, les anciens liens cassent ;
  c'est accepté.
- **Three.js** : passer à `three.module.min.js` de la même révision (r169,
  fichier officiel du paquet npm `three@0.169.0`) ; le téléchargement se fait
  avec l'accord de Rayan.
- **Polices** : l'`@import` Google Fonts (`base.css:7`) est remplacé, dans
  chaque page, par `<link rel="preconnect" href="https://fonts.googleapis.com">`,
  `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` puis le
  `<link rel="stylesheet">` avec `display=swap`.
- **Ancres** : `ui.js` mesure la hauteur de l'en-tête (`ResizeObserver`) et la
  publie dans `--header-h` (64 px par défaut en CSS) ;
  `html { scroll-padding-top: calc(var(--header-h) + 12px) }`. Les ancres, le
  focus clavier et les défilements de Pix s'arrêtent ainsi sous la barre.
- **Mouvement réduit** : la plongée de caméra au scroll (`dive`) est coupée
  quand `prefers-reduced-motion` est actif (aujourd'hui seules la rotation et
  la respiration le sont).
- **Canonical** : chaque page déclare `<link rel="canonical">` vers son URL
  officielle courte (`https://madirayanportfolio.netlify.app/`, `/mesprojets`,
  `/contact`) ; `og:url` suit la même forme.
- **Fichiers non publiés** : `docs/`, `proto/`, `tests/`, `tools/`,
  `README.md` et `_config.yml` ne doivent pas être servis.
  - GitHub Pages (build Jekyll) : `_config.yml` avec
    `exclude: [docs, proto, tests, tools, README.md]` ; les fichiers commençant
    par `_` (dont `_redirects`) ne sont pas publiés par Jekyll.
  - Netlify : `_redirects` avec des règles **forcées** (`!`), sans quoi Netlify
    sert quand même un fichier qui existe :
    `/docs/* /404.html 404!`, de même pour `/proto/*`, `/tests/*`, `/tools/*`,
    `/README.md` et `/_config.yml`.
- **Page 404** : `404.html` **autonome** (servie à n'importe quelle profondeur
  d'URL, et le miroir est sous un sous-chemin) : CSS en ligne, aucun fichier
  externe, favicon en `data:` URI, lien absolu vers
  `https://madirayanportfolio.netlify.app/`, `<meta name="robots" content="noindex">`,
  ni Pix ni canonical.
- **Outils** : `tools/serve.mjs`, serveur statique local en Node sans
  dépendance, pour les vérifications de la section 8.2.
- **README** : réécrit (stack réelle, lien vers le site, aperçu, lancement
  local, commande de test).

## 4. Lot 2 — Projets

### 4.1 Sélection et ordre

| Page | Projets |
|---|---|
| Accueil (4 vignettes et 4 nœuds de galaxie) | Sniper, AITHAN, FEMED, Tout Night |
| Projets (5 fiches) | Sniper, AITHAN, FEMED, Tout Night, Battle of Roles |

Le site vitrine disparaît (fiche, vignette, nœud, image `site-vitrine.webp`).
La ligne de comptage de la page Projets et les meta descriptions sont mises à
jour.

### 4.2 Identifiants et lien vignette ↔ nœud de galaxie

Aujourd'hui, une vignette allume le nœud de même index (`index.html:237-242`) ;
changer l'ordre d'un côté casse l'autre. Chaque vignette porte désormais
`data-project="<id>"` et chaque nœud un champ `id` identique ; le lien se fait
par identifiant. Identifiants : `sniper`, `aithan`, `femed`, `toutnight`,
`battle`. Ce sont aussi les `id` des fiches de la page Projets (`#aithan` et
`#toutnight` sont créés ici).

Couleurs des nœuds, par catégorie : jeux en cyan (`#35d6e8`), web en accent
(`#f5436f`, voir 5.4), IA en violet (`#9a58eb`, déjà présent dans les halos du
fond).

### 4.3 Format des fiches

Les pavés d'environ 100 mots deviennent une fiche lisible en diagonale :
sur-titre, titre, puis une liste de définitions `<dl>` à trois entrées
(**Contexte**, **Mon rôle**, **Résultat**, 140 caractères au plus chacune),
les pastilles de stack et les liens (GitHub, démo vidéo, site en ligne).
Les textes sont rédigés à partir des README des dépôts, puis relus et validés
par Rayan avant publication.

- **AITHAN** : présenté honnêtement comme fork de Mark-XLIX (CC BY-NC 4.0) dont
  le cerveau cloud a été remplacé par une pile locale ; « Mon rôle » liste les
  apports (pile vocale locale, mémoire, RAG, interface Cosmos, tests).
- **Tout Night** : lien vers le dépôt principal, mention de la version Docker.
- **FEMED** : une seule formulation pour la nature du travail (aujourd'hui
  « refonte complète » à l'accueil, « développement et maintenance » sur la page
  Projets) et pastille de traduction conforme au site en ligne (Polylang affiché,
  GTranslate constaté). À trancher par Rayan.

### 4.4 Médias

- Vignettes en 16:10, WebP, 150 Ko au plus, sans texte coupé (la vignette FEMED
  actuelle coupe le titre).
- `sniper.jpg` (640×360) est remplacée par une capture d'au moins 1280 px.
- Vidéos : mp4 H.264, 720p, 20 à 40 s, sans son, 2 Mo au plus.
- **Source unique de vérité pour les vidéos** : l'attribut `data-video` du
  bouton de démo d'une fiche. Sa présence décide du bouton « Démo vidéo », du
  badge « Démo » de la vignette, de l'aperçu au survol (section 7), de l'action
  « Voir la démo » de Pix et de la ligne de comptage. Ajouter une vidéo plus tard
  revient à ajouter ce bouton et ses fichiers, puis à mettre à jour la ligne de
  comptage.
- **À fournir par Rayan** : vidéos Sniper et AITHAN, captures d'AITHAN et de
  Tout Night (ni capture ni vidéo dans ces dépôts, et Docker n'est pas installé
  sur ce poste pour lancer Tout Night). Le lot sort sans attendre les vidéos :
  Sniper garde sa vidéo actuelle, AITHAN n'a pas de démo jusqu'à l'arrivée de
  la sienne. Les captures d'AITHAN et de Tout Night, en revanche, sont
  nécessaires pour leurs vignettes.

## 5. Lot 3 — Premier écran et lisibilité

### 5.1 Héros

- Sur-titre au-dessus du `h1`, lisible (13 px au moins) :
  « Rayan Madi · Développeur full-stack ».
- Le paragraphe d'accroche (`.lead`) est réécrit pour citer les projets de
  l'accueil ; il cite aujourd'hui le jeu de cartes, qui quitte l'accueil.
  Proposition, à valider par Rayan : « …un jeu 3D multijoueur écrit sans
  moteur, le site d'une ONG présente dans 13 pays, un assistant vocal IA qui
  tourne 100 % en local. »
- Sous le paragraphe, une ligne de disponibilité visible à toutes les largeurs,
  qui mène à la page Contact : « Alternance 2026-2027 · 3 semaines entreprise /
  1 semaine école · Paris et Île-de-France · disponible immédiatement ».
  Cette information existe déjà dans la pastille de la section Parcours, mais
  elle est absente du premier écran.
- Boutons inchangés : « Voir les projets » et « Télécharger mon CV ».
- Pastille de la barre : « Disponible — alternance 2026-27 ».

### 5.2 Carte profil

- Ligne « PARIS · ALTERNANCE 2026 » portée à 11 px au moins.
- Pastilles alignées sur ce que les projets prouvent : Unreal sort (aucun projet
  ne le montre) ; Django et Docker entrent (Tout Night), sous réserve du point
  ouvert sur la part de Rayan dans Tout Night (section 10).

### 5.3 Remonter les projets

- Le padding vertical du héros passe de 72/44 px à 48/32 px (`accueil.css:12`).
- La bande de galaxie passe de `clamp(300px, 36vw, 460px)` à
  `clamp(240px, 26vw, 360px)`.
- **Acceptation**, mesurée avec tout le lot 3 appliqué : à 1440×900, le haut du
  titre « Projets » est à 1000 px au plus du haut de la page. S'il ne l'est pas,
  on réduit encore la bande, jamais la taille du `h1`.

### 5.4 Lisibilité

- `--dim` passe de `#5f6b7a` (3,31:1 sur `--bg`) à `#7d8897` (5,00:1 sur
  `--bg`, 4,54:1 sur `--surface`).
- `--accent` passe de `#f43f6e` (4,499:1 sur `--surface`, sous le seuil) à
  `#f5436f` (4,60:1 sur `--surface`, 5,06:1 sur `--bg`, et 5,06:1 pour le texte
  `#14171c` des boutons pleins). Différence invisible à l'œil. Les couleurs
  codées en dur (nœuds de galaxie, sprite de Pix) suivent la nouvelle valeur ;
  les halos décoratifs en `rgba` ne changent pas.
- Aucun texte sous 11 px. 16 déclarations sont concernées aujourd'hui :
  `accueil.css:73, 87, 105, 128, 188, 206, 216, 241, 248`, `base.css:91`,
  `contact.css:48`, `projets.css:22, 67, 92, 102, 191` (dont le HUD et les
  étiquettes de nœuds). Les tailles d'icônes (`accueil.css:197`,
  `.badge .icon`) ne sont pas concernées.

### 5.5 Partage

- `og-banner.png` (1200×630) et `favicon.svg` refaits avec l'identité actuelle
  (accent rose, fond sombre ; ils gardent l'ancienne identité violette).
- `og:description` mentionne la recherche d'alternance.

### 5.6 Ancre du Parcours

La section Parcours (`index.html:163`) reçoit `id="parcours"` (utilisé par Pix).

## 6. Lot 4 — Pix, le guide

### 6.1 Principe

Un petit robot en pixel art, posé sur le bord de l'écran avec un « ! » de donneur
de quête. Il ne fait rien tant qu'on ne lui demande rien. Sur demande, il fait
visiter le site (7 étapes sur les 3 pages) ou répond à 6 questions scriptées.
Tout est statique : aucun appel réseau, aucun coût, aucune invention possible.
Nom provisoire : **Pix**.

### 6.2 Fichiers

| Fichier | Rôle |
|---|---|
| `assets/js/bot/machine.js` | Logique pure : états, transitions, marqueur, reprise ou abandon de visite, validation du scénario. Aucun accès au DOM ni au stockage global : les objets `storage` (`getItem`, `setItem`) et une fonction `targetUsable(selector)` lui sont passés en paramètre. Testable sous Node. |
| `assets/js/bot/scenario.js` | Contenu : étapes de la visite, questions, réponses, actions, textes d'interface. Modifiable sans toucher à la logique. |
| `assets/js/bot/pix.js` | Interface : sprite, bulle, déplacements, mise en surbrillance, clavier. Passe `localStorage` et `sessionStorage` (protégés par `try/catch`) à `machine.js`. |
| `assets/css/pix.css` | Apparence et animations. |

Chargement : `<script type="module" src="assets/js/bot/pix.js" async>` en fin de
`<body>` sur les 3 pages ; `pix.js` charge `pix.css`. Si une visite est en
cours, Pix s'initialise dès l'exécution du module (la visite ne doit pas
attendre Three.js). Sinon, il s'initialise après `load` (tout de suite si
`document.readyState === 'complete'`), via
`requestIdleCallback(init, { timeout: 2000 })`, avec `setTimeout` en repli.

Budget : 12 Ko au plus pour les quatre fichiers concaténés, compressés en gzip
niveau 9 (vérifié par un test). Aucune boucle `requestAnimationFrame` au repos :
les animations de repos sont en CSS.

Chaque `<body>` porte `data-page="accueil|projets|contact"`. Pix ne déduit
jamais la page de l'URL (Netlify réécrit les URL).

### 6.3 Sprite

Robot de 14×16 pixels dessiné en SVG (rectangles, `shape-rendering: crispEdges`),
affiché à l'échelle 4 sur ordinateur (56×64 px) et 3 sous 720 px. Couleurs :
corps `--muted` (`#8b95a3`), visière `--line` (`#2a3038`), yeux `--cyan`,
antenne et cœur `--accent`. Images : repos, clignement, deux images de marche,
parole (l'antenne clignote). Le regard : les pupilles se décalent d'un pixel
vers le pointeur (écouteur `pointermove` passif, limité à une mise à jour par
image, actif seulement si `(pointer: fine)`). Le marqueur au-dessus de la tête
est un « ! » ou un « ? » jaune (`#f5c542`, 11:1 sur le fond).

### 6.4 États

```
repos ──clic──▶ menu ──« Visite guidée »──▶ visite 1…7 ──« Terminer »──▶ fin ──« Fermer »──▶ repos
                 │                              │ Échap, « Quitter la visite »  ─────────────▶ repos
                 │──« Une question précise »──▶ questions ──clic──▶ réponse ──« Retour »──▶ questions
                 │                              │ « Retour » ──▶ menu ;  Échap ──▶ repos
                 │──« Non merci », Échap, × ─────────────────────────────────────────────────▶ repos
                 └──« Masquer le guide » ──▶ masqué ──clic sur la languette──▶ repos
```

- **Repos** : posé sur le bord droit, dans le tiers bas de la fenêtre (en bas à
  droite sous 720 px). Si la marge droite de la page est plus étroite que le
  sprite, Pix est à moitié rentré dans le bord (seuls sa tête et son marqueur
  dépassent) et ressort au survol ou au focus. Au repos, il ne recouvre jamais
  de texte.
- **Marqueur** : `done` → « ? » ; sinon `dismissed` → aucun ; sinon « ! ».
  `dismissed` est posé à toute fermeture de la bulle sans visite terminée
  (« Non merci », Échap, ×, « Masquer le guide », visite quittée, fermeture
  après une réponse). `done` est posé à l'affichage de « Quête accomplie ! ».
- **Menu** : « Bonjour ! Je suis Pix, le guide de ce portfolio. Je vous fais
  visiter ? » et trois choix : « Visite guidée (1 min) », « Une question
  précise », « Non merci ». La bulle a un bouton × et un lien « Masquer le
  guide ».
- **Visite lancée depuis Projets ou Contact** : la visite commence toujours à
  l'étape 1. Pix annonce « On commence par l'accueil » et la navigation part
  aussitôt.
- **Masqué** : Pix devient une languette de 18 px sur le bord droit
  (« Afficher le guide »). Le choix est mémorisé d'une page et d'une session à
  l'autre.
- **Effacement automatique** : Pix est caché quand le menu mobile est ouvert,
  quand un `dialog[open]` existe (lightbox), et sous 720 px quand un champ du
  formulaire a le focus (clavier virtuel).
- **Plan d'empilement** : au-dessus du contenu, sous la barre de navigation
  (`z-index` 30) et sous la lightbox (top layer).

### 6.5 Visite : déplacements et pages

- **Pas d'attente** : à chaque étape, le texte et les boutons s'affichent
  immédiatement ; la page défile vers la cible et Pix marche en parallèle, en
  400 ms au plus. La marche démarre à `scrollend`, avec un délai de repli de
  600 ms.
- **Cible** : elle reçoit un contour d'accent tant que l'étape est affichée.
  Une cible plus haute que l'écran est alignée par le haut, sous la barre.
- **Placement** : sur ordinateur, Pix se place à côté de la cible si l'espace
  libre entre la cible et le bord de la fenêtre dépasse la largeur du sprite
  plus 24 px ; sinon, et toujours sous 720 px, Pix se range en bas de la fenêtre
  (position fixe). La bulle est placée vers l'intérieur de la fenêtre et reste
  entre le bas de la barre et le bas de l'écran au moment du placement.
- **Suivi au défilement** : à côté d'une cible, Pix et sa bulle sont en
  `position: absolute` en coordonnées du document ; ils suivent la cible sans
  JavaScript quand la page défile. Leur position est recalculée au
  redimensionnement (`ResizeObserver` sur la cible et sur la fenêtre).
- **Cible inutilisable** : si la cible est absente, de taille nulle ou masquée
  (par exemple le canvas de la galaxie), l'étape est sautée et le compteur
  s'ajuste.
- **Changement de page** : Pix sort par le bord (200 ms au plus) et la
  navigation part ; sur la page suivante, il entre par le bord et reprend
  l'étape. Au changement de page, le focus va au bouton principal de la bulle.
- **Rechargement** pendant une visite : la visite reprend à son étape.
- **Précédent / Suivant du navigateur** : si la page affichée correspond à
  l'étape mémorisée, la visite reprend ; sinon elle s'arrête. Une page restaurée
  depuis le cache d'historique ne rejoue pas `load` : `pix.js` écoute
  `pageshow` (`event.persisted`) pour relire l'état et se resynchroniser.
- **Stockage indisponible** : la visite ne peut pas passer d'une page à
  l'autre ; à la dernière étape de la page courante, la bulle indique où se
  trouve la suite et la visite se termine.

### 6.6 Clavier, lecteurs d'écran, mouvement réduit

- Pix est un `<button>` (« Ouvrir le guide », `aria-expanded`). À l'ouverture,
  le focus va au premier choix de la bulle.
- Pix ne traite une touche que si le focus est dans Pix, et l'ignore si
  `event.defaultPrevented`, si `event.isComposing`, si la cible est un champ
  (`input`, `textarea`, `select`, `[contenteditable]`) ou une `video`, ou si un
  `dialog[open]` existe. → passe à l'étape suivante ; Entrée active
  normalement le bouton qui a le focus (aucun gestionnaire en plus, pour ne pas
  avancer deux fois) ; Échap suit le diagramme 6.4 et rend le focus à Pix.
  Pix n'appelle jamais `preventDefault()` sur Échap.
- Après « Voir la démo », à la fermeture de la lightbox, le focus revient au
  bouton « Suivant » de la bulle.
- La bulle n'est pas modale : la page reste utilisable pendant la visite.
- Le texte de la bulle est annoncé par une région `aria-live="polite"` créée
  vide à l'initialisation ; le texte y est écrit environ 100 ms plus tard, pour
  que les lecteurs d'écran l'annoncent aussi au changement de page.
- Avec `prefers-reduced-motion` : ni balancement, ni clignement, ni regard, ni
  antenne qui clignote, ni marche. Pix change de place instantanément et le
  défilement est immédiat.

### 6.7 Scénario

**Visite guidée**

| # | Page | Cible | Texte | Actions |
|---|---|---|---|---|
| 1 | Accueil | `.profile-card` | Voici Rayan, développeur full-stack en 3ᵉ année de Bachelor à Paris. Il cherche une alternance 2026-2027, en rythme 3 semaines entreprise / 1 semaine école. | Suivant |
| 2 | Accueil | `#scene-band` | Cette galaxie, il l'a codée à la main en Three.js. Chaque point est un projet. Essayez de la faire tourner. | Suivant |
| 3 | Accueil | `#parcours` | Diplômé concepteur développeur web et mobile, avec deux stages, dont la refonte du site d'une ONG présente dans 13 pays. | Voir ses projets → (page Projets) |
| 4 | Projets | `#sniper` | Son projet le plus ambitieux : un jeu de tir 3D multijoueur, sans moteur de jeu. | Voir la démo · Suivant |
| 5 | Projets | `#aithan` | Un assistant vocal 100 % local. Il a repris un projet open source et en a remplacé tout le cerveau. | Voir la démo · Suivant |
| 6 | Projets | `#toutnight` | Le plus proche de votre quotidien : une API Django, du temps réel en Node.js, React et Docker. | Suivant → (page Contact) |
| 7 | Contact | `.contact-form-card` | Quête finale : lui écrire. Formulaire, mail ou LinkedIn, comme vous préférez. | Télécharger le CV (+1 XP) · Terminer |

- La fin affiche « Quête accomplie ! » et un bouton « Fermer ».
- Le texte de l'étape 3 dépend de la formulation FEMED retenue (4.3) ; celui de
  l'étape 6 et la réponse sur les technos dépendent de la part de Rayan dans
  Tout Night (section 10).
- « Voir la démo » n'apparaît que si la fiche a un `data-video` (4.4).

**Questions précises**

| Question | Réponse | Action |
|---|---|---|
| Que cherche-t-il exactement ? | Une alternance 2026-2027, 3 semaines entreprise / 1 semaine école, à Paris ou en Île-de-France. Il est disponible immédiatement. | Le contacter |
| Son projet le plus technique ? | Sniper : rendu 3D, IA des personnages et multijoueur, tout écrit à la main, sans moteur. | Voir le projet |
| Quelles technos maîtrise-t-il ? | React et Django (Tout Night), PHP et WordPress (FEMED, en production), Three.js (Sniper), Python et IA locale (AITHAN). | Voir les projets |
| A-t-il déjà travaillé en entreprise ? | Oui : deux stages, chez FEMED (site en production) et chez LDLC. | Voir le parcours |
| Je peux voir son code ? | Tout est sur GitHub. | Ouvrir GitHub |
| Je veux son CV | Le voici. | Télécharger le CV (+1 XP) |

**Textes d'interface** (à relire par Rayan avec le reste) : « Ouvrir le
guide », « Afficher le guide », « Masquer le guide », « Quitter la visite »,
« Retour », « Fermer », « Terminer », « On commence par l'accueil »,
« Quête accomplie ! », « +1 XP », et le texte de suite quand le stockage est
indisponible (« La suite de la visite est sur la page Projets »).

**Types d'action** : `next` (étape suivante), `goto` (page et cible), `video`
(déclenche le bouton de démo de la cible), `download` (CV, affiche « +1 XP »),
`link` (lien externe dans un nouvel onglet), `finish`.

**`goto` hors visite** (réponses aux questions) : Pix reste au repos et ne
marche pas. Sur la page courante, la page défile vers la cible ; sur une autre
page, la navigation part vers la page, et la clé `sessionStorage["pix-goto"]`,
lue une seule fois à l'arrivée, fait défiler vers la cible. Dans les deux cas,
la cible reçoit le contour d'accent pendant 3 s. Aucune vidéo n'est lancée à
distance (la lecture automatique serait bloquée de toute façon).

### 6.8 Mémorisation

- `localStorage["pix"]` : `{ v: 1, dismissed, done, hidden }`.
- `sessionStorage["pix-tour"]` : `{ step, page }` pendant une visite.
- `sessionStorage["pix-goto"]` : `{ page, target }`, effacée dès sa lecture.
- Toute lecture ou écriture passe par un `try/catch`. Si le stockage est
  indisponible (données bloquées), Pix fonctionne avec les valeurs par défaut et
  ne mémorise rien (voir 6.5 pour la visite).

## 7. Lot 4 — Motion design

### 7.1 La vignette devient la fiche

Transition entre pages (View Transitions API, inter-documents), d'une vignette
de l'accueil vers sa fiche sur la page Projets. Chrome et Edge 126+, Safari
18.2+ ; les autres navigateurs naviguent normalement.

- `@view-transition { navigation: auto; }` dans `base.css`, sous
  `@media (prefers-reduced-motion: no-preference)`.
- Pas de fondu général : `::view-transition-old(root)` et
  `::view-transition-new(root)` sans animation. Seule la vignette se transforme,
  conformément à la règle « montrer du contenu » (section 2). Une navigation qui
  ne part pas d'une vignette (menu, liens) se fait donc sans animation.
- Les noms sont posés **dynamiquement**, sinon toutes les vignettes partiraient
  vers leurs fiches à chaque navigation :
  - page de départ : à l'événement `pageswap`, si l'URL de destination vise
    une fiche (`…mesprojets#<id>`, quelle que soit la forme de l'URL), la
    vignette `[data-project="<id>"]` reçoit `view-transition-name: proj` ; le
    nom est retiré à `pageshow` (retour depuis le cache d'historique) ;
  - page d'arrivée : un écouteur `pagereveal`, dans le script classique en
    ligne du `<head>` (il doit exister avant le premier rendu), lit
    `location.hash`, pose `view-transition-name: proj` sur le `.project-media`
    de la fiche visée et lui ajoute `.in` (sinon `.js .reveal` la rendrait
    invisible pendant la transition) ;
  - `<link rel="expect" href="#battle" blocking="render">` sur la page Projets,
    pour que les fiches soient analysées avant le premier rendu.
- Durée 350 ms au plus.

### 7.2 Aperçu vidéo au survol

Sur les vignettes de l'accueil dont la fiche a un `data-video` : seulement si
`(hover: hover) and (pointer: fine)`, sans mouvement réduit, et sans mode
économie de données (`navigator.connection?.saveData`, qui n'existe que dans
Chromium ; ailleurs, la condition est considérée comme remplie). Après 150 ms
de survol, une `<video muted loop playsinline>` se superpose à la vignette ;
elle est retirée à la sortie.

### 7.3 Micro-interaction

Le bouton du formulaire affiche un état de succès pendant 2,5 s : icône `i-check`
(à ajouter à `icons.svg`) et « Envoyé », en plus du message existant.

## 8. Vérification

### 8.1 Tests automatiques

Commande : `node --test "tests/**/*.test.mjs"` (Node 24, aucune dépendance ;
les fichiers de test se nomment `*.test.mjs`). La même commande figure dans le
README. Les tests HTML portent sur les trois pages `index.html`,
`mesprojets.html` et `contact.html`, plus `404.html` là où c'est précisé.

- **HTML** :
  - aucun `.reveal` parmi les descendants des conteneurs du premier écran ;
  - champs `message`, `subject` et `_gotcha` présents ;
  - texte du lien LinkedIn égal à son `href` une fois retirés le schéma,
    `www.` et la barre finale ;
  - chaque `href` et `src` local pointe vers un fichier existant, et chaque
    fragment interne (`mesprojets.html#sniper`) vers un `id` existant ;
  - les fichiers de `data-video` et `data-poster` existent ;
  - `canonical` (forme courte) et `data-page` sur les trois pages ; script de
    Pix inclus sur les trois pages ;
  - `404.html` n'utilise aucune ressource locale, et n'a ni canonical ni Pix ;
  - chaque entrée `<dd>` des fiches fait 140 caractères au plus ;
  - images de vignette de 150 Ko au plus, vidéos de 2 Mo au plus.
- **CSS** :
  - contraste de `--text`, `--muted`, `--dim` et `--accent` d'au moins 4,5:1
    (sans arrondi) sur `--bg` et `--surface` ;
  - aucune taille de texte sous 11 px, en analysant `font-size` et le raccourci
    `font`, hors sélecteurs qui visent `.icon` ;
  - la règle masquante est `.js .reveal`, sans règle `.reveal` masquante seule.
- **Pix** (`machine.js`, avec stockages factices injectés) :
  - transitions du diagramme 6.4, dont toutes les sorties ;
  - table du marqueur ;
  - reprise au rechargement, reprise ou abandon selon la page, visite lancée
    hors accueil, étape sautée quand la cible est inutilisable ;
  - stockage qui lève une exception en lecture et en écriture ;
  - validation du scénario : chaque cible de visite et de question existe dans
    la page HTML visée, chaque action a un type connu ;
  - budget : les quatre fichiers de Pix concaténés font 12 Ko au plus en gzip
    niveau 9 (`zlib.gzipSync`).

### 8.2 Vérifications dans le navigateur

Avec `tools/serve.mjs`, à 375, 768, 1024 et 1440 px de large :

- pas de défilement horizontal
  (`document.documentElement.scrollWidth <= document.documentElement.clientWidth`),
  aucune erreur console ;
- menu mobile pleine largeur ; navigation sans JS ;
- lightbox au clavier (critères 3.7) ;
- au repos, Pix ne recouvre aucun texte ;
- visite complète de Pix au clavier et à la souris, sur les trois pages ;
  rechargement en pleine visite ; Précédent pendant une visite (Pix visible,
  visite reprise ou arrêtée selon 6.5) ; « Voir la démo » puis Échap (la vidéo
  se ferme, la visite continue, le focus revient à « Suivant ») ; touche →
  dans le formulaire de l'étape 7 (le curseur bouge, la visite n'avance pas) ;
- masquage de Pix, rechargement, retour de Pix par la languette.

### 8.3 Après déploiement

- PageSpeed Insights (gratuit) sur l'accueil en mobile. Objectifs :
  performance 90 au moins, accessibilité 95 au moins.
- Par `curl`, sur Netlify et sur GitHub Pages (après la fin du workflow
  « pages build and deployment ») : `/proto/accueil.html`, `/README.md`,
  `/_config.yml`, `/docs/superpowers/specs/2026-10-07-refonte-portfolio-design.md`
  et un fichier de `tests/` répondent 404 ; `/index.html` et
  `/assets/css/base.css` répondent 200. Sur Netlify, les anciens chemins du CV
  répondent 301 vers le nouveau.

## 9. Hors périmètre

Chatbot IA, son, Sniper jouable dans le navigateur, galaxie pilotée par le
scroll, remplacement du HUD de la galaxie, carte « Ce que je cherche » à côté
du Parcours, transition au retour Projets → Accueil, réécriture de l'historique
git d'AITHAN (tâche à part, avec l'accord de Rayan, car elle exige un
force-push), réglages du dépôt GitHub (description, site, sujets : à faire par
Rayan), désactivation de GitHub Pages (à faire par Rayan s'il le souhaite).

## 10. Points ouverts

| Point | Qui | Bloque |
|---|---|---|
| Nom définitif du PNJ (« Pix » provisoire) | Rayan | rien |
| FEMED : refonte, ou développement et maintenance ? Polylang ou GTranslate ? | Rayan | lot 2 (fiche FEMED), étape 3 de Pix |
| Tout Night : projet solo ou de groupe, et part de Rayan | Rayan | lot 2 (fiche), lot 3 (pastilles Django et Docker), étape 6 et question 3 de Pix |
| Nouveau paragraphe d'accroche du héros (5.1) | Rayan | lot 3 |
| Captures d'AITHAN et de Tout Night | Rayan | lot 2 (vignettes) |
| Vidéos Sniper (nouvelle) et AITHAN | Rayan | rien (ajout ultérieur, 4.4) |
| Téléchargement de `three.module.min.js` r169 | accord de Rayan | lot 1 (3.8) |
| Mise en ligne de chaque lot (push sur `main`) | accord de Rayan | chaque livraison |
