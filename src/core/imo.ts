/**
 * Critères de stabilité intacte IMO — Résolution A.749(18) §3.1.2.
 *
 * Les six critères généraux applicables aux navires de moins de 100 m :
 *
 *   (a) Aire 0–30° ≥ 0.055 m·rad
 *   (b) Aire 0–40° (ou jusqu'à θf si plus petit) ≥ 0.090 m·rad
 *   (c) Aire 30–40° (ou 30°–θf si plus petit) ≥ 0.030 m·rad
 *   (d) GZ à θ ≥ 30°  ≥ 0.20 m
 *   (e) Angle de GZmax ≥ 25° (préférentiellement > 30°)
 *   (f) GM₀ initial ≥ 0.15 m
 *
 * où θf est l'angle d'envahissement (livet du pont à la flottaison).
 *
 * Réf. : Référentiel CMP §«Critères IMO de stabilité intacte» + IMO A.749(18).
 */

import { gzAnalysis, gzAt } from "./stability";
import type { StabilityContext } from "./stability";

// ---------------------------------------------------------------------------
// Seuils réglementaires (constantes nommées — pas de magic numbers)
// ---------------------------------------------------------------------------

/** Aire minimale 0–30° (m·rad). */
export const IMO_AREA_0_30_MIN = 0.055;
/** Aire minimale 0–40° ou 0–θf (m·rad). */
export const IMO_AREA_0_40_MIN = 0.09;
/** Aire minimale 30°–40° ou 30°–θf (m·rad). */
export const IMO_AREA_30_40_MIN = 0.03;
/** GZ minimum à 30° (m). */
export const IMO_GZ_AT_30_MIN = 0.2;
/** Angle minimum du GZmax (deg). */
export const IMO_GZMAX_ANGLE_MIN = 25;
/** GM₀ initial minimum (m). */
export const IMO_GM0_MIN = 0.15;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Évaluation d'un critère individuel. */
export interface ImoCheck {
  /** Valeur calculée. */
  readonly value: number;
  /** Seuil réglementaire. */
  readonly min: number;
  /**
   * True si `value ≥ min` ET `applicable`. Un critère non applicable a
   * `pass = true` (ne fait pas échouer `allPass`) — la sémantique « FAIL » est
   * réservée aux cas où le critère s'applique mais n'est pas atteint.
   */
  readonly pass: boolean;
  /**
   * False si le critère ne s'applique pas (ex. critère (c) 30°-40° quand
   * l'angle d'envahissement est < 30°, ou critère (e) sur navire instable au
   * repos). Conformément à A.749(18) §3.1.2 « ou jusqu'à θf si plus petit ».
   */
  readonly applicable: boolean;
  /** Légende lisible (FR). */
  readonly label: string;
}

/** Synthèse des six critères A.749 §3.1.2. */
export interface ImoEvaluation {
  readonly area_0_30: ImoCheck;
  readonly area_0_40: ImoCheck;
  readonly area_30_40: ImoCheck;
  readonly gz_at_30: ImoCheck;
  readonly gz_max_angle: ImoCheck;
  readonly gm0: ImoCheck;
  /** True si les six critères passent. */
  readonly allPass: boolean;
}

// ---------------------------------------------------------------------------
// Intégration partielle de la courbe GZ (trapèze, pas 1°)
// ---------------------------------------------------------------------------

/**
 * Intègre la courbe GZ entre `lo` et `hi` (deg) selon la règle du trapèze, pas 1°.
 * Les contributions négatives ne sont pas comptées (la stabilité positive est
 * la grandeur d'intérêt pour les critères A.749).
 *
 * Les bornes peuvent être non entières — gérées par sous-découpage de la première
 * et dernière sous-bande. Les changements de signe à l'intérieur d'une bande
 * sont localisés par interpolation linéaire (entrée OU sortie de positivité).
 */
export function integrateGz(ctx: StabilityContext, lo: number, hi: number): number {
  if (!(hi > lo)) return 0;
  const DEG_TO_RAD = Math.PI / 180;
  let area = 0;
  let a = lo;
  while (a < hi) {
    const aNext = Math.min(Math.floor(a) + 1, hi);
    if (aNext <= a) break;
    const g0 = gzAt(a, ctx);
    const g1 = gzAt(aNext, ctx);
    const widthRad = (aNext - a) * DEG_TO_RAD;
    if (g0 > 0 && g1 > 0) {
      // Bande entièrement positive — trapèze plein
      area += ((g0 + g1) / 2) * widthRad;
    } else if (g0 > 0 && g1 <= 0) {
      // Sortie de positivité — interpoler le zéro, n'intégrer que la portion positive
      const frac = g0 / (g0 - g1);
      area += (g0 / 2) * frac * widthRad;
    } else if (g0 <= 0 && g1 > 0) {
      // Entrée en positivité (cas rare mais réel : GZ(0)=0 strict, ou navire
      // instable au départ qui retrouve une stabilité incliné)
      const frac = g1 / (g1 - g0);
      area += (g1 / 2) * frac * widthRad;
    }
    // sinon : g0 ≤ 0 ET g1 ≤ 0 → contribution nulle
    a = aNext;
  }
  return area;
}

// ---------------------------------------------------------------------------
// Évaluation des six critères
// ---------------------------------------------------------------------------

/**
 * Évalue les six critères IMO A.749 §3.1.2 sur la courbe GZ d'un navire.
 *
 * @param ctx Contexte de stabilité (B, D, TEeff, eKG).
 * @param GMt Hauteur métacentrique initiale (m).
 * @param envAngleDeg Angle d'envahissement (deg). Si défini et < 40°, sert de
 *                    borne supérieure pour les critères (b) et (c).
 */
export function evaluateImoA749(
  ctx: StabilityContext,
  GMt: number,
  envAngleDeg?: number,
): ImoEvaluation {
  // Bornes effectives pour (b) et (c) : θf si envahissement avant 40°
  const upperB =
    Number.isFinite(envAngleDeg) && (envAngleDeg as number) < 40 ? (envAngleDeg as number) : 40;
  const upperC = upperB;

  // (a) Aire 0–30° — toujours applicable (A.749 §3.1.2(a) : pas d'alternative
  // à 30° dans la rédaction). En présence d'envahissement avant 30°,
  // integrateGz tronque naturellement à l'angle de zero-crossing de GZ.
  const area_0_30_value = integrateGz(ctx, 0, 30);
  const area_0_30: ImoCheck = {
    value: area_0_30_value,
    min: IMO_AREA_0_30_MIN,
    applicable: true,
    pass: area_0_30_value >= IMO_AREA_0_30_MIN,
    label: "Aire sous GZ de 0 à 30°",
  };

  // (b) Aire 0–40° ou jusqu'à θf — toujours applicable
  const area_0_40_value = integrateGz(ctx, 0, upperB);
  const area_0_40: ImoCheck = {
    value: area_0_40_value,
    min: IMO_AREA_0_40_MIN,
    applicable: true,
    pass: area_0_40_value >= IMO_AREA_0_40_MIN,
    label: `Aire sous GZ de 0 à ${upperB.toFixed(1)}°`,
  };

  // (c) Aire 30–40° ou 30°–θf — non applicable si upperC ≤ 30 (envahissement
  // avant 30°). A.749(18) §3.1.2 prévoit la fenêtre 30°-40° ou 30°-θf si plus
  // petit ; si θf < 30°, la fenêtre est vide → critère sans objet.
  const area_30_40_applicable = upperC > 30;
  const area_30_40_value = area_30_40_applicable ? integrateGz(ctx, 30, upperC) : 0;
  const area_30_40: ImoCheck = {
    value: area_30_40_value,
    min: IMO_AREA_30_40_MIN,
    applicable: area_30_40_applicable,
    pass: area_30_40_applicable ? area_30_40_value >= IMO_AREA_30_40_MIN : true,
    label: `Aire sous GZ de 30 à ${upperC.toFixed(1)}°`,
  };

  // (d) GZ à 30° ≥ 0.20 m — applicable si θf ≥ 30°
  const gz_at_30_applicable = upperB >= 30;
  const gz30 = gz_at_30_applicable ? gzAt(30, ctx) : 0;
  const gz_at_30: ImoCheck = {
    value: gz30,
    min: IMO_GZ_AT_30_MIN,
    applicable: gz_at_30_applicable,
    pass: gz_at_30_applicable ? gz30 >= IMO_GZ_AT_30_MIN : true,
    label: "GZ à 30°",
  };

  // (e) Angle de GZmax ≥ 25° — non applicable sur navire instable au repos
  // (gzAnalysis renvoie gzMaxAngle = 0 dans ce cas, ce qui ne reflète pas un
  // vrai « non-respect » mais une absence de courbe positive).
  const analysis = gzAnalysis(ctx);
  const gz_max_angle_applicable = analysis.stableAtStart;
  const gz_max_angle: ImoCheck = {
    value: analysis.gzMaxAngle,
    min: IMO_GZMAX_ANGLE_MIN,
    applicable: gz_max_angle_applicable,
    pass: gz_max_angle_applicable ? analysis.gzMaxAngle >= IMO_GZMAX_ANGLE_MIN : true,
    label: "Angle du GZmax",
  };

  // (f) GM₀ ≥ 0.15 m — toujours applicable
  const gm0: ImoCheck = {
    value: GMt,
    min: IMO_GM0_MIN,
    applicable: true,
    pass: GMt >= IMO_GM0_MIN,
    label: "GM₀ initial",
  };

  const allPass =
    area_0_30.pass &&
    area_0_40.pass &&
    area_30_40.pass &&
    gz_at_30.pass &&
    gz_max_angle.pass &&
    gm0.pass;

  return { area_0_30, area_0_40, area_30_40, gz_at_30, gz_max_angle, gm0, allPass };
}
