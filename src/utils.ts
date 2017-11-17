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
