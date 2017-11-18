import { zip } from "../utils";
import { TransformFn } from "./index";
import { Affine } from "../index";

/**
 * Unify the same kind of transformation
 */
export function compressCognate(transformFns: TransformFn[]): TransformFn[] {
  normalize(transformFns);
  let ret: TransformFn[] = [transformFns[0]];
  for (let i = 1; i < transformFns.length; i++) {
    if (ret[ret.length - 1].kind === transformFns[i].kind) {
      switch (transformFns[i].kind) {
        case "translate":
          ret[ret.length - 1].args = zip(ret[ret.length - 1].args, transformFns[i].args).map(pair => pair[0] + pair[1]);
          break;
        case "scale":
          ret[ret.length - 1].args = zip(ret[ret.length - 1].args, transformFns[i].args).map(pair => pair[0] * pair[1]);
          break;
        case "rotate":
          ret[ret.length - 1].args = [ret[ret.length - 1].args[0] + transformFns[i].args[0]];
          break;
        case "skewX":
        case "skewY":
          let a = ret[ret.length - 1].args[0];
          let b = transformFns[i].args[0];
          ret[ret.length - 1].args = [
            Math.atan(Math.tan(a) + Math.tan(b))
          ];
          break;
        case "matrix":
          let mat1 = ret[ret.length - 1].args;
          let mat2 = transformFns[i].args;
          ret[ret.length - 1].args =
            [
              mat1[0] * mat2[0] + mat1[2] * mat2[1],
              mat1[1] * mat2[0] + mat1[3] * mat2[1],
              mat1[0] * mat2[2] + mat1[2] * mat2[3],
              mat1[1] * mat2[2] + mat1[3] * mat2[3],
              mat1[4] + mat1[0] * mat2[4] + mat1[2] * mat2[5],
              mat1[5] + mat1[1] * mat2[4] + mat1[3] * mat2[5]
            ];
          break;
      }
    } else {
      ret.push(transformFns[i]);
    }
  }
  return ret;
}

/**
 * Reveal the implicit arguments
 */
export function normalize(transformFns: TransformFn[]): void {
  transformFns.forEach((fn, i) => {
    switch (fn.kind) {
      case "translate":
        if (fn.args.length === 1) {
          fn.args.push(0);
        }
        break;
      case "scale":
        if (fn.args.length === 1) {
          fn.args.push(fn.args[0]);
        }
        break;
      case "rotate":
        if (fn.args.length === 3) {
          transformFns.splice(
            i, 1,
            { kind: "translate", args: [fn.args[1], fn.args[2]]},
            { kind: "rotate", args: [fn.args[0]]},
            { kind: "translate", args: [-fn.args[1], -fn.args[2]]}
          );
        }
        break;
      default:
        break;
    }
  });
}

/**
 * Unify transform functions to one affine transform matrix
 */
export function unifyToAffine(transformFns: TransformFn[]): Affine {
  let tfns = transformFns;
  normalize(tfns);
  let affines = tfns.map(tfn => {
    switch (tfn.kind) {
      case "translate":
        return Affine.translate([tfn.args[0], tfn.args[1]]);
      case "scale":
        return Affine.scale([tfn.args[0], tfn.args[1]]);
      case "rotate":
        return Affine.rotate(tfn.args[0]);
      case "skewX":
        return Affine.skewX(tfn.args[0]);
      case "skewY":
        return Affine.skewX(tfn.args[0]);
      case "matrix":
        return new Affine(
          [tfn.args[0], tfn.args[2], tfn.args[4]],
          [tfn.args[1], tfn.args[3], tfn.args[5]]
        );
    }
  });
  return affines.reduce((p, c) => p.mulAffine(c));
}
