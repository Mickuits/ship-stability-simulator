/**
 * Smoke test du barrel `src/core/index.ts` — fige l'API publique exposée à
 * la couche présentation. Toute suppression d'un export public fait échouer
 * ce test : oblige à se demander volontairement s'il faut casser le contrat.
 */

import { describe, expect, it } from "vitest";
import * as core from "../index";

describe("core barrel — API publique stable", () => {
  it("expose les profils navires standards", () => {
    expect(core.TANKER.id).toBe("tanker");
    expect(core.SAILBOAT.id).toBe("sailboat");
    expect(core.BARGE.id).toBe("barge");
    expect(core.PROFILES.tanker).toBe(core.TANKER);
  });

  it("expose les constantes physiques", () => {
    expect(core.RHO_SEAWATER).toBe(1.025);
    expect(core.RHO_FRESHWATER).toBe(1.0);
    expect(core.G_EARTH).toBeCloseTo(9.81, 6);
  });

  it("expose les seuils IMO A.749", () => {
    expect(core.IMO_GM0_MIN).toBe(0.15);
    expect(core.IMO_GZ_AT_30_MIN).toBe(0.2);
    expect(core.IMO_AREA_0_30_MIN).toBe(0.055);
  });

  it("expose les primitives hydrostatiques", () => {
    expect(typeof core.kb).toBe("function");
    expect(typeof core.bm).toBe("function");
    expect(typeof core.kmt).toBe("function");
    expect(typeof core.gmt).toBe("function");
    expect(typeof core.envAngle).toBe("function");
    expect(typeof core.computeB0).toBe("function");
    expect(typeof core.computeHydrostatics).toBe("function");
    expect(typeof core.freeSurfaceMoment).toBe("function");
  });

  it("expose les primitives de stabilité", () => {
    expect(typeof core.stabilityContext).toBe("function");
    expect(typeof core.gzAt).toBe("function");
    expect(typeof core.gzPoints).toBe("function");
    expect(typeof core.gzAnalysis).toBe("function");
  });

  it("expose les primitives carène liquide", () => {
    expect(typeof core.bulkheadsFromLayout).toBe("function");
    expect(typeof core.freeSurfaceCorrection).toBe("function");
  });

  it("expose les primitives d'embarquement de poids", () => {
    expect(typeof core.addWeight).toBe("function");
    expect(typeof core.shiftWeightVertical).toBe("function");
    expect(typeof core.shiftWeightHorizontal).toBe("function");
    expect(typeof core.suspendedLoad).toBe("function");
    expect(typeof core.virtualRiseFromSuspension).toBe("function");
    expect(typeof core.equilibriumHeel).toBe("function");
  });

  it("expose le pipeline simulation et l'évaluation IMO", () => {
    expect(typeof core.computeSimState).toBe("function");
    expect(typeof core.evaluateImoA749).toBe("function");
    expect(typeof core.integrateGz).toBe("function");
  });

  it("pipeline bout-en-bout depuis le barrel : computeSimState(BARGE)", () => {
    const inputs = core.defaultInputs(core.BARGE);
    const state = core.computeSimState(inputs, core.BARGE);
    expect(state.hydro.disp).toBeCloseTo(307.5, 6);
    expect(state.hydro.GMt).toBeCloseTo(64 / 18 - 0.25, 9);
    expect(state.GZ).toBeCloseTo(0, 9); // heel = 0 par défaut
  });
});
