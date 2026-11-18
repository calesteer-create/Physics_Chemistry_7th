/** Logical coordinates, measured from O to the tip (not to the base of the head). */
export type Point = readonly [x: number, y: number];

type ForceDiagram = { origin: Point; first: Point; second: Point; resultant: Point };

// p.31 is a construction in drawing units, not a calibrated force measurement.
const sumO: Point = [106, 26];
export const addition: ForceDiagram = {
  origin: sumO,
  first: [sumO[0], sumO[1] + 45],
  second: [sumO[0], sumO[1] + 70],
  resultant: [sumO[0], sumO[1] + 45 + 70],
};

// p.34: left is negative x; all three displacements use the same scale.
const differenceO: Point = [110, 54];
const unitsPerNewton = 4;
const tip = (newtons: number): Point => [differenceO[0] + unitsPerNewton * newtons, differenceO[1]];
export const subtraction: ForceDiagram = {
  origin: differenceO,
  first: tip(-20),
  second: tip(30),
  resultant: tip(30 - 20),
};
