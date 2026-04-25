import type { ShipProfile, SimInputs } from "./types";

/** Densité de l'eau de mer de référence (t/m³). */
export const RHO_SEAWATER = 1.025;

/** Densité de l'eau douce (t/m³) — ballasts, eau de rivière. */
export const RHO_FRESHWATER = 1.0;

/** Pétrolier MR2 — profil hérité du prototype V1. */
export const TANKER: ShipProfile = {
  id: "tanker",
  name: "Pétrolier MR2",
  L: 174,
  Cb: 0.85,
  B: { min: 20, max: 45, step: 0.5, def: 32.2 },
  D: { min: 12, max: 24, step: 0.5, def: 19 },
  TE: { min: 6, max: 16, step: 0.05, def: 12.8 },
  KG: { min: 4, max: 20, step: 0.1, def: 11.5 },
  icingHeight: 3,
  hasTanks: true,
  tankLayout: "double",
  hasKeel: false,
  hasMast: false,
  cargoDensity: 0.85, // pétrole brut léger — impacte correction carène liquide
};

/**
 * Barge parallélépipédique (Cb = 1) — profil **gold standard** de validation analytique.
 *
 * Pour une box pure (Cb = 1, livet vertical, fond plat), les formules hydrostatiques
 * box du core deviennent **exactes** et non plus approchées :
 *   - KB  = TE / 2
 *   - BM  = B² / (12 · TE)            (puisque Cb = 1)
 *   - KMt = KB + BM
 *   - Δ   = ρ · L · B · TE             (carène complète)
 *   - envAngle = atan( (D − TE) / (B/2) )
 *
 * Sert de **non-régression numérique stricte** : toute dérive sur ces valeurs
 * pour ce profil signale un bug. Référentiel CMP §«Calcul du tirant d'eau —
 * exemple barge 25 m».
 */
export const BARGE: ShipProfile = {
  id: "barge",
  name: "Barge parallélépipédique (25 m)",
  L: 25,
  Cb: 1.0,
  B: { min: 4, max: 12, step: 0.1, def: 8 },
  D: { min: 2, max: 5, step: 0.1, def: 3 },
  TE: { min: 0.3, max: 2.5, step: 0.05, def: 1.5 },
  KG: { min: 0.3, max: 2.5, step: 0.05, def: 1.0 },
  icingHeight: 1,
  hasTanks: false,
  tankLayout: "none",
  hasKeel: false,
  hasMast: false,
  cargoDensity: 1.0, // ignoré (hasTanks=false)
};

/** Voilier de 12 m — profil hérité du prototype V1. */
export const SAILBOAT: ShipProfile = {
  id: "sailboat",
  name: "Voilier (12 m)",
  L: 12,
  Cb: 0.48,
  B: { min: 2.5, max: 5, step: 0.1, def: 3.6 },
  D: { min: 2.0, max: 3.5, step: 0.1, def: 2.6 },
  TE: { min: 1.2, max: 2.5, step: 0.02, def: 1.8 },
  KG: { min: 0.3, max: 2.5, step: 0.05, def: 0.9 },
  icingHeight: 1,
  hasTanks: false,
  tankLayout: "none",
  hasKeel: true,
  hasMast: true,
  cargoDensity: 1.0, // valeur nominale, ignorée (hasTanks=false)
};

/** Registre des profils disponibles, indexés par `id`. */
export const PROFILES: Readonly<Record<string, ShipProfile>> = Object.freeze({
  [TANKER.id]: TANKER,
  [SAILBOAT.id]: SAILBOAT,
  [BARGE.id]: BARGE,
});

/** Construit les inputs par défaut d'un profil (sliders à leur position initiale). */
export function defaultInputs(profile: ShipProfile): SimInputs {
  return {
    B: profile.B.def,
    D: profile.D.def,
    TE: profile.TE.def,
    KG: profile.KG.def,
    heel: 0,
    fsRatio: 0,
    ic: 0,
    rho: RHO_SEAWATER,
  };
}
