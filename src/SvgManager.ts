import { nonNull, nonUndefined } from "./utils";
import { Vec2, sub } from "./Vec2";
import { moveof } from "./MoveManager";
import { optional } from "./Option";
import * as tinycolor from "tinycolor2";

export class SvgManager {
  constructor(public node: SVGElement) {}
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
  attrFn(name: string, fn: (v: string | undefined) => string): string | undefined {
    return this.attr(name, fn(this.attr(name)));
  }
  getBBox(): ClientRect {
    return this.node.getBoundingClientRect();
  }

  /**
   * Left top of shape. Getter is by BoundingBox.
   */
  leftTop(vec2?: Vec2): Vec2 {
    if (vec2 === undefined) {
      return [this.getBBox().left, this.getBBox().top];
    } else {
      let delta = sub(vec2, this.leftTop());
      moveof(this.node).move(delta);
      return vec2;
    }
  }

  /**
   * Right bottm of shape. Getter is by BoundingBox.
   */
  rightBottom(vec2?: Vec2): Vec2 {
    if (vec2 === undefined) {
      return [this.getBBox().right, this.getBBox().bottom];
    } else {
      let delta = sub(vec2, this.rightBottom());
      moveof(this.node).move(delta);
      return vec2;
    }
  }

  /**
   * Center position of shape. Getter is by BoundingBox.
   */
  center(vec2?: Vec2): Vec2 {
    if (vec2 === undefined) {
      let bbox = this.getBBox();
      return [(bbox.left + bbox.right) / 2, (bbox.top + bbox.bottom) / 2];
    } else {
      let delta = sub(vec2, this.center());
      moveof(this.node).move(delta);
      return vec2;
    }
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
}

export function svgof(node: SVGElement): SvgManager {
  return new SvgManager(node);
}
