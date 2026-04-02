# Ship Stability Simulator

## Project Overview
Simulateur interactif de stabilité navire pour l'enseignement maritime (certificat matelot pont). Fichier HTML unique autonome, canvas 2D. Deux profils : pétrolier MR2 et voilier 12m.

## Architecture
- **Fichier unique** : `stabilite-navire-v4.html` — HTML + CSS + JS monolithique (~2560 lignes)
- **Moteur physique** : `computeB0()` (intégration numérique 500 strips), `phys()`, `gzAt()`, `gzAnalysis()`
- **Rendu** : canvas 2D avec `requestAnimationFrame`, rotation autour de G structural
- **Cache GZ** : `_gzCache` avec clé `_gzKey()` (B, D, TEeff, eKG, envAngle), invalidé en fin de `phys()` uniquement si les paramètres dérivés changent. Le cache n'est PAS invalidé quand seul `heel` change.
- **Profils** : objet `PROFILES` (tanker + sailboat), switchable via `loadProfile()`. Scalable pour ajouter d'autres navires.

## Profils navire
| Paramètre | Pétrolier MR2 | Voilier 12m |
|-----------|--------------|-------------|
| L | 174m | 12m |
| Cb | 0.85 | 0.48 |
| B (défaut) | 32.2m | 3.6m |
| D (défaut) | 19m | 2.6m |
| TE (défaut) | 12.8m | 1.8m |
| KG (défaut) | 11.5m | 0.9m |
| θ chavirement | ~70° | ~124° |
| bilgeW / bilgeY | 0.55 / 0.6 | 0.15 / 0.25 |
| hasKeel | non | oui (aileron + bulbe) |
| hasTanks | oui (2 latérales) | non |

Pour ajouter un profil : dupliquer un objet dans `PROFILES`, ajuster les valeurs, ajouter un bouton HTML `<button class="pb ship-btn" data-ship="newkey" onclick="loadProfile('newkey')">`.

## Key Functions
| Fonction | Rôle | Lignes |
|----------|------|--------|
| `computeB0(theta, B, TE, D)` | Centroïde volume immergé. Guard isFinite, fallback by=0.05 | ~660 |
| `phys()` | Calcule KB, BM, KMt, GMt, eKG, TEeff, GZ, moment. Invalide cache si params changent | ~720 |
| `gzAt(a)` | GZ à un angle donné (appelle computeB0) | ~790 |
| `gzPoints()` | 361 points GZ (-180°→180°), cached. VÉRIFIE `_gzCache.pts` avant retour | ~810 |
| `gzAnalysis()` | GZ max, angle chavirement (interpolé), aire dynamique, stableAtStart | ~830 |
| `draw(ts)` | Boucle animation principale (~1100 lignes), try/catch avec console.error | ~880 |
| `drawGZc(ctx, w, h, big)` | Courbe GZ miniature + plein écran. Axe Y adaptatif (tous angles) | ~2020 |
| `loadProfile(key)` | Switch profil, reset TOUT (sliders, state, camera, trace, milieu, zoom, titre, hint, légende) | ~580 |
| `updStatusBanner()` | 12 états de stabilité + envahissement overlay | ~2380 |
| `tw(l)` | Transforme un point local navire → coordonnées monde (avec sinkPx) | ~1820 |

## Système de coordonnées
- **Repère navire (local)** : origine à la flottaison du slider (S.TE), x+ = tribord, y+ = quille
- **Repère monde (écran)** : origine arbitraire, x+ = droite, y+ = bas
- **Transform canvas** : `X.translate(cx, waterY + gShipYpivot)` → `X.rotate(rad)` → `X.translate(0, -gShipYpivot + sinkPx)`
- **sinkPx** = `(TEvis - S.TE) * sc` — décalage d'enfoncement quand la densité d'eau change
- **gShipYpivot** = `(TEvis - S.KG) * sc` — position de G par rapport à la flottaison effective
- **Fonction tw()** : convertit local → monde en tenant compte du sinkPx

## Conventions de code
- **save/restore canvas** : TOUJOURS équilibré (compter X.save = X.restore, ctx.save = ctx.restore)
- **Couleurs** : conditionnelles par profil via `colG`, `colB0`, `colMt`, `colGZ`, `colP`, `colPi`
- **Forme coque** : basée sur `S.TE` et `S.D` (slider, fixe) via `draftShape`/`fbShape` — jamais `TEvis`
- **Échelle** : `sc` basé sur `S.TE` (pas `TEvis`) pour que le changement de milieu ne déforme pas le navire
- **Accents** : TOUS les textes visibles en français avec accents (stabilité, métacentre, carène, gîte, etc.)
- **Formules** : dans `<details><summary>` pour les débutants, directement visibles = vulgarisation
- **Tooltips** : canvas → `hoverPts[]` avec rayon 18px + `#tt`. Légende → `data-tip` avec handler mouseenter
- **Bandeau orange** : signifie "stabilité faible" (passé GZ max), PAS "stabilité normale"

## Logo client
Configurable via `LOGO_CONFIG` en haut du script. Désactivé par défaut (neutre) :
```javascript
const LOGO_CONFIG = {
  src: 'logo.png',   // chemin vers le logo (même dossier)
  enabled: true,      // true pour afficher, false pour masquer
  opacity: 0.35,
  maxWidth: 80,       // pixels, coin haut-gauche fixe écran
};
```

## Hardened Rules (NE JAMAIS VIOLER)
| # | Règle | Contexte |
|---|-------|----------|
| H1 | save/restore canvas toujours équilibrés | Bug : context state corrompu si déséquilibré |
| H2 | `gzPoints()` vérifie `_gzCache.pts` avant retour | Bug historique : retournait null → crash "pts is not iterable" |
| H3 | `computeB0` guard isFinite + fallback `{bx:0, by:0.05}` | NaN se propageait dans tout le rendu |
| H4 | `BM` guard `TE > 0.01` → retourne 0 | Division par zéro → BM = Infinity |
| H5 | `phys()` invalide le cache GZ via `_gzKey()` en FIN de fonction | Bug : clé calculée avant que TEeff/eKG soient prêts |
| H6 | pas de variables globales `window.*` | Utiliser `let` au niveau module |
| H7 | `bTrace` nettoyé par `.filter()` (pas `.splice()` en boucle) | splice = O(n²), filter = O(n) |
| H8 | `sc` basé sur `S.TE` (slider), pas `TEvis` | Sinon le navire change de taille au changement de milieu |

## Bugs historiques (contexte pour comprendre les guards)
| Bug | Symptôme | Cause racine | Fix appliqué |
|-----|----------|-------------|--------------|
| Courbe GZ invisible | Canvas GZ vide | `gzAnalysis()` créait le cache avec `pts:null`, `gzPoints()` retournait ce null | H2 : vérifier `_gzCache.pts` |
| BM = Infinity | Valeurs NaN partout | TE=0 dans la formule BM | H4 : guard TE > 0.01 |
| B' aléatoire | Points sautent sur le canvas | Échelles anisotropes hsc ≠ vsc | Échelle isotrope unique `sc` |
| Pivotement faux | Navire tourne autour de la flottaison | `X.rotate` sans offset G | Rotation autour de `gShipYpivot` |
| Cache invalidé chaque frame | Performance dégradée | Clé phys() ≠ clé _gzKey() (formats différents) | H5 : clé unifiée _gzKey() en fin de phys() |
| Navire déforme au changement milieu | Taille change visuellement | `sc` utilisait `TEvis` (variable) | H8 : `sc` basé sur `S.TE` (fixe) |

## Audit qualité (dernier résultat)
| Domaine | Note | Agents |
|---------|------|--------|
| Structure + Cache GZ | 10/10 | save/restore, TDZ, accolades, cache scénarios |
| Moteur Physique | 10/10 | 14 tests numériques (pétrolier + voilier) |
| Rendu Visuel | 10/10 | courbe GZ, couleurs, logo, clip, tooltips |
| UX Interactions | 9.5/10 | 12 tests (sliders, bandeaux, contrôles, profils) |
| Complétude Production | 10/10 | pas de console.log, pas de TODO/FIXME, IDs ok, perf ok |

## Shell Note (Windows)
Node.js PATH : `export PATH="/c/Program Files/nodejs:$PATH"` avant npm/node/npx.

## Dev Commands
- Ouvrir `stabilite-navire-v4.html` directement dans un navigateur
- `node -e "const m=require('fs').readFileSync('...','utf8').match(/<script>([\s\S]*?)<\/script>/);require('vm').createScript(m[1]);console.log('OK')"` — vérifier syntaxe
- Réimplémenter `computeB0` dans `node -e` pour tests numériques (voir CLAUDE.md section Key Functions)

## Workflow d'audit recommandé
1. Lancer 5 agents en parallèle (Structure, Physique, Rendu, UX, Régression)
2. Chaque agent : lecture seule, tests node -e, rapport ✅/❌ avec note /10
3. Corriger les ⚠️/❌, relancer les agents impactés
4. Objectif : 10/10 sur les 5 domaines avant toute mise en production

## Git
- Repo : github.com/Mickuits/ship-stability-simulator
- Branche : master
- Fichier production : `stabilite-navire-v4.html`
- Roadmap et historique : voir `TODO.md`
