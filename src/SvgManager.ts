import { nonNull, nonUndefined } from "./utils";
import { Vec2, sub } from "./Vec2";
import { optional } from "./Option";
import * as tinycolor from "tinycolor2";
import { TransformFn, unifyToAffine } from "./transform";
import { compressCognate } from "./transform/transforms";
import { parseTransform, Affine, divdot } from "./index";
import { RootManager } from "./RootManager";

export class SvgManager {
  constructor(public root: RootManager, public node: SVGElement) {}
  /**
   * Getter and setter of attributes. Remove an attribute if value is undefined.
   */
  attr(name: string, value?: string): string | undefined {
    if (value === undefined) {
      return nonNull(this.node.getAttribute(name), undefined);
    } else {
      this.node.setAttribute(name, value);
      return value;
    }
  }

  /**
   * Attributes setter which can use current value.
   */
  attrFn(name: string, fn: (v: string | undefined) => string | undefined): string | undefined {
    return this.attr(name, fn(this.attr(name)));
  }

  /**
   * It's the same as `getBoundingClientRect`
   */
  getBBox(): ClientRect {
    return this.node.getBoundingClientRect();
  }

  /**
   * Left top of shape.
   */
  leftTop(vec2?: Vec2): Vec2 {
    if (vec2 === undefined) {
      return sub([this.getBBox().left, this.getBBox().top], this.root.leftTop);
    } else {
      let delta = sub(vec2, this.leftTop());
      this.root.moveof(this.node).move(delta);
      return vec2;
    }
  }

  /**
   * Right bottm of shape. Size is calculated by BoundingClientRect.
   */
  rightBottom(vec2?: Vec2): Vec2 {
    if (vec2 === undefined) {
      return sub([this.getBBox().right, this.getBBox().bottom], this.root.leftTop);
    } else {
      let delta = sub(vec2, this.rightBottom());
      this.root.moveof(this.node).move(delta);
      return vec2;
    }
  }

  /**
   * Center position of shape. Size is calculated by BoundingClientRect.
   */
  center(vec2?: Vec2): Vec2 {
    if (vec2 === undefined) {
      let bbox = this.getBBox();
      return sub([(bbox.left + bbox.right) / 2, (bbox.top + bbox.bottom) / 2], this.root.leftTop);
    } else {
      let delta = sub(vec2, this.center());
      this.root.moveof(this.node).move(delta);
      return vec2;
    }
  }

  /**
   * Get and set width and height, calculated by BoundingClientRect.
   */
  size(vec2?: Vec2): Vec2 {
    if (vec2 === undefined) {
      return [this.getBBox().width, this.getBBox().height];
    } else {
      this.root.sizeof(this.node).zoom(divdot(vec2, this.size()));
      return vec2;
    }
  }

  /**
   * Zoom the shape without transform attributes. If only raito fixed zoom is accepted, value of `ratio[0]` is applied.
   */
  zoom(ratio: Vec2): void {
    this.root.sizeof(this.node).zoom(ratio);
  }

  /**
   * Get or set color of fill/stroke with opacity. In getter, source function is `getComputedStyle`. Return undefined if there is `none` color.
   */
  color(fillstroke: "fill" | "stroke", colorInstance?: tinycolorInstance): tinycolorInstance | undefined {
    if (fillstroke === "fill") {
      if (colorInstance === undefined) {
        let style = window.getComputedStyle(this.node);
        if (style.fill === null || style.fill === "none") return undefined;
        let tcolor = tinycolor(style.fill);
        let opacity = style.fillOpacity;
        if (opacity) tcolor.setAlpha(+opacity);
        return tcolor;
      } else {
        this.node.style.fill = colorInstance.toHexString();
        this.node.style.fillOpacity = colorInstance.getAlpha() + "";
        return colorInstance;
      }
    } else {
      if (colorInstance === undefined) {
        let style = window.getComputedStyle(this.node);
        if (style.stroke === null || style.stroke === "none") return undefined;
        let tcolor = tinycolor(style.stroke);
        let opacity = style.strokeOpacity;
        if (opacity) tcolor.setAlpha(+opacity);
        return tcolor;
      } else {
        this.node.style.stroke = colorInstance.toHexString();
        this.node.style.strokeOpacity = colorInstance.getAlpha() + "";
        return colorInstance;
      }
    }
  }

  /**
   * Get or set transform attribute
   */
  transform(transformfns?: TransformFn[]): TransformFn[] | undefined {
    if (transformfns === undefined) {
      return optional(this.attr("transform")).map(c => parseTransform(c)).content;
    } else {
      transformfns = compressCognate(transformfns);
      this.attr("transform", transformfns.map(fn => `${fn.kind} (${fn.args.join(" ")})`).join(" "));
      return transformfns;
    }
  }

  /**
   * Add transform function in right
   */
  addTransformFnRight(transformFn: TransformFn): void {
    let rawAttr = this.attr("transform");
    let attr = rawAttr === undefined ? [] : parseTransform(rawAttr);
    attr.push(transformFn);
    attr = compressCognate(attr);
    this.attr(
      "transform",
      `${attr.map(fn => fn.kind + "(" + fn.args.join(" ") + ")")}})`
    );
  }

  /**
   * Add transform function in left
   */
  addTransformFnLeft(transformFn: TransformFn): void {
    let attr = (() => {
      let rawAttr = this.attr("transform");
      return rawAttr === undefined ? [] : parseTransform(rawAttr);
    })();
    attr.unshift(transformFn);
    attr = compressCognate(attr);
    this.attr(
      "transform",
      `${attr.map(fn => fn.kind + "(" + fn.args.join(" ") + ")")}})`
    );
  }

  /**
   * Get or set as one affine transform matrix
   */
  matrix(affine?: Affine): Affine {
    if (affine === undefined) {
      let tfns = this.transform();
      return tfns ? unifyToAffine(tfns) : Affine.unit();
    } else {
      this.attr("transform", `matrix(${affine.col(0)[0]} ${affine.col(0)[1]} ${affine.col(1)[0]} ${affine.col(1)[1]} ${affine.col(2)[0]} ${affine.col(2)[1]})`);
      return affine;
    }
  }
}
