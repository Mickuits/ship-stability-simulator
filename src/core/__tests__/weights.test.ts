/**
 * Tests du module `weights` — embarquement de poids (S4 référentiel CMP).
 *
 * Couvre les 6 scénarios narratifs + cas critique du grutage (poids suspendu).
 * Référentiel pédagogique : CMP §«Embarquement de poids».
 */

import { describe, expect, it } from "vitest";
import {
  type ShipMassState,
  addWeight,
  equilibriumHeel,
  shiftWeightHorizontal,
  shiftWeightVertical,
  suspendedLoad,
  virtualRiseFromSuspension,
} from "../weights";

// État de référence : barge 25 m chargée à pleine capacité.
const BASE: ShipMassState = { M: 300, KG: 5.0, TCG: 0 };

// ---------------------------------------------------------------------------
// 1. addWeight — scénarios axiaux 1/2/3
// ---------------------------------------------------------------------------

describe("addWeight — scénarios axiaux narratifs (1, 2, 3)", () => {
  it("scénario 1 : charge dans les fonds (kw < KG) → eKG ↓ (stabilité ↑↑)", () => {
    // 30 t à kw=1 m (très bas) sur navire M=300, KG=5
    const after = addWeight(BASE, { w: 30, kw: 1.0 });
    expect(after.M).toBe(330);
    // KG' = (300·5 + 30·1) / 330 = (1500 + 30) / 330 = 4.6364…
    expect(after.KG).toBeCloseTo(1530 / 330, 9);
    expect(after.KG).toBeLessThan(BASE.KG);
  });

  it("scénario 2 : charge au niveau de G (kw = KG) → eKG inchangé", () => {
    const after = addWeight(BASE, { w: 30, kw: BASE.KG });
    expect(after.M).toBe(330);
    expect(after.KG).toBeCloseTo(BASE.KG, 12);
  });

  it("scénario 3 : charge au-dessus de G (kw > KG) → eKG ↑ (stabilité ↓)", () => {
    const after = addWeight(BASE, { w: 30, kw: 9.0 });
    expect(after.M).toBe(330);
    // KG' = (1500 + 270) / 330 = 1770 / 330 = 5.3636…
    expect(after.KG).toBeCloseTo(1770 / 330, 9);
    expect(after.KG).toBeGreaterThan(BASE.KG);
  });

  it("conservation : KG' interpolé entre KG et kw selon le ratio des masses", () => {
    // Si w = M alors KG' = (KG + kw) / 2 (moyenne arithmétique)
    const after = addWeight(BASE, { w: BASE.M, kw: 9.0 });
    expect(after.KG).toBeCloseTo((BASE.KG + 9.0) / 2, 9);
  });
});

// ---------------------------------------------------------------------------
// 2. addWeight — scénario latéral 4 (charge bâbord/tribord)
// ---------------------------------------------------------------------------

describe("addWeight — scénario latéral 4", () => {
  it("charge tribord (tw > 0) → TCG' tribord", () => {
    const after = addWeight(BASE, { w: 30, kw: 5.0, tw: 2.0 });
    // TCG' = (300·0 + 30·2) / 330 = 60/330
    expect(after.TCG).toBeCloseTo(60 / 330, 9);
    expect(after.TCG).toBeGreaterThan(0);
  });

  it("charge bâbord (tw < 0) → TCG' bâbord (signe négatif)", () => {
    const after = addWeight(BASE, { w: 30, kw: 5.0, tw: -2.0 });
    expect(after.TCG).toBeCloseTo(-60 / 330, 9);
  });

  it("charge axiale (tw = 0 ou omis) → TCG inchangé", () => {
    expect(addWeight(BASE, { w: 30, kw: 5.0, tw: 0 }).TCG).toBe(0);
    expect(addWeight(BASE, { w: 30, kw: 5.0 }).TCG).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 3. addWeight — robustesse (inputs invalides)
// ---------------------------------------------------------------------------

describe("addWeight — robustesse", () => {
  it("w ≤ 0 → état inchangé", () => {
    expect(addWeight(BASE, { w: 0, kw: 5 })).toEqual(BASE);
    expect(addWeight(BASE, { w: -10, kw: 5 })).toEqual(BASE);
  });

  it("kw ou tw non fini → état inchangé", () => {
    expect(addWeight(BASE, { w: 30, kw: Number.NaN })).toEqual(BASE);
    expect(addWeight(BASE, { w: 30, kw: Number.POSITIVE_INFINITY })).toEqual(BASE);
    expect(addWeight(BASE, { w: 30, kw: 5, tw: Number.NaN })).toEqual(BASE);
  });

  it("state.M < 0 (état dégénéré amont) → état inchangé (préserve l'invariant)", () => {
    const degenerate: ShipMassState = { M: -10, KG: 5, TCG: 0 };
    expect(addWeight(degenerate, { w: 30, kw: 5 })).toBe(degenerate);
  });

  it("state.M = 0 + w petit → newM > 0 OK ; state.M = 0 + w nul → état inchangé", () => {
    const empty: ShipMassState = { M: 0, KG: 0, TCG: 0 };
    expect(addWeight(empty, { w: 0, kw: 5 })).toBe(empty);
    const after = addWeight(empty, { w: 10, kw: 3 });
    expect(after.M).toBe(10);
    expect(after.KG).toBe(3); // ratio (0 + 10·3) / 10
  });
});

// ---------------------------------------------------------------------------
// 4. shiftWeightVertical — scénario 5 (mouvement vertical)
// ---------------------------------------------------------------------------

describe("shiftWeightVertical — scénario 5", () => {
  it("monter une masse de dz → ΔKG = w·dz/M, masse inchangée", () => {
    // Bouger 30 t de dz=+2 m sur 300 t → ΔKG = 30·2/300 = 0.2 m
    const after = shiftWeightVertical(BASE, 30, 2.0);
    expect(after.M).toBe(BASE.M);
    expect(after.KG).toBeCloseTo(BASE.KG + 0.2, 9);
  });

  it("descendre une masse (dz < 0) → KG diminue", () => {
    const after = shiftWeightVertical(BASE, 30, -2.0);
    expect(after.KG).toBeCloseTo(BASE.KG - 0.2, 9);
  });

  it("dz = 0 → état strictement inchangé", () => {
    expect(shiftWeightVertical(BASE, 30, 0).KG).toBe(BASE.KG);
  });

  it("w ≤ 0 → état inchangé", () => {
    expect(shiftWeightVertical(BASE, 0, 2)).toEqual(BASE);
    expect(shiftWeightVertical(BASE, -5, 2)).toEqual(BASE);
  });

  it("dz non fini ou state dégénéré → état inchangé", () => {
    expect(shiftWeightVertical(BASE, 30, Number.NaN)).toEqual(BASE);
    expect(shiftWeightVertical({ M: 0, KG: 5, TCG: 0 }, 30, 2)).toEqual({ M: 0, KG: 5, TCG: 0 });
  });
});

// ---------------------------------------------------------------------------
// 5. shiftWeightHorizontal — scénario 6 (mouvement horizontal, GMt inchangé)
// ---------------------------------------------------------------------------

describe("shiftWeightHorizontal — scénario 6", () => {
  it("déplacer une masse de dy → ΔTCG = w·dy/M, KG strictement inchangé", () => {
    const after = shiftWeightHorizontal(BASE, 30, 2.0);
    expect(after.M).toBe(BASE.M);
    expect(after.KG).toBe(BASE.KG); // KG ne bouge pas — clé pédagogique du scénario
    expect(after.TCG).toBeCloseTo(BASE.TCG + 0.2, 9);
  });

  it("dy < 0 (tribord vers bâbord) → TCG bâbord", () => {
    const after = shiftWeightHorizontal({ ...BASE, TCG: 0.5 }, 30, -1.0);
    // ΔTCG = 30·(-1)/300 = -0.1 → TCG' = 0.5 - 0.1 = 0.4
    expect(after.TCG).toBeCloseTo(0.4, 9);
  });

  it("dy non fini ou state dégénéré → état inchangé", () => {
    expect(shiftWeightHorizontal(BASE, 30, Number.NaN)).toEqual(BASE);
    expect(shiftWeightHorizontal(BASE, 0, 2)).toEqual(BASE);
    expect(shiftWeightHorizontal({ M: 0, KG: 5, TCG: 0 }, 30, 2)).toEqual({ M: 0, KG: 5, TCG: 0 });
  });
});

// ---------------------------------------------------------------------------
// 6. suspendedLoad — cas critique du grutage
// ---------------------------------------------------------------------------

describe("suspendedLoad — cas critique du grutage", () => {
  it("KG virtuel = position du point de suspente, pas position réelle", () => {
    // Charge w=30 t suspendue à 15 m (flèche grue), conteneur réel sur pont à 6 m
    const realLoad = addWeight(BASE, { w: 30, kw: 6.0 });
    const suspended = suspendedLoad(BASE, 30, 15.0);
    expect(suspended.KG).toBeGreaterThan(realLoad.KG); // G virtuel plus haut
  });

  it("plus le point de suspente est haut, plus le KG virtuel monte", () => {
    const lo = suspendedLoad(BASE, 30, 8.0);
    const hi = suspendedLoad(BASE, 30, 15.0);
    expect(hi.KG).toBeGreaterThan(lo.KG);
  });

  it("masse + point de suspente latéraux → TCG dévie aussi", () => {
    const after = suspendedLoad(BASE, 30, 15.0, 5.0);
    // TCG' = (300·0 + 30·5)/330 = 150/330
    expect(after.TCG).toBeCloseTo(150 / 330, 9);
  });
});

// ---------------------------------------------------------------------------
// 7. virtualRiseFromSuspension — différentiel pédagogique
// ---------------------------------------------------------------------------

describe("virtualRiseFromSuspension", () => {
  it("ΔKG_virtuel = w · (h_suspente − h_réelle) / (M + w)", () => {
    // M=300, w=30, h_suspente=15, h_réel=6 → ΔKG = 30·9/330 = 270/330
    const rise = virtualRiseFromSuspension(300, 30, 6, 15);
    expect(rise).toBeCloseTo(270 / 330, 9);
  });

  it("suspente = position réelle → ΔKG = 0", () => {
    expect(virtualRiseFromSuspension(300, 30, 6, 6)).toBe(0);
  });

  it("suspente sous la position réelle → ΔKG négatif (cas pédagogique inverse)", () => {
    expect(virtualRiseFromSuspension(300, 30, 10, 6)).toBeLessThan(0);
  });

  it("M ou w ≤ 0 → 0 (sécurité)", () => {
    expect(virtualRiseFromSuspension(0, 30, 6, 15)).toBe(0);
    expect(virtualRiseFromSuspension(300, 0, 6, 15)).toBe(0);
  });

  it("ΔKG cohérent avec suspendedLoad − addWeight", () => {
    const real = addWeight(BASE, { w: 30, kw: 6.0 });
    const sus = suspendedLoad(BASE, 30, 15.0);
    const delta = virtualRiseFromSuspension(BASE.M, 30, 6.0, 15.0);
    expect(sus.KG - real.KG).toBeCloseTo(delta, 9);
  });
});

// ---------------------------------------------------------------------------
// 8. equilibriumHeel — gîte d'équilibre statique
// ---------------------------------------------------------------------------

describe("equilibriumHeel", () => {
  it("tan(θ_eq) = TCG / GMt — petite gîte", () => {
    // TCG = 0.1 m, GMt = 3.3 m → tan θ ≈ 0.0303 → θ ≈ 1.74°
    const angle = equilibriumHeel(0.1, 3.3);
    expect(angle).toBeCloseTo((Math.atan(0.1 / 3.3) * 180) / Math.PI, 9);
    expect(angle).toBeCloseTo(1.736, 2);
  });

  it("TCG = 0 → gîte = 0 (équilibre symétrique)", () => {
    expect(equilibriumHeel(0, 3.3)).toBe(0);
  });

  it("GMt ≤ 0 → 0 (navire instable, formule non valable)", () => {
    expect(equilibriumHeel(0.5, 0)).toBe(0);
    expect(equilibriumHeel(0.5, -0.1)).toBe(0);
  });

  it("TCG négatif → gîte bâbord (négative)", () => {
    expect(equilibriumHeel(-0.1, 3.3)).toBeLessThan(0);
  });

  it("TCG non fini → 0 (sécurité)", () => {
    expect(equilibriumHeel(Number.NaN, 3.3)).toBe(0);
    expect(equilibriumHeel(Number.POSITIVE_INFINITY, 3.3)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 9. Composition de scénarios — sanity check intégration
// ---------------------------------------------------------------------------

describe("composition — embarquement puis déplacement", () => {
  it("addWeight + shiftWeightVertical donne le même résultat qu'embarquer directement à la position finale", () => {
    // Embarquer 30 t à kw=2, puis monter de 3 m
    const path1 = shiftWeightVertical(addWeight(BASE, { w: 30, kw: 2.0 }), 30, 3.0);
    // Vs. embarquer directement à kw=5
    const path2 = addWeight(BASE, { w: 30, kw: 5.0 });
    expect(path1.M).toBe(path2.M);
    // KG ne sera pas exactement identique car shiftWeightVertical agit sur M+w
    // alors que addWeight dilue avec M. Vérifier la formule manuelle :
    //  path1 : KG_int = (300·5 + 30·2)/330 = 1560/330 ; KG_fin = 1560/330 + 30·3/330 = 1650/330
    //  path2 : KG = (300·5 + 30·5)/330 = 1650/330
    expect(path1.KG).toBeCloseTo(path2.KG, 9);
  });
});
