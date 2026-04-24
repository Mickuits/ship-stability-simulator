# SPEC-CMP — Spécification fonctionnelle mappée au référentiel

> Mapping entre le **référentiel pédagogique CMP Module P3-Appui** (Institut Maritime Esterel, édition septembre 2024, 52 pages, auteurs Julien Luciano & Frédéric Niay) et les **features** du logiciel 3D à produire.
>
> Source : `Description Construction Stabilité Sept 2024.pdf` (agrément DREETS 93.83.0658883).
>
> Ce document est la **fondation pédagogique** du produit. Toute définition, formule ou nomenclature utilisée dans le logiciel doit être **strictement fidèle** au référentiel, sous peine de disqualification auprès des centres de formation agréés.
>
> **Note technique (24/04/2026)** : le contenu pédagogique ci-dessous est **indépendant du moteur**. Les mentions techniques Unity/Obi/Crest des versions initiales ont été révisées vers la stack Web 3D (Three.js + R3F + Tauri) — cf. `DECISIONS.md` D-015. Le cahier des charges pédagogique reste intact.

---

## Principes pédagogiques directeurs

| Principe | Implication produit |
|----------|--------------------|
| **Fidélité référentielle** | Les définitions, abréviations et formules du logiciel sont copiées mot-pour-mot du PDF. Aucune dérive terminologique. |
| **Progressivité** | Le logiciel suit l'ordre du référentiel : Description → Construction → Stabilité. Un élève ne peut pas sauter les notions prérequises. |
| **Visualisation 3D** | Tout concept abstrait (carène, métacentre, GZ, couple) est matérialisé par un objet 3D manipulable. |
| **Quantification** | Chaque démonstration affiche les valeurs numériques en temps réel (TE, GMt, GZ, MSIT). |
| **Examen blanc** | Le logiciel inclut un mode quiz/QCM pour préparer l'évaluation CMP. |

---

## PARTIE 1 — Description / Construction

### Module D1 — Définitions élémentaires (PDF §I)

**Objectif pédagogique** : maîtriser le vocabulaire de base de l'architecture navale.

**Concepts à visualiser en 3D** :
- Coque (monocoque, catamaran, trimaran) → 3 modèles commutables
- Œuvres vives (partie immergée, animée colorée bleu translucide)
- Œuvres mortes (partie émergée, colorée gris)
- Carène (mise en évidence des lignes de coque sous l'eau)
- Superstructures (timonerie, deck house)

**Livrables logiciel** :
- Scène 3D « Anatomie du navire » avec clic sur chaque partie → pop-up définition du PDF
- Coupe transparente animée montrant limite œuvres vives/mortes à différents tirants d'eau

### Module D2 — Matériaux de construction (PDF §II)

**Objectif** : connaître avantages/inconvénients de chaque matériau.

**Matériaux du référentiel** :
- Bois (bois massif, contreplaqué marine, bois moulé, strip-planking)
- Acier (densité 7,8) — corrosion, électrolyse
- Aluminium (densité 2,7) — vulnérabilité électrolyse
- Composites (polyester, vinylester, époxy + fibres verre/carbone/aramide)

**Livrables logiciel** :
- Tableau comparatif interactif (Poids / Prix / Entretien / Feu) — copie directe du PDF p.7
- Vue 3D « corrosion électrolytique » : animation de plaques de métal avec anode sacrificielle
- Module **« Les 2 maladies des métaux »** : corrosion vs électrolyse, schéma animé des électrons

### Module D3 — Construction de la coque acier (PDF §III)

**Objectif** : identifier les éléments de charpente et comprendre les 3 systèmes de construction.

**Éléments à modéliser en 3D** (pièce démontable/survolable) :

*Longitudinal* :
- Quille, étrave, brion, étambot, carlingue (centrale + latérales), lisses, hiloires

*Transversal* :
- Varangues, membrures, barrots, goussets, anguillet

*Ensemble* : **porque** = varangue + membrure + barrot

**Systèmes de construction** (3 scènes 3D) :
1. **Transversal** (navires < 120 m) — anneaux rapprochés
2. **Longitudinal** (grands navires, pétroliers, minéraliers) — lisses nombreuses
3. **Mixte** (fonds/pont longitudinal, murailles transversal)

**Livrables logiciel** :
- Éclaté 3D « exploded view » de la charpente — chaque pièce libellée conforme au PDF
- Toggle entre systèmes transversal/longitudinal/mixte
- Zoom sur double-fond, bouchain, presse-étoupe, tube d'étambot

### Module D4 — Compartimentage (PDF §IV)

**Objectif** : comprendre l'étanchéité, la flottabilité conservée, les bureaux de classification.

**Concepts 3D** :
- Cloisons étanches (dont cloison d'abordage)
- Cofferdam / maille sèche (espace entre deux cloisons)
- Double fond (combustible, eau)
- Ballasts (remplissage pour conserver stabilité en lège)
- Trou d'homme, dégagements d'air

**Livrables logiciel** :
- Coupe longitudinale animée avec scénario **« envahissement d'un compartiment »** (simulation du compartimentage en action)
- Bureaux de classification : liste BV / LR / ABS / RINA / DNV avec logos + rôle (règles, approbation, certificats)

### Module D5 — Équipements de pont (PDF §V)

**Objectif** : connaître vannes, pompes, grues.

**Types de vannes** (8 modèles 3D commutables) :
- Opercule, clapet, boule/boisseau sphérique, boisseau conique, papillon, guillotine, piston, électrovanne, 3 voies

**Types de pompes** (6 modèles) :
- Rotative, centrifuge, membrane, diaphragme, turbine (impeller), entraînement magnétique

**Appareils de manutention** (scène 3D interactive — **critique pour porte-conteneurs**) :
- Grue à flèche relevable
- Grue flèche télescopique
- Grue à flèche articulée
- Portique roulant
- Treuils, guindeaux, cabestans

**Livrables logiciel** :
- **Scénario « Déchargement porte-conteneurs »** — grue 3D animée, chargement/déchargement de conteneurs avec effet sur la stabilité en temps réel (poids suspendu → élévation virtuelle CG → perte GMt)
- Référence réglementaire : **Division 214** (règles manutention)

### Module D6 — Appareil propulsif (PDF §VI)

**Objectif** : comprendre la chaîne propulsive et les circuits moteurs.

**Éléments 3D** :
- Salle des machines (cathédrale, PC machine, échappées de secours)
- Moteur Diesel (lubrification, gasoil, air, eau mer, échappement, waterlock)
- Groupes électrogènes
- Inverseur + arbre d'hélice + pod
- Séparateurs, échangeurs, osmoseur, bouilleur
- Compresseurs d'air, circuit hydraulique (140-180 bars)

**Livrables logiciel** :
- Vue écorchée moteur Diesel animée (circuit huile rouge, gasoil jaune, eau mer bleue, air blanc)
- Schéma distribution électrique bord (un seul arbre)

---

## PARTIE 2 — Stabilité (cœur métier — priorité absolue)

### Module S1 — Rappel sur les forces (PDF §I stabilité)

**Concepts** :
- Force : direction, sens, intensité, point d'application
- Combinaison : addition, soustraction, annulation, parallélogramme
- Couple de forces : M = F × d (kg·m ou t·m)
- **Principe d'Archimède** : poussée π verticale bas→haut, appliquée au centre de carène B0, égale au poids du liquide déplacé
- Densité : `P = V × d` → `V = P / d`

**Livrables logiciel** :
- Démonstration interactive travelift → bateau mis à l'eau → lecture dynamomètre → poussée apparaît
- Slider densité (eau douce 1.0 → eau salée 1.025 → gas-oil 0.83 → mercure 13) → voir évolution du tirant d'eau
- Exemple du référentiel : **barge 25m × 4m, 100 t** → calcul TE dans gas-oil (1,204 m) vs eau douce (1 m)

### Module S2 — Géométrie du navire (PDF §II stabilité, définitions)

**Glossaire officiel à implémenter** (copié du référentiel) :

| Abréviation | Signification officielle PDF |
|-------------|------------------------------|
| B0 | Centre de carène |
| G | Centre de gravité du navire |
| GMT | Rayon métacentrique transversal |
| GML | Rayon métacentrique longitudinal |
| Θ | Angle de gîte |
| KB | Cote entre quille et centre de carène |
| KG | Cote entre quille et centre de gravité |
| KMT | Cote entre quille et métacentre transversal |
| LCB | Distance perpendiculaire arrière au centre de carène |
| LCG | Distance perpendiculaire arrière au centre de gravité |
| LCF | Distance perpendiculaire arrière au centre surface flottaison |

**Autres notions à visualiser** :
- Longueur hors tout (Lht / Loa)
- Largeur hors tout
- Creux (quille → pont)
- Ligne de flottaison, surface de flottaison
- Tirant d'eau (lège, pleine charge, **exposant de charge** = différence)
- Échelle des tirants d'eau (chiffres pairs 10 cm, lecture directe/interpolée)
- Assiette (ligne de quille vs horizontale)
- Gîte (vertical vs axe navire)
- Perpendiculaires avant/arrière

**Marques de franc-bord (LL 66)** — scène dédiée :
- Disque de Plimsoll + livet de pont
- Échelle de charge : TD, D, T, E, H, HAN (eau douce tropicale → hiver Atlantique Nord)
- Initiales bureau classification (BV, LR)

**Jauges** :
- Système UMS (Convention Londres 1969) : `GT = K × V` où `K = 0,2 + 0,02 × log10(V)`
- Exemple référentiel : V=10 000 → GT=2 800 UMS
- Jauge brute (GRT) vs jauge nette
- Seuils : 200, 500, 3000, 8000, 15000

**Déplacement** :
- Déplacement lège, en charge, port en lourd (deadweight)
- Relation : `Déplacement lège + Port en lourd = Déplacement en charge`

### Module S3 — Notions de stabilité (PDF §II.1) — **MODULE CENTRAL**

**Concept clé** : couple poids-poussée et métacentre.

**Démonstration 3D principale** (scène centrale du logiciel) :
- Navire en 3D, gîte pilotable au slider (0° → 90°)
- Affichage permanent de :
  - **P** (poids) appliqué au CG — flèche rouge descendante
  - **π** (poussée Archimède) appliquée au B0 — flèche bleue montante
  - Bo qui **suit un arc de cercle** quand gîte évolue
  - Axe de verticalité navire (pointillé) + direction de poussée
  - **Métacentre Mt** matérialisé au point d'intersection
  - Rayon métacentrique **r** (= B0→Mt)
  - Distance **r - a** = **GMt** (métacentre → centre de gravité)
  - Bras de levier **GZ** (bras de redressement) = GMt × sin(Θ) à petits angles
  - Couple de redressement visible (deux flèches opposées)

**Seuils pédagogiques du référentiel** :
- **GMt minimum ≈ 0,60 m** pour un navire d'une trentaine de mètres
- **MSIT** (Module de Stabilité Initial Transversal) = P × GMt

### Module S4 — Embarquement de poids (PDF §II.2)

**Scénarios 3D animés** (boutons narrativés) :

*Charges axiales* :
1. **Charge dans les fonds** : navire s'enfonce, G descend, B0 monte, GMt + P augmentent → **stabilité ↑↑**
2. **Charge au niveau de G** : navire s'enfonce, G stable, GMt inchangé, P augmente → **stabilité ↑ (peu)**
3. **Charge au-dessus de G** : navire s'enfonce, G monte, GMt diminue, P augmente → **stabilité ↓**

*Charges latérales* :
4. **Charge bâbord/tribord** : gîte vers le chargement. Au-dessus de G → G' monte → **stabilité ↓**
5. **Mouvement vertical d'un poids latéral** : affecte GMt (G se déplace verticalement)
6. **Mouvement horizontal** : crée gîte mais ne change pas GMt

**Cas particulier CRITIQUE — poids suspendu (grutage)** :
- Le poids suspendu s'applique **au point de suspente**, pas à sa position réelle
- G virtuel remonte → **stabilité diminue**
- Danger majeur lors de chargement grue sur pont
- Solution : arrimer (élinguer) pour supprimer l'effet

**Livrables logiciel** :
- Grue 3D + conteneur suspendu → visualisation du G virtuel en temps réel
- Slider hauteur de suspension → GMt diminue en direct
- Alarme visuelle si GMt < 0,15 m (dérivée critères IMO)

### Module S5 — Bilan positions centres (PDF §II.3)

**4 cas à visualiser** (scènes séparées) :

| Cas | Position G | Comportement | Usage |
|-----|-----------|--------------|-------|
| a | Sous Mt, au-dessus B0 | Stabilité normale | Cas général |
| b | Sous B0 | Redressement très fort/violent | Voiliers fortement lestés |
| c | Confondu avec Mt | Équilibre incertain (sphère/cylindre) | À proscrire |
| d | Au-dessus de Mt | Chavirement | À proscrire |

**Conclusion pédagogique (copiée PDF)** :
> *Pour une bonne stabilité transversale, placer le métacentre le plus haut possible (coque large — stabilité de forme) avec un centre de gravité très bas (stabilité de poids).*

### Module S6 — Cas particuliers (PDF §II.4)

**Givrage** (déjà dans v4 actuel, à porter 3D) :
- Hautes latitudes, blizzard + paquets de mer
- Amas de glace dans superstructures → alourdissement hauts → **G monte → stabilité ↓**
- Parade : briser la glace, déblayer le pont

**Livrable 3D** :
- Animation progressive de givre sur mât, rambardes, superstructures
- Slider épaisseur de givre → évolution temps réel de G, GMt, courbe GZ

### Module S7 — Grands angles de gîte (PDF §II.5) — **PHYSIQUE COMPLÈTE**

À grands angles, le métacentre **Mt devient Mt'** et tend à **descendre**.
- `r - a` devient `h - a` (< `r - a`)
- GZ diminue
- GZ = 0 quand Mt' = CG
- Couple chavirant quand Mt' passe sous CG

**Livrable logiciel** :
- **Courbe GZ complète** (0° → 180°, pas 0,5°) — déjà dans v4, à porter 3D
- Axe Y adaptatif
- Marqueurs : angle GZ max, angle chavirement
- **Critères IMO (section dédiée)** :
  - GZ ≥ 0,20 m à Θ ≥ 30°
  - Aire sous courbe 0-30° ≥ 0,055 m·rad
  - Aire sous courbe 0-40° ≥ 0,090 m·rad
  - Angle de GZ max ≥ 25°

### Module S8 — Essai de stabilité (PDF §II.6)

**Opération officielle à la mise à l'eau** avec poids calibrés.

**Livrable logiciel** — simulation d'essai virtuel :
- Navire 3D à la mise à l'eau
- Poids calibrés déplaçables transversalement
- Mesure automatique gîte, enfoncement, assiette
- Génération de **documents officiels** :
  - Tables hydrostatiques (exemple référentiel p.50 navire 29 m)
  - Courbe GZ à différents angles
  - Angle de chavirement
  - Plans de forme, échelles de charge, plan d'échouage

### Module S9 — Envahissement accidentel (PDF §II.7)

**Conséquences directes** :
- Flottabilité : navire s'enfonce
- Stabilité : gîte/assiette importantes, diminution stabilité transversale
- **Création carène(s) liquide(s)**

**Conséquences indirectes** :
- Perte moyens énergétiques (moteurs, barre, assèchement)

**Livrable logiciel** :
- Scénario animé : voie d'eau → envahissement compartiment → évolution réelle TE, gîte, GZ
- Comparatif avec / sans compartimentage

### Module S10 — Stabilité longitudinale (PDF §II.8)

Mêmes principes transversaux, métacentre **Ml** très haut.

**Livrable logiciel** :
- Scène dédiée stabilité longitudinale
- Effet chargement avant/arrière sur assiette
- Formules et valeurs Ml visibles

### Module S11 — Carène liquide (PDF §II.9) — **OBJECTIF MAJEUR PRODUIT**

**Formule officielle du référentiel** (à afficher dans le logiciel) :

```
Effet de carène liquide = (largeur³ × longueur) / 12
```

**Exemple PDF** : réservoir 4m × 3m → effet = 16 (soit `4³ × 3 / 12`).

**Propriété cubique** : diviser la largeur par 2 → effet divisé par 8.

**Formule de cloisonnement** : n cloisons longitudinales → perte stabilité divisée par **(n+1)²**.

**Concepts à visualiser** :
- Surface libre horizontale constante même en gîte
- Centre de gravité G du liquide se déplace sur arc de cercle (métacentre carène liquide)
- G fluide **Gf** (centre de gravité général navire décalé vers le haut)
- **MSIT diminué** → stabilité dégradée

**Livrable logiciel (feature hero)** :
- Réservoir 3D avec surface animée (**shader Three.js custom** — surface horizontale en world space, CFD non nécessaire pédagogiquement, cf. `DECISIONS.md` D-005 amendé)
- Slider largeur compartiment → visualisation effet cubique en direct
- Toggle cloisonnement (0, 1, 2, 3, 4 cloisons) → MSIT actualisé
- Cas pratique **ferry/roulier pont garage** (cité au référentiel : *« sensibles à ce problème car pont garage vaste et peu cloisonné »*)

---

## Features transverses

### Profils de navires (système `PROFILES` à étendre)

Le prototype HTML couvre déjà 2 profils (pétrolier MR2, voilier 12m). Pour le logiciel CMP :

| Profil | Usage pédagogique | Priorité |
|--------|-------------------|----------|
| Pétrolier (tanker) | Stabilité longitudinale, ballasts | ✅ existe v4 |
| Voilier | Stabilité de poids, lest profond | ✅ existe v4 |
| **Porte-conteneurs** | Grues de déchargement, carène liquide pont garage | 🔴 critique |
| **Cargo / vraquier** | Construction longitudinale, systèmes manutention | 🔴 critique |
| **Ferry / roulier** | Carène liquide pont garage (cas emblématique du référentiel) | 🔴 critique |
| **Yacht motor 30m** | Cas type CMP — courbes hydrostatiques exemple p.51 | 🟡 important |
| **Pêche côtier** | Cas fréquent formation matelot | 🟡 important |
| Barge parallélépipèdique | Exemple calcul TE du référentiel | 🟢 nice-to-have |

### Mode examen / quiz CMP

- QCM généré par module (D1 à S11)
- Banque de questions type examen DDTM
- Correction automatique avec renvoi au § PDF correspondant
- Chronomètre et score de passage (critère réussite : ≥ 60 %)

### Glossaire / aide-mémoire

- Barre latérale avec toutes les définitions PDF (recherche plein texte)
- Lien contextuel : cliquer sur « métacentre » dans n'importe quelle scène → pop-up définition

### Accessibilité / UX

- Mode jour/nuit
- Langue française (par défaut) + anglais (option — marché international)
- Raccourcis clavier pour démonstrations (prof devant classe)
- Export PDF rapport de session (scénarios joués, valeurs observées)

---

## Conformité référentielle — check-list qualité

Avant toute release, vérifier :

- [ ] Toutes les abréviations du glossaire PDF (B0, G, GMT, GML, Θ, KB, KG, KMT, LCB, LCG, LCF) sont utilisées **à l'identique**
- [ ] Formule MSIT `P × GMt` référencée dans le cours
- [ ] Formule carène liquide `l³ × L / 12` exacte
- [ ] Seuil GMt = 0,60 m (navire 30 m) cité
- [ ] Cloisonnement : perte divisée par `(n+1)²`
- [ ] Division 211 (stabilité intacte et après avarie) citée
- [ ] Division 214 (manutention) citée pour grues
- [ ] LL 66 citée pour marques franc-bord
- [ ] Convention Londres 1969 citée pour jauge UMS
- [ ] Bibliographie PDF reproduite dans "À propos" :
  - Architecture Navale (D. Paulet & D. Presles)
  - Statique du navire (Infomer)
  - Construction alu-acier-inox (G. Caroff)
  - Diesels marins 7e (Infomer)
  - Division 211

---

## Priorisation build (ordre recommandé)

1. **Sprint 1 — Portage moteur physique** : transposer `computeB0/phys/gzAnalysis` du HTML actuel vers C# avec tests unitaires (14 scénarios tanker + voilier déjà validés)
2. **Sprint 2 — POC R3F** : navire tanker (glTF low-poly) + mer (shader Gerstner) + UI Tailwind/shadcn, rejouer tous les scénarios v4
3. **Sprint 3 — Modules S1 à S7** (stabilité cœur) — **valeur pédagogique maximale** pour bêta
4. **Sprint 4 — Carène liquide 3D** (S11) — feature différenciante
5. **Sprint 5 — Grues & chargement** (D5, S4 poids suspendu) — porte-conteneurs
6. **Sprint 6 — Modules D1 à D6** (description/construction) — complétude référentielle
7. **Sprint 7 — Mode examen** + quiz
8. **Sprint 8 — Bêta centre pilote** — itérations retour
9. **Sprint 9 — Licensing, installer, signing, go-to-market**

**Objectif V1.0** : couverture 100 % des 11 modules stabilité + 6 modules construction, conforme référentiel CMP.

---

## Risques pédagogiques à surveiller

| Risque | Mitigation |
|--------|-----------|
| Dérive terminologique (ex. écrire « centre de poussée » au lieu de « centre de carène ») | Check-list conformité + revue par auteurs référentiel ou centre pilote |
| Formules simplifiées qui perdent la rigueur du référentiel | Double validation numérique + citation PDF dans tooltip |
| Scénarios 3D « spectaculaires » mais non pédagogiques | Chaque scénario doit viser un paragraphe précis du PDF (traçabilité §) |
| Concurrence avec simulateurs pro (Stabmaster, Seaworthy) | Positionnement : **outil pédagogique CMP**, pas de calcul pro → pas de conflit |

---

*Document à tenir à jour à chaque évolution du référentiel CMP. Prochaine révision prévue : à l'obtention du feedback centre pilote.*
