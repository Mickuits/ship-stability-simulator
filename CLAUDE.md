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

## Historique des versions
| Version | Statut | Description |
|---------|--------|-------------|
| v0 | Archivée | Prototype initial (stabilite-navire.html, ~500 lignes) |
| v1 | Archivée | Panneau cours, tooltips, dark theme |
| v2 | Backup (v2-backup.html) | Profils navire, voilier, cache GZ, citernes animées |
| v3 | Backup | Corrections cache GZ (bug pts=null), guards NaN, clip GZ |
| **v4** | **Production** | Version finale auditée — tous les bugs corrigés |

## Journal de session (02/04/2026)

### Travail réalisé
1. **Moteur physique scalable** — extraction des constantes hardcodées (L, Cb, bilgeW...) dans `PROFILES` pour supporter plusieurs types de navires
2. **Voilier réaliste** — paramètres calibrés (B=3.6, D=2.6, TE=1.8, KG=0.9, Cb=0.48) pour un angle de chavirement à ~124° (cible 110-140° selon ISO 12217)
3. **Dessin voilier** — quille à aileron avec bulbe ovale, mât, voiles (vue de face), rouf, filière, haubans, feux de navigation
4. **Couleurs harmonisées** — `colG`, `colB0`, `colMt`, `colGZ` adaptées par profil (visibles sur coque blanche voilier ET sombre pétrolier)
5. **Cours vulgarisé** — analogies concrètes (baignoire, radeau vs canoë, plateau avec verre d'eau), formules dans `<details><summary>` pour les débutants
6. **Tooltips enrichis** — légende avec design riche (`data-tip` + tooltip `#tt`), Mt ajouté aux hoverPts, feux de navigation (bâbord/tribord), citernes (description carène liquide)
7. **Enfoncement visuel** — `sinkPx` pour que le changement de milieu (eau douce/mer/tropicale) montre le navire s'enfoncer ou s'alléger sans déformation
8. **Courbe GZ** — axe Y adaptatif (toute la courbe visible), navigation souris en plein écran, fermeture Escape
9. **Cache GZ unifié** — clé unique `_gzKey()` utilisée en fin de `phys()`, pas invalidé quand seul heel change
10. **Bandeau stabilité** — 12 états distincts, "stabilité faible" quand dot orange (passé GZ max)
11. **Nettoyage** — 5 variables mortes supprimées, accents français (~55 corrections), format GZ "à" cohérent
12. **Logo configurable** — `LOGO_CONFIG.enabled` + `LOGO_CONFIG.src`, désactivé par défaut pour neutralité

### Audits réalisés (agents parallèles)
- **4 rounds d'audit complets** (5 agents chacun : Structure, Physique, Rendu, UX, Régression)
- **Score final v4** : Structure 10/10, Physique 10/10 (14/14 tests), Rendu 10/10, UX 9.5/10, Complétude 10/10
- **0 bug critique**, 0 régression fonctionnelle entre versions

### Bugs historiques corrigés (à ne JAMAIS réintroduire)
| Bug | Cause | Fix |
|-----|-------|-----|
| Courbe GZ invisible | `gzPoints()` retournait `null` — cache créé par `gzAnalysis()` avec `pts:null` | Vérifier `_gzCache.pts` avant retour (H2) |
| BM = Infinity | Division par zéro quand TE=0 | Guard `TE > 0.01` (H4) |
| B' positions aléatoires | Échelles anisotropes (hsc ≠ vsc) | Échelle isotrope unique `sc` |
| Navire pivote sur la flottaison | `X.translate/rotate` autour du mauvais point | Rotation autour de G (`gShipYpivot`) |
| Cache GZ invalidé à chaque frame | Clé `phys()` ≠ clé `_gzKey()` | Clé unifiée `_gzKey()` en fin de `phys()` (H5) |
| Taille navire change avec milieu | `sc` utilisait `TEvis` (variable) | `sc` basé sur `S.TE` (slider, fixe) |

## Prochaines étapes

### Priorité haute
- [ ] **Fenêtre info feux de navigation** — ajouter un panneau explicatif détaillé (secteurs, portée, couleurs COLREG) quand on clique sur les feux
- [ ] **Scénarios guidés** — boutons "Chargement en hauteur", "Coup de vent", "Ballastage mal fait" qui animent les paramètres et expliquent en temps réel
- [ ] **Critères IMO** — afficher les critères réglementaires (GZ > 0.20m à 30°, aire 0-30° > 0.055 m·rad, etc.) sur la courbe GZ

### Priorité moyenne
- [ ] **Nouveaux profils navire** — porte-conteneurs (passerelle arrière), vraquier, ferry RoRo
- [ ] **Mode exercice/quiz** — questions avec correction automatique pour l'examen matelot pont
- [ ] **Effet du vent** — slider pression de vent avec bras de levier inclinant (Weather Criterion IMO)
- [ ] **Animation de chavirement** — quand le navire est instable et qu'on lâche la gîte, il bascule tout seul selon la courbe GZ

### Priorité basse
- [ ] **Accessibilité** — aria-labels, labels liés aux inputs, `tabindex` sur les cartes cours
- [ ] **Export PDF** — capture du canvas + paramètres en cours pour documentation
- [ ] **Modularisation** — découper le JS en modules ES6 si le fichier dépasse ~3000 lignes
- [ ] **Reflet eau** — miroir inversé du navire dans l'eau pour plus de réalisme
- [ ] **Mobile** — pinch-to-zoom amélioré, fermeture Escape → back button

## Git
- Repo : github.com/Mickuits/ship-stability-simulator
- Branche : master
- Seul fichier production : `stabilite-navire-v4.html`
