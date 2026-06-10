# HANDOFF — Ship Stability Simulator V2 : Audit + Pivot D-016 + Plan d'exécution

> **Document de transfert pour Claude Code** — session de reprise du projet `github.com/Mickuits/ship-stability-simulator`.
> Rédigé le 10/06/2026 suite à un audit complet du repo (code V1, DECISIONS.md, CLAUDE.md, SPEC-CMP.md, BUSINESS-PLAN.md, TODO.md).
> Ce document est la **source de vérité de la session** : il prime sur le TODO.md actuel (obsolète) et amende le CLAUDE.md du repo. À l'issue du Sprint 0, son contenu doit être intégré dans les docs du repo et ce fichier archivé dans `docs/`.

---

## 0. Décision produit (prise par Micka, ne pas rediscuter)

Le projet est **prioritaire** car directement commercialisable (CA court terme vs autres projets).

**Vision produit clarifiée** : un véritable simulateur de stabilité navale pour centres de formation maritime (CMP), avec :

1. **Moteur hydrostatique générique basé maillage** (pas de formules barge hardcodées) — voir D-016 ci-dessous.
2. **Extensibilité navires par assets** : ajouter un nouveau navire = ajouter un pack d'assets (maillages + JSON), **zéro modification du moteur physique**. C'est Micka (l'éditeur) qui intègre les navires, pas l'utilisateur final. Pas de modeleur de coque utilisateur.
3. **Qualité commerciale** : rendu 3D immersif et beau (océan, éclairage PBR, post-processing), UI moderne et ergonomique, fluidité 60 FPS, niveau de finition justifiant un pricing B2B 3 900–12 900 €.
4. La stack **Vite + React + TypeScript strict + Three.js (R3F) + Tauri v2** est **confirmée** (D-015 maintenu). Elle permet le niveau visé. Le problème du projet n'était pas la stack mais l'absence d'exécution et les défauts du moteur physique V1.

---

## 1. Résultats de l'audit (10/06/2026) — à corriger

### 🔴 A1 — Les « 14 cas numériques validés » n'existent pas dans le repo
La claim est répétée dans CLAUDE.md, TODO.md, DECISIONS.md comme fondement du « moat physique ». Aucun fichier de test, aucune valeur de référence, aucune trace dans le repo.
**Action** : ne plus jamais référencer cette validation. La remplacer par le protocole de validation DELFTship (§3.4). Purger la mention des docs.

### 🔴 A2 — Moteur physique V1 quantitativement faux hors barge
Analyse de `legacy/stabilite-navire-v4.html` :
- `computeB0()` intègre une **section rectangulaire** (barge wall-sided) alors que le rendu dessine bouchains et coques en V → incohérence physique/visuel.
- `KB = TE × 0.5` : exact pour une barge uniquement. Faux pour le voilier (Cb 0.48).
- `BM = B²/(12·TE·Cb)` : inertie de flottaison rectangulaire pleine (Cw=1 implicite) → BM surestimé ~40-50 % sur le voilier.
- Carène liquide hardcodée « 2 citernes de largeur B/2 », tanker uniquement. Non généralisable.
**Action** : le V1 reste une archive de référence UX/pédagogique. **Aucune formule physique V1 n'est portée telle quelle en V2.** Le moteur V2 est refondé (D-016).

### 🔴 A3 — Risque juridique référentiel
SPEC-CMP.md impose des définitions « copiées mot-pour-mot » du PDF de l'Institut Maritime Esterel. Ce polycopié est une œuvre protégée appartenant à un centre de formation (prospect/concurrent potentiel). Validation DREETS ≠ libre de droits.
**Action** :
- Récupérer le **référentiel national CMP** (arrêté relatif à la délivrance du certificat de matelot pont, Légifrance + annexes pédagogiques DGAMPA) comme source de conformité primaire.
- **Reformuler** toutes les définitions/formulations dans le logiciel (paraphrase fidèle au sens, jamais verbatim du polycopié).
- Le PDF Esterel devient un **check de cohérence pédagogique interne uniquement** (jamais cité, jamais reproduit).
- Amender SPEC-CMP.md : remplacer « copiées mot-pour-mot » par « conformes au référentiel national, reformulées ».

### 🟠 A4 — Dogme « 100 % agents » incompatible avec l'objectif esthétique
Pixelmatch/Playwright valident la non-régression, pas la beauté. **Amendement** : les agents exécutent tout le code ; **Micka valide visuellement à chaque fin de sprint** (screenshots/build). Prévoir des points de revue design explicites dans la roadmap. Mettre à jour la section « Validation autonome » du CLAUDE.md en conséquence.

### 🟠 A5 — Rapier sans cas d'usage défini
**Règle** : Rapier (@react-three/rapier) est **cosmétique uniquement** (balancement de charge sous grue, animations secondaires). Il n'est **jamais** la source d'une valeur affichée (GZ, GM, TE, gîte d'équilibre…). Seul le core hydrostatique fait foi. Ajouter cette règle aux Hardened Rules (H11).

### 🟠 A6 — Code V1 non réutilisable
2 594 lignes monolithiques, variables 1-2 caractères, état global mutable. Le « port TS » de la roadmap est en réalité une **réécriture**. Valeur récupérable : leçons des 5 bugs historiques (guards NaN/Infinity, invalidation cache — voir CLAUDE.md §Bugs historiques), structure UX des panneaux, et la banque de profils comme inspiration de presets.

### 🟡 A7 — Périmètre V2.0 resserré
17 modules = irréaliste en time-to-market. **Périmètre V2.0 vendable** (à confirmer avec Micka en début de session) :
- **S3** Stabilité cœur (GZ, GM, couple de redressement, criteria IMO)
- **S11** Carène liquide (cas ferry pont garage = démonstrateur emblématique)
- **D1** Anatomie du navire (œuvres vives/mortes, vocabulaire)
- **Mode quiz/QCM** basique
- 3 navires : tanker MR2, voilier 12 m, ferry/roulier
Le reste (D2-D6, S autres, porte-conteneurs/grues) passe en V2.1+.

---

## 2. D-016 — Moteur hydrostatique générique basé maillage (NOUVELLE DÉCISION STRUCTURANTE)

> À transcrire formellement dans `DECISIONS.md` (format D-xxx existant : date 2026-06-10, contexte, alternatives, choix, conséquences). Invalide partiellement la Phase 1 du TODO.md (qui prévoyait le port des formules barge V1).

### 2.1 Principe
Le navire est une **donnée**, le moteur est **unique et générique** :

```
assets/ships/<nom-navire>/
├── hull-calc.glb        # maillage de carène ÉTANCHE (watertight manifold),
│                        # basse résolution (~2-5k tris), géométrie de CALCUL
├── hull-visual.glb      # maillage haute qualité (rendu : superstructures,
│                        # détails, textures) — jamais utilisé pour le calcul
├── tanks/<tank>.glb     # volumes internes des capacités (carène liquide),
│                        # maillages étanches également
└── ship.json            # masse lège, KG lège, position des capacités,
│                        # bornes sliders, métadonnées pédagogiques,
│                        # hydrostatiques de référence (validation)
```

### 2.2 Algorithmes du core (TypeScript pur, zéro dépendance React/Three — règle H1 maintenue)
1. **Coupe du maillage par le plan de flottaison** pour tout triplet (tirant d'eau, gîte θ, assiette) → volume immergé ∇, centre de carène B(θ), aire de flottaison, inerties de flottaison (It, Il).
2. **GZ(θ) par méthode directe** : bras de levier calculé depuis la position réelle de B à chaque angle (pas l'approximation métacentrique GZ = GM·sinθ, qui n'est affichée que comme comparaison pédagogique petits angles). Valable grands angles, pont immergé, formes quelconques.
3. **Équilibre** : recherche du tirant d'eau d'équilibre par itération (Δ = ρ·∇) ; gîte d'équilibre par annulation du moment.
4. **Carène liquide générique** : les tanks sont des maillages → même algorithme de coupe au niveau de remplissage courant → position réelle du CG du liquide + correction de surface libre exacte. Supprime tout hardcodé.
5. **Critères IMO** (A.749/IS Code) calculés sur la courbe GZ réelle : GZ≥0,20 m à 30°, aires 0-30°/0-40°/30-40°, angle de GZmax, GM initial ≥ 0,15 m.

Implémentation : clipping triangle/plan classique + sommation des contributions volumiques (théorème de la divergence) ; précalcul de la courbe GZ par pas de 1° avec cache invalidé par clé de paramètres (reprendre la leçon du bug cache V1). Si besoin de perf : BVH, mais probablement inutile à 2-5k triangles.

### 2.3 Conventions assets (NON NÉGOCIABLES — à inscrire en Hardened Rules)
- **H12** : maillage de calcul **étanche** (watertight, manifold, normales sortantes cohérentes). Test automatique d'étanchéité à l'import (somme des volumes signés, edges non-manifold = rejet).
- **H13** : convention unique — unités **mètres**, origine à l'intersection perpendiculaire arrière / ligne de quille, X vers l'avant, Y bâbord, Z vers le haut (ou convention équivalente documentée UNE fois et jamais changée). Tout asset non conforme est rejeté à l'import.
- **H14** : chaque navire entre dans le repo **avec ses hydrostatiques de référence** dans `ship.json` (voir §3.4) et le test Vitest associé. Pas de référence = pas de merge.

### 2.4 Pipeline d'intégration d'un nouveau navire (workflow Micka)
1. Sourcer/modéliser le visuel (Sketchfab CC0, Blender) → `hull-visual.glb`.
2. Modéliser ou importer la carène de calcul dans **DELFTship** (Micka maîtrise) → export maillage étanche → `hull-calc.glb` (+ nettoyage Blender CLI si besoin).
3. Exporter les **tables hydrostatiques DELFTship** (∇, KB, BM, KMt, LCB à plusieurs tirants d'eau ; courbe KN/GZ si dispo) → coller dans `ship.json.reference`.
4. Lancer `pnpm validate:ship <nom>` → le moteur recalcule et compare (tolérance ±2 % sur ∇/KB/KMt, ±3 % sur GZ aux angles clés). Vert = navire intégrable.

### 2.5 Conséquences
- Phase 1 (core) passe de 2 à **3-4 semaines**, tests inclus. En échange, navires n°3 à n+ = quelques jours d'assets chacun, zéro dev moteur.
- Le moat devient réel : un moteur hydrostatique mesh-based **validé contre DELFTship** est difficilement copiable, contrairement à des formules de barge.
- Résout A2 (cohérence physique/visuel : on peut afficher la carène de calcul en overlay translucide sur le visuel), A5 (une seule source de vérité physique) et A1 (validation enfin réelle et reproductible).

---

## 3. Plan d'exécution (sprints Claude Code)

### Sprint 0 — Mise en conformité documentaire + bootstrap (1 session)
- [ ] Transcrire **D-016** dans `DECISIONS.md` (avec amendements explicites : Phase 1 du D-013, sections concernées de SPEC-CMP).
- [ ] Amender `CLAUDE.md` : moteur mesh-based, Hardened Rules H11-H14, validation design humaine (A4), pipeline assets, arborescence (`assets/ships/`, `src/core/geometry/`, `src/core/hydrostatics/`).
- [ ] Purger toutes les mentions « 14 cas numériques validés » (A1) ; corriger SPEC-CMP « mot-pour-mot » → « reformulé conforme au référentiel national » (A3).
- [ ] Réécrire `TODO.md` sur le périmètre V2.0 resserré (A7) après confirmation de Micka.
- [ ] Créer branche `v2-web3d` ; init **Vite + React 18 + TS strict + Tailwind + shadcn/ui + Biome + Vitest + Playwright** ; CI GitHub Actions (typecheck + lint + test) ; README pointeurs.
- [ ] Rechercher le référentiel national CMP (Légifrance/DGAMPA), l'archiver dans `docs/referentiel/` avec note de source (A3).

### Sprint 1 — Core géométrie + hydrostatiques (3-4 semaines, le cœur du produit)
- [ ] `src/core/geometry/` : chargeur glTF → structure de maillage interne (positions, indices) ; tests d'étanchéité/manifold ; volume signé.
- [ ] `src/core/geometry/clip.ts` : coupe maillage/plan, calcul ∇, centroïde immergé, aire et inerties de flottaison.
- [ ] `src/core/hydrostatics/` : équilibre (TE pour Δ donné), KB/BM/KMt/GMt, GZ(θ) direct, courbe précalculée + cache.
- [ ] `src/core/tanks.ts` : carène liquide mesh-based (CG liquide réel + correction surface libre).
- [ ] `src/core/imo.ts` : critères sur courbe GZ réelle.
- [ ] **Cas de validation** : commencer par 3 géométries analytiques (barge parallélépipédique, cylindre, prisme triangulaire — solutions exactes calculables à la main) PUIS les 3 navires V2.0 contre tables DELFTship (§2.4). Coverage cible > 90 % sur `src/core/`.
- [ ] `pnpm validate:ship` (script CLI).

### Sprint 2 — POC visuel « go/no-go esthétique » (2-3 semaines)
- [ ] Une seule scène (tanker) poussée au **niveau de qualité commercial cible** : océan Gerstner + HDRI + ACES + Bloom/N8AO, navire visual + overlay carène de calcul, mouvement de gîte fluide, courbe GZ live (Recharts ou canvas custom), panneau paramètres shadcn.
- [ ] **Revue visuelle Micka** = critère de sortie. Itérer jusqu'à validation. C'est le go/no-go avant d'industrialiser les modules.

### Sprint 3+ — Modules V2.0 (S3 complet, S11 ferry, D1, quiz), puis licensing/Tauri/signing selon roadmap existante (D-013 phases 7-10 inchangées).

---

## 4. Règles de travail pour cette session (rappel des principes Micka)

1. **Vérification primaire** : toute valeur de référence physique doit être sourcée (DELFTship export, solution analytique, manuel type Barrass & Derrett *Ship Stability for Masters and Mates*). Jamais de valeur « plausible » inventée dans un test.
2. **Claims dérivées vs vérifiées** : étiqueter explicitement. Si un calcul n'a pas encore son test de référence, il est marqué `// UNVERIFIED` et listé en fin de session.
3. **First principles** : en cas de doute sur une formule, redériver depuis Archimède/géométrie plutôt que copier le V1 (cf. A2).
4. **Sorties action-ready** : fin de session = code qui compile, tests verts, commit conventional, TODO.md à jour, liste des points nécessitant validation Micka (design, périmètre, juridique).
5. **Pas de sur-promesse documentaire** : on ne documente que ce qui existe et tourne. L'écart doc/exécution était le défaut n°1 du projet.

---

## 5. Checklist de démarrage immédiat (premier message à Claude Code)

```
Lis HANDOFF-CLAUDE-CODE.md à la racine du repo, puis CLAUDE.md, DECISIONS.md,
TODO.md. Exécute le Sprint 0 dans l'ordre. Confirme avec moi uniquement :
(1) le périmètre V2.0 resserré (§1-A7), (2) la convention d'axes retenue (§2.3-H13).
Tout le reste est décidé. Commence.
```
