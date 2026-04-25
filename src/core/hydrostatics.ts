import { freeSurfaceCorrection } from "./freeSurface";
import { RHO_SEAWATER } from "./profiles";
import type { BuoyancyCenter, Hydrostatics, ShipProfile, SimInputs } from "./types";

/** Seuil au-dessous duquel TE est considéré « trop petit » pour calculer BM — garde-fou V1. */
const TE_MIN_SAFE = 0.01;

/** Nombre de bandes pour l'intégration numérique de computeB0 (équivalent V1). */
const COMPUTE_B0_STRIPS = 500;

/** Epsilon cos(θ) pour détecter les angles proches de ±90°. */
const COS_EPS = 0.001;

/** Aire minimale d'une section immergée — en dessous, on retombe sur un fallback V1. */
const AREA_MIN = 0.001;

/** Franc-bord minimum toléré (m) — clamp pour éviter que TEeff n'atteigne D. */
const FREEBOARD_MIN = 0.1;

/** Accélération de la pesanteur (m/s²). */
export const G_EARTH = 9.81;

/**
 * Hauteur du centre de carène au-dessus de la quille (m), approximation coque
 * rectangulaire : KB = TE/2.
 *
 * Ref: CMP référentiel §«Notions de stabilité» — centre de carène B0.
 */
export function kb(TE: number): number {
  if (!Number.isFinite(TE) || TE <= 0) return 0;
  return TE * 0.5;
}

/**
 * Rayon métacentrique transversal (m) : BM = B² / (12 · TE · Cb).
 *
 * Ref: CMP référentiel §«Notions de stabilité» — rayon métacentrique r
 * (distance MB0), module de stabilité transversale initial (MSIT).
 *
 * Garde-fou V1 (bug historique « BM = Infinity ») : retourne 0 si TE ≤ 0.01
 * ou si Cb ≤ 0, et si l'un des inputs n'est pas fini.
 */
export function bm(B: number, TE: number, Cb: number): number {
  if (!Number.isFinite(B) || !Number.isFinite(TE) || !Number.isFinite(Cb)) return 0;
  if (TE <= TE_MIN_SAFE || Cb <= 0 || B <= 0) return 0;
  return (B * B) / (12 * TE * Cb);
}

/** Hauteur du métacentre transversal : KMt = KB + BM. */
export function kmt(kbValue: number, bmValue: number): number {
  return kbValue + bmValue;
}

/** Hauteur métacentrique : GMt = KMt − eKG. Doit être > 0 pour la stabilité initiale. */
export function gmt(kmtValue: number, eKG: number): number {
  return kmtValue - eKG;
}

/**
 * Angle d'envahissement (deg) — angle pour lequel le livet du pont atteint
 * la flottaison : tan(θ_env) = franc-bord / (B/2).
 *
 * Ref: CMP référentiel §«Cas d'envahissement accidentel» — immersion du livet,
 * perte de stabilité transversale associée.
 */
export function envAngle(B: number, D: number, TEeff: number): number {
  const fb = D - TEeff;
  if (fb <= 0 || B <= 0) return 0;
  return (Math.atan(fb / (B / 2)) * 180) / Math.PI;
}

/**
 * Calcule analytiquement le centre de carène B' pour une coque rectangulaire
 * à une gîte donnée, par intégration sur 500 bandes verticales.
 *
 * Repère navire : origine au centre de la flottaison droite, x+ tribord, y+ vers la quille.
 * Coque : x ∈ [−B/2, B/2], y ∈ [−(D−TE), TE].
 * Condition immergée (repère monde y > 0) : x·sin(θ) + y·cos(θ) > 0.
 *
 * Ref: CMP référentiel §«Notions de stabilité» — trajectoire de B0 vers B'
 * lors de l'inclinaison transversale ; §«Moment de redressement» pour GZ
 * aux grands angles.
 *
 * Garde-fous V1 :
 * - Inputs non finis ou non strictement positifs → fallback `{bx:0, by:0.05}`.
 * - Aire totale sous AREA_MIN → fallback `{bx:0, by:TE/2}`.
 *
 * @param theta Gîte en degrés.
 * @returns Centre de carène en repère navire (bx, by) et repère monde (wx, wy).
 */
export function computeB0(theta: number, B: number, TE: number, D: number): BuoyancyCenter {
  if (
    !Number.isFinite(theta) ||
    !Number.isFinite(B) ||
    !Number.isFinite(TE) ||
    !Number.isFinite(D) ||
    B <= 0 ||
    TE <= 0 ||
    D <= 0
  ) {
    return { bx: 0, by: 0.05, wx: 0, wy: 0.05 };
  }

  const rad = (theta * Math.PI) / 180;
  const cosT = Math.cos(rad);
  const sinT = Math.sin(rad);
  const halfB = B / 2;
  const freeboard = D - TE;
  const yDeck = -freeboard;
  const yKeel = TE;

  const dx = B / COMPUTE_B0_STRIPS;
  let area = 0;
  let sx = 0;
  let sy = 0;

  for (let i = 0; i < COMPUTE_B0_STRIPS; i++) {
    const x = -halfB + (i + 0.5) * dx;
    let ytop: number;
    let ybot: number;

    if (Math.abs(cosT) < COS_EPS) {
      // θ proche de ±90° : bande immergée si x·sinT > 0
      if (x * sinT <= 0) continue;
      ytop = yDeck;
      ybot = yKeel;
    } else if (cosT > 0) {
      const wl = (-x * sinT) / cosT;
      ytop = Math.max(yDeck, Math.min(yKeel, wl));
      ybot = yKeel;
    } else {
      const wl = (-x * sinT) / cosT;
      if (wl < yDeck) continue;
      ytop = yDeck;
      ybot = Math.min(yKeel, wl);
    }

    const h = ybot - ytop;
    if (h <= 0) continue;
    const ymid = (ytop + ybot) / 2;
    const dA = h * dx;
    area += dA;
    sx += x * dA;
    sy += ymid * dA;
  }

  if (area < AREA_MIN) {
    return { bx: 0, by: TE / 2, wx: 0, wy: TE / 2 };
  }

  const bx = sx / area;
  const by = sy / area;
  const wx = bx * cosT - by * sinT;
  const wy = bx * sinT + by * cosT;

  return { bx, by, wx, wy };
}

/**
 * Calcule toutes les grandeurs hydrostatiques dérivées à partir des inputs et du profil.
 * Porte `phys()` du prototype V1 en fonction pure (sans moment — rempli par `computeSimState`).
 *
 * Ref: CMP référentiel §«Cas particulier du givrage» (étape 5) ;
 * §«Effet de carène liquide par les chiffres» (étape 6).
 *
 * Chaîne de calcul :
 * 1. Masse de base depuis V = L·B·TE·Cb et ρ_ref (eau de mer).
 * 2. Masse totale = masse de base + masse de glace.
 * 3. TEeff = min( V_needed / (L·B·Cb), D − freeboardMin ) avec V_needed = masseTotale/ρ.
 * 4. KB, BM, KMt à partir de TEeff.
 * 5. eKG = pondération KG structural + glace (hauteur D + icingHeight).
 * 6. Correction carène liquide : eKG += ρ_cargo · i · fsRatio / (ρ_eau · V).
 * 7. GMt, envAngle.
 */
export function computeHydrostatics(inputs: SimInputs, profile: ShipProfile): Hydrostatics {
  const { B, D, TE, KG, ic, rho, fsRatio } = inputs;
  const { L, Cb, icingHeight, tankLayout } = profile;

  const V_base = L * B * TE * Cb;
  const massBase = V_base * RHO_SEAWATER;
  const massTotale = massBase + ic;

  let TEeff: number;
  if (L > 0 && B > 0 && Cb > 0 && rho > 0) {
    const V_needed = massTotale / rho;
    TEeff = Math.min(V_needed / (L * B * Cb), D - FREEBOARD_MIN);
  } else {
    TEeff = TE;
  }

  const V = L * B * TEeff * Cb;
  const disp = massTotale;

  const kbValue = kb(TEeff);
  const bmValue = bm(B, TEeff, Cb);
  const kmtValue = kmt(kbValue, bmValue);

  let eKG = KG;
  if (ic > 0 && massTotale > 0) {
    const kgGlace = D + icingHeight;
    eKG = (massBase * KG + ic * kgGlace) / massTotale;
  }

  // Clamp défensif du contrat SimInputs.fsRatio ∈ [0, 1] (cf. types.ts).
  const fsClamped = Math.max(0, Math.min(1, fsRatio));
  eKG += freeSurfaceCorrection({
    L,
    B,
    tankLayout,
    fsRatio: fsClamped,
    cargoDensity: profile.cargoDensity,
    rho,
    V,
  });

  const gmtValue = gmt(kmtValue, eKG);
  const envAngleValue = envAngle(B, D, TEeff);

  return {
    TEeff,
    KB: kbValue,
    BM: bmValue,
    KMt: kmtValue,
    eKG,
    GMt: gmtValue,
    disp,
    mom: 0,
    envAngle: envAngleValue,
  };
}
