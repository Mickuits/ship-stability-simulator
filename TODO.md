# Ship Stability Simulator V2 — TODO

> Roadmap V2 Web 3D. Mise à jour à chaque fin de session.
> **Dernière MAJ** : 10/06/2026 (Sprint 0 — mise en conformité docs + pivot moteur mesh-based D-017)
>
> Voir `CLAUDE.md` pour la stack technique, `SPEC-CMP.md` pour le mapping pédagogique, `DECISIONS.md` pour l'historique architectural (D-017 = moteur hydrostatique générique basé maillage).

---

## Cap produit (rappel)

V2.0 = **simulateur de stabilité navale commercialisable** pour centres de formation CMP. Deux piliers :

1. **Moteur hydrostatique générique basé maillage** (D-017) — le navire est une donnée (assets glTF + JSON), le moteur est unique. Validé contre tables DELFTship. C'est le moat.
2. **Périmètre resserré vendable** (A7, confirmé Micka 10/06/2026) : **S3** (stabilité cœur), **S11** (carène liquide ferry), **D1** (anatomie navire), **quiz QCM basique**, **3 navires** (tanker MR2, voilier 12 m, ferry/roulier). Le reste (D2-D6, autres S, porte-conteneurs/grues) → V2.1+.

Le core box-hull existant (`profiles.ts`, `stability.ts`, `freeSurface.ts`, `weights.ts`, 203 tests) est **conservé comme couche de comparaison pédagogique** (approximation métacentrique petits angles), **pas** comme moteur primaire. Décision Micka 10/06/2026.

---

## En cours — Sprint 0 (conformité docs + bootstrap)

- [x] Transcrire **D-017** dans `DECISIONS.md` (moteur mesh-based, amende Phase 1 du D-013)
- [x] Amender `CLAUDE.md` : moteur mesh-based, Hardened Rules H11-H14, validation design humaine (A4), pipeline assets, arborescence (`assets/ships/`, `src/core/geometry/`, `src/core/hydrostatics/`)
- [x] Purger les mentions « 14 cas numériques validés » (A1) — remplacées par protocole validation DELFTship + géométries analytiques
- [x] Corriger SPEC-CMP « mot-pour-mot » → « reformulé conforme au référentiel national » (A3) ; idem README, BUSINESS-PLAN
- [x] Réécrire ce `TODO.md` sur le périmètre V2.0 resserré (A7)
- [ ] Rechercher le référentiel national CMP (Légifrance/DGAMPA), l'archiver dans `docs/referentiel/` avec note de source (A3)
- [ ] Créer `docs/CONVENTIONS-AXES.md` (H13) — convention DELFTship documentée une fois pour toutes
- [ ] Vérifier CI `ci.yml` (typecheck + lint + test) ; `pnpm typecheck && pnpm lint && pnpm test:run` verts
- [ ] Archiver `HANDOFF-CLAUDE-CODE.md` dans `docs/` (fin de Sprint 0)
- [ ] Commit + push Sprint 0 sur `v2-web3d`

---

## Sprints V2 (D-017)

### Sprint 0 — Conformité documentaire + bootstrap *(en cours, voir ci-dessus)*
Bootstrap déjà acquis (sessions antérieures) : Vite + React 18 + TS strict + Tailwind + shadcn/ui + Biome + Vitest + Playwright + Storybook + CI GitHub Actions + branche `v2-web3d`.

### Sprint 1 — Core géométrie + hydrostatiques mesh-based *(3-4 semaines — le cœur du produit)*
- [ ] `src/core/geometry/mesh.ts` — chargeur glTF → structure maillage interne (positions, indices) ; volume signé (théorème de la divergence)
- [ ] `src/core/geometry/watertight.ts` — tests étanchéité/manifold (edges non-manifold = rejet, normales sortantes cohérentes) — H12
- [ ] `src/core/geometry/clip.ts` — coupe maillage/plan de flottaison → ∇, centroïde immergé B(θ), aire de flottaison, inerties It/Il
- [ ] `src/core/hydrostatics/equilibrium.ts` — recherche TE d'équilibre par itération (Δ = ρ·∇), gîte d'équilibre par annulation du moment
- [ ] `src/core/hydrostatics/curve.ts` — KB/BM/KMt/GMt, **GZ(θ) direct** (position réelle de B, pas l'approximation GM·sinθ), courbe précalculée pas 1° + cache invalidé par clé de params (leçon bug cache V1)
- [ ] `src/core/tanks.ts` — carène liquide mesh-based : coupe du tank au niveau de remplissage → CG liquide réel + correction surface libre exacte (supprime tout hardcodé)
- [ ] `src/core/imo.ts` (mesh) — critères A.749/IS Code sur courbe GZ réelle : GZ≥0,20 m à 30°, aires 0-30/0-40/30-40°, angle GZmax, GM₀≥0,15 m
- [ ] **Validation analytique** (solutions exactes à la main) : barge parallélépipédique, cylindre, prisme triangulaire — tolérance serrée
- [ ] **Validation DELFTship** : 3 navires V2.0 (tanker MR2, voilier 12 m, ferry/roulier) contre tables exportées — tolérance ±2 % ∇/KB/KMt, ±3 % GZ
- [ ] `pnpm validate:ship <nom>` — script CLI (recalcule + compare aux références `ship.json.reference`) — H14
- [ ] Coverage > 90 % sur `src/core/`
- [ ] Multi-agent review (naval-architect + code-reviewer + meta-quality) avant merge

**Assets requis pour Sprint 1** (Micka, pipeline §2.4 du handoff / D-017) :
- [ ] `assets/ships/tanker-mr2/` : hull-calc.glb (étanche, 2-5k tris) + ship.json (masse lège, KG, bornes, hydrostatiques réf DELFTship)
- [ ] `assets/ships/voilier-12m/` : idem
- [ ] `assets/ships/ferry-roro/` : idem + tanks/ (pont garage pour S11)

### Sprint 2 — POC visuel « go/no-go esthétique » *(2-3 semaines)*
- [ ] Une scène (tanker) au **niveau qualité commercial cible** : océan Gerstner + HDRI Poly Haven + tone mapping ACES + Bloom/N8AO
- [ ] Navire visual (hull-visual.glb) + overlay carène de calcul translucide (hull-calc.glb)
- [ ] Mouvement de gîte fluide (slider θ → core → rendu 60 FPS)
- [ ] Courbe GZ live (Recharts ou canvas custom) + comparaison overlay GM·sinθ (couche box-hull)
- [ ] Panneau paramètres shadcn/ui
- [ ] **Revue visuelle Micka = critère de sortie** (A4). Itérer jusqu'à validation. Go/no-go avant d'industrialiser les modules.

### Sprint 3 — Module S3 Stabilité cœur *(périmètre V2.0)*
- [ ] Scène S3 complète : P/π/B0/G/Mt/GZ (flèches + labels), couple de redressement
- [ ] Courbe GZ 0-180° + critères IMO overlay (zones aires, GZmax, GM₀)
- [ ] Embarquement de poids (G monte/descend/latéral/suspendu) → recalcul live
- [ ] Storybook stories + visual regression (screenshots référence)

### Sprint 4 — Module S11 Carène liquide *(feature héro, cas ferry pont garage)*
- [ ] Tank mesh paramétrable (niveau de remplissage) → effet surface libre visible
- [ ] Toggle cloisonnement → correction surface libre recalculée en direct
- [ ] Scénario ferry/roulier pont garage (démonstrateur emblématique du référentiel)
- [ ] Rapier cosmétique uniquement pour le ballottement visuel du liquide (H11 — jamais source de valeur)

### Sprint 5 — Module D1 Anatomie navire + Quiz QCM
- [ ] D1 : œuvres vives/mortes, superstructures, vocabulaire — clic sur pièce → pop-up pédagogique
- [ ] Banque QCM basique (par module S3/S11/D1)
- [ ] UI quiz + score + renvoi au concept
- [ ] Reformulation conforme référentiel national (A3 — jamais verbatim Esterel)

### Sprint 6 — Licensing + Tauri + installer + signing *(roadmap D-013 phase 8 inchangée)*
- [ ] `src/licensing/` — RSA 4096 offline (vérif + fingerprint via Tauri API), clé privée jamais committée (H9)
- [ ] `LicenseGenerator` CLI interne (Node script)
- [ ] Wrapping Tauri v2 (`src-tauri/tauri.conf.json`)
- [ ] Build `.msi` Windows + `.dmg` macOS via `tauri-bundler`
- [ ] Code signing macOS (Apple Developer 99$/an) ; Windows V1.0 non signé → cert OV V1.1 (D-008)
- [ ] Test installation propre (Windows 10/11, macOS Intel/ARM)

### Sprint 7 — Bêta centre pilote + go-to-market *(roadmap D-013 phases 9-10)*
- [ ] Déploiement 2-3 postes centre partenaire, observation 1 promo CMP
- [ ] Collecte métriques + itérations P0/P1 + témoignage
- [ ] Nom commercial définitif, logo/identité, site vitrine, pricing/tunnel
- [ ] EULA (`strat-ip-protection`) ; prospection 5-10 centres → **1re vente payante**

---

## V2.1+ (reporté hors périmètre vendable)

- Modules S1/S2/S4-S7 restants, D2-D6
- Profils porte-conteneurs, vraquier (+ grues D5, poids suspendu animé)
- Export rapport PDF fin de session
- Multilingue FR+EN (marché yacht crew international)

---

## Questions stratégiques ouvertes

- [ ] **Nom commercial** — "Ship Stability Simulator" trop technique. Candidats ?
- [ ] **Logo / identité visuelle** — brief `eng-ux-product-design` ou `sm-creative-producer`
- [ ] **Partenariat auteurs référentiel** (Esterel) — sensible juridiquement (A3) : co-signature crédibilise mais le polycopié reste protégé. À cadrer.
- [ ] **Produits d'appel gratuits** (YouTube, webinaire) top of funnel
- [ ] **Langue V2.0** : FR seul d'abord, EN en V2.1 ?

---

## Points de vigilance (ne pas régresser)

| Règle | Vérification |
|-------|-------------|
| Core physique zéro dépendance UI (H1) | `grep -r "react\|three" src/core/` → vide |
| Pas de `any` TypeScript (H2) | `tsc --noEmit` strict passe |
| Maillage de calcul étanche (H12) | test étanchéité à l'import (volume signé, edges manifold) |
| Convention axes unique (H13) | `docs/CONVENTIONS-AXES.md`, rejet à l'import si non conforme |
| Navire = hydrostatiques de réf (H14) | `pnpm validate:ship` vert avant merge |
| Rapier cosmétique seulement (H11) | aucune valeur affichée (GZ/GM/TE) ne vient de Rapier |
| Coverage core > 90 % | `pnpm test:cov` |
| Validation physique sourcée | DELFTship export / solution analytique / Barrass & Derrett — jamais de valeur inventée |
| Visual regression | diff < seuil sur scènes validées |
| Bundle size | < 5 Mo JS main (hors assets WASM/HDRI) |
| Perf | 60 FPS tablette (iPad 2020+), Lighthouse ≥ 90 |
| Secrets | aucune clé RSA privée / cert signing dans le repo (H9) |

---

## Couche comparaison box-hull (conservée — ne pas supprimer)

Le core box-hull livré sessions 3-4 reste en place comme **approximation métacentrique de référence pédagogique** (GZ = GM·sinθ petits angles), à afficher en overlay du GZ direct mesh-based pour illustrer les limites de l'approximation grands angles.

- `src/core/` (legacy box-hull) : `types.ts`, `profiles.ts`, `hydrostatics.ts`, `stability.ts`, `simulation.ts`, `freeSurface.ts`, `weights.ts`, `imo.ts`, `index.ts`
- 203 tests Vitest verts, coverage 99.55 % stmt / 88.95 % branch
- Profil barge Cb=1 (formules box exactes) = également réutilisable comme **géométrie analytique de validation** du moteur mesh-based (Sprint 1)
- Valable barge uniquement quantitativement (A2 : KB=TE/2 et BM box faux hors barge) — d'où le moteur mesh-based primaire

---

## Historique sessions

### Session 5 (10/06/2026) — Sprint 0, pivot D-017
- [x] Audit handoff intégré : moteur mesh-based générique (D-017), 7 findings A1-A7 corrigés
- [x] Périmètre V2.0 resserré confirmé (S3+S11+D1+quiz, 3 navires) ; axes alignés DELFTship (H13)
- [x] Box-hull core conservé comme couche comparaison (décision Micka)
- [x] Docs mises en conformité (CLAUDE/DECISIONS/README/SPEC-CMP/BUSINESS-PLAN) : purge « 14 cas validés » (A1), correction « mot-pour-mot » (A3)
- [x] TODO.md réécrit (ce fichier)

### Session 4 (25/04/2026) — Phase 1 core box-hull terminée
- [x] 4 modules + barrel + profil barge ; 203 tests verts (99.55 % stmt) ; multi-agent review + 7 fixes
- [x] `freeSurface.ts`, `weights.ts`, `imo.ts` (flag applicable), `index.ts`, profil BARGE Cb=1
- [ ] *(Note : ce core devient couche comparaison, pas moteur primaire — voir D-017)*

### Session 3 (24/04/2026) — Core box-hull partiel
- [x] types/profiles/hydrostatics/stability/simulation ; 67 tests ; multi-agent review 4 fixes
- [x] D-016 (arbitrage BM box vs textbook), dettes documentées

### Session 2 (24/04/2026) — Pivot Web 3D
- [x] Pivot Unity → Web 3D (D-015) ; refonte CLAUDE/TODO/DECISIONS/BUSINESS/SPEC

### Session 1 (02/04/2026) — V1 HTML
- [x] Prototype HTML monolithique finalisé (archivé `legacy/`, référence UX uniquement — A2/A6)
