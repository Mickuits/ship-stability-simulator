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
