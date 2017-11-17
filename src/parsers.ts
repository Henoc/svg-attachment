import {Input, decimal, r} from "yaparsec";
import { Vec2 } from "./Vec2";

export function parsePoints(attr: string): Vec2[] {
  let point = decimal.then(decimal);
  let points = point.rep();
  return points.of(new Input(attr, /^[\s,]+/)).getResult();
}

export interface PathOperator {
  kind: string;
  points: Vec2[];
}

export function parseD(attr: string): PathOperator[] {
  let opHead = r(/[mMlLhHvVaAqQtTcCsSzZ]/);
  let point = decimal.then(() => decimal);
  let points = point.rep();
  let op = opHead.then(points).map(ret => {return <PathOperator>{ kind: ret[0], points: ret[1] }; });
  return op.rep().of(new Input(attr, /^[\s,]+/)).getResult();
}

export function genD(pathOps: PathOperator[]): string {
  return pathOps.map(pathOp => {
    return pathOp.kind + " " + pathOp.points.map(p => p.join(" ")).join(", ");
  }).join(" ");
}
