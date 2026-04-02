# Ship Stability Simulator — TODO

> Mis à jour à chaque fin de session. Dernière MAJ : 02/04/2026 (fin de session 1).

---

## En cours
_(rien — session terminée)_

---

## Priorité haute

- [ ] **Fenêtre info feux de navigation** — panneau explicatif au clic (secteurs COLREG, portée, couleurs réglementaires). Tooltips de survol déjà en place, manque le panneau détaillé au clic.
- [ ] **Scénarios guidés animés** — boutons qui animent progressivement les paramètres avec narration en temps réel :
  - "Chargement en hauteur" (KG monte → GMt diminue → chavirement)
  - "Coup de vent" (gîte forcée + critère vent IMO)
  - "Ballastage mal fait" (carène liquide → effondrement GZ)
- [ ] **Critères IMO sur courbe GZ** — lignes horizontales/verticales réglementaires :
  - GZ ≥ 0.20m à θ ≥ 30°
  - Aire 0-30° ≥ 0.055 m·rad
  - Aire 0-40° ≥ 0.090 m·rad
  - Angle de GZ max ≥ 25°
- [ ] **Accents restants** — ~15-20 mots dans les tooltips JS canvas et labels drawGZc manquent encore d'accents

---

## Priorité moyenne

- [ ] **Nouveaux profils navire** — porte-conteneurs (passerelle arrière, Cb=0.65), vraquier (Cb=0.82), ferry RoRo. Le système `PROFILES` est prêt, juste ajouter les objets.
- [ ] **Mode exercice/quiz** — questions type examen matelot pont avec correction automatique
- [ ] **Slider pression de vent** — bras de levier inclinant (Weather Criterion IMO), visible sur la courbe GZ
- [ ] **Animation chavirement libre** — simulation physique du roulis quand on lâche la gîte (tentative v3 retirée car saccadée, à reprendre avec meilleur amortissement)
- [ ] **Surbrillance concepts abstraits** — pulsation citernes quand "carène liquide" sélectionné dans le cours, givre clignotant quand "givrage" sélectionné. Le mapping `activeConcept` est en place ('TANK', 'ICE'), manque le rendu visuel dans draw().

---

## Priorité basse

- [ ] **Accessibilité** — aria-labels, `<label for>` liés aux inputs, `tabindex="0"` + `role="button"` sur les cartes cours, texte alternatif canvas
- [ ] **Export PDF** — capture canvas + tableau de paramètres courants
- [ ] **Modularisation** — découper le JS en modules ES6 si le fichier dépasse ~3000 lignes
- [ ] **Reflet eau** — miroir vertical inversé du navire avec opacité
- [ ] **Mobile** — back button Android = fermeture GZ plein écran, amélioration pinch-to-zoom
- [ ] **CSS orphelin** — classe `.card-formula` plus utilisée (peut être supprimée)
- [ ] **Handler `touchcancel`** — mineur, le prochain touchstart réinitialise l'état

---

## Points de vigilance (ne pas régresser)

| Règle | Vérification |
|-------|-------------|
| save/restore équilibrés | `X.save()` = `X.restore()`, `ctx.save()` = `ctx.restore()` |
| `gzPoints()` ne retourne jamais null | Toujours vérifier `_gzCache.pts` avant retour |
| `computeB0` jamais NaN | Guard `isFinite` + fallback `{bx:0, by:0.05}` |
| BM jamais Infinity | Guard `TE > 0.01` |
| Cache GZ invalidé proprement | `_gzKey()` appelé en FIN de `phys()` |
| Échelle stable au changement milieu | `sc` basé sur `S.TE` (slider), pas `TEvis` |
| `bTrace` nettoyé par filter (pas splice) | Évite O(n²) |

---

## Complété — Session 02/04/2026

- [x] Moteur physique scalable (PROFILES avec constantes extraites)
- [x] Profil voilier réaliste (B=3.6, D=2.6, TE=1.8, KG=0.9, Cb=0.48, chavirement ~124°)
- [x] Dessin voilier complet (quille/bulbe ovale, mât, voiles vue de face, rouf, filière, haubans, feux)
- [x] Couleurs harmonisées par profil (colG, colB0, colMt, colGZ)
- [x] Cours vulgarisé (analogies concrètes + formules dans `<details>`)
- [x] Tooltips légende design riche (data-tip + #tt mouseenter/mouseleave)
- [x] Tooltip Mt dans hoverPts avec diagnostic GMt
- [x] Tooltips feux navigation bâbord/tribord (pétrolier + voilier)
- [x] Tooltips citernes (description carène liquide)
- [x] Enfoncement visuel (sinkPx) au changement de milieu
- [x] Courbe GZ : axe Y adaptatif (toute la courbe), navigation souris plein écran, Escape
- [x] Cache GZ unifié (_gzKey en fin de phys, pas invalidé quand seul heel change)
- [x] Bandeau "stabilité faible" quand dot orange (passé GZ max)
- [x] 5 variables mortes nettoyées (gShipYPreview, gShipY, tankInnerAt, hullWidthAt, tkMargin)
- [x] ~55 accents français corrigés (HTML + JS)
- [x] Format GZ "à" cohérent (plus de "@")
- [x] Formules card-head supprimées → details/summary
- [x] Logo configurable, désactivé par défaut (LOGO_CONFIG.enabled)
- [x] Bouton centrer repositionné au-dessus du zoom
- [x] Caméra stable au changement de milieu
- [x] Validation onchange nH identique à oninput
- [x] Labels GZ anti-chevauchement (décalage Y si GZ max proche de θ chavirement)
- [x] Guard NaN computeB0 (fallback by=0.05)
- [x] Guard BM TE=0 → retourne 0
- [x] Bug gzPoints null → vérification _gzCache.pts
- [x] Légende couleurs dynamiques au changement de profil
- [x] 4 rounds d'audit (20 agents au total) — scores finaux 10/10 partout
- [x] Push GitHub (Mickuits/ship-stability-simulator)
- [x] CLAUDE.md + TODO.md

## Complété — Sessions précédentes

- [x] Prototype v0 (animation canvas, sliders, physique de base)
- [x] Panneau cours (12 cartes concept, 4 catégories)
- [x] Citernes animées (bisection, ondulations, surface libre horizontale)
- [x] Givrage visuel (stalactites, givre flancs, rambardes, mât)
- [x] Trace B' avec interpolation et fading
- [x] Pétrolier détaillé (passerelle, cheminée, hublots, tuyauterie, bollards, ancre)
- [x] Étoiles animées dans le ciel
- [x] Pan/zoom caméra (souris + touch 2 doigts)
- [x] Double-clic gauche = gîte 0°, double-clic droit = recentrer
