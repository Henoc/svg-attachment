# SVG Attachment

Tiny utility functions of SVG DOM.

## Usage

```typescript
import {svgof} from "svg-attachment";

let circle = document.getElementById("circle");
console.log(JSON.stringify(
  svgof(circle).leftTop()     // print the position of circle
));
```

## Functions

Below functions are methods derived by `svgof(node: SVGElement)`. Many functions are getter and also setter.


types:

- `Vec2 = [number, number]`
- `TransformFn = { kind: TransformKinds; args: number[]; }`
- `TransformKinds = "matrix" | "translate" | "scale" | "rotate" | "skewX" | "skewY"`
- `tinycolorInstance` is the instance by package tinycolor2.

functions:

|name|description|
|:---|:---|
|attr(name: string, value?: string)| Get or set attributes |
|attrFn(name: string, fn: (v: string \| undefined => string): string)| Attributes setter which can use current value |
|getBBox()|Get bounding box|
|leftTop(vec2?: Vec2)|Left top of shape. Getter is by BoundingBox|
|rightDown(vec2?: Vec2)| |
|center(vec2?: Vec2)| |
|color(fillstroke: "fill" \| "stroke", colorInstance?: tinycolorInstance) | Get or set color of fill/stroke with opacity. In getter, source function is `getComputedStyle`. Return undefined if there is `none` color. |
|transform(transformfns?: TransformFn[])| Get or set transform attribute |
|matrix(affine?: Affine)| Get or set as one matrix function |

