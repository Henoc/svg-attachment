import { Vec2, optional, nonUndefined, parsePoints, add, muldot, PathOperator, parseD, genD } from "./index";
import { RootManager } from "./RootManager";

export class SizeManager {
  constructor(public root: RootManager, public node: Element) {}

  /**
   * 図形中心を中心として縮尺を変更する
   * 比率維持拡大しかできないものはvec2[0]倍する
   */
  zoom(vec2: Vec2): void {
    let center = this.root.svgof(this.node).center();
    switch (this.node.tagName) {
      case "circle":
        this.root.svgof(this.node).attrFn("r", origin => optional(origin).map(c => String(+c * vec2[0])).content);
        break;
      case "ellipse":
        this.root.svgof(this.node).attrFn("rx", origin => optional(origin).map(c => String(+c * vec2[0])).content);
        this.root.svgof(this.node).attrFn("ry", origin => optional(origin).map(c => String(+c * vec2[1])).content);
        break;
      case "text":
        this.root.svgof(this.node).attrFn("font-size", origin => optional(origin).map(c => String(+c * vec2[0])).content);
        break;
      case "rect":
      case "use":
        this.root.svgof(this.node).attrFn("width", origin => optional(origin).map(c => String(+c * vec2[0])).content);
        this.root.svgof(this.node).attrFn("height", origin => optional(origin).map(c => String(+c * vec2[1])).content);
        break;
      case "line":
        center = this.root.svgof(this.node).center();
        this.root.svgof(this.node).attrFn("x2", origin => optional(origin).map(c => String(+c * vec2[0])).content);
        this.root.svgof(this.node).attrFn("y2", origin => optional(origin).map(c => String(+c * vec2[1])).content);
        break;
      case "polygon":
      case "polyline":
        center = this.root.svgof(this.node).center();
        let pointsAttr = this.root.svgof(this.node).attr("points");
        let points = nonUndefined(optional(pointsAttr).map(c => parsePoints(c)).content, []);
        points = points.map(p => muldot(p, vec2));
        this.root.svgof(this.node).attr("points", points.map(p => p.join(" ")).join(", "));
        break;
      case "path":
        center = this.root.svgof(this.node).center();
        let dAttr = this.root.svgof(this.node).attr("d");
        let d = nonUndefined(optional(dAttr).map(c => parseD(c)).content, []);
        d = d.map(op => <PathOperator>{
          kind: op.kind,
          points: op.points.map(p => muldot(p, vec2))
        });
        this.root.svgof(this.node).attr("d", genD(d));
        break;
      default:
        break;
    }
    this.root.svgof(this.node).center(center);
  }
}
