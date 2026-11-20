export type WorkDirection = "aligned" | "opposed" | "perpendicular" | "no-displacement";

/** Signed work for the grade-seven cases covered in the lesson. */
export function calculateWork(forceN: number, displacementM: number, direction: WorkDirection): number {
  if (!Number.isFinite(forceN) || forceN < 0) throw new RangeError("Force must be a finite non-negative number");
  if (!Number.isFinite(displacementM) || displacementM < 0) throw new RangeError("Displacement must be a finite non-negative number");
  if (displacementM === 0 || direction === "perpendicular" || direction === "no-displacement") return 0;
  return direction === "opposed" ? -forceN * displacementM : forceN * displacementM;
}

export function calculatePower(workJ: number, timeS: number): number {
  if (!Number.isFinite(workJ)) throw new RangeError("Work must be finite");
  if (!Number.isFinite(timeS) || timeS <= 0) throw new RangeError("Time must be a finite positive number");
  return workJ / timeS;
}

export function comparePower(workA: number, timeA: number, workB: number, timeB: number): "A" | "B" | "equal" {
  const powerA = calculatePower(workA, timeA);
  const powerB = calculatePower(workB, timeB);
  if (powerA === powerB) return "equal";
  return powerA > powerB ? "A" : "B";
}
