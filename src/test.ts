import { svgof } from "./SvgManager";
import * as tinycolor from "tinycolor2";

function log(name: string, obj: any) {
  console.log(name + ": " + JSON.stringify(obj));
}

let circle = <any>document.getElementById("circle");
let circle2 = <any>document.getElementById("circle2");
let circle3 = <any>document.getElementById("circle3");

log("leftTop", svgof(circle).leftTop());
log("rightBottom", svgof(circle).rightBottom());
log("attr fill", svgof(circle).attr("fill"));
log("color fill",  svgof(circle).color("fill"));
log("color fill",  svgof(circle2).color("fill"));
log("color stroke",  svgof(circle2).color("stroke"));
log("color stroke",  svgof(circle3).color("stroke"));
svgof(circle3).color("stroke", tinycolor("#666644"));
log("color set stroke", svgof(circle3).color("stroke"));


