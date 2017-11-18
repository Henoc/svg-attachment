import { Vec2, CollectionManager } from "./index";
import { SvgManager } from "./SvgManager";
import { SizeManager } from "./SizeManager";
import { MoveManager } from "./MoveManager";

/**
 * Manage `svg` node.
 */
export class RootManager {

  public leftTop: Vec2;
  public size: Vec2;
  public rightBottom: Vec2;

  constructor(public svgroot: SVGElement) {
    let clientRect = this.svgroot.getBoundingClientRect();
    this.leftTop = [clientRect.left, clientRect.top];
    this.size = [clientRect.width, clientRect.height];
    this.rightBottom = [clientRect.right, clientRect.bottom];
  }

  svgof(node: SVGElement): SvgManager {
    return new SvgManager(this, node);
  }

  /**
   * Internal use only
   */
  sizeof(node: SVGElement): SizeManager {
    return new SizeManager(this, node);
  }

  /**
   * Internal use only
   */
  moveof(node: SVGElement): MoveManager {
    return new MoveManager(this, node);
  }

  collectionof(nodes: SVGElement[]): CollectionManager {
    return new CollectionManager(this, nodes);
  }
}

/**
 * Make `RootManager` instance
 */
export function svg(svgroot: HTMLElement): RootManager {
  return new RootManager(<any>svgroot);
}
