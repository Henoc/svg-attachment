import { Vec2, add } from "./Vec2";
import { svgof } from "./SvgManager";
import { nonUndefined } from "./utils";
import { parsePoints, parseD, PathOperator, genD } from "./parsers";
import { optional } from "./Option";

export class MoveManager {
  constructor(public node: SVGElement) {}
  move(delta: Vec2) {
    switch (this.node.tagName) {
      case "circle":
      case "ellipse":
        svgof(this.node).attrFn("cx", origin => String(+nonUndefined(origin, "0") + delta[0]));
        svgof(this.node).attrFn("cy", origin => String(+nonUndefined(origin, "0") + delta[1]));
        break;
      case "image":
      case "text":
      case "rect":
      case "use":
        svgof(this.node).attrFn("x", origin => String(+nonUndefined(origin, "0") + delta[0]));
        svgof(this.node).attrFn("y", origin => String(+nonUndefined(origin, "0") + delta[1]));
        break;
      case "line":
        svgof(this.node).attrFn("x1", origin => String(+nonUndefined(origin, "0") + delta[0]));
        svgof(this.node).attrFn("y1", origin => String(+nonUndefined(origin, "0") + delta[1]));
        svgof(this.node).attrFn("x2", origin => String(+nonUndefined(origin, "0") + delta[0]));
        svgof(this.node).attrFn("y2", origin => String(+nonUndefined(origin, "0") + delta[1]));
        break;
      case "polygon":
      case "polyline":
        let pointsAttr = svgof(this.node).attr("points");
        let points = nonUndefined(optional(pointsAttr).map(c => parsePoints(c)).content, []);
        points = points.map(p => add(p, delta));
        svgof(this.node).attr("points", points.map(p => p.join(" ")).join(", "));
        break;
      case "path":
        let dAttr = svgof(this.node).attr("d");
        let d = nonUndefined(optional(dAttr).map(c => parseD(c)).content, []);
        d = d.map(op => <PathOperator>{
          kind: op.kind,
          points: op.points.map(p => add(p, delta))
        });
        svgof(this.node).attr("d", genD(d));
        break;
      default:
        break;
    }
  }
}

export function moveof(node: SVGElement): MoveManager {
  return new MoveManager(node);
}
