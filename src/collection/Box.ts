import { Vec2 } from "../index";

export interface Box {
  leftTop: Vec2;
  rightBottom: Vec2;
}

export function merge(a: Box, b: Box): Box {
  return {
    leftTop: [Math.min(a.leftTop[0], b.leftTop[0]), Math.min(a.leftTop[1], b.leftTop[1])],
    rightBottom: [Math.max(a.rightBottom[0], b.rightBottom[0]), Math.max(a.rightBottom[1], b.rightBottom[1])]
  };
}
