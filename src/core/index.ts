/**
 * Barrel export — API publique du moteur physique.
 *
 * Point d'entrée unique pour la couche présentation (composants R3F, scènes,
 * stores Zustand). Importer **toujours** depuis `@/core` plutôt que des
 * sous-modules pour préserver l'encapsulation.
 *
 * Règle H1 : ce module et tous les sous-modules sont **zéro dépendance React /
 * Three.js**. Tout est testable en CLI (vitest src/core).
 */

// ---- Types fondamentaux ---------------------------------------------------

export type {
  SliderRange,
  TankLayout,
  ShipProfile,
  SimInputs,
  BuoyancyCenter,
  Hydrostatics,
  SimState,
  GzPoint,
  GzAnalysis,
} from "./types";

// ---- Profils navires ------------------------------------------------------

export {
  RHO_SEAWATER,
  RHO_FRESHWATER,
  TANKER,
  SAILBOAT,
  BARGE,
  PROFILES,
  defaultInputs,
} from "./profiles";

// ---- Hydrostatique --------------------------------------------------------

export {
  G_EARTH,
  kb,
  bm,
  kmt,
  gmt,
  envAngle,
  computeB0,
  computeHydrostatics,
} from "./hydrostatics";

// ---- Carène liquide -------------------------------------------------------

export type { FreeSurfaceCorrectionInputs } from "./freeSurface";
export {
  bulkheadsFromLayout,
  freeSurfaceCorrection,
  freeSurfaceMoment,
} from "./freeSurface";

// ---- Stabilité (GZ) -------------------------------------------------------

export type { StabilityContext } from "./stability";
export { stabilityContext, gzAt, gzPoints, gzAnalysis } from "./stability";

// ---- Embarquement de poids ------------------------------------------------

export type { ShipMassState, WeightAddition } from "./weights";
export {
  addWeight,
  shiftWeightVertical,
  shiftWeightHorizontal,
  suspendedLoad,
  virtualRiseFromSuspension,
  equilibriumHeel,
} from "./weights";

// ---- Critères IMO A.749 ---------------------------------------------------

export type { ImoCheck, ImoEvaluation } from "./imo";
export {
  IMO_AREA_0_30_MIN,
  IMO_AREA_0_40_MIN,
  IMO_AREA_30_40_MIN,
  IMO_GZ_AT_30_MIN,
  IMO_GZMAX_ANGLE_MIN,
  IMO_GM0_MIN,
  integrateGz,
  evaluateImoA749,
} from "./imo";

// ---- Pipeline complet -----------------------------------------------------

export { computeSimState } from "./simulation";
