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

|name|description|
|:---|:---|
|attr(name: string, value?: string)| Get and set attributes |
|attrFn(name: string, fn: (v: string \| undefined => string): string)| Attributes setter which can use current value |
|getBBox()|Get bounding box|
|leftTop(vec2?: Vec2)|Left top of shape. Getter is by BoundingBox|
|rightDown(vec2?: Vec2)| |
|center(vec2?: Vec2)| |
|color(fillstroke: "fill" \| "stroke", colorInstance?: tinycolorInstance): tinycolorInstance \| undefined | Get or set color of fill/stroke with opacity. In getter, source function is `getComputedStyle`. Return undefined if there is `none` color. |



