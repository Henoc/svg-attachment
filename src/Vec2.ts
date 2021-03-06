export type Vec2 = [number, number];

export function add(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}

export function muldot(a: Vec2, b: Vec2): Vec2 {
  return [a[0] * b[0], a[1] * b[1]];
}

export function divdot(a: Vec2, b: Vec2): Vec2 {
  return [a[0] / b[0], a[1] / b[1]];
}