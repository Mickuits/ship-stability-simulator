# Référentiel CMP — sources de conformité

> Note de source pour la conformité pédagogique du logiciel (cf. audit A3, DECISIONS.md D-017).
> **Dernière MAJ** : 10/06/2026.

---

## 1. Source primaire (libre, officielle) — à utiliser

La conformité du logiciel s'appuie sur le **référentiel national du Certificat de Matelot Pont (CMP)**, texte réglementaire public :

| Référence | Nature | Lien |
|-----------|--------|------|
| **Arrêté du 18 août 2015** relatif à la délivrance du certificat de matelot pont, du certificat de matelot de quart passerelle et du certificat de marin qualifié pont | Texte réglementaire (JORF) | [Légifrance JORFSCTA000031100355](https://www.legifrance.gouv.fr/loda/id/JORFSCTA000031100355) |
| **Annexe II** — référentiel de formation (contenu des modules) | Annexe pédagogique | Annexe de l'arrêté ci-dessus |
| **Annexes II & III** — référentiel d'évaluation CMP (01/09/2015) | Annexe pédagogique DGAMPA | [formations.mer.gouv.fr — PDF](https://formations.mer.gouv.fr/sites/default/files/2022-06/Certificats_matelot_Annexes_II_III_referentiel_evaluation_01_09_2015%20(1).pdf) |
| **Arrêté du 16 septembre 2020** (modification conditions d'admission CMP) | Texte modificatif | [Légifrance JORFTEXT000042345154](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042345154) |
| **RNCP24154** — fiche France Compétences du CMP | Fiche certification | [francecompetences.fr/recherche/rncp/24154](https://www.francecompetences.fr/recherche/rncp/24154/) |

### Module pédagogique cible

**Module P3 — Appui** : « Contrôle de l'exploitation du navire et assistance aux personnes à bord, entretien et réparation » (49 h). Thèmes :
1. Description et construction
2. **Stabilité** ← cœur du logiciel (S3, S11)
3. Sécurité
4. Entretien et réparation

Le périmètre V2.0 (S3 stabilité, S11 carène liquide, D1 anatomie, quiz) couvre les thèmes « Stabilité » et « Description et construction » de ce module.

---

## 2. Source interne uniquement (NE PAS citer, NE PAS reproduire)

Le polycopié **« Description Construction Stabilité Sept 2024 »** (Institut Maritime Esterel) présent à la racine du repo est une **œuvre protégée** appartenant à un centre de formation (prospect/concurrent potentiel). Sa validation DREETS ne le rend pas libre de droits.

**Règles d'usage (A3, non négociables)** :
- Utilisé **uniquement** comme check de cohérence pédagogique interne (vérifier qu'on n'oublie pas une notion attendue en CMP).
- **Jamais cité** dans le logiciel, la doc commerciale ou le marketing.
- **Jamais reproduit** verbatim (définitions, schémas, exercices).
- Toute définition affichée à l'utilisateur est **reformulée fidèlement au sens** à partir du référentiel national (§1) et de manuels libres (cf. §3), jamais copiée.

---

## 3. Manuels de référence physique (validation calculs)

Pour sourcer les valeurs de référence des tests (cf. règle de travail handoff §4.1) :
- **Barrass & Derrett**, *Ship Stability for Masters and Mates* — manuel de référence stabilité.
- **Tables hydrostatiques DELFTship** exportées par navire (∇, KB, BM, KMt, LCB, courbe KN/GZ) → collées dans `ship.json.reference`, servent de vérité de validation du moteur mesh-based (D-017 §2.4).
- Solutions analytiques fermées (barge, cylindre, prisme triangulaire) pour les tests géométriques exacts.

Aucune valeur « plausible » inventée dans un test : toute référence est sourcée (DELFTship export, solution analytique, ou manuel).
