import { Matrix3 } from "./Matrix3";
import { Vec3 } from "./Vec3";
import { Vec2 } from "../Vec2";

export class Affine extends Matrix3 {
  constructor(r1: Vec3, r2: Vec3) {
    super(r1, r2, [0, 0, 1]);
  }

  /**
   * Transform `p` using this affine transform.
   */
  transform(p: Vec2): Vec2 {
    return this.mulVec([p[0], p[1], 1]);
  }

  mulAffine(that: Affine): Affine {
    let ret = this.mul(that);
    return new Affine(
      ret.m[0],
      ret.m[1]
    );
  }

  static translate(p: Vec2): Affine {
    return new Affine(
      [1, 0, p[0]],
      [0, 1, p[1]]
    );
  }

  static scale(p: Vec2): Affine {
    return new Affine(
      [p[0], 0, 0],
      [0, p[1], 0]
    );
  }

  static rotate(a: number): Affine {
    return new Affine(
      [Math.cos(a), -Math.sin(a), 0],
      [Math.sin(a), Math.cos(a), 0]
    );
  }

  static skewX(a: number): Affine {
    return new Affine(
      [1, Math.tan(a), 0],
      [0, 1, 0]
    );
  }

  static skewY(a: number): Affine {
    return new Affine(
      [1, 0, 0],
      [Math.tan(a), 1, 0]
    );
  }

  static unit(): Affine {
    return new Affine(
      [1, 0, 0],
      [0, 1, 0]
    );
  }
}
