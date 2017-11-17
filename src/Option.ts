export class Option<T> {
  constructor(public content: T | undefined) {}

  map<U>(fn: (t: T) => U): Option<U> {
    if (this.content) {
      return new Option(fn(this.content));
    } else {
      return new Option<U>(undefined);
    }
  }
}

export function optional<T>(content: T | undefined): Option<T> {
  return new Option(content);
}
