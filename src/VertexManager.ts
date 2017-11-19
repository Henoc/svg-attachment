import { RootManager } from "./RootManager";
import { Vec2, nonUndefined } from "./index";
import { parsePoints, parseD } from "./parsers";

export class VertexManager {
  constructor(public root: RootManager, public node: Element) {}

  vertexes(vec2s?: Vec2[]): Vec2[] | undefined {
    if (vec2s === undefined) {
      switch (this.node.tagName) {
        case "polygon":
        case "polyline":
          let pointsAttr = this.root.svgof(this.node).attr("points");
          return pointsAttr ? parsePoints(pointsAttr) : [];
        case "line":
          let x1 = +nonUndefined(this.root.svgof(this.node).attr("x1"), "0");
          let y1 = +nonUndefined(this.root.svgof(this.node).attr("y1"), "0");
          let x2 = +nonUndefined(this.root.svgof(this.node).attr("x2"), "0");
          let y2 = +nonUndefined(this.root.svgof(this.node).attr("y2"), "0");
          return [[x1, y1], [x2, y2]];
        case "path":
          let ret: Vec2[] = [];
          let dAttr = this.root.svgof(this.node).attr("d");
          if (dAttr) parseD(dAttr).forEach(op => {
            ret.push(...op.points);
          });
          return ret;
        default:
          return undefined;
      }
    } else {
      switch (this.node.tagName) {
        case "polygon":
        case "polyline":
          this.root.svgof(this.node).attr("points", vec2s.map(p => [p[0] + " " + p[1]]).join(", "));
          return vec2s;
        case "line":
          this.root.svgof(this.node).attr("x1", vec2s[0][0] + "");
          this.root.svgof(this.node).attr("y1", vec2s[0][1] + "");
          this.root.svgof(this.node).attr("x2", vec2s[1][0] + "");
          this.root.svgof(this.node).attr("y2", vec2s[1][1] + "");
          return vec2s;
        case "path":
          let dAttr = this.root.svgof(this.node).attr("d");
          if (dAttr === undefined) return;
          let pathOps = parseD(dAttr);
          let c = 0;
          for (let op of pathOps) {
            op.points = vec2s.slice(c, c + op.points.length);
            c += op.points.length;
          }
          this.root.svgof(this.node).attr("d", pathOps.map(op => op.kind + " " + op.points.map(p => [p[0] + " " + p[1]]).join(", ")).join(" "));
          return vec2s;
      }
      return vec2s;
    }
  }
}
