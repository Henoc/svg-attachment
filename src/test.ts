import * as tinycolor from "tinycolor2";
import { Affine } from "./index";
import { svg } from "./RootManager";
import * as SVG from "svgjs";
let expect =  require("expect.js");

let doc = SVG("mocha").size(400, 400);
let circle = doc.circle(50).move(0, 0);

let root = svg(doc.node);

it("svgof", () => {
  expect(root.svgof(circle.node).leftTop()).to.eql([0, 0]);
  expect(root.svgof(circle.node).rightBottom()).to.eql([50, 50]);
  expect(root.svgof(circle.node).center()).to.eql([25, 25]);
});


