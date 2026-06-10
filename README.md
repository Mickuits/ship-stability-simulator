# Ship Stability Simulator

Outil pédagogique 3D pour l'enseignement du **CMP (Certificat Matelot Pont)**.
Licence perpétuelle B2B, desktop offline (Windows + macOS) + PWA.

---

## État

- **V1** (branche `master`) — prototype HTML monolithique sous `legacy/stabilite-navire-v4.html`. Archivé en référence UX/pédagogique (moteur box-hull, valide barge uniquement — non porté tel quel, cf. D-017).
- **V2** (branche `v2-web3d`) — refonte **Vite + React + Three.js + Tauri**. Moteur **hydrostatique générique basé maillage** validé contre tables DELFTship (D-017). Sprint 0 (conformité docs + bootstrap) en cours (cf. `TODO.md`).

---

## Docs racine

| Fichier | Rôle |
|---------|------|
| [`CLAUDE.md`](./CLAUDE.md) | Guide technique projet — stack, architecture 3 couches, hardened rules |
| [`TODO.md`](./TODO.md) | Roadmap V2 — 10 phases jusqu'à la 1re vente payante |
| [`DECISIONS.md`](./DECISIONS.md) | Journal des décisions d'architecture (ADR) |
| [`SPEC-CMP.md`](./SPEC-CMP.md) | Mapping exhaustif référentiel CMP → modules logiciel |
| [`BUSINESS-PLAN.md`](./BUSINESS-PLAN.md) | Modèle économique et go-to-market |

---

## Dev V2

Pré-requis : **Node 20+** et **pnpm 9** (activable via `corepack enable pnpm`).

```bash
pnpm install                 # install dépendances
pnpm dev                     # Vite HMR sur http://localhost:5173
pnpm typecheck               # tsc --noEmit (strict)
pnpm lint                    # Biome (lint + import order)
pnpm format                  # Biome format
pnpm test:run                # Vitest (core physique)
pnpm test:cov                # coverage
pnpm test:e2e:install        # install navigateurs Playwright (1re fois)
pnpm test:e2e                # Playwright
pnpm storybook               # Storybook sur http://localhost:6006
pnpm build                   # build PWA dans dist/
```

Voir `CLAUDE.md` §Dev Commands pour le détail.

---

## Architecture (rappel court)

Trois couches strictement séparées :

1. **Licensing** (`src/licensing/`) — RSA 4096 offline, indépendant.
2. **Core physique** (`src/core/`) — TypeScript pur, **zéro dépendance React/Three**. Testable CLI Vitest.
3. **Présentation** (`src/scenes/`, `src/components/`) — R3F + shadcn/ui, consomme le core.

Règle absolue (H1) : le core ne connaît ni React ni Three.js.

---

## Licence

Propriétaire — tous droits réservés. EULA V2.0 à définir avant Phase 10.
