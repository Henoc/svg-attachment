import { Vec2, optional, nonUndefined, parsePoints, add, muldot, PathOperator, parseD, genD } from "./index";
import { svgof } from "./SvgManager";

export class SizeManager {
  constructor(public node: SVGElement) {}

  /**
   * 図形中心を中心として縮尺を変更する
   * 比率維持拡大しかできないものはvec2[0]倍する
   */
  zoom(vec2: Vec2): void {
    let center = svgof(this.node).center();
    switch (this.node.tagName) {
      case "circle":
        svgof(this.node).attrFn("r", origin => optional(origin).map(c => String(+c * vec2[0])).content);
        break;
      case "ellipse":
        svgof(this.node).attrFn("rx", origin => optional(origin).map(c => String(+c * vec2[0])).content);
        svgof(this.node).attrFn("ry", origin => optional(origin).map(c => String(+c * vec2[1])).content);
        break;
      case "text":
        svgof(this.node).attrFn("font-size", origin => optional(origin).map(c => String(+c * vec2[0])).content);
        break;
      case "rect":
      case "use":
        svgof(this.node).attrFn("width", origin => optional(origin).map(c => String(+c * vec2[0])).content);
        svgof(this.node).attrFn("height", origin => optional(origin).map(c => String(+c * vec2[1])).content);
        break;
      case "line":
        center = svgof(this.node).center();
        svgof(this.node).attrFn("x2", origin => optional(origin).map(c => String(+c * vec2[0])).content);
        svgof(this.node).attrFn("y2", origin => optional(origin).map(c => String(+c * vec2[1])).content);
        break;
      case "polygon":
      case "polyline":
        center = svgof(this.node).center();
        let pointsAttr = svgof(this.node).attr("points");
        let points = nonUndefined(optional(pointsAttr).map(c => parsePoints(c)).content, []);
        points = points.map(p => muldot(p, vec2));
        svgof(this.node).attr("points", points.map(p => p.join(" ")).join(", "));
        break;
      case "path":
        center = svgof(this.node).center();
        let dAttr = svgof(this.node).attr("d");
        let d = nonUndefined(optional(dAttr).map(c => parseD(c)).content, []);
        d = d.map(op => <PathOperator>{
          kind: op.kind,
          points: op.points.map(p => muldot(p, vec2))
        });
        svgof(this.node).attr("d", genD(d));
        break;
      default:
        break;
    }
    svgof(this.node).center(center);
  }
}

export function sizeof(node: SVGElement): SizeManager {
  return new SizeManager(node);
}
