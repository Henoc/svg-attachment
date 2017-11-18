import { Box, merge } from "./Box";
import { Vec2, add, divdot, sub, muldot } from "../index";
import { svgof } from "../SvgManager";
import { moveof } from "../MoveManager";
import { sizeof } from "../SizeManager";

/**
 * Utilities for set of SVGElement
 */
export class CollectionManager {

  constructor(public svgs: SVGElement[]) {
  }

  private makeBox(): Box {
    let clientRect = svgof(this.svgs[0]).getBBox();
    let box = <Box> {
      leftTop: [clientRect.left, clientRect.top],
      rightBottom: [clientRect.right, clientRect.bottom]
    };
    for (let i = 1; i < this.svgs.length; i++) {
      let rect = svgof(this.svgs[i]).getBBox();
      let box2 = <Box> {
        leftTop: [rect.left, rect.top],
        rightBottom: [rect.right, rect.bottom]
      };
      box = merge(box, box2);
    }
    return box;
  }

  /**
   * Get and set the center of the group. This affects all of members.
   */
  center(vec2?: Vec2): Vec2 {
    if (vec2 === undefined) {
      let box = this.makeBox();
      return divdot(add(box.leftTop, box.rightBottom), [2, 2]);
    } else {
      let delta = sub(vec2, this.center());
      this.svgs.forEach(svg => moveof(svg).move(delta));
      return this.center();
    }
  }

  zoom(ratio: Vec2): void {
    let center = this.center();
    this.svgs.forEach(svg => {
      sizeof(svg).zoom(ratio);
      let indivisual = svgof(svg).center();
      svgof(svg).center(add(muldot(indivisual, ratio), muldot(center, sub([1, 1], ratio) )));
    });
  }

  size(vec2?: Vec2): Vec2 {
    if (vec2 === undefined) {
      let box = this.makeBox();
      return [box.rightBottom[0] - box.leftTop[0], box.rightBottom[1] - box.leftTop[1]];
    } else {
      let ratio = divdot(vec2, this.size());
      this.zoom(ratio);
      return vec2;
    }
  }

  /**
   * Merged bounding box
   */
  getBox(): Box {
    return this.makeBox();
  }
}

export function collectionof(svgs: SVGElement[]): CollectionManager {
  return new CollectionManager(svgs);
}
