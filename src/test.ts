import { svgof } from "./SvgManager";
import * as tinycolor from "tinycolor2";
import { Affine, collectionof } from "./index";

function log(name: string, obj: any) {
  console.log(name + ": " + JSON.stringify(obj));
}

let circle = <any>document.getElementById("circle");
let circle2 = <any>document.getElementById("circle2");
let circle3 = <any>document.getElementById("circle3");

log("box", collectionof([circle, circle2, circle3]).size());
collectionof([circle, circle2, circle3]).size([200, 400]);
