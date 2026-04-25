/**
 * Carène liquide — moment d'inertie de surface libre et correction de KG.
 *
 * Une cuve partiellement remplie déplace son centre de gravité quand le navire
 * gîte : le liquide se déplace vers le bas-côté de la gîte, dégradant la
 * stabilité initiale. La correction se traduit par un **rehaussement virtuel**
 * du KG effectif :
 *
 *     ΔKG_carène-liquide = ρ_cargo · i · fsRatio  /  (ρ_eau · V_carène)
 *
 * où `i` est le moment d'inertie transversal de la surface libre.
 *
 * Pour une cuve rectangulaire de longueur L et largeur B, avec n cloisons
 * longitudinales équidistantes :
 *
 *     i = L · B³  /  ( 12 · (n+1)² )
 *
 * Le cloisonnement divise donc l'effet par (n+1)². Diviser une cuve en deux
 * (n=1) le réduit d'un facteur 4 : c'est la principale parade architecturale
 * (« 1 cloison vaut bien 1 m de KG »).
 *
 * Réf. CMP référentiel §«Effet de carène liquide par les chiffres».
 */

import type { TankLayout } from "./types";

/**
 * Moment d'inertie transversal de la surface libre d'une cuve rectangulaire,
 * avec cloisonnement longitudinal éventuel : `i = L · B³ / (12 · (n+1)²)`.
 *
 * @param L Longueur de la cuve (m).
 * @param B Largeur de la cuve (m).
 * @param bulkheads Nombre de cloisons longitudinales (0 = cuve unique, 1 = double, 2 = triple).
 * @returns Moment d'inertie en m⁴, ou 0 pour des inputs invalides.
 */
export function freeSurfaceMoment(L: number, B: number, bulkheads: number): number {
  if (!Number.isFinite(L) || !Number.isFinite(B) || L <= 0 || B <= 0) return 0;
  const n = Math.max(0, Math.floor(bulkheads));
  const divisor = 12 * (n + 1) * (n + 1);
  return (L * B * B * B) / divisor;
}

/**
 * Convertit un `TankLayout` en nombre de cloisons longitudinales.
 *
 * - `none`   → −1 (sentinelle : pas de correction à appliquer)
 * - `single` →  0 (1 cuve)
 * - `double` →  1 (2 cuves, 1 cloison)
 * - `triple` →  2 (3 cuves, 2 cloisons)
 */
export function bulkheadsFromLayout(layout: TankLayout): number {
  switch (layout) {
    case "none":
      return -1;
    case "single":
      return 0;
    case "double":
      return 1;
    case "triple":
      return 2;
  }
}

/** Paramètres pour calculer la correction de carène liquide à appliquer à eKG. */
export interface FreeSurfaceCorrectionInputs {
  /** Longueur de la cuve (m) — typiquement la longueur navire L. */
  readonly L: number;
  /** Largeur de la cuve (m) — typiquement la largeur navire B. */
  readonly B: number;
  /** Disposition des citernes (détermine le nombre de cloisons). */
  readonly tankLayout: TankLayout;
  /** Taux de remplissage (∈ [0, 1] — le clamp est de la responsabilité de l'appelant). */
  readonly fsRatio: number;
  /** Densité du liquide cargo (t/m³). */
  readonly cargoDensity: number;
  /** Densité de l'eau ambiante (t/m³). */
  readonly rho: number;
  /** Volume immergé du navire (m³). */
  readonly V: number;
}

/**
 * Correction (m) à ajouter à eKG pour modéliser l'effet d'une carène liquide.
 *
 * Retourne 0 dans tous les cas dégénérés (pas de cuve, fsRatio=0, V≤0, ρ≤0, etc.)
 * pour rester sûr en présence d'inputs partiels.
 */
export function freeSurfaceCorrection(inputs: FreeSurfaceCorrectionInputs): number {
  const { L, B, tankLayout, fsRatio, cargoDensity, rho, V } = inputs;
  const bulkheads = bulkheadsFromLayout(tankLayout);
  if (bulkheads < 0) return 0; // tankLayout="none"
  if (!(fsRatio > 0)) return 0; // pas de liquide ou NaN
  if (!(V > 0) || !(rho > 0)) return 0;
  if (!(cargoDensity > 0)) return 0; // densité non physique → pas de correction perverse
  const i = freeSurfaceMoment(L, B, bulkheads);
  return (cargoDensity * i * fsRatio) / (rho * V);
}
