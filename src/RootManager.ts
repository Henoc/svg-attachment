import { Vec2, CollectionManager } from "./index";
import { SvgManager } from "./SvgManager";
import { SizeManager } from "./SizeManager";
import { MoveManager } from "./MoveManager";
import { VertexManager } from "./VertexManager";

/**
 * Manage `svg` node.
 */
export class RootManager {

  public leftTop: Vec2;
  public size: Vec2;
  public rightBottom: Vec2;

  constructor(public svgroot: HTMLElement) {
    let clientRect = this.svgroot.getBoundingClientRect();
    this.leftTop = [clientRect.left, clientRect.top];
    this.size = [clientRect.width, clientRect.height];
    this.rightBottom = [clientRect.right, clientRect.bottom];
  }

  svgof(node: HTMLElement): SvgManager {
    return new SvgManager(this, node);
  }

  /**
   * Internal use only
   */
  sizeof(node: HTMLElement): SizeManager {
    return new SizeManager(this, node);
  }

  /**
   * Internal use only
   */
  moveof(node: HTMLElement): MoveManager {
    return new MoveManager(this, node);
  }

  collectionof(nodes: HTMLElement[]): CollectionManager {
    return new CollectionManager(this, nodes);
  }

  vertexof(node: HTMLElement): VertexManager {
    return new VertexManager(this, node);
  }
}

/**
 * Make `RootManager` instance
 */
export function svg(svgroot: HTMLElement): RootManager {
  return new RootManager(<any>svgroot);
}
