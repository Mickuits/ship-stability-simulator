import { G_EARTH, computeB0, computeHydrostatics } from "./hydrostatics";
import type { ShipProfile, SimInputs, SimState } from "./types";

/**
 * Calcule l'état complet de la simulation à partir des inputs et du profil.
 *
 * Pipeline :
 * 1. `computeHydrostatics` → TEeff, KB, BM, KMt, eKG, GMt, disp, envAngle
 * 2. `computeB0` pour l'angle courant → B' en repères navire et monde
 * 3. GZ = B'.wx − (eKG − TEeff) · sin(heel)
 * 4. Moment de redressement Cr = Δ · g · GZ (kN·m)
 *
 * Fonction pure : aucune mutation du paramètre `inputs`.
 */
export function computeSimState(inputs: SimInputs, profile: ShipProfile): SimState {
  const hydroWithoutMom = computeHydrostatics(inputs, profile);
  const b0 = computeB0(inputs.heel, inputs.B, hydroWithoutMom.TEeff, inputs.D);

  const rad = (inputs.heel * Math.PI) / 180;
  const gz = b0.wx - (hydroWithoutMom.eKG - hydroWithoutMom.TEeff) * Math.sin(rad);
  const mom = hydroWithoutMom.disp * G_EARTH * gz;

  return {
    inputs,
    hydro: { ...hydroWithoutMom, mom },
    b0,
    GZ: gz,
  };
}
