/**
 * Types fondamentaux du core physique.
 *
 * Conventions :
 * - Repère navire : origine au centre de la flottaison, x+ = tribord, y+ = vers la quille (bas).
 * - Repère monde : idem mais après rotation de la gîte.
 * - Longueurs en mètres, masses en tonnes, angles en degrés (sauf indication contraire).
 * - Densités en t/m³ (eau de mer ≈ 1.025, eau douce = 1.000).
 */

/** Plage de valeurs pour un slider de profil navire. */
export interface SliderRange {
  readonly min: number;
  readonly max: number;
  readonly step: number;
  /** Valeur par défaut (sert aussi à construire SimInputs par défaut). */
  readonly def: number;
}

/** Disposition des citernes — détermine la formule de carène liquide. */
export type TankLayout = "none" | "single" | "double" | "triple";

/**
 * Profil physique d'un navire. Uniquement les paramètres de physique/géométrie,
 * sans les paramètres visuels (bilge, bridge, keel rendering, etc.) qui vivent
 * dans la couche présentation.
 */
export interface ShipProfile {
  /** Identifiant stable (clef de dictionnaire). */
  readonly id: string;
  /** Libellé affiché. */
  readonly name: string;
  /** Longueur hors tout (m). */
  readonly L: number;
  /** Coefficient de block (adimensionnel, 0 < Cb ≤ 1). */
  readonly Cb: number;
  /** Plages autorisées pour les sliders. */
  readonly B: SliderRange;
  readonly D: SliderRange;
  readonly TE: SliderRange;
  readonly KG: SliderRange;
  /** Hauteur du centre de masse de la glace au-dessus du pont (m). */
  readonly icingHeight: number;
  /** Présence de citernes (pour carène liquide). */
  readonly hasTanks: boolean;
  /** Disposition des citernes. */
  readonly tankLayout: TankLayout;
  /** Quille (voilier) — TE fixé par la quille, non modifiable en live. */
  readonly hasKeel: boolean;
  /** Mât (voilier) — influe sur l'altitude d'application de la glace. */
  readonly hasMast: boolean;
  /**
   * Densité du liquide transporté dans les citernes (t/m³) — utilisée pour
   * la correction de carène liquide. Exemples :
   * - Tanker pétrolier : 0.85 (cru léger)
   * - Chimiquier eau douce / ballast : 1.0
   * - Vraquier (sans citernes) : valeur nominale 1.0, ignorée si `hasTanks=false`.
   */
  readonly cargoDensity: number;
}

/** Entrées éditables de la simulation (sliders). */
export interface SimInputs {
  /** Largeur au maître (m). */
  readonly B: number;
  /** Hauteur du pont au-dessus de la quille (m). */
  readonly D: number;
  /** Tirant d'eau (m) — valeur slider, distincte du TE effectif calculé. */
  readonly TE: number;
  /** Position verticale du centre de gravité structural (m, depuis la quille). */
  readonly KG: number;
  /** Angle de gîte (deg, positif = tribord). */
  readonly heel: number;
  /**
   * Taux de remplissage des citernes pour correction de carène liquide.
   * **Contrat** : doit être dans [0, 1] ; `computeHydrostatics` applique un clamp
   * défensif pour tolérer un bruit UI, mais la couche présentation doit
   * garantir la plage pour éviter toute surprise de traçabilité.
   */
  readonly fsRatio: number;
  /** Masse de glace sur les superstructures (tonnes, ≥ 0). */
  readonly ic: number;
  /** Densité de l'eau ambiante (t/m³, > 0 attendu). */
  readonly rho: number;
}

/** Position du centre de carène B' en repères navire et monde. */
export interface BuoyancyCenter {
  /** Repère navire — x (transversal). */
  readonly bx: number;
  /** Repère navire — y (vertical, +bas). */
  readonly by: number;
  /** Repère monde — x (après rotation de la gîte). */
  readonly wx: number;
  /** Repère monde — y (après rotation de la gîte). */
  readonly wy: number;
}

/** Grandeurs hydrostatiques dérivées des inputs + profil. */
export interface Hydrostatics {
  /** TE effectif après ajustement masse/densité (m). */
  readonly TEeff: number;
  /** Hauteur du centre de carène au-dessus de la quille (m). */
  readonly KB: number;
  /** Rayon métacentrique transversal (m). */
  readonly BM: number;
  /** Hauteur du métacentre transversal (m). */
  readonly KMt: number;
  /** KG effectif — inclut givrage et correction carène liquide (m). */
  readonly eKG: number;
  /** Hauteur métacentrique GMt = KMt − eKG (m). Stabilité initiale. */
  readonly GMt: number;
  /** Déplacement (tonnes). */
  readonly disp: number;
  /** Moment de redressement (kN·m) à l'angle courant. */
  readonly mom: number;
  /** Angle d'envahissement (deg) — livet du pont au niveau de l'eau. */
  readonly envAngle: number;
}

/** État complet de la simulation à un instant donné (snapshot immuable). */
export interface SimState {
  readonly inputs: SimInputs;
  readonly hydro: Hydrostatics;
  readonly b0: BuoyancyCenter;
  /** Bras de levier de redressement à l'angle courant (m). */
  readonly GZ: number;
}

/** Point sur la courbe GZ (angle en deg, bras de levier en m). */
export interface GzPoint {
  readonly a: number;
  readonly g: number;
}

/** Analyse de la courbe GZ — critères de stabilité. */
export interface GzAnalysis {
  /** Vrai si GZ(1°), GZ(2°) et GZ(3°) sont tous > 0. */
  readonly stableAtStart: boolean;
  /** Bras de levier maximum (m) — 0 si instable dès le départ. */
  readonly gzMax: number;
  /** Angle où GZmax est atteint (deg) — 0 si instable. */
  readonly gzMaxAngle: number;
  /** Angle de chavirement (deg) — 0 si instable dès le départ. */
  readonly vanAngle: number;
  /** Aire sous la courbe GZ positive (rad·m) — stabilité dynamique. */
  readonly area: number;
}
