# DECISIONS — Architecture & choix techniques

> Registre des décisions architecturales majeures du projet **Ship Stability Simulator** (refonte V2 Web 3D desktop — révisée 24/04/2026, cf. **D-015** pour le pivot Unity → Vite + React + Three.js + Tauri).
> Format : date, décision, contexte, alternatives, choix, conséquences.

---

## D-001 — Passage du HTML/Canvas 2D au 3D (stack desktop installable)

**Date** : 2026-04-23 (décision initiale) · **Amendé** : 2026-04-24 (cf. D-015)
**Statut** : ✅ Adopté (3D confirmée) · ⚠️ **moteur révisé** : Unity remplacé par Web 3D (Three.js + Tauri). Voir D-015.

**Contexte** :
Le prototype V4 (HTML monolithique ~2560 lignes, Canvas 2D) a prouvé la viabilité pédagogique. L'objectif V2 est de produire un **logiciel desktop installable, payant en licence perpétuelle, à destination des centres de formation CMP**. Le 2D ne permet ni la fidélité 3D demandée (mer réaliste, grues, porte-conteneurs, carène liquide volumétrique), ni la valeur perçue justifiant un prix B2B de plusieurs k€.

**Alternatives envisagées** :

| Option | Avantages | Inconvénients | Verdict |
|--------|-----------|---------------|---------|
| Continuer en HTML5 + Three.js / Babylon.js | Fait maison, zéro licence, portable | Perf insuffisante pour mer FFT + CFD carène liquide, pas d'installer natif facile, pas de DRM sérieux | ❌ |
| Unreal Engine 5 | Qualité graphique supérieure, Nanite/Lumen | C++, courbe d'apprentissage, build 10 Go, royalties 5% au-dessus de 1M$ brut | ❌ overkill |
| Godot 4 | Open source, gratuit, GDScript | Moins mature pour simulation fluide commerciale, écosystème assets limité, pas de plugin ocean reconnu | ❌ |
| **Unity 2022 LTS** (URP) | Ecosystem mature, C#, Crest Ocean disponible, multi-plateformes build natif, licence Personal gratuite | Pas de royalties tant que revenu < 200 k$/an, support long terme | ✅ **Choix** |

**Choix initial (23/04)** : Unity 2022 LTS (ou Unity 6 si stabilisé).

**Choix révisé (24/04)** : voir **D-015**. Contrainte produit ajoutée : le développement doit être 100 % réalisable par des agents LLM sans intervention manuelle dans un éditeur GUI. Unity plafonne l'autonomie agent à 60-70 % (Scene View, Inspector, Prefab workflow requis). La stack retenue devient **Vite + React + Three.js + Tauri v2** — même livrable utilisateur (.msi/.dmg signé, offline, licence perpétuelle) mais 100 % pilotable CLI.

**Conséquences (révisées)** :
- Code en **TypeScript** (pas de C#)
- Build natif Windows + macOS via **Tauri v2** (WebView natif + binaire Rust ~15 Mo overhead)
- Aucune royalty, aucune licence moteur payante
- Validation visuelle via Playwright + pixelmatch (CI headless)

---

## D-002 — Architecture 3 couches (Core physique / Présentation / Licensing)

**Date** : 2026-04-23 (décision initiale) · **Amendé** : 2026-04-24 (cf. D-015 — couche présentation migrée de Unity/C# vers React/TS)
**Statut** : ✅ Adopté (principe 3 couches inchangé, implémentations révisées)

**Contexte** :
Le moteur physique actuel (computeB0, phys, gzAnalysis) doit être portable, testable unitairement, et indépendant du moteur de rendu. La couche licence doit pouvoir être swappée sans toucher au core. La couche présentation ne doit faire que le rendu/UI.

**Architecture retenue** (révisée 24/04) :

```
┌────────────────────────────────────────────────────────────┐
│  Couche 3 — Présentation (Vite + React + R3F + Tauri)     │
│  - Scènes 3D R3F (stabilité, grue, carène liquide…)       │
│  - UI shadcn/ui (nav, tooltips, courbes GZ, glossaire)     │
│  - Shader Gerstner custom (mer), shader surface (carène)   │
│  - @react-three/postprocessing (Bloom, N8AO, ACES)         │
│  - @react-three/rapier (physique WASM)                     │
│  - Tauri v2 wrapper (Windows .msi + macOS .dmg signés)    │
└──────────────────────────────┬─────────────────────────────┘
                               │ import TypeScript
┌──────────────────────────────▼─────────────────────────────┐
│  Couche 2 — Core physique (TypeScript 5 strict, pur)      │
│  - ShipProfile (tanker, voilier, porte-conteneurs, ...)    │
│  - Hydrostatics (computeB0, KB, BM, KMt, GMt)             │
│  - StabilityAnalysis (GZ, GZmax, angle chavirement, MSIT) │
│  - FreeSurfaceCorrection (carène liquide l³L/12)          │
│  - WeightManager (embarquement, poids suspendu)           │
│  - TESTABLE CLI (Vitest, zéro dépendance React/Three)      │
└──────────────────────────────┬─────────────────────────────┘
                               │ import TypeScript
┌──────────────────────────────▼─────────────────────────────┐
│  Couche 1 — Licensing (TypeScript + Tauri API)            │
│  - RSA signature verification (offline license files)     │
│  - Machine fingerprint (via Tauri command natif)           │
│  - Grace period, expiry, features flags                   │
│  - INDÉPENDANTE : swappable                                │
└────────────────────────────────────────────────────────────┘
```

**Raison** :
- Le **Core** est le moat : calculs déterministes validables par tests, portabilité éventuelle vers mobile/web si futur pivot
- **Présentation** reste "bête" : elle visualise ce que le core calcule
- **Licensing** isolé permet de changer de provider sans migration douloureuse

**Conséquence** :
Chaque feature pédagogique se décompose en `[Scène R3F] → appelle → [Core API TS] → retourne → [Scène R3F rend]`. Les tests Vitest valident le core seul, les tests Playwright valident la scène globale en visual regression (CI 100 % headless).

---

## D-003 — Rendu mer (Crest Ocean → shader Three.js custom)

**Date** : 2026-04-23 (décision initiale) · **Amendé** : 2026-04-24 (cf. D-015)
**Statut** : ❌ **Obsolète depuis D-015**. Crest Ocean abandonné (Unity-only). Remplacé par shader custom Three.js / R3F.

**Contexte** :
Le projet demande une **simulation de la mer** réaliste. Unity n'a pas d'ocean shader digne de ce nom dans le core. Refaire l'océan from scratch (FFT, Gerstner, foam, wakes, buoyancy) représente 2-3 mois de dev pour un résultat inférieur.

**Alternatives** :

| Option | Prix | Verdict |
|--------|------|---------|
| **Crest Ocean System** (asset store, one-time) | ~350 € | ✅ Référence industrie, FFT, buoyancy, wakes, samples bateaux |
| CTS Ocean | ~50 € | Moins abouti, moins documenté |
| KWS Water System | ~70 € | URP only, bon pour lacs, moins pour haute mer |
| Coder from scratch | 0 € + 3 mois dev | ❌ Pas ROI |

**Choix initial (23/04)** : Crest Ocean (350 €).
**Choix révisé (24/04)** : **shader Three.js custom** — Gerstner waves + normal map animée + reflets HDRI.

**Raison du revirement** :
- Crest Ocean est un asset Unity, non utilisable hors Unity.
- Pour un contexte pédagogique CMP, un océan photoréaliste FFT n'est **pas nécessaire** : l'objectif est de voir un navire flotter avec une surface crédible, pas un simulateur maritime commercial.
- Écosystème R3F riche : `drei/Sky`, shaders Gerstner open source, post-processing bloom + tone mapping suffisent pour un rendu propre.
- Économie : **-350 €** one-shot.

**Conséquences** :
- Développement shader ~2-3 jours (vs 0 pour Crest)
- Aucune dépendance asset tiers
- Rendu ajustable entre "schéma pédagogique" et "photoréaliste léger" selon le module

---

## D-004 — Pipeline de rendu (URP → Three.js WebGL2/WebGPU)

**Date** : 2026-04-23 (décision initiale) · **Amendé** : 2026-04-24 (cf. D-015)
**Statut** : ❌ **Obsolète depuis D-015**. URP Unity abandonné. Rendu via **Three.js r170+** (WebGL2 par défaut, WebGPU automatique quand supporté).

**Contexte** :
Unity propose 3 pipelines : Built-in (legacy), URP (Universal Render Pipeline), HDRP (High Definition). Le choix impacte perf, visuel et compatibilité plugins.

**Choix (révisé)** : **Three.js r170+** via `@react-three/fiber` — WebGL2 fallback, WebGPU automatique.

**Raison** :
- Compatible hardware modeste (iGPU Intel, laptops standard, Apple Silicon) sans réglage spécifique
- WebGPU (Chrome 113+, Safari 18+) offre 5-10× perf potentielle, transition transparente
- Post-processing équivalent URP via `@react-three/postprocessing` (Bloom, N8AO, DoF, ACES tone mapping)
- Ecosystem R3F + drei : Environment HDRI, Instancing, ContactShadows — couvrent tous les besoins pédagogiques

**Conséquences** :
- Shaders via **TSL** (Three.js Shading Language, cross-API WebGL/WebGPU) ou `CustomShaderMaterial`
- Pas de Nanite/Lumen → asset budget polycount géré côté pipeline (Blender → Draco + Meshopt)
- Rendu cible : > 60 FPS sur iPad 2020+, > 30 FPS sur tablettes low-end

---

## D-005 — Carène liquide : shader custom Three.js (CFD non nécessaire)

**Date** : 2026-04-23 (décision initiale) · **Amendé** : 2026-04-24 (cf. D-015)
**Statut** : ✅ Adopté (choix renforcé : shader, pas de lib tierce)

**Contexte** :
La **carène liquide** (free surface effect) est une feature héro du produit. Le référentiel CMP impose de montrer :
- Surface libre horizontale malgré la gîte
- Déplacement du centre de gravité du liquide
- Effet de cloisonnement (formule `(n+1)²`)
- Cas ferry/roulier pont garage

Une vraie simulation CFD temps réel n'est pas nécessaire — il faut une **visualisation crédible** d'un fluide qui se déplace correctement lors d'inclinaisons.

**Options** :

| Option | Prix | Réalisme | Perf | Verdict |
|--------|------|----------|------|---------|
| **Obi Fluid** (asset store) | ~150 € | Élevé (particules SPH) | Moyen | ✅ candidat |
| Zibra Liquid (GPU grid-based) | ~200 € | Très élevé | Excellent GPU | ✅ candidat si GPU cible |
| Fake 2D procedural (shader) | 0 € | Moyen (visuel trompé mais convaincant) | Excellent | 🟡 MVP fallback |
| Custom CFD (Navier-Stokes simplifié) | 0 € + 1-2 mois | Élevé | Selon implémentation | ❌ hors scope V1 |

**Choix révisé (24/04)** : **shader Three.js custom** — surface forcée horizontale en world space, déplacement du centre de gravité du liquide calculé analytiquement par le core physique (formule `l³L/12`).

**Raison** :
- Rendu "plan d'eau qui reste horizontal" est **suffisant pédagogiquement** — l'objectif CMP est de comprendre que le centre de gravité du liquide se déplace, pas de simuler une CFD
- Équivalent en Three.js : un `PlaneGeometry` dans le repère monde (pas repère navire), avec shader pour animer la surface
- Obi Fluid (Unity) abandonné avec le pivot Unity → Web 3D
- Alternatives web (WebGL fluid sim genre PavelDoGreat) = démesurées et non nécessaires pédagogiquement
- Économie : **-150 €** one-shot (Obi Fluid)

**Conséquences** :
- 2-3 jours de dev shader
- Performance excellente (pas de simulation particules)
- Pédagogiquement équivalent : on voit la surface horizontale, on voit G se déplacer, on voit MSIT chuter

---

## D-006 — Licensing : RSA offline, développement custom

**Date** : 2026-04-23
**Statut** : ✅ Adopté

**Contexte** :
Contrainte utilisateur : **zéro abonnement récurrent**. Les solutions SaaS (Cryptolens, Keygen.sh, LicenseSpring) ont toutes un tier récurrent et nécessitent une connexion internet pour activation — inacceptable pour centres de formation offline.

**Alternatives** :

| Option | Coût récurrent | Offline | Verdict |
|--------|----------------|---------|---------|
| **Custom RSA signing offline** | 0 € | ✅ 100% | ✅ **Choix** |
| Keygen.sh self-hosted | 0 € | ✅ | ⚠️ Dev + infra à gérer |
| Cryptolens | 15-100 €/mois | ⚠️ Limité | ❌ récurrent |
| LicenseSpring | 30-200 €/mois | ✅ | ❌ récurrent |

**Architecture retenue** :

```
1. Génération clé privée/publique RSA 4096 bits (serveur de build)
2. Clé publique embarquée dans l'exécutable
3. Pour chaque vente :
   a. Récolte fingerprint machine du client (hash CPU+motherboard)
   b. Création d'un fichier license.dat contenant :
      - Nom client
      - Machine fingerprint
      - Date d'émission
      - Features activées (modules construction / stabilité / porte-conteneurs)
      - Signature RSA du tout avec la clé privée
   c. Livraison par email du license.dat
4. Au démarrage de l'app :
   - Lecture license.dat
   - Vérification signature avec la clé publique embarquée
   - Vérification fingerprint machine (tolère reformatage OS)
   - Si invalid → mode démo
```

**Conséquences** :
- Développement initial : ~1-2 semaines d'effort (génération, validation, UI d'activation)
- Piratage théoriquement possible (binaire patchable) mais **suffisant pour B2B institutionnel** (les centres agréés ne vont pas pirater un logiciel qu'ils utilisent légalement)
- Support : procédure de ré-émission de licence si changement de machine (email → nouveau fingerprint → nouveau license.dat)

**Outils à implémenter** :
- `LicenseGenerator.exe` (interne, pas distribué)
- `LicenseValidator.cs` (dans l'app client)

---

## D-007 — Installer (Inno Setup + DMG → tauri-bundler unifié)

**Date** : 2026-04-23 (décision initiale) · **Amendé** : 2026-04-24 (cf. D-015)
**Statut** : ❌ **Obsolète depuis D-015**. Remplacé par `tauri-bundler` (Windows `.msi` + macOS `.dmg`).

**Choix révisé (24/04)** : **`tauri-bundler`** (intégré à Tauri v2) — génère `.msi` Windows + `.dmg` macOS + `.deb`/`.rpm`/`.AppImage` Linux en une commande.

**Raison** :
- Unifié, CLI-only, intégré à la toolchain Tauri (aucun outil tiers à maintenir)
- Gère uninstall, raccourcis bureau, permissions, auto-update (via `tauri-plugin-updater`)
- Signing intégré (macOS `codesign` + notarization, Windows `signtool`)
- Zero Unity dépendance

**Conséquences** :
- Une seule commande `pnpm tauri:build` produit tous les installers
- Auto-update mode fallback offline : téléchargement du nouveau `.msi`/`.dmg` sans passer par un store

---

## D-008 — Code signing : progressif, budget minimal V1

**Date** : 2026-04-23
**Statut** : ✅ Adopté (révision V1.1)

**Contexte** :
Le code signing évite les alertes SmartScreen (Windows) et permet la distribution macOS (obligatoire depuis macOS 10.15+).

**Contrainte utilisateur** : zéro récurrent, mais certains coûts sont **incontournables**.

**Décision V1 (lancement)** :

| Plateforme | V1.0 | V1.1 (après 3-5 ventes) |
|-----------|------|-------------------------|
| Windows | **Non signé** (SmartScreen alerte) | Cert OV ~300 €/an |
| macOS | **Apple Developer Program** 99 $/an (impossible à éviter) + notarization | Idem |

**Raison** :
- SmartScreen Windows : on peut vivre sans signing en V1 (clic "exécuter quand même")
- macOS Catalina+ refuse totalement les apps non signées/notarizées → signing **obligatoire**
- 99 $/an Apple Developer Program = **500 €/an total récurrent maximum** après signing Windows — négligeable face à une vente de 5 k€

**Mitigation coût récurrent** : répercuter dans **"pack maintenance optionnel"** facturé au client (300-500 €/an pour correctifs + re-signing). Le client choisit.

---

## D-009 — Assets 3D (Unity Asset Store → glTF libres + Blender)

**Date** : 2026-04-23 (décision initiale) · **Amendé** : 2026-04-24 (cf. D-015)
**Statut** : ❌ **Obsolète depuis D-015**. Unity Asset Store abandonné. Pipeline : **glTF libres (Sketchfab CC0, Kenney, Poly Haven) + modélisation Blender CLI headless**.

**Décision révisée (24/04)** : pipeline glTF libres + modélisation Blender CLI si besoin spécifique.

**Sources prioritaires** :
- **Sketchfab** (filtrer CC0 / CC-BY) — banque énorme de navires, conteneurs, grues
- **Kenney.nl** — packs low-poly libres (CC0)
- **Poly Haven** (CC0) — HDRI + textures PBR + quelques modèles
- **Quaternius** (CC0) — assets low-poly stylisés

**Modélisation custom (quand assets libres insuffisants)** :
- **Blender 4.x** piloté en CLI headless : `blender -b -P script.py`
- Agents peuvent éditer les `.blend` en mode script Python (add_mesh, UV unwrap, export glTF)
- Retouche manuelle requise uniquement pour polish artistique final (non bloquant V1)

**Budget total révisé** : **0-300 €** one-shot (vs 500-1500 € Unity Asset Store) — économie **~1 000 €**.

**Optimisation pipeline** (scriptable CLI, 100 % agent) :
- `gltf-transform` : Draco + Meshopt compression, texture resampling
- `ktx-software` : conversion textures en KTX2 (BasisU)
- `npx @xeokit/gltf-compressor` alternative légère

---

## D-010 — Pricing : licence perpétuelle B2B site-license

**Date** : 2026-04-23
**Statut** : 🟡 Propositions à valider avec bêta testeurs

**Modèle retenu** : licence **perpétuelle** (pas d'abonnement), vendue au **centre de formation** (site license, pas au poste).

**Grille tarifaire proposée** (à affiner avec centre pilote) :

| Offre | Prix | Cible | Features |
|-------|------|-------|----------|
| **CMP Démo** | Gratuit | Candidats/particuliers | Module S3 (stabilité basique) seul, watermark |
| **CMP Élève** | 89 € | Élève individuel | Tous modules, usage personnel, 1 machine |
| **CMP Centre Basic** | 3 900 € | Centre formation, < 30 élèves/an | 5 postes, tous modules, support email |
| **CMP Centre Pro** | 6 900 € | Centre formation, 30+ élèves/an | 10 postes, tous modules, support prioritaire, personnalisation logo |
| **CMP École** | 12 900 € | ENSM, lycées maritimes | Illimité, intégration LMS, formation formateurs |
| **Pack maintenance** (optionnel) | +400 €/an | Tous paliers Centre | Correctifs, mise à jour référentiel, re-signing, support téléphone |

**Raison** :
- Marché centres CMP estimé 20-40 structures en France → ~100-200 k€ CA potentiel si 50 % pénétration
- Ecoles marine marchande (ENSM + 4 lycées) → ~50-80 k€ potentiel
- Ventes B2C à 89 € = marge faible mais acquisition top of funnel pour notoriété

**Conséquences** :
- Seuil de rentabilité : **1 vente Centre Pro = 6 900 €** couvre le budget initial (assets + Crest + signing)
- Pas de MRR donc pas de "SaaS valuation" — c'est un produit, pas une startup VC
- Effort de vente concentré, pas de churn à gérer

---

## D-011 — Déploiement : multi-seat via licences individuelles (pas de serveur central)

**Date** : 2026-04-23
**Statut** : ✅ Adopté

**Contexte** :
Les offres Centre (Basic 5 postes / Pro 10 postes) impliquent plusieurs installations. Deux approches :

| Option | Complexité | Verdict |
|--------|-----------|---------|
| Serveur licence local (LAN) | Élevée (dev serveur + maintenance client) | ❌ |
| **Licences individuelles émises à l'avance** | Faible | ✅ **Choix** |

**Choix** : pour un centre 5 postes, on émet **5 license.dat** distincts à l'achat. Le centre les déploie lui-même (ou on fournit support d'installation).

**Conséquences** :
- Zéro infrastructure côté client
- Si un poste tombe → réémission d'une licence (support payant ou inclus Pack Maintenance)
- Simple à comprendre pour le client (pas de serveur à gérer)

---

## D-012 — Langage et conventions (C# → TypeScript)

**Date** : 2026-04-23 (décision initiale) · **Amendé** : 2026-04-24 (cf. D-015)
**Statut** : ✅ Adopté (conventions révisées pour stack TS)

- **Langage** : **TypeScript 5.x strict** (`strict: true`, `noImplicitAny`, `strictNullChecks`)
- **Style** : conventions React/TS standard — `PascalCase` composants et types, `camelCase` variables/fonctions, `UPPER_SNAKE_CASE` constantes
- **Linting + format** : **Biome** (remplace ESLint + Prettier, 10× plus rapide, config unique `biome.json`)
- **Tests** : **Vitest** pour core physique (ciblage coverage > 90 % sur `src/core/`), **Playwright** pour E2E, **Storybook test-runner** pour composants UI
- **UI** : strings français par défaut, `react-i18next` pour préparer i18n anglais (V1.1+)
- **Commentaires** : français pour docstring métier (référence §PDF référentiel), anglais pour technique bas niveau
- **Commits** : Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)
- **Side-layer Rust** (Tauri v2 commands uniquement si nécessaire : fingerprint machine, file system access natif) — conventions Rust standard (`rustfmt`, `clippy`)

---

## D-013 — Roadmap / phasing

**Date** : 2026-04-23 (décision initiale) · **Amendé** : 2026-04-24 (cf. D-015 — phases sans Unity)
**Statut** : ✅ Adopté (indicatif, ajustable — voir `TODO.md` pour version courante)

**Phases prévues** :

| Phase | Durée estimée | Livrable | Critère sortie |
|-------|---------------|----------|----------------|
| 0. Cadrage | 1 sem | SPEC-CMP, DECISIONS, BUSINESS-PLAN | Docs validés utilisateur |
| 1. Core physique TypeScript | 2 sem | Lib portée depuis V4 + tests Vitest | 14 tests numériques passent |
| 2. POC R3F | 3 sem | 1 scène stabilité tanker + mer shader Gerstner + UI shadcn | Feature parity avec v4 sur stabilité |
| 3. Modules S1-S7 | 4 sem | Tous les modules stabilité cœur | Validation bêta centre pilote |
| 4. Carène liquide 3D | 2 sem | Module S11 avec visualisation fluide | Scénario ferry pont garage démontrable |
| 5. Grues + porte-conteneurs | 3 sem | Modules D5 + S4 poids suspendu | Scénario déchargement animé |
| 6. Modules construction D1-D6 | 4 sem | Complétude référentielle | Check-list SPEC-CMP à 100% |
| 7. Mode examen + quiz | 2 sem | QCM banque questions | Parcours examen complet |
| 8. Licensing + installer + signing | 2 sem | Build signé Windows + macOS | Installation propre sur 3 machines test |
| 9. Bêta centre pilote | 4 sem | Feedback collecté | Correctifs P0/P1 traités |
| 10. Go-to-market V1.0 | 2 sem | Site web, docs, pricing page | Première vente |

**Total estimé** : ~6 mois temps développeur plein temps.
**Temps partiel réaliste** : 9-12 mois calendaires.

---

## D-014 — Repository & workflow

**Date** : 2026-04-23 (décision initiale) · **Amendé** : 2026-04-24 (cf. D-015)
**Statut** : ✅ Adopté (branche V2 renommée)

- Repository : `github.com/Mickuits/ship-stability-simulator`
- **Branche `master`** : V1 HTML (v4), archive. Fichier à déplacer dans `legacy/`.
- **Branche `v2-web3d`** (renommée depuis `v2-unity`) : refonte V2. Future `main` au release V2.0.
- **Branches feature** : `feature/<nom>` puis PR vers `v2-web3d`.
- **Tags** : SemVer. V1 reste `v1.x.x`, V2 commence `v2.0.0-alpha.1`.
- **CI** : GitHub Actions — `typecheck + biome + vitest + playwright + tauri-build`. Obligatoire avant merge.
- **Secrets** : certificats signing (Apple Developer, Windows OV), clé RSA privée licensing → GitHub Secrets chiffrés. Jamais committés.

---

## D-015 — **PIVOT MAJEUR** : Unity → Web 3D (Vite + React + Three.js + Tauri)

**Date** : 2026-04-24
**Statut** : ✅ Adopté (décision structurante — invalide partiellement D-001, D-003, D-004, D-005, D-007, D-009, D-012)

**Contexte** :
Les décisions initiales (23/04/2026) retenaient Unity 2022 LTS comme moteur. Le lendemain, lors de la session 2, une **contrainte produit supplémentaire** a été posée par l'utilisateur : le développement doit être **100 % réalisable par des agents LLM** (Claude + sous-agents), sans intervention manuelle dans un éditeur GUI.

**Analyse du gap Unity** :
- Unity Editor (Scene View, Inspector, Prefab workflow, lighting baking, animation curves visuelles) = **obligatoire** pour un workflow classique
- Batch mode Unity (`Unity.exe -batchmode`) permet build + tests, mais pas layout/polish visuel
- Autonomie agent plafonnée à **60-70 %** sur Unity (le reste = humain en GUI)
- Inacceptable vu la contrainte produit

**Alternatives évaluées** :

| Stack | Livrable user | Autonomie agent | Rendu 3D pro | Perf mobile | Coût licences |
|-------|---------------|-----------------|--------------|-------------|---------------|
| **Unity 2022** (choix initial) | .exe/.dmg signés | 60-70 % | ⭐⭐⭐⭐ | ⭐⭐⭐ | 0 € (sous 200k$/an) |
| Unreal Engine 5 | .exe/.dmg | 40 % | ⭐⭐⭐⭐⭐ | ⭐⭐ | 5 % > 1M$ |
| Godot 4 | .exe/.dmg | 70 % | ⭐⭐⭐ | ⭐⭐⭐ | 0 € |
| **Vite + R3F + Tauri v2** | .msi/.dmg signés + PWA | **100 %** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 0 € |
| Next.js + R3F + Electron | .exe/.dmg | 100 % | ⭐⭐⭐⭐ | ⭐⭐⭐ | 0 € |

**Choix** : **Vite + React + TypeScript + Three.js (via @react-three/fiber) + Tauri v2**.

### Justification en 5 points

1. **Autonomie agent 100 %** : tout est texte (TS, TSX, JSON, YAML), tout est pilotable CLI. Validation visuelle via Playwright + pixelmatch (screenshots + diff pixel) remplace l'œil humain.
2. **Livrable utilisateur identique** : `.msi` Windows + `.dmg` macOS signés via `tauri-bundler`. Offline complet. Installer-style natif. Les centres de formation ne verront pas la différence vs Unity.
3. **Rendu 3D pro** : Three.js r170+ utilisé par Apple, Porsche, Ferrari, Louis Vuitton, Nike, Tesla — plafond visuel **très au-dessus** du besoin pédagogique CMP. PBR complet, post-processing (Bloom, ACES, N8AO, DoF), WebGPU optionnel.
4. **Perf supérieure sur cible** : tablettes/laptops centres formation = sweet spot web 3D. Bundle plus léger (Tauri ~15 Mo overhead vs Unity ~40 Mo). Startup plus rapide.
5. **Économie one-shot** : **-1 500 €** sur budget V1 (cf. détail BUSINESS-PLAN §4.4 amendé)
   - Crest Ocean : -350 €
   - Obi Fluid : -150 €
   - Unity Asset Store : -1 000 €
   - À la place : assets libres CC0 + modélisation Blender CLI si besoin

### Mapping complet des changements

| Domaine | Avant (Unity) | Après (Web 3D) |
|---------|---------------|----------------|
| Moteur rendu | Unity 2022 LTS URP | Three.js r170+ via R3F |
| Langage app | C# 10 | TypeScript 5 strict |
| Langage bas niveau | — | Rust (Tauri commands, opt) |
| Pipeline scène | Unity Scene/Prefab | JSX déclaratif R3F |
| Post-processing | Unity URP Volume | @react-three/postprocessing |
| Mer | Crest Ocean (350 €) | Shader custom Gerstner |
| Fluide (carène) | Obi Fluid (150 €) | Shader surface horizontale |
| Physique | Unity PhysX | Rapier WASM via @react-three/rapier |
| Assets | Unity Asset Store (1 000 €) | Sketchfab CC0 / Kenney / Blender CLI |
| Tests | xUnit C# | Vitest + Playwright + Storybook |
| Linting | Roslyn + StyleCop | Biome |
| Installer Windows | Inno Setup | tauri-bundler |
| Installer macOS | hdiutil DMG | tauri-bundler DMG |
| Code signing | Inno Setup + codesign | tauri-bundler (signtool + codesign intégrés) |
| Auto-update | Non prévu | tauri-plugin-updater |
| Runtime overhead | ~40 Mo | ~15 Mo (Tauri WebView natif) |
| CI | GH Actions (Unity Cloud) | GH Actions standard (Node + Rust) |
| Branche V2 | `v2-unity` | `v2-web3d` |

### Modèle business — inchangé

Le pivot est **100 % transparent côté client** :
- Licence perpétuelle offline : inchangée (RSA 4096 offline, cf. D-006)
- Distribution `.msi` + `.dmg` signés : inchangée (Tauri produit des installers natifs)
- Pas de SaaS, pas de dépendance internet : inchangée
- Positionnement CMP, grille tarifaire (3 900 € / 6 900 € / 12 900 €) : inchangés
- Centre pilote, cibles, projections financières : inchangés

**La seule conséquence business positive** : budget one-shot réduit de ~1 500 €, break-even atteint dès la 1re vente Centre Basic (idem initial, mais avec marge de sécurité accrue).

### Risques nouveaux + mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|-----------|
| Tauri v2 moins mature que Unity | Faible | Moyen | Tauri v2 stable depuis 2024, utilisé en prod par de grosses boîtes |
| Rendu Three.js inférieur à Unity AAA | Moyen | Faible | Non requis pour CMP (pédagogique). Rendu cible atteint par Apple/Porsche en R3F |
| Web 3D perçu comme "moins sérieux" qu'un vrai .exe | Faible | Faible | Tauri = .msi/.dmg signés natifs, identique à Unity côté utilisateur |
| Maintenance deps npm / Rust crates plus fréquente qu'Unity LTS | Moyen | Faible | Lockfile strict + renovate-bot en CI |
| Perf WebGL2 sur tablettes anciennes | Faible | Moyen | Cible minimale iPad 2020+ (documentée), budget polycount strict |

### Conséquences opérationnelles

- **Arborescence** refondue (voir CLAUDE.md §"Arborescence projet cible")
- **Docs amendés** : D-001, D-003, D-004, D-005, D-007, D-009, D-012, D-013, D-014 (références à Unity remplacées/marquées obsolètes)
- **TODO.md** réécrit (roadmap 10 phases adaptée)
- **BUSINESS-PLAN §4.4** révisé (coûts)
- **SPEC-CMP** mis à jour (mentions "Unity avec Obi Fluid" → "shader custom R3F")

---

## Décisions en attente

### ❓ Langue interface V1 — français uniquement ou bilingue ?
**Contexte** : le marché primaire est français (CMP délivré en France). L'anglais ouvre export (yacht crew international).
**À trancher** : privilégier français V1, i18n préparée structurellement, anglais V1.1 si demande.

### ❓ Mode mobile ou tablette tactile
**Contexte** : centres de formation utilisent parfois tablettes iPad/Android. La stack Web 3D est **déjà mobile-ready** (PWA installable sur tout navigateur, Tauri peut cibler iOS/Android en option).
**À trancher** : V1 = desktop Windows/macOS + PWA navigateur, Tauri iOS/Android = V1.1 si demande centres.

### ❓ Format distribution : DVD physique ou download ?
**Contexte** : certaines écoles publiques n'acceptent que du physique, d'autres bloquent les installations non auditées.
**À trancher** : télécharger + lien de backup DVD à la demande.

---

*Registre à mettre à jour à chaque décision majeure. Toute décision tech doit référencer le #D-xxx pour traçabilité.*
