import * as tinycolor from "tinycolor2";
import { Affine } from "./index";
import { svg } from "./RootManager";

function log(name: string, obj: any) {
  console.log(name + ": " + JSON.stringify(obj));
}

let circle = <any>document.getElementById("circle");
let circle2 = <any>document.getElementById("circle2");
let circle3 = <any>document.getElementById("circle3");

let root = svg(document.getElementById("svg")!);
log("1", root.svgof(circle).center());
log("2", root.svgof(circle2).leftTop());
log("3", root.svgof(circle3).rightBottom());

log("box", root.collectionof([circle, circle2, circle3]).center());
root.collectionof([circle, circle2, circle3]).size([200, 400]);
