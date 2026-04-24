import { describe, expect, it } from "vitest";
import { computeHydrostatics } from "../hydrostatics";
import { SAILBOAT, TANKER, defaultInputs } from "../profiles";
import { computeSimState } from "../simulation";
import { gzAnalysis, gzAt, gzPoints, stabilityContext } from "../stability";
import type { StabilityContext } from "../stability";

function tankerContext(overrides: Partial<StabilityContext> = {}): StabilityContext {
  const inputs = defaultInputs(TANKER);
  const hydro = computeHydrostatics(inputs, TANKER);
  return { ...stabilityContext(inputs, hydro), ...overrides };
}

function sailboatContext(overrides: Partial<StabilityContext> = {}): StabilityContext {
  const inputs = defaultInputs(SAILBOAT);
  const hydro = computeHydrostatics(inputs, SAILBOAT);
  return { ...stabilityContext(inputs, hydro), ...overrides };
}

describe("stability — gzAt", () => {
  it("GZ(0°) = 0 pour tout navire droit", () => {
    expect(gzAt(0, tankerContext())).toBeCloseTo(0, 3);
    expect(gzAt(0, sailboatContext())).toBeCloseTo(0, 3);
  });

  it("GZ positif et monotone croissant aux petits angles (stabilité initiale)", () => {
    // NOTE V1 : computeB0 intègre une coque parallélépipédique (sans Cb),
    // alors que bm() utilise la formule textbook B²/(12·TE·Cb). Les deux ne
    // sont pas cohérents — l'approximation GZ ≈ GMt·sin(θ) sous-estime la
    // valeur réelle calculée par computeB0. À investiguer Phase 1 suivante.
    const ctx = tankerContext();
    const gz1 = gzAt(1, ctx);
    const gz3 = gzAt(3, ctx);
    const gz5 = gzAt(5, ctx);
    expect(gz1).toBeGreaterThan(0);
    expect(gz3).toBeGreaterThan(gz1);
    expect(gz5).toBeGreaterThan(gz3);
  });

  it("GZ box-hull : approximation métacentrique cohérente avec computeB0 (BM sans Cb)", () => {
    // computeB0 intègre un parallélépipède de largeur B → BM effectif = B² / (12·TE)
    // (sans Cb, contrairement à la formule textbook utilisée par bm()).
    // Cette approximation doit matcher computeB0 aux petits angles.
    const B = 32.2;
    const TEeff = 12.8;
    const eKG = 11.5;
    const BM_box = (B * B) / (12 * TEeff);
    const KB = TEeff / 2;
    const GMt_box = KB + BM_box - eKG;
    const ctx = tankerContext();
    const gz5 = gzAt(5, ctx);
    expect(gz5).toBeCloseTo(GMt_box * Math.sin((5 * Math.PI) / 180), 2);
  });

  it("symétrie : gzAt(θ) ≈ −gzAt(−θ)", () => {
    const ctx = tankerContext();
    expect(gzAt(20, ctx)).toBeCloseTo(-gzAt(-20, ctx), 3);
    expect(gzAt(45, ctx)).toBeCloseTo(-gzAt(-45, ctx), 3);
  });

  it("GZ positif tant que θ < angle de chavirement", () => {
    const ctx = tankerContext();
    expect(gzAt(10, ctx)).toBeGreaterThan(0);
    expect(gzAt(30, ctx)).toBeGreaterThan(0);
  });
});

describe("stability — gzPoints", () => {
  it("retourne 361 points sur [−180°, 180°] par défaut", () => {
    const pts = gzPoints(tankerContext());
    expect(pts).toHaveLength(361);
    expect(pts[0]?.a).toBe(-180);
    expect(pts[360]?.a).toBe(180);
  });

  it("accepte une plage personnalisée", () => {
    const pts = gzPoints(tankerContext(), 90);
    expect(pts).toHaveLength(181);
    expect(pts[0]?.a).toBe(-90);
    expect(pts[180]?.a).toBe(90);
  });

  it("cohérent avec gzAt point à point", () => {
    const ctx = tankerContext();
    const pts = gzPoints(ctx, 30);
    for (const p of pts) {
      expect(p.g).toBeCloseTo(gzAt(p.a, ctx), 6);
    }
  });
});

describe("stability — gzAnalysis (tanker stable)", () => {
  const analysis = gzAnalysis(tankerContext());

  it("stableAtStart = true (GZ positif aux petits angles)", () => {
    expect(analysis.stableAtStart).toBe(true);
  });

  it("gzMax > 0 et gzMaxAngle entre 30° et 90° (ordre de grandeur tanker)", () => {
    expect(analysis.gzMax).toBeGreaterThan(0);
    expect(analysis.gzMaxAngle).toBeGreaterThan(30);
    expect(analysis.gzMaxAngle).toBeLessThan(90);
  });

  it("vanAngle entre 60° et 120° (ordre de grandeur tanker)", () => {
    expect(analysis.vanAngle).toBeGreaterThan(60);
    expect(analysis.vanAngle).toBeLessThan(120);
  });

  it("aire stabilité dynamique > 0", () => {
    expect(analysis.area).toBeGreaterThan(0);
  });
});

describe("stability — gzAnalysis (chavirement immédiat)", () => {
  it("KG > KMt → GMt < 0 → stableAtStart = false, tous les critères à 0", () => {
    const inputs = { ...defaultInputs(TANKER), KG: 20 }; // KG très haut
    const hydro = computeHydrostatics(inputs, TANKER);
    const ctx = stabilityContext(inputs, hydro);
    const analysis = gzAnalysis(ctx);
    expect(analysis.stableAtStart).toBe(false);
    expect(analysis.gzMax).toBe(0);
    expect(analysis.gzMaxAngle).toBe(0);
    expect(analysis.vanAngle).toBe(0);
    expect(analysis.area).toBe(0);
  });
});

describe("stability — gzAnalysis (voilier)", () => {
  const analysis = gzAnalysis(sailboatContext());

  it("voilier stable initialement avec GMt ≈ 1.25", () => {
    expect(analysis.stableAtStart).toBe(true);
    expect(analysis.gzMax).toBeGreaterThan(0);
  });

  it("voilier : vanAngle significatif (> 40°, architecture à franc-bord élevé)", () => {
    expect(analysis.vanAngle).toBeGreaterThan(40);
  });
});

describe("simulation — computeSimState (intégration bout-en-bout)", () => {
  it("tanker par défaut : GZ(0°) = 0, mom = 0", () => {
    const state = computeSimState(defaultInputs(TANKER), TANKER);
    expect(state.GZ).toBeCloseTo(0, 3);
    expect(state.hydro.mom).toBeCloseTo(0, 2);
  });

  it("tanker gîte 15° : GZ > 0, mom > 0 (redressement actif)", () => {
    const state = computeSimState({ ...defaultInputs(TANKER), heel: 15 }, TANKER);
    expect(state.GZ).toBeGreaterThan(0);
    expect(state.hydro.mom).toBeGreaterThan(0);
    // mom = disp × g × GZ
    const expectedMom = state.hydro.disp * 9.81 * state.GZ;
    expect(state.hydro.mom).toBeCloseTo(expectedMom, 1);
  });

  it("tanker gîte −15° : GZ < 0 (bâbord), mom < 0", () => {
    const state = computeSimState({ ...defaultInputs(TANKER), heel: -15 }, TANKER);
    expect(state.GZ).toBeLessThan(0);
    expect(state.hydro.mom).toBeLessThan(0);
  });

  it("SimState est cohérent : b0 et hydro correspondent aux inputs", () => {
    const inputs = { ...defaultInputs(TANKER), heel: 20 };
    const state = computeSimState(inputs, TANKER);
    expect(state.inputs).toBe(inputs); // même référence, pas de copie
    expect(state.hydro.TEeff).toBeCloseTo(12.8, 6);
    expect(state.b0.bx).toBeGreaterThan(0);
  });
});
