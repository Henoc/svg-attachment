# SVG Attachment

![attachment image here](https://github.com/Henoc/svg-attachment/blob/master/images/attachment.png)

Tiny utility functions of SVG DOM.

## Features

- Simple, easy.
- No dirty DOM. No append some extra attributes.

## Usage

typescript:

```typescript
import {svg} from "svg-attachment";

let root = svg(document.getElementById("svg")!);    // svg tag element
let circle = document.getElementById("circle");
console.log(JSON.stringify(
  root.svgof(circle).leftTop()     // print the position of circle
));
```

## Contents

`svg` function makes a `RootManager` instance. `RootManager` has some methods that derives more managers.

### Functions of SvgManager

Below functions are methods derived by `svgof(node: SVGElement)`. Many functions are getter and also setter.

|name, args|return|description|
|:---|:---|:---|
|attr(name: string, value?: string)|string \| undefined| Get or set attributes |
|attrFn(name: string, fn: (v: string \| undefined) => string)|string \| undefined| Attributes setter which can use current value |
|getBBox()|ClientRect|Get bounding box|
|leftTop(vec2?: Vec2)|Vec2| Get or set left top position of shape|
|rightDown(vec2?: Vec2)|Vec2| |
|center(vec2?: Vec2)|Vec2| |
|size(vec2?: Vec2)|Vec2| Get or set width and height, introduced by BoundingClientRect method. |
|zoom(ratio: Vec2)|void| Zoom the shape without transform attributes. If only raito fixed zoom is accepted, value of `ratio[0]` is applied. |
|color(fillstroke: "fill" \| "stroke", colorInstance?: tinycolorInstance) |tinycolorInstance \| undefined| Get or set color of fill/stroke with opacity. In getter, source function is `getComputedStyle`. Return undefined if there is `none` color. |
|transform(transformfns?: TransformFn[])|TransformFn[] \| undefined| Get or set transform attribute |
|matrix(affine?: Affine)|Affine| Get or set as one matrix function |

### Functions of CollectionManager

Below functions are methods derived by `collectionof(node: SVGElement[])`. It's to enable united processes for SVGElement set.

|name, args|return|description|
|:--|:--|:--|
|center(vec2?: Vec2)|Vec2| |
|zoom(ratio: Vec2)|void| |
|size(vec2?: Vec2)|Vec2| |
|getBox()|Box| Returns an object represents merged ClientRect |

### Types

- `Vec2 = [number, number]`
- `TransformFn = { kind: TransformKinds; args: number[]; }`
- `TransformKinds = "matrix" | "translate" | "scale" | "rotate" | "skewX" | "skewY"`
- `Box = { leftTop: Vec2; rightBottom: Vec2; }`
- `tinycolorInstance` is the instance by package tinycolor2.
