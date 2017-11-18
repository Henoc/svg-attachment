import * as tinycolor from "tinycolor2";
import { Affine } from "./index";
import { svg } from "./RootManager";
import * as SVG from "svgjs";
let expect =  require("expect.js");

let doc = SVG("mocha").size(400, 400);
let circle: SVG.Element;
let root = svg(doc.node);

describe("svgof", () => {
  beforeEach(() => {
    circle = doc.circle(50).move(0, 0).fill("#666600");
  });

  afterEach(() => {
    doc.clear();
  });

  it("coordinate", () => {
    expect(root.svgof(circle.node).leftTop()).to.eql([0, 0]);
    expect(root.svgof(circle.node).rightBottom()).to.eql([50, 50]);
    expect(root.svgof(circle.node).center()).to.eql([25, 25]);
  });

  it("style", () => {
    expect(tinycolor(root.svgof(circle.node).style("fill")!).toHexString()).to.be("#666600");
    root.svgof(circle.node).style("fill", "#007777");
    expect(tinycolor(root.svgof(circle.node).style("fill")!).toHexString()).to.be("#007777");
  });
});




