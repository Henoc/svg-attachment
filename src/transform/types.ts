export type TransformKinds = "matrix" | "translate" | "scale" | "rotate" | "skewX" | "skewY";
export interface TransformFn {
  kind: TransformKinds;
  args: number[];
}
