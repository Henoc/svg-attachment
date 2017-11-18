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

|name, args|return|description|
|:---|:---|:---|
|attr(name: string, value?: string)|string \| undefined| Get or set attributes |
|attrFn(name: string, fn: (v: string \| undefined) => string)|string \| undefined| Attributes setter which can use current value |
|getBBox()|ClientRect|Get bounding box|
|leftTop(vec2?: Vec2)|Vec2|Left top of shape. Getter is by BoundingBox|
|rightDown(vec2?: Vec2)|Vec2| |
|center(vec2?: Vec2)|Vec2| |
|size(vec2?: Vec2)|Vec2| Get and set width and height. Getter is by BoundingBox. |
|zoom(ratio: Vec2)|void| Zoom the shape without transform attributes. If only raito fixed zoom is accepted, value of `ratio[0]` is applied. |
|color(fillstroke: "fill" \| "stroke", colorInstance?: tinycolorInstance) |tinycolorInstance \| undefined| Get or set color of fill/stroke with opacity. In getter, source function is `getComputedStyle`. Return undefined if there is `none` color. |
|transform(transformfns?: TransformFn[])|TransformFn[] \| undefined| Get or set transform attribute |
|matrix(affine?: Affine)|Affine| Get or set as one matrix function |

