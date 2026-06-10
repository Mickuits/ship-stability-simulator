# Conventions d'axes & unités (H13)

> Convention **unique et définitive** du moteur hydrostatique mesh-based (D-017). Documentée ici une seule fois, **jamais changée**. Tout asset non conforme est rejeté à l'import.
> **Dernière MAJ** : 10/06/2026.

---

## 1. Convention canonique du core (repère navire)

Le core physique (`src/core/`) raisonne dans un **repère navire orienté à droite (right-handed)**, aligné sur la convention DELFTship que Micka maîtrise pour l'export des carènes.

| Axe | Direction | Origine |
|-----|-----------|---------|
| **X** | vers l'**avant** (étrave), positif | perpendiculaire arrière (AP) |
| **Y** | vers **bâbord** (port), positif | plan longitudinal de symétrie |
| **Z** | vers le **haut**, positif | ligne de quille (baseline, quille → pont) |

**Origine** : intersection de la **perpendiculaire arrière** et de la **ligne de quille** (baseline). Soit le point `(X=0, Y=0, Z=0)` = AP × baseline.

**Unités** : **mètres** partout. Pas de pieds, pas de millimètres. Masses en **tonnes** (t), masse volumique en **t/m³** (eau de mer ρ = 1,025 t/m³).

### Vérification main-droite

X (avant) × Y (bâbord) = Z (haut). Repère right-handed cohérent. Vu de dessus (Z vers soi), X pointe vers l'avant et Y vers la gauche/bâbord — orientation standard architecture navale.

> ⚠️ Certaines sources documentent Y vers tribord (left-handed) ou X vers l'arrière. **On retient X-avant / Y-bâbord / Z-haut.** C'est la convention de CE projet, point final.

---

## 2. Repère DELFTship (source des assets de calcul)

DELFTship place l'origine à l'intersection **perpendiculaire arrière / baseline**, X le long de la quille, Z vertical depuis la quille, Y transversal (demi-largeur). C'est la convention §1 ci-dessus. Lors de l'export du maillage de calcul (`hull-calc.glb`), s'assurer que :
- la baseline (quille) est à `Z = 0` (déplacer le modèle en Z+ si nécessaire) ;
- l'AP est à `X = 0` ;
- le plan de symétrie est à `Y = 0`.

Sources : [DELFTship Forum — Coordinates of hull geometry points](https://forum.delftship.net/Public/topic/coordinates-of-hull-geometry-points/), [DELFTship Forum — Changing Position of Aft Perpendicular](https://forum.delftship.net/Public/topic/changing-position-of-aft-perpendicular/).

---

## 3. Repère glTF / Three.js (frontière de rendu)

Le format **glTF 2.0** (et Three.js) impose un repère **right-handed, +Y vers le haut, +Z vers le spectateur** (le modèle « regarde » −Z), unités mètres. Ce n'est **pas** le repère navire (qui a **Z** vers le haut, pas Y).

### Conséquence : un remap d'axes existe à DEUX frontières

1. **Import asset → core** (`src/core/geometry/mesh.ts`) : le maillage chargé depuis glTF est **transformé** vers le repère navire (§1) avant tout calcul. Le core ne manipule QUE des coordonnées navire (Z-up). Mapping fixe glTF→navire :

   | glTF (Y-up) | → navire (Z-up) |
   |-------------|-----------------|
   | `x_gltf` (droite) | `−y_nav` ou `y_nav` selon export — **fixé à l'import, testé** |
   | `y_gltf` (haut) | `z_nav` (haut) |
   | `z_gltf` (vers spectateur) | `x_nav` (avant) ou `−x_nav` — **fixé à l'import, testé** |

   > Le mapping exact dépend de l'orientation d'export DELFTship→glTF. Il est **figé dans `mesh.ts`, validé par un test** (`pnpm validate:ship` compare les hydrostatiques recalculées aux références DELFTship : un mauvais remap fait diverger ∇/KB → détection automatique). H14.

2. **Core → scène R3F** (`src/scenes/`) : la scène applique la rotation inverse pour afficher le navire correctement dans le monde Three.js Y-up. La logique métier reste en repère navire (H1 : le core ne connaît pas Three.js).

> **Règle pratique** : le maillage de calcul est la seule géométrie transformée vers le repère navire pour le calcul. Le maillage **visuel** (`hull-visual.glb`) reste dans le repère glTF natif et n'est utilisé que pour le rendu — il n'entre jamais dans le core.

---

## 4. Grandeurs hydrostatiques (rappel de notation)

| Symbole | Grandeur | Repère |
|---------|----------|--------|
| ∇ | volume de carène immergée (m³) | — |
| Δ | déplacement (t) = ρ·∇ | — |
| KB | hauteur du centre de carène B au-dessus de la quille | `Z_B` (m) |
| KG | hauteur du centre de gravité G au-dessus de la quille | `Z_G` (m) |
| BM | rayon métacentrique = I_t / ∇ | (m) |
| KMt | KB + BM | (m) |
| GMt | KMt − KG | (m) |
| LCB | position longitudinale de B | `X_B` (m, depuis AP) |
| TE | tirant d'eau | `Z` de la flottaison (m) |
| θ | gîte | rotation autour de **X** (axe avant) |
| trim | assiette | rotation autour de **Y** (axe bâbord) |

GZ(θ) est calculé par **méthode directe** depuis la position réelle de B à chaque angle, dans le repère navire — pas l'approximation GM·sinθ (réservée à l'overlay comparaison petits angles).
