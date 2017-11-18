export function nonNull<T>(value: T | null, defaultValue: T): T {
  if (value === null) {
    return defaultValue;
  } else {
    return value;
  }
}

export function nonUndefined<T>(value: T | undefined, defaultValue: T): T {
  if (value === undefined) {
    return defaultValue;
  } else {
    return value;
  }
}

export function zip<T, U>(a: T[], b: U[]): [T, U][] {
  let ret: [T, U][] = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    ret.push([a[i], b[i]]);
  }
  return ret;
}
