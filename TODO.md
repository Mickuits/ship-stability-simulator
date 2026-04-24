# Ship Stability Simulator V2 — TODO

> Roadmap V2 Web 3D (refonte depuis HTML V1). Mise à jour à chaque fin de session.
> **Dernière MAJ** : 24/04/2026 (session 3 — Phase 0 bootstrap exécutée, branche `v2-web3d` verte)
>
> Voir `CLAUDE.md` pour la stack technique complète, `SPEC-CMP.md` pour le mapping pédagogique, `DECISIONS.md` pour l'historique architectural.

---

## En cours
**Phase 1 — Core physique TypeScript** *(session 3 en cours, ~40 % fait)* :
- ✅ `types.ts`, `profiles.ts` (tanker + voilier), `hydrostatics.ts`, `stability.ts`, `simulation.ts`
- ✅ 67 tests Vitest verts, coverage 98.5 % stmt, 100 % funcs
- ✅ Multi-agent review passée (3 agents en parallèle) — 4 findings fixés avant commit
- ⏳ Reste à faire Phase 1 : `freeSurface.ts` autonome, `weights.ts`, `imo.ts`, 14 scénarios numériques V1 exhaustifs, barrel `src/core/index.ts`, profil barge Cb=1 pour validation exacte.

---

## Phases V2 (ordre d'exécution — le plus petit chemin vers la 1re vente)

### Phase 0 — Cadrage & bootstrap repo ✅ *(sessions 24/04/2026 n°2 + n°3)*
- [x] Pivot stack validé (Unity → Web 3D)
- [x] CLAUDE.md V2 refactoré
- [x] DECISIONS.md mis à jour (D-015 pivot + amendements D-001, D-003, D-004, D-005, D-007, D-009, D-012)
- [x] BUSINESS-PLAN.md ajusté (coûts + distribution)
- [x] SPEC-CMP.md ajusté (mentions Unity → R3F équivalent)
- [x] TODO.md réécrit
- [x] Déplacer `stabilite-navire-v4.html` dans `legacy/` sur branche `master`
- [x] Créer branche `v2-web3d` vierge (base depuis `master`)
- [x] Initialiser projet Vite + React + TS strict + Tailwind + shadcn/ui
- [x] Config Biome + tsconfig strict
- [x] Config Vitest + Playwright + Storybook
- [x] CI GitHub Actions (typecheck + lint + test + E2E Playwright)
- [x] `.gitignore` V2 (node_modules, dist, test-results, src-tauri/target, etc.)
- [x] README.md d'accueil (pointeurs CLAUDE/SPEC/DECISIONS/BUSINESS)

### Phase 1 — Core physique TypeScript *(2 semaines cible)*
- [x] `src/core/types.ts` — SimInputs, SimState, Hydrostatics, ShipProfile, GzAnalysis
- [x] `src/core/profiles.ts` — `ShipProfile` type + tanker + voilier (port V1) + `cargoDensity`
- [x] `src/core/hydrostatics.ts` — `computeB0`, `kb`, `bm`, `kmt`, `gmt`, `envAngle`, `freeSurfaceMoment`, `computeHydrostatics`
- [x] `src/core/stability.ts` — `gzAt`, `gzPoints`, `gzAnalysis` (GZmax, angle chavirement, aire)
- [x] `src/core/simulation.ts` — orchestrateur `computeSimState` (pipeline bout-en-bout)
- [x] Références §PDF CMP sur toutes les fonctions majeures (règle H8)
- [x] Clamp défensif `fsRatio ∈ [0,1]` (multi-agent review finding)
- [x] `cargoDensity` paramétré dans ShipProfile (0.85 tanker pétrole, 1.0 défaut)
- [x] **Tests non-régression** : BM=0 si TE=0, isFinite computeB0, NaN fallback, AREA_MIN fallback, symétrie GZ, conservation Δ=ρ·V, clamp fsRatio, ρ≤0 fallback, ic<0 robuste
- [x] Coverage core > 98 % (stmt + lines), 100 % functions

**Reste Phase 1 (session 4+)** :
- [ ] `src/core/freeSurface.ts` — extraire formule de hydrostatics, supporter single/triple tanks
- [ ] `src/core/weights.ts` — embarquement poids (axial fonds/G/haut, latéral, suspendu — cf. SPEC-CMP S4)
- [ ] `src/core/imo.ts` — critères IMO (A.749 §3.1.2) : GMt≥0.15m, GZ≥0.20m à 30°, GZmax ≥25°, aires 0-30°/0-40°/30-40°
- [ ] `src/core/index.ts` — barrel export API publique
- [ ] Profil **barge parallélépipédique** (Cb=1) — cas de validation numérique **exacte** (KB, BM, KMt analytiques fermés, gold standard non-régression)
- [ ] 14 scénarios numériques V1 **nommés et documentés** (le V1 revendique 14 cas validés ; les reproduire formellement avec valeurs attendues commentées)
- [ ] Option `kbMethod: "box" | "morrish"` pour profils non-box (voilier, yacht motor) — Phase 2 si UI demande

### Phase 2 — POC R3F (scène stabilité tanker) *(3 semaines)*
- [ ] Setup R3F + drei + postprocessing
- [ ] Scène 3D : navire tanker low-poly + eau (shader custom simple, pas besoin de Crest)
- [ ] HDRI Poly Haven + tone mapping ACES
- [ ] Visualisation P / π / B0 / G / Mt / GZ (flèches + labels)
- [ ] Slider gîte (0° → 90°) → appel core → rendu en temps réel
- [ ] Courbe GZ 2D overlay (canvas ou SVG, pas besoin de 3D)
- [ ] Responsive mobile/tablette (DPR clamp, FOV réactif)
- [ ] **Feature parity V1** : tout ce que le prototype HTML montre, on le retrouve
- [ ] Storybook stories pour composants UI isolés
- [ ] Visual regression tests (screenshots référence 4 angles × 2 profils)

### Phase 3 — Modules S1-S7 (stabilité cœur pédagogique) *(4 semaines)*
Mapping détaillé dans `SPEC-CMP.md`.

- [ ] **S1** — Rappel forces (Archimède interactif, slider densité, exemple barge 25m PDF)
- [ ] **S2** — Géométrie navire (glossaire interactif, marques franc-bord LL66, jauge UMS)
- [ ] **S3** — Stabilité (scène centrale POC déjà fait — à polir)
- [ ] **S4** — Embarquement poids (6 scénarios narratifs : fonds/G/haut, latéral, suspendu)
- [ ] **S5** — Bilan positions centres (4 cas a/b/c/d)
- [ ] **S6** — Cas particulier givrage (animation progressive glace → G monte → GZ ↓)
- [ ] **S7** — Grands angles + courbe GZ complète (0-180°) + **critères IMO overlay**

### Phase 4 — Carène liquide 3D (S11 — feature héro) *(2 semaines)*
- [ ] Shader custom « surface horizontale en world space » (pas besoin d'Obi Fluid, CFD pas nécessaire pédagogiquement — cf. D-005 amendé)
- [ ] Réservoir paramétrable (largeur, longueur, niveau)
- [ ] Slider largeur → effet cubique visible (formule `l³L/12`)
- [ ] Toggle cloisonnement (0 → 4 cloisons) → MSIT recalculé en direct
- [ ] Scénario ferry/roulier pont garage (cas emblématique du référentiel)

### Phase 5 — Grues + porte-conteneurs (D5 + S4 suspendu) *(3 semaines)*
- [ ] Modèle 3D grue + conteneurs (glTF low-poly, Blender CLI)
- [ ] Animation chargement/déchargement
- [ ] Poids suspendu → G virtuel remonte en temps réel
- [ ] Alarme GMt < 0,15m (critères IMO dérivés)
- [ ] Référence Division 214 (règles manutention)

### Phase 6 — Modules construction D1-D6 *(4 semaines)*
- [ ] **D1** — Anatomie navire (œuvres vives/mortes, superstructures) — clic sur pièce → pop-up
- [ ] **D2** — Matériaux (tableau comparatif, animation électrolyse)
- [ ] **D3** — Charpente (exploded view, 3 systèmes : transversal/longitudinal/mixte)
- [ ] **D4** — Compartimentage (scénario envahissement, bureaux classification)
- [ ] **D5** — Vannes + pompes + manutention (déjà fait phase 5)
- [ ] **D6** — Propulsion (moteur Diesel écorché animé, distribution électrique)

### Phase 7 — Mode examen + quiz *(2 semaines)*
- [ ] Banque de questions (QCM par module)
- [ ] UI quiz + chrono + score
- [ ] Correction automatique + renvoi au §PDF
- [ ] Export rapport PDF fin de session (scénarios joués, scores)

### Phase 8 — Licensing + Tauri + installer + signing *(2 semaines)*
- [ ] `src/licensing/` — RSA 4096 offline (vérif + fingerprint via Tauri API)
- [ ] `LicenseGenerator` CLI interne (Node script, clé privée jamais committée)
- [ ] Wrapping Tauri v2 (`src-tauri/tauri.conf.json`)
- [ ] Build `.msi` Windows + `.dmg` macOS via `tauri-bundler`
- [ ] Code signing macOS (Apple Developer 99$/an — obligatoire)
- [ ] Code signing Windows : V1.0 non signé (SmartScreen tolérable) → cert OV V1.1 (cf. D-008)
- [ ] Test installation propre sur 3 machines (Windows 10/11, macOS Intel/ARM)

### Phase 9 — Bêta centre pilote *(4 semaines)*
- [ ] Déploiement sur 2-3 postes centre partenaire
- [ ] Sessions d'observation pédagogique (1 promo CMP complète)
- [ ] Collecte métriques : compréhension concepts, taux réussite, NPS
- [ ] Itérations correctifs P0/P1 rapides
- [ ] Production étude de cas / témoignage

### Phase 10 — Go-to-market V2.0 *(2 semaines)*
- [ ] Nom commercial définitif (question ouverte BUSINESS-PLAN §10)
- [ ] Logo / identité visuelle
- [ ] Site web vitrine (Next.js séparé, marketing)
- [ ] Pricing page + tunnel achat (Stripe / LemonSqueezy pour B2C 89€, devis manuel B2B)
- [ ] EULA rédigée (à valider `strat-ip-protection`)
- [ ] Prospection 5-10 premiers centres (via `mkt-sales-outreach`)
- [ ] **Objectif** : 1re vente payante

---

## Questions stratégiques ouvertes (avant M+3)

- [ ] **Nom commercial** — "Ship Stability Simulator" trop technique. Candidats à proposer ?
- [ ] **Logo / identité visuelle** — brief à poser à `eng-ux-product-design` ou `sm-creative-producer`
- [ ] **Partenariat auteurs référentiel** (Luciano / Niay — Institut Maritime Esterel) — co-signature décuplerait crédibilité
- [ ] **Produits d'appel gratuits** (vidéos YouTube, webinaire) pour top of funnel
- [ ] **Langue V1** : français seul ou FR+EN dès le début ? (marché yacht crew international parle EN)

---

## Priorités reportées de V1 (à intégrer dans phases V2)

- [ ] Fenêtre info feux de navigation (reporté dans Phase 6 — D1 anatomie)
- [ ] Scénarios guidés animés → couvert par phases 3-5 (narrative par module)
- [ ] Critères IMO sur courbe GZ → Phase 3 (S7)
- [ ] Nouveaux profils navire (porte-conteneurs, vraquier, ferry) → Phases 4-5 (indispensables)
- [ ] Mode quiz → Phase 7
- [ ] Export PDF → Phase 7
- [ ] Accessibilité (axe-core dans Playwright dès phase 2, WCAG tout du long)

---

## Points de vigilance (ne pas régresser)

| Règle | Vérification |
|-------|-------------|
| Core physique zéro dépendance UI | `grep -r "react\|three" src/core/` → doit être vide |
| Pas de `any` TypeScript | `tsc --noEmit --strict` passe |
| Coverage core > 90% | `pnpm test:cov` (actuellement 98.5 %) |
| Tests numériques valides | 14 scénarios V1 reproduits à l'identique (tanker + voilier) |
| Visual regression | Diff < 0.1% sur scènes validées |
| Bundle size | < 5 Mo JS main (hors assets WASM/HDRI) |
| Perf mobile | 60 FPS sur iPad 2020+ (profil `Lighthouse` ≥ 90) |
| A11y | `axe-core` zéro erreur critique |
| Secrets | Aucun (clé RSA privée, cert signing) dans le repo |

## Dette technique identifiée (multi-agent review session 3)

| Item | Priorité | Source | Tracker |
|------|----------|--------|---------|
| Cache GZ pour perf 60 fps tablette (V1 avait `_gzCache`, port V2 pas encore) | Phase 2 (avant UI R3F) | code-reviewer | À implémenter quand UI consomme `gzPoints` 60 fps |
| `src/core/index.ts` barrel export | Phase 1 suite | meta-reviewer | Simplifie imports couche présentation |
| Arbitrage BM box vs textbook (Cb) | Documenté | naval-architect + meta | D-016 dans DECISIONS.md (décision : cohabitation) |
| 14 scénarios numériques V1 nommés | Phase 1 suite | meta-reviewer | Fidélité référentielle + non-régression stricte |
| Profil barge Cb=1 (validation exacte) | Phase 1 suite | naval-architect | KB/BM/KMt analytiques fermés → gold test |
| KB Morrish (alternatif au box KB=TE/2) | Phase 2 | naval-architect | Pour profils non-box (voilier, yacht motor) |
| Zone hachurée courbe GZ au-delà envAngle | Phase 3 UI | naval-architect | Signal visuel d'invalidation wall-sided |

---

## Complété — Session 3 (24/04/2026)

- [x] Phase 1 partielle : core physique TS (types, profiles, hydrostatics, stability, simulation)
- [x] 67 tests Vitest verts (hydrostatics 46 + stability 19 + smoke 2), coverage 98.5 %
- [x] Multi-agent review (meta-quality, code-reviewer, naval-architect) — 4 findings fixés
- [x] Fix A : clamp défensif `fsRatio ∈ [0,1]` + contrat documenté dans types.ts
- [x] Fix B : `cargoDensity` dans ShipProfile (tanker 0.85 pétrole, correction FS corrigée ~18 %)
- [x] Fix C : références §PDF CMP sur `kb`, `bm`, `envAngle`, `freeSurfaceMoment`, `computeB0`, `computeHydrostatics`, `gzAt`, `gzAnalysis` (règle H8)
- [x] Fix D : tests symétrie GZ, ρ≤0, ic<0, fsRatio hors bornes, conservation Δ=ρ·V, cargoDensity
- [x] D-016 ajouté à DECISIONS.md (arbitrage BM box vs textbook)
- [x] Dettes techniques documentées (cache GZ, barrel index, profil barge, Morrish KB)

## Complété — Session 2 (24/04/2026)

- [x] Pivot Unity → Web 3D décidé (D-015)
- [x] CLAUDE.md refondu (V2 stack complète, architecture, validation autonome)
- [x] TODO.md refondu (roadmap 10 phases)
- [x] DECISIONS.md amendé (D-015 ajouté, D-001/D-003/D-004/D-005/D-007/D-009/D-012 amendés)
- [x] BUSINESS-PLAN.md ajusté (coûts -1500€ one-shot, distribution Tauri+PWA)
- [x] SPEC-CMP.md ajusté (mentions Unity/Obi → R3F équivalent, contenu pédagogique intact)

## Complété — Session 1 (02/04/2026) — V1 HTML

- [x] Moteur physique scalable (`PROFILES` avec constantes extraites)
- [x] Profil voilier 12m réaliste
- [x] Couleurs harmonisées par profil, tooltips design riche
- [x] Courbe GZ axe adaptatif, plein écran navigable
- [x] Cache GZ unifié (`_gzKey` en fin de `phys`)
- [x] ~55 accents français corrigés
- [x] Logo configurable, désactivé par défaut
- [x] 5 variables mortes nettoyées
- [x] Guards NaN, BM=0 si TE=0, cache pts null
- [x] 4 rounds d'audit (20 agents) — scores finaux 10/10 partout
- [x] Push GitHub + CLAUDE.md + TODO.md

## Complété — Sessions précédentes (V1 — prototype)

- [x] Prototype v0 (canvas, sliders, physique de base)
- [x] Panneau cours (12 cartes, 4 catégories)
- [x] Citernes animées (bisection, ondulations, surface libre horizontale)
- [x] Givrage visuel
- [x] Trace B' avec interpolation
- [x] Pétrolier détaillé
- [x] Étoiles animées, pan/zoom caméra, double-clic recentrer
