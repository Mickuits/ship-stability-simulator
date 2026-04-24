# BUSINESS-PLAN — Ship Stability Simulator V2

> Plan d'affaires de la refonte V2 desktop (Tauri v2 + Web 3D), à destination des centres de formation maritime privés délivrant le **CMP (Certificat Matelot Pont)**.

**Date de rédaction** : 2026-04-23 · **Révisé** : 2026-04-24 (pivot Unity → Web 3D, cf. `DECISIONS.md` D-015)
**Auteur** : Micka (Prime Yachting)
**Horizon** : 3 ans (2026-2028)

---

## 1. Executive summary

**Produit** : Logiciel desktop 3D de simulation interactive de stabilité navale, aligné sur le **référentiel CMP Module P3-Appui** (Institut Maritime Esterel, édition sept. 2024).

**Forme de distribution** :
- Installer natif signé : `.msi` Windows + `.dmg` macOS (via Tauri v2)
- PWA (Progressive Web App) offline installable en complément — permet aussi le B2C rapide sans installer
- Build techno : Web 3D (TypeScript + Three.js via React Three Fiber) wrappée en binaire natif (Rust/Tauri) — expérience utilisateur finale identique à un .exe classique (cf. `DECISIONS.md` D-015)

**Promesse client** : *« L'outil pédagogique de référence pour enseigner la stabilité aux candidats CMP, conforme au référentiel officiel, fonctionnant offline, sans abonnement. »*

**Modèle économique** : **vente directe en licence perpétuelle**, pas de SaaS, pas d'abonnement obligatoire. Maintenance annuelle optionnelle.

**Cible primaire (Year 1-2)** : **centres de formation maritime privés** agréés pour délivrer le CMP (estimé 20-40 structures en France).

**Cible secondaire (Year 2-3)** :
- Écoles publiques (ENSM, lycées maritimes)
- Élèves individuels (B2C, acquisition funnel)
- Export francophone (Nouvelle-Calédonie, Polynésie, Maroc, Tunisie, Sénégal — marine marchande)

**Objectif chiffré Year 3** : **CA cumulé 120-200 k€** avec ~25-35 centres équipés.

---

## 2. Analyse du marché

### 2.1 Le référentiel CMP en France

Le **Certificat de Matelot Pont** est un titre obligatoire pour servir comme matelot à la passerelle sur les navires de commerce et yachts professionnels. Il est **délivré par les DDTM** (Directions Départementales des Territoires et de la Mer) via des **centres de formation agréés**.

**Référentiel de formation** :
- Module P3-Appui (Description / Construction / Stabilité) — **cible directe du produit**
- Autres modules (Sécurité, Navigation, Environnement) — hors scope V1

**Volume annuel France** : estimation 400-800 candidats CMP/an (données partielles DDTM publiques + structures privées).

### 2.2 Concurrence

| Acteur | Positionnement | Prix | Menace |
|--------|---------------|------|--------|
| **Polycopiés papier DDTM/centres** | Gratuit, référence officielle | 0 € | Pas un logiciel, pas un vrai concurrent |
| **Simulateurs pro** (StabMaster, Bassnet, Seaworthy) | Logiciels d'architecte naval | 5-50 k€ | Pas pédagogique, trop technique |
| **ECDIS / simulateurs bridge** | Environnements navigation complets | 20-200 k€ | Scope différent (navigation, pas stabilité) |
| **Simulateurs plate-forme IMO STCW** | Pour CoC officier, pas CMP | 50-100 k€ | Hors marché |
| **YouTube / vidéos pédagogiques** | Ad-hoc, gratuit | 0 € | Pas interactif |
| **Outils maison centres de formation** | Improvisés (Excel, Powerpoint) | 0 € | Qualité hétérogène |

**Insight clé** : **aucun concurrent direct** ne vise le segment « logiciel pédagogique interactif dédié CMP ». Le marché est un **green field** de niche, ce qui justifie :
- Prix premium (pas de benchmark concurrent bas)
- Défensibilité (niche trop petite pour attirer un gros acteur)

### 2.3 Taille du marché (TAM / SAM / SOM)

**TAM (Total Addressable Market)** — francophone global :
- France : ~30 centres privés + 4 lycées maritimes + ENSM = ~35 structures
- Nouvelle-Calédonie : ~2-3 structures
- Polynésie : ~1-2 structures
- Outremer (Réunion, Antilles, Guyane) : ~3-5 structures
- Maroc / Tunisie / Sénégal : ~10-20 structures CMP équivalent

→ **TAM ≈ 55-70 structures**

**SAM (Serviceable Available Market)** — centres réellement atteignables commercialement en 3 ans :
- Focus France métropole + DOM : ~40-45 structures

**SOM (Serviceable Obtainable Market)** — part réaliste capturable :
- Year 1 : 2-4 centres (bêta + early adopters)
- Year 2 : 8-12 centres
- Year 3 : 15-25 centres

**CA potentiel Year 3** : 15-25 centres × ~5-7 k€ moyen = **75-175 k€ CA cumulé**.
Ajout B2C (élèves) + maintenance = **~120-220 k€**.

### 2.4 Buyer persona

**"Jean-Marc, Directeur de centre de formation maritime privé"**
- 45-60 ans, ancien officier Marine Marchande ou pêche
- Dirige un centre de 30 à 80 élèves/an
- Budget pédagogique annuel : 5-20 k€
- Douleurs actuelles :
  - Cours magistral au tableau → faible engagement élèves
  - Polycopiés figés → concepts abstraits (métacentre, GZ) incompris
  - Pas d'outil moderne de démonstration
  - Concurrence entre centres agréés → cherche différenciation pédagogique
- Critères d'achat :
  - **Conformité référentielle absolue** (sinon agrément menacé)
  - Simplicité installation (pas d'IT dédié)
  - Prix prévisible (budget annuel)
  - Démonstration avant achat
  - Recommandation d'un pair
- **Ne veut PAS** :
  - Abonnement récurrent (budget public/associatif)
  - Dépendance internet
  - Formation à un outil complexe

### 2.5 Canaux d'acquisition

| Canal | Coût | Délai | Priorité |
|-------|------|-------|----------|
| **Bouche-à-oreille centre pilote** | 0 € | 6 mois | 🔴 P0 |
| **Démonstration physique** (salons, visites) | 1-3 k€/event | 3-12 mois | 🔴 P0 |
| **LinkedIn ciblé** (directeurs centres) | 500 €/mois ads | 3-6 mois | 🟡 P1 |
| **Site web SEO** ("simulation stabilité CMP", "outil pédagogique matelot pont") | Temps + 200 €/an hébergement | 6-12 mois | 🟡 P1 |
| **Partenariat syndicats** (AFCAN, FIM) | 0 € + relations | 6-12 mois | 🟢 P2 |
| **Salons maritimes** (Euromaritime, Nautic) | 3-8 k€ stand | 12 mois | 🟢 P2 |
| **Cold email/phone centres** | Temps | 1-3 mois | 🟡 P1 |

**Stratégie recommandée** : **bêta centre pilote** (bouche-à-oreille + études de cas) → **LinkedIn + cold outreach** → **salons et partenariats** Year 2+.

---

## 3. Positionnement & pricing

### 3.1 Proposition de valeur

*« Faites passer vos élèves CMP avec un outil visuel, interactif, 100 % conforme au référentiel, qui fonctionne offline et que vous achetez une bonne fois pour toutes. »*

**Arguments clés** :
1. **Conformité** : chaque définition alignée mot-pour-mot sur le PDF DDTM
2. **Licence unique** : pas de piège SaaS, pas de renouvellement forcé
3. **Offline** : pas de dépendance Wi-Fi, utilisable en salle ou à bord
4. **Installation simple** : .exe / .dmg, moins de 5 minutes
5. **3D interactive** : les concepts abstraits (métacentre, carène liquide) deviennent évidents

### 3.2 Grille tarifaire

| Offre | Prix TTC | Cible | Postes | Features | Maintenance annuelle (optionnelle) |
|-------|---------|-------|--------|----------|-----------------------------------|
| **Démo gratuite** | 0 € | Essai, acquisition | 1 | Module S3 seul, watermark | — |
| **CMP Élève** | 89 € | B2C | 1 | Tous modules, usage personnel | — |
| **CMP Centre Basic** | 3 900 € | Centres < 30 élèves/an | 5 | Tous modules + logo centre | +400 €/an |
| **CMP Centre Pro** | 6 900 € | Centres 30+ élèves/an | 10 | Tous modules + logo + personnalisation UI | +500 €/an |
| **CMP École** | 12 900 € | ENSM, lycées maritimes | Illimité | Tous modules + intégration LMS + formation formateurs | +800 €/an |
| **Packs additionnels** | — | — | — | — | — |
| Postes supplémentaires (au-delà du pack) | 400 €/poste | Centres | +1..+N | — | +50 €/poste/an |
| Pack extension profil navire (RoRo, sous-marin, …) | 900 €/profil | Tous | — | Profils additionnels hors référentiel CMP | — |
| Formation formateurs sur site | 1 500 €/jour | Centres/Écoles | — | Journée dédiée équipe pédagogique | — |
| Audit conformité référentielle DDTM (si évolution) | 800 € forfait | Tous | — | Mise à jour logiciel | — |

### 3.3 Justification pricing

**Point de vue centre de formation** :
- Budget pédagogique annuel ~8-15 k€
- 6 900 € pour 10 postes = 690 €/poste = amorti sur 5-10 ans = 70-140 €/poste/an
- Comparé à polycopiés (impression, mise à jour) ou instructeur temps perdu → **ROI évident**

**Point de vue économique projet** :
- Seuil de rentabilité : couverture 2 500 € budget initial + 500 €/an signing → **1 vente Centre Basic** suffit
- Marge brute élevée : pas de coût variable par vente (hors support)

### 3.4 Conditions commerciales

- **Paiement** : 100 % à la commande (pas de credit par défaut — renégociable B2B institutionnel)
- **Livraison** : 48-72 h après paiement (génération licences + email)
- **Garantie** : 1 an de correctifs offerts (bug fixes), puis Pack Maintenance optionnel
- **Mises à jour mineures (V2.1, V2.2)** : gratuites pour clients sous maintenance
- **Mise à jour majeure (V3.0)** : tarif upgrade 50 % du prix initial

---

## 4. Projections financières 3 ans

### 4.1 Scénario conservateur (base)

| Ligne | 2026 (Y1) | 2027 (Y2) | 2028 (Y3) | Total |
|-------|-----------|-----------|-----------|-------|
| **Ventes Centre Basic (3 900 €)** | 2 | 4 | 6 | 12 |
| **Ventes Centre Pro (6 900 €)** | 1 | 3 | 6 | 10 |
| **Ventes École (12 900 €)** | 0 | 1 | 2 | 3 |
| **Ventes B2C Élève (89 €)** | 10 | 40 | 80 | 130 |
| **CA ventes licences** | 15 590 € | 52 960 € | 90 970 € | **159 520 €** |
| **Maintenance (clients Y-1 × 450 € moy)** | 0 € | 1 350 € | 5 400 € | 6 750 € |
| **Formation / extensions (~10 %)** | 1 500 € | 5 500 € | 9 500 € | 16 500 € |
| **CA total** | **17 090 €** | **59 810 €** | **105 870 €** | **182 770 €** |

### 4.2 Scénario optimiste

| Ligne | 2026 | 2027 | 2028 | Total |
|-------|------|------|------|-------|
| Centres Basic | 4 | 8 | 12 | 24 |
| Centres Pro | 2 | 6 | 12 | 20 |
| Écoles | 1 | 2 | 3 | 6 |
| B2C | 30 | 120 | 250 | 400 |
| **CA ventes** | 46 270 € | 131 680 € | 230 250 € | **408 200 €** |

### 4.3 Scénario pessimiste

| Ligne | 2026 | 2027 | 2028 | Total |
|-------|------|------|------|-------|
| Centres Basic | 1 | 2 | 3 | 6 |
| Centres Pro | 0 | 1 | 2 | 3 |
| Écoles | 0 | 0 | 1 | 1 |
| B2C | 5 | 15 | 30 | 50 |
| **CA ventes** | 4 345 € | 17 235 € | 38 870 € | **60 450 €** |

### 4.4 Coûts (révisés 24/04/2026 — pivot Web 3D, cf. D-015)

**One-shot (Y1)** — **-1 500 € vs budget initial Unity** :
- ~~Crest Ocean : 350 €~~ → shader Three.js custom (0 €)
- ~~Obi Fluid : 150 €~~ → shader surface horizontale custom (0 €)
- ~~Assets Unity Store : 1 000 €~~ → glTF CC0 (Sketchfab / Kenney / Poly Haven) + Blender CLI si spécifique (0-300 €)
- Outils dev (Vite, React, Three.js, Tauri, GitHub Actions : tous open source) : 0 €
- Nom de domaine : 15 €
- Éventuels assets spécialisés (yacht 30m, ferry réaliste) : 0-200 €
- **Total one-shot : 0-500 €** (vs 1 500 € Unity)

**Récurrent annuel** (inchangé par le pivot) :
- Apple Developer Program : 99 $/an ≈ 90 € (obligatoire pour signing macOS)
- Cert Windows OV (à partir de Y1.1, après 3-5 ventes) : 300 €/an
- Hébergement site web : 100 €/an
- Nom de domaine : 15 €/an
- Email pro : 50 €/an
- **Total récurrent : ~555 €/an**

**Note marge de sécurité** : l'économie de 1 500 € couvre les frais récurrents des 2-3 premières années, renforçant la robustesse du modèle financier.

**Charges variables** :
- Temps support client : ~30 min / vente Centre
- Temps émission licence : ~5 min / vente

**Temps développement initial** :
- 6 mois temps-plein équivalent (réalité 9-12 mois temps partiel)
- Si valorisé à taux freelance 500 €/jour × 120 jours = **60 000 € valeur-temps** (hors poche si travail propre)

### 4.5 Seuil de rentabilité

- Coûts externes Y1 : ~2 000 €
- **Break-even** : 1 vente Centre Basic → atteint dès la 1re vente
- **Rentabilité réelle** (amortissement valeur-temps) : ~15-20 ventes Centre Pro cumulées

---

## 5. Stratégie commerciale Year 1

### Phase 1 — Bêta pilote (Mois 1-6)

**Objectif** : valider le produit avec 1 centre partenaire avant lancement commercial.

**Plan** :
1. Identifier centre partenaire (déjà confirmé par utilisateur ✅)
2. Accord bêta : **licence Centre Pro gratuite à vie** en échange de retours détaillés + témoignage + recommandation
3. Déploiement sur 2-3 postes du centre
4. Sessions d'observation pédagogique (suivre 1 promo CMP complète)
5. Itérations logiciel selon feedback
6. Collecte métriques : temps de compréhension des concepts, taux de réussite examen, satisfaction élèves
7. Production **étude de cas** / livre blanc : *« Comment [Centre X] a amélioré son taux de réussite CMP de +X% avec le simulateur »*

### Phase 2 — Early adopters (Mois 6-12)

**Objectif** : 3-5 premiers clients payants.

**Plan** :
1. Listing exhaustif des centres agréés CMP (via DDTM, sites publics)
2. Email/LinkedIn personnalisé aux directeurs (script préparé par agent mkt-sales-outreach)
3. Démo live (visio ou visite physique pour top-prospects)
4. Offre **lancement** : -20 % pour les 5 premiers achats documentés publiquement (témoignage + logo)
5. Présence à 1 événement maritime régional (salon, rencontre AFCAN…)

### Phase 3 — Expansion (Year 2-3)

**Objectif** : couverture nationale + export DOM-TOM + francophone.

**Plan** :
1. Programme de référencement : -10 % sur prochaine vente au centre qui recommande (marque d'affaires)
2. Partenariat syndicat / fédération centres (AFCAN, UMEP)
3. Versions sectorielles : pêche, yachting commercial, marine marchande
4. i18n anglais → marché yachting international (Antibes, Monaco, Palma)
5. Prospection Maroc / Tunisie / Sénégal via réseaux francophones

---

## 6. Risques & mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|-----------|
| Centre pilote insatisfait, pas de témoignage utilisable | Faible | Fort | Itération rapprochée bêta + contrat engagement mutuel |
| Concurrence inattendue (gros acteur EdTech maritime) | Faible | Fort | Vitesse d'exécution + niche + relationnel bâti |
| Référentiel CMP évolue et logiciel devient obsolète | Moyenne | Moyen | Audit annuel + Pack Maintenance inclut mise à jour référentielle |
| Piratage de licences | Moyenne | Faible | B2B institutionnel = risque faible. Watermark + fingerprint suffisent |
| Marché trop petit en France (plateau à 15 centres) | Moyenne | Moyen | Expansion francophone + pivot produits adjacents (autres certifs) |
| ~~Unity change de politique licence~~ | — | — | ✅ Neutralisé par pivot Web 3D (D-015) — plus aucune dépendance moteur propriétaire |
| Coûts récurrents (Apple Dev + signing) dépassent | Faible | Faible | Répercutés dans Pack Maintenance client |
| Abandon utilisateur (problèmes perso, temps) | Moyenne | Fort | Documentation rigoureuse (DECISIONS.md, SPEC-CMP.md) pour reprise facile |

---

## 7. Jalons & KPIs

### Jalons Year 1

- [ ] M+1 : SPEC-CMP, DECISIONS, BUSINESS-PLAN validés
- [ ] M+2 : Core physique C# portée + tests passent
- [ ] M+4 : POC R3F scène stabilité + mer (shader Gerstner custom)
- [ ] M+6 : Modules S1-S7 opérationnels → bêta centre pilote
- [ ] M+8 : Modules S11 (carène) + D5 (grues) → scénario porte-conteneurs
- [ ] M+10 : V1.0 complète, licensing + installer signés
- [ ] M+11 : Site web, pricing page, premier lead
- [ ] M+12 : **1re vente payante**

### KPIs suivis

**Produit** :
- Nombre de modules implémentés (objectif 17/17 V1.0)
- Tests unitaires passants (objectif 100 %)
- Feedback bêta : NPS > 50

**Commercial** :
- Leads générés / mois
- Taux conversion lead → démo
- Taux conversion démo → vente
- Cycle de vente moyen (objectif < 6 semaines)
- Ticket moyen

**Financier** :
- CA mensuel / trimestriel
- Ventes cumulées par offre
- Marge brute (objectif > 90 %)
- Trésorerie (pas de dette, autofinancé)

---

## 8. Structuration juridique & fiscalité

### 8.1 Cadre proposé

- **Structure** : vente via **SASU Prime Yachting** (existante)
  - Alternative : créer filiale dédiée « Prime Education » si volume justifie séparation
- **Régime TVA** : TVA 20 % France métropole, règles export pour DOM-TOM (TGC en NC, non-TVA)
- **Régime IS** : standard SASU, rémunération gérant arbitrable

### 8.2 Points de vigilance fiscale

- **CIR / CII** (Crédit Impôt Recherche / Innovation) : envisageable sur développement logiciel original — à valider avec expert-comptable Y1
- **JEI** (Jeune Entreprise Innovante) : si moins de 11 ans et >15 % R&D, exonérations charges sociales — probablement non applicable ici
- **TGC Nouvelle-Calédonie** : ventes en NC = régime TGC (à confirmer selon chiffre)
- **Facturation transfrontalière** : EU reverse charge, hors EU TVA à 0 %

**Action** : demander validation agent `fin-fiscalite-juridique` au lancement commercial.

### 8.3 Propriété intellectuelle

- **Code source** : copyright auteur (Micka), pas de licence open source (produit propriétaire)
- **Dépôt INPI** : nom de marque « Ship Stability Simulator » ou équivalent à déposer (~300 €)
- **Licence utilisateur final (EULA)** à rédiger (template standard adapté)
- **Assets tiers** (glTF CC0 Sketchfab/Kenney/Poly Haven, libs npm MIT/Apache, Rapier Apache 2.0) : licences respectées, liste tenue à jour dans `THIRD-PARTY.md`

**Action** : demander validation agent `strat-ip-protection` Y1.

---

## 9. Recommandations immédiates (révisées 24/04)

1. **Valider le cadrage avec le centre partenaire** (avant tout dev) — s'assurer que le mapping SPEC-CMP colle à leur cours concret
2. **Démarrer le portage core physique en TypeScript** (2 semaines, autonome, testable via Vitest)
3. ~~Acheter Crest Ocean~~ → **Implémenter shader Gerstner Three.js custom** (2-3 jours, 0 €)
4. **Bootstrap projet Vite + R3F + Tauri** (structure `src/core` + `src/scenes` + `src-tauri`)
5. **Réserver le nom de domaine** et une version maintenue du site
6. **Identifier 5-10 cibles commerciales prioritaires** pour prospection Month 8+

---

## 10. Questions stratégiques ouvertes

À trancher avant mois 3 :
- [ ] Nom commercial du produit (pas forcément "Ship Stability Simulator" — trop technique)
- [ ] Logo / identité visuelle
- [ ] Site web : Next.js maison (stack Micka) ou Carrd/Webflow rapide
- [ ] Produits d'appel gratuits (vidéos YouTube, webinaire) pour top of funnel
- [ ] Partenariat auteurs référentiel (Luciano / Niay — Institut Maritime Esterel) : co-signature possible ? Cela décuplerait la crédibilité

---

*Document à réviser tous les trimestres. Metrics à suivre dans Notion / Monday.*
