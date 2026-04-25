/**
 * Embarquement et déplacement de poids — module pédagogique S4 (PDF §II.2).
 *
 * Modélise les 6 scénarios narratifs du référentiel CMP :
 *
 *   AXIAUX (1-3) :
 *     1. Charge dans les fonds   (kw < KG) → eKG ↓ → stabilité ↑↑
 *     2. Charge au niveau de G   (kw = KG) → eKG inchangé → stabilité ↑ (peu)
 *     3. Charge au-dessus de G   (kw > KG) → eKG ↑ → stabilité ↓
 *
 *   LATÉRAUX (4-6) :
 *     4. Charge bâbord/tribord   → TCG dévie → gîte d'équilibre
 *     5. Mouvement vertical d'un poids existant   → ΔKG = w·dz/M
 *     6. Mouvement horizontal d'un poids existant → ΔTCG = w·dy/M (KG inchangé)
 *
 *   CAS CRITIQUE — POIDS SUSPENDU (GRUTAGE) :
 *     Le poids suspendu s'applique **au point de suspente**, pas à sa position
 *     réelle. G virtuel remonte → stabilité diminue. Solution : élinguer.
 *
 * Réf. : §«Embarquement de poids» du référentiel CMP (Module P3-Appui).
 *
 * Conventions :
 * - Repère navire : origine en quille pour la verticale (+haut), axe de symétrie
 *   pour le transversal (+tribord).
 * - Toutes les longueurs en m, masses en tonnes.
 */

/** État massique du navire — masse totale + centres de gravité. */
export interface ShipMassState {
  /** Masse totale (tonnes, > 0). */
  readonly M: number;
  /** Centre de gravité vertical au-dessus de la quille (m). */
  readonly KG: number;
  /** Centre de gravité transversal — distance signée à l'axe de symétrie (m, +tribord). */
  readonly TCG: number;
}

/** Description d'un poids embarqué. */
export interface WeightAddition {
  /** Masse ajoutée (tonnes, > 0). */
  readonly w: number;
  /** Hauteur d'application au-dessus de la quille (m). */
  readonly kw: number;
  /** Distance transversale signée à l'axe de symétrie (m, +tribord). Défaut 0 (axial). */
  readonly tw?: number;
}

/**
 * Embarque un poids `w` à la position (kw, tw) en repère navire.
 *
 * Formule classique du barycentre :
 *   KG' = (M·KG + w·kw) / (M + w)
 *   TCG' = (M·TCG + w·tw) / (M + w)
 *
 * Couvre les scénarios narratifs **1, 2, 3 (axiaux)** et **4 (latéral)**.
 * Si `w ≤ 0` ou non fini, l'état d'origine est retourné inchangé.
 */
export function addWeight(state: ShipMassState, addition: WeightAddition): ShipMassState {
  if (!(state.M >= 0)) return state; // état dégénéré : préserver l'invariant amont
  if (!(addition.w > 0) || !Number.isFinite(addition.kw)) return state;
  const tw = addition.tw ?? 0;
  if (!Number.isFinite(tw)) return state;
  const newM = state.M + addition.w;
  if (newM <= 0) return state;
  return {
    M: newM,
    KG: (state.M * state.KG + addition.w * addition.kw) / newM,
    TCG: (state.M * state.TCG + addition.w * tw) / newM,
  };
}

/**
 * Déplacement vertical d'une masse `w` **déjà à bord**, de `dz` (m, +haut).
 *
 * Formule : ΔKG = w · dz / M  (la masse totale ne change pas).
 *
 * Couvre le scénario narratif **5 (mouvement vertical d'un poids latéral)**.
 */
export function shiftWeightVertical(state: ShipMassState, w: number, dz: number): ShipMassState {
  if (!(w > 0) || !Number.isFinite(dz) || state.M <= 0) return state;
  return {
    ...state,
    KG: state.KG + (w * dz) / state.M,
  };
}

/**
 * Déplacement horizontal d'une masse `w` **déjà à bord**, de `dy` (m, +tribord).
 *
 * Formule : ΔTCG = w · dy / M  (KG inchangé, masse inchangée).
 *
 * Couvre le scénario narratif **6 (mouvement horizontal — gîte induite, GMt inchangé)**.
 */
export function shiftWeightHorizontal(state: ShipMassState, w: number, dy: number): ShipMassState {
  if (!(w > 0) || !Number.isFinite(dy) || state.M <= 0) return state;
  return {
    ...state,
    TCG: state.TCG + (w * dy) / state.M,
  };
}

/**
 * Charge **suspendue à une grue** (cas critique du grutage).
 *
 * Le centre de gravité de la charge est virtuellement remonté au **point de
 * suspente** (`suspensionHeight`), indépendamment de la position physique de
 * la charge. Conséquence : G virtuel monte, GMt diminue, danger d'instabilité.
 *
 * Réf. : §«Cas particulier critique — poids suspendu (grutage)».
 *
 * @param state État massique courant.
 * @param w Masse de la charge suspendue (tonnes).
 * @param suspensionHeight Hauteur du point de suspente au-dessus de la quille (m).
 * @param tw Position transversale du point de suspente (m, +tribord). Défaut 0.
 */
export function suspendedLoad(
  state: ShipMassState,
  w: number,
  suspensionHeight: number,
  tw = 0,
): ShipMassState {
  return addWeight(state, { w, kw: suspensionHeight, tw });
}

/**
 * Rehaussement virtuel du KG dû à la suspension d'une charge à hauteur
 * `suspensionHeight` au lieu de sa hauteur réelle `kw`.
 *
 *   ΔKG_virtuel = w · (suspensionHeight − kw) / (M + w)
 *
 * Positif si la suspente est au-dessus de la position réelle (cas grutage
 * normal : flèche au-dessus du pont).
 */
export function virtualRiseFromSuspension(
  M: number,
  w: number,
  realHeight: number,
  suspensionHeight: number,
): number {
  if (!(w > 0) || !(M > 0)) return 0;
  if (!Number.isFinite(realHeight) || !Number.isFinite(suspensionHeight)) return 0;
  return (w * (suspensionHeight - realHeight)) / (M + w);
}

/**
 * Gîte d'équilibre statique (deg) induite par un déséquilibre transversal du CG.
 *
 *   tan(θ_eq) = TCG / GMt
 *
 * **Domaine de validité** : formule petite-gîte (linéarisée) uniquement valable
 * tant que `θ_eq < envAngle` (livet du pont hors de l'eau) ET tant que la coque
 * reste wall-sided à cet angle. Au-delà, la formule sous-estime (Mt' descend)
 * et ne remplace pas une intégration de la courbe GZ. La couche présentation
 * doit avertir l'utilisateur si `|θ_eq| > envAngle`.
 *
 * Réf. : §«Couple poids/poussée» — équilibre statique transversal.
 *
 * @param TCG Décalage transversal du CG (m).
 * @param GMt Hauteur métacentrique transversale (m, > 0 attendu).
 * @returns Angle d'équilibre signé en degrés. Retourne 0 si `GMt ≤ 0` (le
 *          navire ne trouve pas d'équilibre stable inclinable — bascule).
 */
export function equilibriumHeel(TCG: number, GMt: number): number {
  if (!(GMt > 0)) return 0;
  if (!Number.isFinite(TCG)) return 0;
  return (Math.atan(TCG / GMt) * 180) / Math.PI;
}
