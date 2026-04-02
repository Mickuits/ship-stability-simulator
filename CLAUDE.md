# Ship Stability Simulator

## Project Overview
Simulateur interactif de stabilité navire pour l'enseignement maritime (certificat matelot pont). Fichier HTML unique autonome, canvas 2D.

## Architecture
- **Fichier unique** : `stabilite-navire-v4.html` — HTML + CSS + JS monolithique (~2560 lignes)
- **Moteur physique** : `computeB0()` (intégration numérique 500 strips), `phys()`, `gzAt()`, `gzAnalysis()`
- **Rendu** : canvas 2D avec `requestAnimationFrame`, rotation autour de G
- **Cache GZ** : `_gzCache` avec clé `_gzKey()` (B, D, TEeff, eKG, envAngle), invalidé en fin de `phys()`
- **Profils** : objet `PROFILES` (tanker + sailboat), switchable via `loadProfile()`

## Profils navire
| Paramètre | Pétrolier MR2 | Voilier 12m |
|-----------|--------------|-------------|
| L | 174m | 12m |
| Cb | 0.85 | 0.48 |
| B | 32.2m | 3.6m |
| D | 19m | 2.6m |
| TE | 12.8m | 1.8m |
| KG | 11.5m | 0.9m |
| θ chavirement | ~70° | ~124° |

## Key Functions
- `computeB0(theta, B, TE, D)` — centroïde volume immergé (guard NaN, fallback by=0.05)
- `phys()` — calcule KB, BM, KMt, GMt, eKG, TEeff, GZ, moment. Invalide cache GZ si params changent
- `gzPoints()` — 361 points GZ (-180°→180°), cached. Vérifie `_gzCache.pts` avant retour
- `gzAnalysis()` — GZ max, angle chavirement (interpolé), aire dynamique, stableAtStart
- `draw(ts)` — boucle d'animation principale (~1100 lignes), try/catch avec console.error
- `drawGZc(ctx, w, h, big)` — courbe GZ miniature + plein écran
- `loadProfile(key)` — switch profil, reset tous les sliders/state/camera/trace
- `updStatusBanner()` — 12 états de stabilité + envahissement overlay

## Conventions
- **save/restore canvas** : toujours équilibré (4/4 X, 4/4 ctx)
- **Couleurs** : conditionnelles par profil via `colG`, `colB0`, `colMt`, `colGZ`
- **Rotation** : autour de G structural (`gShipYpivot`), pas de la flottaison
- **Enfoncement** : `sinkPx = (TEvis - S.TE) * sc` ajouté au transform
- **Forme coque** : basée sur `S.TE` (slider, fixe), pas `TEvis` (variable)
- **Échelle** : `sc` basé sur `S.TE` pour que le changement de milieu ne déforme pas
- **Accents** : textes en français avec accents (stabilité, métacentre, carène, etc.)
- **Formules** : dans `<details><summary>` pour les débutants

## Shell Note (Windows)
Node.js PATH : `export PATH="/c/Program Files/nodejs:$PATH"` avant npm/node/npx.

## Dev Commands
- Ouvrir directement dans un navigateur (fichier HTML standalone)
- `node -e "require('vm').createScript(code)"` pour vérifier la syntaxe JS
- Tests physiques : réimplémenter `computeB0` dans `node -e` et vérifier les valeurs

## Logo client
Configurable via `LOGO_CONFIG` en haut du script :
```javascript
const LOGO_CONFIG = {
  src: 'logo.png',   // chemin vers le logo
  enabled: true,      // true pour afficher
  opacity: 0.35,
  maxWidth: 80,
};
```

## Hardened Rules
- H1 : save/restore canvas toujours équilibrés
- H2 : pas de `_gzCache.pts` retourné sans vérification (bug historique)
- H3 : `computeB0` guard isFinite + fallback 0.05 (jamais NaN)
- H4 : `BM` guard TE > 0.01 (jamais Infinity)
- H5 : phys() invalide le cache GZ via `_gzKey()` en FIN de fonction (après calculs)
- H6 : pas de variables globales `window.*` (utiliser `let` au niveau module)
- H7 : `bTrace` auto-limité par décroissance opacité (filter, pas splice)

## Git
- Repo : github.com/Mickuits/ship-stability-simulator
- Branche : master
- Seul fichier production : `stabilite-navire-v4.html`
