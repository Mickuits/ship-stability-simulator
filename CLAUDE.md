# Ship Stability Simulator — V2 Web 3D

> Outil pédagogique de simulation de stabilité navale pour l'enseignement du **CMP (Certificat Matelot Pont)**. Cible : centres de formation maritime agréés DDTM.
>
> Ce fichier est la **source de vérité technique**. Les routines début/fin de session sont définies dans `~/.claude/CLAUDE.md` (global).

---

## Project Overview

**Produit** : logiciel pédagogique 3D installable (licence perpétuelle B2B, offline), aligné sur le référentiel CMP Module P3-Appui (Institut Maritime Esterel, sept. 2024).

**Stack retenue — 100 % pilotable par agents** (Vite + React + Three.js + Tauri). Voir `DECISIONS.md` D-015 pour le pivot depuis Unity.

**Status produit** :
- **V1** (production) — prototype HTML monolithique `stabilite-navire-v4.html` sur branche `master`. Conservé en archive référence pédagogique (moteur physique validé sur 14 cas numériques).
- **V2** (en cours) — refonte desktop/PWA sur branche `v2-web3d` (à créer). Objectif : 17 modules CMP, distribution via Tauri signé (Windows + macOS) + PWA web.

---

## Pourquoi pas Unity (historique)

Les docs initiaux (BUSINESS-PLAN / DECISIONS / SPEC-CMP datés 23/04/2026) visaient Unity 2022 LTS + Crest Ocean + Obi Fluid. Contrainte produit ajoutée le 24/04/2026 : **100 % du dev doit être réalisable par des agents LLM sans intervention manuelle en éditeur GUI**. Unity exige l'Editor (Scene View, Inspector, Prefab workflow) → autonomie agent plafonnée à 60-70 %. Décision : pivot vers stack **text-first + validation CLI headless** (cf. D-015).

---

## Stack V2

### Core
- **Vite** + **React 18** + **TypeScript strict** (`noImplicitAny`, `strictNullChecks`)
- **TailwindCSS** + **shadcn/ui** (composants UI)
- **Zustand** (state global simulation)
- **React Router** (navigation entre modules CMP)

### 3D / Rendu
- **Three.js r170+** (WebGPU quand dispo, fallback WebGL2)
- **@react-three/fiber** (R3F — scène déclarative React)
- **@react-three/drei** (helpers : Environment HDRI, instancing, controls, loaders)
- **@react-three/postprocessing** (Bloom, N8AO, DoF, ACES tone mapping)
- **@react-three/rapier** (physique WASM déterministe)
- **three-custom-shader-material** ou **TSL** (shaders — carène liquide, eau)

### Desktop / distribution
- **Tauri v2** (wrapping native Windows + macOS, remplace l'.exe Unity)
- **PWA** (offline, installable navigateur, cache Service Worker)
- Installer auto via `tauri-bundler` → `.msi` (Windows) + `.dmg` (macOS)

### Backend (optionnel, plus tard)
- **Supabase** (Postgres + Auth) si besoin stockage progression élève ou LMS intégration
- **FastAPI** si calcul lourd côté serveur (non requis V1)

### Assets pipeline
- **Blender 4.x** (CLI headless : `blender -b scene.blend -P script.py`) — modélisation navires, baking lightmaps, export glTF
- **gltf-transform** (CLI) — Draco + Meshopt compression
- **KTX2 + BasisU** — textures GPU-compressed
- **Poly Haven HDRI** (CC0) — éclairage studio via drei `<Environment>`

### Validation autonome (remplace l'œil humain)
- **Vitest** — tests unitaires (core physique, 14 scénarios numériques portés depuis V1)
- **Playwright** — E2E + visual regression (screenshots + pixelmatch/Chromatic)
- **Storybook + test-runner** — composants UI isolés
- **TypeScript `tsc --noEmit`** — validation types
- **Biome** — lint + format (plus rapide qu'ESLint+Prettier)
- **Lighthouse CI** — perf/a11y/SEO
- **axe-core** (via Playwright) — WCAG

### Licensing
- **RSA 4096 offline** (custom, zéro récurrent) — cf. D-006. Non modifié par le pivot.

---

## Architecture 3 couches

```
┌──────────────────────────────────────────────────────────────────┐
│  Couche 3 — Présentation (Vite + React + R3F + Tauri)           │
│  src/scenes/          — scènes 3D R3F par module                │
│  src/components/      — UI shadcn (panneaux, sliders, glossaire)│
│  src/hooks/           — hooks simulation (usePhys, useGZ)       │
│  src/stores/          — Zustand stores (sim state, UI state)    │
│  src-tauri/           — wrapper desktop natif                   │
└────────────────────────────────┬─────────────────────────────────┘
                                 │ import depuis /core
┌────────────────────────────────▼─────────────────────────────────┐
│  Couche 2 — Core physique (TypeScript pur, zéro dépendance UI)  │
│  src/core/profiles.ts        — ShipProfile (tanker, voilier...)  │
│  src/core/hydrostatics.ts    — computeB0, KB, BM, KMt, GMt      │
│  src/core/stability.ts       — GZ curves, GZmax, chavirement    │
│  src/core/freeSurface.ts     — carène liquide l³L/12            │
│  src/core/weights.ts         — embarquement, poids suspendu     │
│  src/core/__tests__/         — Vitest (14+ cas numériques)      │
│  TESTABLE EN CLI : vitest src/core                              │
└────────────────────────────────┬─────────────────────────────────┘
                                 │ import depuis /licensing
┌────────────────────────────────▼─────────────────────────────────┐
│  Couche 1 — Licensing (TypeScript, Node crypto / Web Crypto)    │
│  src/licensing/verify.ts     — vérif signature RSA              │
│  src/licensing/fingerprint.ts — hash machine (Tauri API natif)  │
│  src/licensing/features.ts   — flags modules activés            │
│  Indépendante, swappable                                        │
└──────────────────────────────────────────────────────────────────┘
```

**Règle absolue** : le core physique **ne connaît ni React ni Three.js**. Il ne manipule que des nombres et des structures. Chaque scène Unity/React lit le core et rend le résultat.

---

## Arborescence projet cible

```
ship-stability-simulator/
├── legacy/
│   └── stabilite-navire-v4.html     # V1 archive (renommé depuis racine)
├── src/
│   ├── core/                         # physique pure TS
│   ├── scenes/                       # scènes R3F par module CMP
│   ├── components/                   # UI shadcn
│   ├── hooks/
│   ├── stores/                       # Zustand
│   ├── licensing/
│   ├── lib/                          # utils
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/                        # wrapper Tauri v2
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
├── tests/
│   ├── e2e/                          # Playwright
│   └── visual/                       # screenshots référence
├── public/
│   ├── models/                       # .gltf navires
│   ├── textures/                     # KTX2
│   └── hdri/                         # .hdr Poly Haven
├── docs/
│   ├── SPEC-CMP.md                   # mapping référentiel
│   ├── BUSINESS-PLAN.md
│   └── DECISIONS.md
├── .github/workflows/                # CI
├── CLAUDE.md                         # CE FICHIER
├── TODO.md                           # roadmap
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── biome.json
└── tailwind.config.ts
```

---

## Key Paths

| Path | Rôle | Statut |
|------|------|--------|
| `legacy/stabilite-navire-v4.html` | V1 prototype HTML monolithique | ✅ archivé |
| `src/core/index.ts` | Barrel API publique du moteur physique | ✅ phase 1 |
| `src/core/types.ts` | Types fondamentaux (SimInputs, Hydrostatics, ShipProfile…) | ✅ phase 1 |
| `src/core/profiles.ts` | TANKER, SAILBOAT, BARGE (gold standard Cb=1) | ✅ phase 1 |
| `src/core/hydrostatics.ts` | KB, BM, KMt, GMt, computeB0 (500 bandes), envAngle | ✅ phase 1 |
| `src/core/stability.ts` | gzAt, gzPoints, gzAnalysis (GZmax, vanAngle, area) | ✅ phase 1 |
| `src/core/freeSurface.ts` | Carène liquide L·B³/(12·(n+1)²) + correction KG | ✅ phase 1 |
| `src/core/weights.ts` | Embarquement S4 + grutage suspendu + gîte d'équilibre | ✅ phase 1 |
| `src/core/imo.ts` | Critères A.749 §3.1.2 avec flag `applicable` | ✅ phase 1 |
| `src/core/simulation.ts` | Pipeline `computeSimState` bout-en-bout | ✅ phase 1 |
| `src/core/__tests__/` | 9 fichiers, 203 tests, coverage 99.55 % stmt | ✅ phase 1 |
| `src/scenes/S3_StabilityCore.tsx` | Scène centrale stabilité (couple P/π + Mt) | ⏳ phase 2 |
| `src/scenes/S11_FreeSurface.tsx` | Carène liquide (shader custom) | ⏳ phase 4 |
| `src/scenes/D5_Cranes.tsx` | Grues + chargement porte-conteneurs | ⏳ phase 5 |
| `src-tauri/tauri.conf.json` | Config desktop Tauri | ⏳ phase 8 |
| `src/licensing/verify.ts` | Vérif signature RSA offline | ⏳ phase 8 |

---

## Dev Commands (cibles — à câbler au fur et à mesure)

```bash
# Installation
pnpm install

# Dev local (Vite HMR)
pnpm dev

# Tests unitaires (core physique)
pnpm test                             # Vitest watch
pnpm test:run                         # one-shot CI
pnpm test:cov                         # coverage

# Tests E2E + visual regression
pnpm test:e2e                         # Playwright headless
pnpm test:visual                      # screenshots + diff

# Type check + lint
pnpm typecheck                        # tsc --noEmit
pnpm lint                             # Biome check
pnpm format                           # Biome format

# Build
pnpm build                            # PWA (output /dist)
pnpm tauri:build                      # .msi + .dmg (signing via CI)

# Asset pipeline
pnpm assets:optimize                  # gltf-transform + KTX2
```

### V1 legacy commands (encore valides)
- Ouvrir `stabilite-navire-v4.html` dans navigateur
- Vérifier syntaxe JS extrait : `node -e "..."` (cf. ancienne doc, commit `1142d7e`)

---

## Hardened Rules V2 (NE JAMAIS VIOLER)

| # | Règle | Raison |
|---|-------|--------|
| H1 | **Core physique zéro dépendance React/Three** | Testabilité CLI, portabilité future, séparation stricte |
| H2 | **TypeScript strict, jamais `any`** sans commentaire justificatif | Erreurs détectées au build, pas en prod |
| H3 | **Tous les calculs physiques → tests Vitest** (scénarios numériques comparés à valeurs attendues) | Le moteur est le moat. Pas de régression silencieuse |
| H4 | **Three.js : dispose() systématique** (geometries, materials, textures) OU utiliser drei qui le gère | Fuites mémoire sur les longues sessions |
| H5 | **Rapier : même `world` pour reproductibilité tests** (seed fixe) | Physique déterministe = tests validables |
| H6 | **Pas de logique métier dans les composants R3F** (ils consomment le core, ne calculent rien) | Respect couche 2/3 |
| H7 | **Assets binaires compressés** (glTF Draco + KTX2) jamais en source non compressée | Budget perf mobile/tablette centres |
| H8 | **Chaque feature pédagogique → référence §PDF dans un commentaire** (traçabilité conformité CMP) | Conformité référentielle = argument de vente |
| H9 | **Licensing RSA : clé privée JAMAIS committée** (secrets chiffrés dans CI) | Compromis = piratage trivial |
| H10 | **Visual regression tests avant merge** sur PR modifiant une scène | Garde-fou "ça ressemble toujours à ce qui était validé" |

---

## Validation autonome — le pattern

L'objectif du pivot est que **toute la boucle dev tourne sans intervention humaine** :

```
agent → édite code
      → pnpm typecheck && pnpm test:run && pnpm test:e2e
      → lit diff visual regression (PNG dans test-results/)
      → corrige ou commit
      → CI GitHub Actions valide → merge
```

**Ce qui remplace "l'œil" humain** :
- Nombres : Vitest compare `computeB0({...}) ≈ {bx: 0.12, by: 2.34}` à la valeur attendue
- Pixels : Playwright + pixelmatch compare screenshot à référence (seuil tolérance configurable)
- Comportement : Playwright scripte un parcours élève (clic slider KG → observe GZ curve) et assert sur le DOM

**Cas où l'humain reste nécessaire** (acceptés) :
- Validation esthétique finale avant release (feedback design)
- Validation pédagogique (centre pilote)
- Signing Apple Developer Program (compte physique)

---

## Profils navire (hérités V1, à porter TS)

| Profil | L | Cb | Status V1 | Status V2 |
|--------|---|----|-----------|-----------|
| Pétrolier MR2 | 174m | 0.85 | ✅ | ⏳ port |
| Voilier 12m | 12m | 0.48 | ✅ | ⏳ port |
| Porte-conteneurs | ~300m | 0.65 | ❌ | 🔴 critique V2 (grues D5 + carène liquide S11) |
| Vraquier | ~200m | 0.82 | ❌ | 🔴 critique V2 |
| Ferry / roulier | ~180m | 0.60 | ❌ | 🔴 critique V2 (cas emblématique carène liquide pont garage) |
| Yacht motor 30m | 30m | 0.45 | ❌ | 🟡 important (exemple hydrostatique référentiel p.51) |
| Pêche côtier | 15-25m | 0.55 | ❌ | 🟡 important |
| Barge parallélépipédique | 25m | 1.0 | ❌ | 🟢 nice-to-have (exemple calcul TE référentiel) |

Définition centralisée dans `src/core/profiles.ts`. Ajout d'un profil = 1 objet + 1 glTF dans `public/models/`.

---

## Bugs historiques V1 (contexte porting)

À garder en tête lors du portage TS pour ne pas reproduire :

| Bug V1 | Symptôme | Cause | Fix appliqué V1 |
|--------|----------|-------|-----------------|
| Courbe GZ invisible | Canvas GZ vide | `gzAnalysis()` créait cache `pts:null`, `gzPoints()` retournait ce null | Vérifier cache avant retour |
| BM = Infinity | NaN partout | TE=0 dans formule BM | Guard `TE > 0.01` → retourne 0 |
| NaN propagé | Rendu crashait | `computeB0` pas défensif | Guard `isFinite` + fallback `{bx:0, by:0.05}` |
| Cache invalidé chaque frame | Perf dégradée | Clés phys()/gzKey() pas unifiées | `_gzKey()` appelé en fin de `phys()` |
| Navire déforme au changement milieu | Taille change visuellement | Échelle basée sur `TEvis` (variable) | Échelle sur `S.TE` (slider, fixe) |

En V2, ces guards sont repris dans `src/core/*.ts` avec tests Vitest dédiés (test de non-régression).

---

## Git Workflow

- **Repo** : `github.com/Mickuits/ship-stability-simulator`
- **Branche `master`** : V1 HTML (archivée). Correctifs critiques V1 acceptés mais pas de nouvelle feature.
- **Branche `v2-web3d`** (à créer) : refonte V2. Future `main` au release V2.0.
- **Branches feature** : `feature/<nom>` puis PR vers `v2-web3d`.
- **Tags** : SemVer. V1 reste sur `v1.x.x`, V2 commence `v2.0.0-alpha.1`.
- **CI** : GitHub Actions — `typecheck + lint + vitest + playwright + tauri-build`. Obligatoire avant merge.
- **Commits** : Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- **Secrets** : certificats signing, clé RSA privée → GitHub Secrets chiffrés.

---

## Vérifications spécifiques (routine fin de session, étape 4 Git)

Avant chaque commit de fin de session :

**V1 (branche master, si modif du HTML legacy)** :
- [ ] Syntaxe JS OK (`node -e` sur script extrait)
- [ ] Pas de `console.log` oublié
- [ ] Pas de TODO/FIXME non résolu

**V2 (branche v2-web3d, dès qu'existante)** :
- [ ] `pnpm typecheck` passe
- [ ] `pnpm lint` passe
- [ ] `pnpm test:run` passe (tests core physique)
- [ ] `pnpm test:e2e` passe (si scènes modifiées)
- [ ] Visual regression : si diff > seuil, valider volontairement puis commit les nouveaux PNG de référence
- [ ] Pas de secret commité (clé RSA, cert signing)
- [ ] Pas de asset binaire lourd non compressé

---

## Notes aux sessions futures

- Le **référentiel CMP PDF** (`Description Construction Stabilité Sept 2024.pdf`, racine repo) est la **source de vérité pédagogique absolue**. Toute dérive terminologique = disqualification auprès des centres agréés. Voir SPEC-CMP.md § "Conformité référentielle — check-list qualité".
- Le **centre pilote** est déjà identifié (accord bêta gratuit contre témoignage — cf. BUSINESS-PLAN §5).
- **Budget one-shot V2** réduit vs Unity (pas de Crest 350 € ni Obi 150 € ni assets Unity Store 1000 € ni Apple Dev forced-to-pay avant signing desktop). Cf. BUSINESS-PLAN §4.4 amendé.
- Le modèle **licence perpétuelle offline zéro récurrent** reste intact. Tauri + PWA atteignent l'objectif "installer natif signé + utilisation hors ligne" identique à Unity build.
