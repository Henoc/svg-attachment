(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const Vec2_1 = require("./Vec2");
const utils_1 = require("./utils");
const parsers_1 = require("./parsers");
const Option_1 = require("./Option");
class MoveManager {
    constructor(root, node) {
        this.root = root;
        this.node = node;
    }
    move(delta) {
        switch (this.node.tagName) {
            case "circle":
            case "ellipse":
                this.root.svgof(this.node).attrFn("cx", origin => String(+utils_1.nonUndefined(origin, "0") + delta[0]));
                this.root.svgof(this.node).attrFn("cy", origin => String(+utils_1.nonUndefined(origin, "0") + delta[1]));
                break;
            case "image":
            case "text":
            case "rect":
            case "use":
                this.root.svgof(this.node).attrFn("x", origin => String(+utils_1.nonUndefined(origin, "0") + delta[0]));
                this.root.svgof(this.node).attrFn("y", origin => String(+utils_1.nonUndefined(origin, "0") + delta[1]));
                break;
            case "line":
                this.root.svgof(this.node).attrFn("x1", origin => String(+utils_1.nonUndefined(origin, "0") + delta[0]));
                this.root.svgof(this.node).attrFn("y1", origin => String(+utils_1.nonUndefined(origin, "0") + delta[1]));
                this.root.svgof(this.node).attrFn("x2", origin => String(+utils_1.nonUndefined(origin, "0") + delta[0]));
                this.root.svgof(this.node).attrFn("y2", origin => String(+utils_1.nonUndefined(origin, "0") + delta[1]));
                break;
            case "polygon":
            case "polyline":
                let pointsAttr = this.root.svgof(this.node).attr("points");
                let points = utils_1.nonUndefined(Option_1.optional(pointsAttr).map(c => parsers_1.parsePoints(c)).content, []);
                points = points.map(p => Vec2_1.add(p, delta));
                this.root.svgof(this.node).attr("points", points.map(p => p.join(" ")).join(", "));
                break;
            case "path":
                let dAttr = this.root.svgof(this.node).attr("d");
                let d = utils_1.nonUndefined(Option_1.optional(dAttr).map(c => parsers_1.parseD(c)).content, []);
                d = d.map(op => ({
                    kind: op.kind,
                    points: op.points.map(p => Vec2_1.add(p, delta))
                }));
                this.root.svgof(this.node).attr("d", parsers_1.genD(d));
                break;
            default:
                break;
        }
    }
}
exports.MoveManager = MoveManager;

},{"./Option":2,"./Vec2":6,"./parsers":16,"./utils":19}],2:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
class Option {
    constructor(content) {
        this.content = content;
    }
    map(fn) {
        if (this.content) {
            return new Option(fn(this.content));
        }
        else {
            return new Option(undefined);
        }
    }
}
exports.Option = Option;
function optional(content) {
    return new Option(content);
}
exports.optional = optional;

},{}],3:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const SvgManager_1 = require("./SvgManager");
const SizeManager_1 = require("./SizeManager");
const MoveManager_1 = require("./MoveManager");
const VertexManager_1 = require("./VertexManager");
/**
 * Manage `svg` node.
 */
class RootManager {
    constructor(svgroot) {
        this.svgroot = svgroot;
        let clientRect = this.svgroot.getBoundingClientRect();
        this.leftTop = [clientRect.left, clientRect.top];
        this.size = [clientRect.width, clientRect.height];
        this.rightBottom = [clientRect.right, clientRect.bottom];
    }
    svgof(node) {
        return new SvgManager_1.SvgManager(this, node);
    }
    /**
     * Internal use only
     */
    sizeof(node) {
        return new SizeManager_1.SizeManager(this, node);
    }
    /**
     * Internal use only
     */
    moveof(node) {
        return new MoveManager_1.MoveManager(this, node);
    }
    collectionof(nodes) {
        return new index_1.CollectionManager(this, nodes);
    }
    vertexof(node) {
        return new VertexManager_1.VertexManager(this, node);
    }
}
exports.RootManager = RootManager;
/**
 * Make `RootManager` instance
 */
function svg(svgroot) {
    return new RootManager(svgroot);
}
exports.svg = svg;

},{"./MoveManager":1,"./SizeManager":4,"./SvgManager":5,"./VertexManager":7,"./index":15}],4:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
class SizeManager {
    constructor(root, node) {
        this.root = root;
        this.node = node;
    }
    /**
     * 図形中心を中心として縮尺を変更する
     * 比率維持拡大しかできないものはvec2[0]倍する
     */
    zoom(vec2) {
        let center = this.root.svgof(this.node).center();
        switch (this.node.tagName) {
            case "circle":
                this.root.svgof(this.node).attrFn("r", origin => index_1.optional(origin).map(c => String(+c * vec2[0])).content);
                break;
            case "ellipse":
                this.root.svgof(this.node).attrFn("rx", origin => index_1.optional(origin).map(c => String(+c * vec2[0])).content);
                this.root.svgof(this.node).attrFn("ry", origin => index_1.optional(origin).map(c => String(+c * vec2[1])).content);
                break;
            case "text":
                this.root.svgof(this.node).attrFn("font-size", origin => index_1.optional(origin).map(c => String(+c * vec2[0])).content);
                break;
            case "rect":
            case "use":
                this.root.svgof(this.node).attrFn("width", origin => index_1.optional(origin).map(c => String(+c * vec2[0])).content);
                this.root.svgof(this.node).attrFn("height", origin => index_1.optional(origin).map(c => String(+c * vec2[1])).content);
                break;
            case "line":
                center = this.root.svgof(this.node).center();
                this.root.svgof(this.node).attrFn("x2", origin => index_1.optional(origin).map(c => String(+c * vec2[0])).content);
                this.root.svgof(this.node).attrFn("y2", origin => index_1.optional(origin).map(c => String(+c * vec2[1])).content);
                break;
            case "polygon":
            case "polyline":
                center = this.root.svgof(this.node).center();
                let pointsAttr = this.root.svgof(this.node).attr("points");
                let points = index_1.nonUndefined(index_1.optional(pointsAttr).map(c => index_1.parsePoints(c)).content, []);
                points = points.map(p => index_1.muldot(p, vec2));
                this.root.svgof(this.node).attr("points", points.map(p => p.join(" ")).join(", "));
                break;
            case "path":
                center = this.root.svgof(this.node).center();
                let dAttr = this.root.svgof(this.node).attr("d");
                let d = index_1.nonUndefined(index_1.optional(dAttr).map(c => index_1.parseD(c)).content, []);
                d = d.map(op => ({
                    kind: op.kind,
                    points: op.points.map(p => index_1.muldot(p, vec2))
                }));
                this.root.svgof(this.node).attr("d", index_1.genD(d));
                break;
            default:
                break;
        }
        this.root.svgof(this.node).center(center);
    }
}
exports.SizeManager = SizeManager;

},{"./index":15}],5:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const Vec2_1 = require("./Vec2");
const Option_1 = require("./Option");
const tinycolor = require("tinycolor2");
const transform_1 = require("./transform");
const transforms_1 = require("./transform/transforms");
const index_1 = require("./index");
class SvgManager {
    constructor(root, node) {
        this.root = root;
        this.node = node;
    }
    /**
     * Getter and setter of attributes. Remove an attribute if value is undefined.
     */
    attr(name, value) {
        if (value === undefined) {
            return utils_1.nonNull(this.node.getAttribute(name), undefined);
        }
        else {
            this.node.setAttribute(name, value);
            return value;
        }
    }
    /**
     * Attributes setter which can use current value.
     */
    attrFn(name, fn) {
        return this.attr(name, fn(this.attr(name)));
    }
    /**
     * It's the same as `getBoundingClientRect`
     */
    getBBox() {
        return this.node.getBoundingClientRect();
    }
    /**
     * Left top of shape.
     */
    leftTop(vec2) {
        if (vec2 === undefined) {
            return Vec2_1.sub([this.getBBox().left, this.getBBox().top], this.root.leftTop);
        }
        else {
            let delta = Vec2_1.sub(vec2, this.leftTop());
            this.root.moveof(this.node).move(delta);
            return vec2;
        }
    }
    /**
     * Right bottm of shape. Size is calculated by BoundingClientRect.
     */
    rightBottom(vec2) {
        if (vec2 === undefined) {
            return Vec2_1.sub([this.getBBox().right, this.getBBox().bottom], this.root.leftTop);
        }
        else {
            let delta = Vec2_1.sub(vec2, this.rightBottom());
            this.root.moveof(this.node).move(delta);
            return vec2;
        }
    }
    /**
     * Center position of shape. Size is calculated by BoundingClientRect.
     */
    center(vec2) {
        if (vec2 === undefined) {
            let bbox = this.getBBox();
            return Vec2_1.sub([(bbox.left + bbox.right) / 2, (bbox.top + bbox.bottom) / 2], this.root.leftTop);
        }
        else {
            let delta = Vec2_1.sub(vec2, this.center());
            this.root.moveof(this.node).move(delta);
            return vec2;
        }
    }
    /**
     * Get and set width and height, calculated by BoundingClientRect.
     */
    size(vec2) {
        if (vec2 === undefined) {
            return [this.getBBox().width, this.getBBox().height];
        }
        else {
            this.root.sizeof(this.node).zoom(index_1.divdot(vec2, this.size()));
            return vec2;
        }
    }
    /**
     * Zoom the shape without transform attributes. If only raito fixed zoom is accepted, value of `ratio[0]` is applied.
     */
    zoom(ratio) {
        this.root.sizeof(this.node).zoom(ratio);
    }
    /**
     * Get or set color of fill/stroke with opacity. In getter, source function is `getComputedStyle`. Return undefined if there is `none` color.
     */
    color(fillstroke, colorInstance) {
        if (fillstroke === "fill") {
            if (colorInstance === undefined) {
                let style = window.getComputedStyle(this.node);
                if (style.fill === null || style.fill === "none")
                    return undefined;
                let tcolor = tinycolor(style.fill);
                let opacity = style.fillOpacity;
                if (opacity)
                    tcolor.setAlpha(+opacity);
                return tcolor;
            }
            else {
                this.node.style.fill = colorInstance.toHexString();
                this.node.style.fillOpacity = colorInstance.getAlpha() + "";
                return colorInstance;
            }
        }
        else {
            if (colorInstance === undefined) {
                let style = window.getComputedStyle(this.node);
                if (style.stroke === null || style.stroke === "none")
                    return undefined;
                let tcolor = tinycolor(style.stroke);
                let opacity = style.strokeOpacity;
                if (opacity)
                    tcolor.setAlpha(+opacity);
                return tcolor;
            }
            else {
                this.node.style.stroke = colorInstance.toHexString();
                this.node.style.strokeOpacity = colorInstance.getAlpha() + "";
                return colorInstance;
            }
        }
    }
    /**
     * Get computed style (undefined if value is undefined or "none") or set `value` to the style attribute
     */
    style(name, value) {
        if (value === undefined) {
            let st = window.getComputedStyle(this.node);
            if (st[name] === undefined || st[name] === "none")
                return undefined;
            else
                return st[name];
        }
        else {
            this.node.style[name] = value;
            return value;
        }
    }
    /**
     * Get or set transform attribute
     */
    transform(transformfns) {
        if (transformfns === undefined) {
            return Option_1.optional(this.attr("transform")).map(c => index_1.parseTransform(c)).content;
        }
        else {
            transformfns = transforms_1.compressCognate(transformfns);
            this.attr("transform", transformfns.map(fn => `${fn.kind} (${fn.args.join(" ")})`).join(" "));
            return transformfns;
        }
    }
    /**
     * Add transform function in right
     */
    addTransformFnRight(transformFn) {
        let rawAttr = this.attr("transform");
        let attr = rawAttr === undefined ? [] : index_1.parseTransform(rawAttr);
        attr.push(transformFn);
        attr = transforms_1.compressCognate(attr);
        this.attr("transform", `${attr.map(fn => fn.kind + "(" + fn.args.join(" ") + ")")}})`);
    }
    /**
     * Add transform function in left
     */
    addTransformFnLeft(transformFn) {
        let attr = (() => {
            let rawAttr = this.attr("transform");
            return rawAttr === undefined ? [] : index_1.parseTransform(rawAttr);
        })();
        attr.unshift(transformFn);
        attr = transforms_1.compressCognate(attr);
        this.attr("transform", `${attr.map(fn => fn.kind + "(" + fn.args.join(" ") + ")")}})`);
    }
    /**
     * Get or set as one affine transform matrix
     */
    matrix(affine) {
        if (affine === undefined) {
            let tfns = this.transform();
            return tfns ? transform_1.unifyToAffine(tfns) : index_1.Affine.unit();
        }
        else {
            this.attr("transform", `matrix(${affine.col(0)[0]} ${affine.col(0)[1]} ${affine.col(1)[0]} ${affine.col(1)[1]} ${affine.col(2)[0]} ${affine.col(2)[1]})`);
            return affine;
        }
    }
}
exports.SvgManager = SvgManager;

},{"./Option":2,"./Vec2":6,"./index":15,"./transform":17,"./transform/transforms":18,"./utils":19,"tinycolor2":20}],6:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
function add(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
}
exports.add = add;
function sub(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
}
exports.sub = sub;
function muldot(a, b) {
    return [a[0] * b[0], a[1] * b[1]];
}
exports.muldot = muldot;
function divdot(a, b) {
    return [a[0] / b[0], a[1] / b[1]];
}
exports.divdot = divdot;

},{}],7:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const parsers_1 = require("./parsers");
class VertexManager {
    constructor(root, node) {
        this.root = root;
        this.node = node;
    }
    vertexes(vec2s) {
        if (vec2s === undefined) {
            switch (this.node.tagName) {
                case "polygon":
                case "polyline":
                    let pointsAttr = this.root.svgof(this.node).attr("points");
                    return pointsAttr ? parsers_1.parsePoints(pointsAttr) : [];
                case "line":
                    let x1 = +index_1.nonUndefined(this.root.svgof(this.node).attr("x1"), "0");
                    let y1 = +index_1.nonUndefined(this.root.svgof(this.node).attr("y1"), "0");
                    let x2 = +index_1.nonUndefined(this.root.svgof(this.node).attr("x2"), "0");
                    let y2 = +index_1.nonUndefined(this.root.svgof(this.node).attr("y2"), "0");
                    return [[x1, y1], [x2, y2]];
                case "path":
                    let ret = [];
                    let dAttr = this.root.svgof(this.node).attr("d");
                    if (dAttr)
                        parsers_1.parseD(dAttr).forEach(op => {
                            ret.push(...op.points);
                        });
                    return ret;
                default:
                    return undefined;
            }
        }
        else {
            switch (this.node.tagName) {
                case "polygon":
                case "polyline":
                    this.root.svgof(this.node).attr("points", vec2s.map(p => [p[0] + " " + p[1]]).join(", "));
                    return vec2s;
                case "line":
                    this.root.svgof(this.node).attr("x1", vec2s[0][0] + "");
                    this.root.svgof(this.node).attr("y1", vec2s[0][1] + "");
                    this.root.svgof(this.node).attr("x2", vec2s[1][0] + "");
                    this.root.svgof(this.node).attr("y2", vec2s[1][1] + "");
                    return vec2s;
                case "path":
                    let dAttr = this.root.svgof(this.node).attr("d");
                    if (dAttr === undefined)
                        return;
                    let pathOps = parsers_1.parseD(dAttr);
                    let c = 0;
                    for (let op of pathOps) {
                        op.points = vec2s.slice(c, c + op.points.length);
                        c += op.points.length;
                    }
                    this.root.svgof(this.node).attr("d", pathOps.map(op => op.kind + " " + op.points.map(p => [p[0] + " " + p[1]]).join(", ")).join(" "));
                    return vec2s;
            }
            return vec2s;
        }
    }
}
exports.VertexManager = VertexManager;

},{"./index":15,"./parsers":16}],8:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const Matrix3_1 = require("./Matrix3");
class Affine extends Matrix3_1.Matrix3 {
    constructor(r1, r2) {
        super(r1, r2, [0, 0, 1]);
    }
    /**
     * Transform `p` using this affine transform.
     */
    transform(p) {
        return this.mulVec([p[0], p[1], 1]);
    }
    mulAffine(that) {
        let ret = this.mul(that);
        return new Affine(ret.m[0], ret.m[1]);
    }
    static translate(p) {
        return new Affine([1, 0, p[0]], [0, 1, p[1]]);
    }
    static scale(p) {
        return new Affine([p[0], 0, 0], [0, p[1], 0]);
    }
    static rotate(a) {
        return new Affine([Math.cos(a), -Math.sin(a), 0], [Math.sin(a), Math.cos(a), 0]);
    }
    static skewX(a) {
        return new Affine([1, Math.tan(a), 0], [0, 1, 0]);
    }
    static skewY(a) {
        return new Affine([1, 0, 0], [Math.tan(a), 1, 0]);
    }
    static unit() {
        return new Affine([1, 0, 0], [0, 1, 0]);
    }
}
exports.Affine = Affine;

},{"./Matrix3":9}],9:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const Vec3_1 = require("./Vec3");
class Matrix3 {
    constructor(r1, r2, r3) {
        this.m = [r1, r2, r3];
    }
    static fromColumns(c1, c2, c3) {
        return new Matrix3([c1[0], c2[0], c3[0]], [c1[1], c2[1], c3[1]], [c1[2], c2[2], c3[2]]);
    }
    /**
     * Multiple to column vector.
     */
    mulVec(that) {
        return [
            Vec3_1.innerProd(this.m[0], that),
            Vec3_1.innerProd(this.m[1], that),
            Vec3_1.innerProd(this.m[2], that)
        ];
    }
    /**
     * Get nth column vector.
     */
    col(n) {
        return [
            this.m[0][n],
            this.m[1][n],
            this.m[2][n]
        ];
    }
    mul(that) {
        let c1 = this.mulVec(that.col(0));
        let c2 = this.mulVec(that.col(1));
        let c3 = this.mulVec(that.col(2));
        return Matrix3.fromColumns(c1, c2, c3);
    }
}
exports.Matrix3 = Matrix3;

},{"./Vec3":10}],10:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
function innerProd(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}
exports.innerProd = innerProd;

},{}],11:[function(require,module,exports){
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./Affine"));
__export(require("./Vec3"));

},{"./Affine":8,"./Vec3":10}],12:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
function merge(a, b) {
    return {
        leftTop: [Math.min(a.leftTop[0], b.leftTop[0]), Math.min(a.leftTop[1], b.leftTop[1])],
        rightBottom: [Math.max(a.rightBottom[0], b.rightBottom[0]), Math.max(a.rightBottom[1], b.rightBottom[1])]
    };
}
exports.merge = merge;

},{}],13:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const Box_1 = require("./Box");
const index_1 = require("../index");
/**
 * Utilities for set of SVGElement
 */
class CollectionManager {
    constructor(root, svgs) {
        this.root = root;
        this.svgs = svgs;
    }
    makeBox() {
        let clientRect = this.root.svgof(this.svgs[0]).getBBox();
        let box = {
            leftTop: [clientRect.left, clientRect.top],
            rightBottom: [clientRect.right, clientRect.bottom]
        };
        for (let i = 1; i < this.svgs.length; i++) {
            let rect = this.root.svgof(this.svgs[i]).getBBox();
            let box2 = {
                leftTop: [rect.left, rect.top],
                rightBottom: [rect.right, rect.bottom]
            };
            box = Box_1.merge(box, box2);
        }
        return box;
    }
    leftTop(vec2) {
        if (vec2 === undefined) {
            let box = this.makeBox();
            return index_1.sub(box.leftTop, this.root.leftTop);
        }
        else {
            let delta = index_1.sub(vec2, this.leftTop());
            this.svgs.forEach(s => this.root.moveof(s).move(delta));
            return this.leftTop();
        }
    }
    rightBottom(vec2) {
        if (vec2 === undefined) {
            let box = this.makeBox();
            return index_1.sub(box.rightBottom, this.root.leftTop);
        }
        else {
            let delta = index_1.sub(vec2, this.rightBottom());
            this.svgs.forEach(s => this.root.moveof(s).move(delta));
            return this.rightBottom();
        }
    }
    /**
     * Get and set the center of the group. This affects all of members.
     */
    center(vec2) {
        if (vec2 === undefined) {
            let box = this.makeBox();
            return index_1.sub(index_1.divdot(index_1.add(box.leftTop, box.rightBottom), [2, 2]), this.root.leftTop);
        }
        else {
            let delta = index_1.sub(vec2, this.center());
            this.svgs.forEach(s => this.root.moveof(s).move(delta));
            return this.center();
        }
    }
    zoom(ratio) {
        let center = this.center();
        this.svgs.forEach(s => {
            this.root.sizeof(s).zoom(ratio);
            let indivisual = this.root.svgof(s).center();
            this.root.svgof(s).center(index_1.add(index_1.muldot(indivisual, ratio), index_1.muldot(center, index_1.sub([1, 1], ratio))));
        });
    }
    size(vec2) {
        if (vec2 === undefined) {
            let box = this.makeBox();
            return [box.rightBottom[0] - box.leftTop[0], box.rightBottom[1] - box.leftTop[1]];
        }
        else {
            let ratio = index_1.divdot(vec2, this.size());
            this.zoom(ratio);
            return vec2;
        }
    }
    /**
     * Merged bounding box
     */
    getBox() {
        return this.makeBox();
    }
}
exports.CollectionManager = CollectionManager;

},{"../index":15,"./Box":12}],14:[function(require,module,exports){
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./Box"));
__export(require("./CollectionManager"));

},{"./Box":12,"./CollectionManager":13}],15:[function(require,module,exports){
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./SvgManager"));
__export(require("./RootManager"));
__export(require("./utils"));
__export(require("./Vec2"));
__export(require("./parsers"));
__export(require("./Option"));
__export(require("./affine"));
__export(require("./collection"));

},{"./Option":2,"./RootManager":3,"./SvgManager":5,"./Vec2":6,"./affine":11,"./collection":14,"./parsers":16,"./utils":19}],16:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const yaparsec_1 = require("yaparsec");
function parsePoints(attr) {
    let point = yaparsec_1.decimal.then(yaparsec_1.decimal);
    let points = point.rep();
    return points.of(new yaparsec_1.Input(attr, /^[\s,]+/)).getResult();
}
exports.parsePoints = parsePoints;
function parseD(attr) {
    let opHead = yaparsec_1.r(/[mMlLhHvVaAqQtTcCsSzZ]/);
    let point = yaparsec_1.decimal.then(() => yaparsec_1.decimal);
    let points = point.rep();
    let op = opHead.then(points).map(ret => { return { kind: ret[0], points: ret[1] }; });
    return op.rep().of(new yaparsec_1.Input(attr, /^[\s,]+/)).getResult();
}
exports.parseD = parseD;
function genD(pathOps) {
    return pathOps.map(pathOp => {
        return pathOp.kind + " " + pathOp.points.map(p => p.join(" ")).join(", ");
    }).join(" ");
}
exports.genD = genD;
/**
 * Parse transform property of SVG
 */
function parseTransform(transformProperty) {
    let tfns = [];
    let tfn = {
        kind: undefined,
        args: []
    };
    let str = null;
    let identify = /[^\s(),]+/g;
    while (str = identify.exec(transformProperty)) {
        let matched = str[0];
        if (matched.match(/[a-zA-Z]+/)) {
            if (tfn.kind) {
                tfns.push(tfn);
                tfn = { kind: undefined, args: [] };
                tfn.kind = matched;
            }
            else {
                tfn.kind = matched;
            }
        }
        else {
            tfn.args.push(+matched);
        }
    }
    tfns.push(tfn);
    return tfns;
}
exports.parseTransform = parseTransform;
function parseStyle(style) {
    let ret = {};
    let pair = yaparsec_1.r(/[^:\s]+/).then(yaparsec_1.r(/[^;\s]+/));
    pair.rep().of(style).getResult().forEach(p => {
        ret[p[0]] = p[1];
    });
    return ret;
}
exports.parseStyle = parseStyle;

},{"yaparsec":23}],17:[function(require,module,exports){
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./transforms"));

},{"./transforms":18}],18:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const index_1 = require("../index");
/**
 * Unify the same kind of transformation
 */
function compressCognate(transformFns) {
    normalize(transformFns);
    let ret = [transformFns[0]];
    for (let i = 1; i < transformFns.length; i++) {
        if (ret[ret.length - 1].kind === transformFns[i].kind) {
            switch (transformFns[i].kind) {
                case "translate":
                    ret[ret.length - 1].args = utils_1.zip(ret[ret.length - 1].args, transformFns[i].args).map(pair => pair[0] + pair[1]);
                    break;
                case "scale":
                    ret[ret.length - 1].args = utils_1.zip(ret[ret.length - 1].args, transformFns[i].args).map(pair => pair[0] * pair[1]);
                    break;
                case "rotate":
                    ret[ret.length - 1].args = [ret[ret.length - 1].args[0] + transformFns[i].args[0]];
                    break;
                case "skewX":
                case "skewY":
                    let a = ret[ret.length - 1].args[0];
                    let b = transformFns[i].args[0];
                    ret[ret.length - 1].args = [
                        Math.atan(Math.tan(a) + Math.tan(b))
                    ];
                    break;
                case "matrix":
                    let mat1 = ret[ret.length - 1].args;
                    let mat2 = transformFns[i].args;
                    ret[ret.length - 1].args =
                        [
                            mat1[0] * mat2[0] + mat1[2] * mat2[1],
                            mat1[1] * mat2[0] + mat1[3] * mat2[1],
                            mat1[0] * mat2[2] + mat1[2] * mat2[3],
                            mat1[1] * mat2[2] + mat1[3] * mat2[3],
                            mat1[4] + mat1[0] * mat2[4] + mat1[2] * mat2[5],
                            mat1[5] + mat1[1] * mat2[4] + mat1[3] * mat2[5]
                        ];
                    break;
            }
        }
        else {
            ret.push(transformFns[i]);
        }
    }
    return ret;
}
exports.compressCognate = compressCognate;
/**
 * Reveal the implicit arguments
 */
function normalize(transformFns) {
    transformFns.forEach((fn, i) => {
        switch (fn.kind) {
            case "translate":
                if (fn.args.length === 1) {
                    fn.args.push(0);
                }
                break;
            case "scale":
                if (fn.args.length === 1) {
                    fn.args.push(fn.args[0]);
                }
                break;
            case "rotate":
                if (fn.args.length === 3) {
                    transformFns.splice(i, 1, { kind: "translate", args: [fn.args[1], fn.args[2]] }, { kind: "rotate", args: [fn.args[0]] }, { kind: "translate", args: [-fn.args[1], -fn.args[2]] });
                }
                break;
            default:
                break;
        }
    });
}
exports.normalize = normalize;
/**
 * Unify transform functions to one affine transform matrix
 */
function unifyToAffine(transformFns) {
    let tfns = transformFns;
    normalize(tfns);
    let affines = tfns.map(tfn => {
        switch (tfn.kind) {
            case "translate":
                return index_1.Affine.translate([tfn.args[0], tfn.args[1]]);
            case "scale":
                return index_1.Affine.scale([tfn.args[0], tfn.args[1]]);
            case "rotate":
                return index_1.Affine.rotate(tfn.args[0]);
            case "skewX":
                return index_1.Affine.skewX(tfn.args[0]);
            case "skewY":
                return index_1.Affine.skewX(tfn.args[0]);
            case "matrix":
                return new index_1.Affine([tfn.args[0], tfn.args[2], tfn.args[4]], [tfn.args[1], tfn.args[3], tfn.args[5]]);
        }
    });
    return affines.reduce((p, c) => p.mulAffine(c));
}
exports.unifyToAffine = unifyToAffine;

},{"../index":15,"../utils":19}],19:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
function nonNull(value, defaultValue) {
    if (value === null) {
        return defaultValue;
    }
    else {
        return value;
    }
}
exports.nonNull = nonNull;
function nonUndefined(value, defaultValue) {
    if (value === undefined) {
        return defaultValue;
    }
    else {
        return value;
    }
}
exports.nonUndefined = nonUndefined;
function zip(a, b) {
    let ret = [];
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        ret.push([a[i], b[i]]);
    }
    return ret;
}
exports.zip = zip;

},{}],20:[function(require,module,exports){
// TinyColor v1.4.1
// https://github.com/bgrins/TinyColor
// Brian Grinstead, MIT License

(function(Math) {

var trimLeft = /^\s+/,
    trimRight = /\s+$/,
    tinyCounter = 0,
    mathRound = Math.round,
    mathMin = Math.min,
    mathMax = Math.max,
    mathRandom = Math.random;

function tinycolor (color, opts) {

    color = (color) ? color : '';
    opts = opts || { };

    // If input is already a tinycolor, return itself
    if (color instanceof tinycolor) {
       return color;
    }
    // If we are called as a function, call using new instead
    if (!(this instanceof tinycolor)) {
        return new tinycolor(color, opts);
    }

    var rgb = inputToRGB(color);
    this._originalInput = color,
    this._r = rgb.r,
    this._g = rgb.g,
    this._b = rgb.b,
    this._a = rgb.a,
    this._roundA = mathRound(100*this._a) / 100,
    this._format = opts.format || rgb.format;
    this._gradientType = opts.gradientType;

    // Don't let the range of [0,255] come back in [0,1].
    // Potentially lose a little bit of precision here, but will fix issues where
    // .5 gets interpreted as half of the total, instead of half of 1
    // If it was supposed to be 128, this was already taken care of by `inputToRgb`
    if (this._r < 1) { this._r = mathRound(this._r); }
    if (this._g < 1) { this._g = mathRound(this._g); }
    if (this._b < 1) { this._b = mathRound(this._b); }

    this._ok = rgb.ok;
    this._tc_id = tinyCounter++;
}

tinycolor.prototype = {
    isDark: function() {
        return this.getBrightness() < 128;
    },
    isLight: function() {
        return !this.isDark();
    },
    isValid: function() {
        return this._ok;
    },
    getOriginalInput: function() {
      return this._originalInput;
    },
    getFormat: function() {
        return this._format;
    },
    getAlpha: function() {
        return this._a;
    },
    getBrightness: function() {
        //http://www.w3.org/TR/AERT#color-contrast
        var rgb = this.toRgb();
        return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    },
    getLuminance: function() {
        //http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
        var rgb = this.toRgb();
        var RsRGB, GsRGB, BsRGB, R, G, B;
        RsRGB = rgb.r/255;
        GsRGB = rgb.g/255;
        BsRGB = rgb.b/255;

        if (RsRGB <= 0.03928) {R = RsRGB / 12.92;} else {R = Math.pow(((RsRGB + 0.055) / 1.055), 2.4);}
        if (GsRGB <= 0.03928) {G = GsRGB / 12.92;} else {G = Math.pow(((GsRGB + 0.055) / 1.055), 2.4);}
        if (BsRGB <= 0.03928) {B = BsRGB / 12.92;} else {B = Math.pow(((BsRGB + 0.055) / 1.055), 2.4);}
        return (0.2126 * R) + (0.7152 * G) + (0.0722 * B);
    },
    setAlpha: function(value) {
        this._a = boundAlpha(value);
        this._roundA = mathRound(100*this._a) / 100;
        return this;
    },
    toHsv: function() {
        var hsv = rgbToHsv(this._r, this._g, this._b);
        return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
    },
    toHsvString: function() {
        var hsv = rgbToHsv(this._r, this._g, this._b);
        var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
        return (this._a == 1) ?
          "hsv("  + h + ", " + s + "%, " + v + "%)" :
          "hsva(" + h + ", " + s + "%, " + v + "%, "+ this._roundA + ")";
    },
    toHsl: function() {
        var hsl = rgbToHsl(this._r, this._g, this._b);
        return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
    },
    toHslString: function() {
        var hsl = rgbToHsl(this._r, this._g, this._b);
        var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
        return (this._a == 1) ?
          "hsl("  + h + ", " + s + "%, " + l + "%)" :
          "hsla(" + h + ", " + s + "%, " + l + "%, "+ this._roundA + ")";
    },
    toHex: function(allow3Char) {
        return rgbToHex(this._r, this._g, this._b, allow3Char);
    },
    toHexString: function(allow3Char) {
        return '#' + this.toHex(allow3Char);
    },
    toHex8: function(allow4Char) {
        return rgbaToHex(this._r, this._g, this._b, this._a, allow4Char);
    },
    toHex8String: function(allow4Char) {
        return '#' + this.toHex8(allow4Char);
    },
    toRgb: function() {
        return { r: mathRound(this._r), g: mathRound(this._g), b: mathRound(this._b), a: this._a };
    },
    toRgbString: function() {
        return (this._a == 1) ?
          "rgb("  + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ")" :
          "rgba(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ", " + this._roundA + ")";
    },
    toPercentageRgb: function() {
        return { r: mathRound(bound01(this._r, 255) * 100) + "%", g: mathRound(bound01(this._g, 255) * 100) + "%", b: mathRound(bound01(this._b, 255) * 100) + "%", a: this._a };
    },
    toPercentageRgbString: function() {
        return (this._a == 1) ?
          "rgb("  + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%)" :
          "rgba(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
    },
    toName: function() {
        if (this._a === 0) {
            return "transparent";
        }

        if (this._a < 1) {
            return false;
        }

        return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
    },
    toFilter: function(secondColor) {
        var hex8String = '#' + rgbaToArgbHex(this._r, this._g, this._b, this._a);
        var secondHex8String = hex8String;
        var gradientType = this._gradientType ? "GradientType = 1, " : "";

        if (secondColor) {
            var s = tinycolor(secondColor);
            secondHex8String = '#' + rgbaToArgbHex(s._r, s._g, s._b, s._a);
        }

        return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr="+hex8String+",endColorstr="+secondHex8String+")";
    },
    toString: function(format) {
        var formatSet = !!format;
        format = format || this._format;

        var formattedString = false;
        var hasAlpha = this._a < 1 && this._a >= 0;
        var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "hex4" || format === "hex8" || format === "name");

        if (needsAlphaFormat) {
            // Special case for "transparent", all other non-alpha formats
            // will return rgba when there is transparency.
            if (format === "name" && this._a === 0) {
                return this.toName();
            }
            return this.toRgbString();
        }
        if (format === "rgb") {
            formattedString = this.toRgbString();
        }
        if (format === "prgb") {
            formattedString = this.toPercentageRgbString();
        }
        if (format === "hex" || format === "hex6") {
            formattedString = this.toHexString();
        }
        if (format === "hex3") {
            formattedString = this.toHexString(true);
        }
        if (format === "hex4") {
            formattedString = this.toHex8String(true);
        }
        if (format === "hex8") {
            formattedString = this.toHex8String();
        }
        if (format === "name") {
            formattedString = this.toName();
        }
        if (format === "hsl") {
            formattedString = this.toHslString();
        }
        if (format === "hsv") {
            formattedString = this.toHsvString();
        }

        return formattedString || this.toHexString();
    },
    clone: function() {
        return tinycolor(this.toString());
    },

    _applyModification: function(fn, args) {
        var color = fn.apply(null, [this].concat([].slice.call(args)));
        this._r = color._r;
        this._g = color._g;
        this._b = color._b;
        this.setAlpha(color._a);
        return this;
    },
    lighten: function() {
        return this._applyModification(lighten, arguments);
    },
    brighten: function() {
        return this._applyModification(brighten, arguments);
    },
    darken: function() {
        return this._applyModification(darken, arguments);
    },
    desaturate: function() {
        return this._applyModification(desaturate, arguments);
    },
    saturate: function() {
        return this._applyModification(saturate, arguments);
    },
    greyscale: function() {
        return this._applyModification(greyscale, arguments);
    },
    spin: function() {
        return this._applyModification(spin, arguments);
    },

    _applyCombination: function(fn, args) {
        return fn.apply(null, [this].concat([].slice.call(args)));
    },
    analogous: function() {
        return this._applyCombination(analogous, arguments);
    },
    complement: function() {
        return this._applyCombination(complement, arguments);
    },
    monochromatic: function() {
        return this._applyCombination(monochromatic, arguments);
    },
    splitcomplement: function() {
        return this._applyCombination(splitcomplement, arguments);
    },
    triad: function() {
        return this._applyCombination(triad, arguments);
    },
    tetrad: function() {
        return this._applyCombination(tetrad, arguments);
    }
};

// If input is an object, force 1 into "1.0" to handle ratios properly
// String input requires "1.0" as input, so 1 will be treated as 1
tinycolor.fromRatio = function(color, opts) {
    if (typeof color == "object") {
        var newColor = {};
        for (var i in color) {
            if (color.hasOwnProperty(i)) {
                if (i === "a") {
                    newColor[i] = color[i];
                }
                else {
                    newColor[i] = convertToPercentage(color[i]);
                }
            }
        }
        color = newColor;
    }

    return tinycolor(color, opts);
};

// Given a string or object, convert that input to RGB
// Possible string inputs:
//
//     "red"
//     "#f00" or "f00"
//     "#ff0000" or "ff0000"
//     "#ff000000" or "ff000000"
//     "rgb 255 0 0" or "rgb (255, 0, 0)"
//     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
//     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
//     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
//     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
//     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
//     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
//
function inputToRGB(color) {

    var rgb = { r: 0, g: 0, b: 0 };
    var a = 1;
    var s = null;
    var v = null;
    var l = null;
    var ok = false;
    var format = false;

    if (typeof color == "string") {
        color = stringInputToObject(color);
    }

    if (typeof color == "object") {
        if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
            rgb = rgbToRgb(color.r, color.g, color.b);
            ok = true;
            format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
        }
        else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
            s = convertToPercentage(color.s);
            v = convertToPercentage(color.v);
            rgb = hsvToRgb(color.h, s, v);
            ok = true;
            format = "hsv";
        }
        else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
            s = convertToPercentage(color.s);
            l = convertToPercentage(color.l);
            rgb = hslToRgb(color.h, s, l);
            ok = true;
            format = "hsl";
        }

        if (color.hasOwnProperty("a")) {
            a = color.a;
        }
    }

    a = boundAlpha(a);

    return {
        ok: ok,
        format: color.format || format,
        r: mathMin(255, mathMax(rgb.r, 0)),
        g: mathMin(255, mathMax(rgb.g, 0)),
        b: mathMin(255, mathMax(rgb.b, 0)),
        a: a
    };
}


// Conversion Functions
// --------------------

// `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
// <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

// `rgbToRgb`
// Handle bounds / percentage checking to conform to CSS color spec
// <http://www.w3.org/TR/css3-color/>
// *Assumes:* r, g, b in [0, 255] or [0, 1]
// *Returns:* { r, g, b } in [0, 255]
function rgbToRgb(r, g, b){
    return {
        r: bound01(r, 255) * 255,
        g: bound01(g, 255) * 255,
        b: bound01(b, 255) * 255
    };
}

// `rgbToHsl`
// Converts an RGB color value to HSL.
// *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
// *Returns:* { h, s, l } in [0,1]
function rgbToHsl(r, g, b) {

    r = bound01(r, 255);
    g = bound01(g, 255);
    b = bound01(b, 255);

    var max = mathMax(r, g, b), min = mathMin(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min) {
        h = s = 0; // achromatic
    }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return { h: h, s: s, l: l };
}

// `hslToRgb`
// Converts an HSL color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
function hslToRgb(h, s, l) {
    var r, g, b;

    h = bound01(h, 360);
    s = bound01(s, 100);
    l = bound01(l, 100);

    function hue2rgb(p, q, t) {
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }

    if(s === 0) {
        r = g = b = l; // achromatic
    }
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return { r: r * 255, g: g * 255, b: b * 255 };
}

// `rgbToHsv`
// Converts an RGB color value to HSV
// *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
// *Returns:* { h, s, v } in [0,1]
function rgbToHsv(r, g, b) {

    r = bound01(r, 255);
    g = bound01(g, 255);
    b = bound01(b, 255);

    var max = mathMax(r, g, b), min = mathMin(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max === 0 ? 0 : d / max;

    if(max == min) {
        h = 0; // achromatic
    }
    else {
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h, s: s, v: v };
}

// `hsvToRgb`
// Converts an HSV color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
 function hsvToRgb(h, s, v) {

    h = bound01(h, 360) * 6;
    s = bound01(s, 100);
    v = bound01(v, 100);

    var i = Math.floor(h),
        f = h - i,
        p = v * (1 - s),
        q = v * (1 - f * s),
        t = v * (1 - (1 - f) * s),
        mod = i % 6,
        r = [v, q, p, p, t, v][mod],
        g = [t, v, v, q, p, p][mod],
        b = [p, p, t, v, v, q][mod];

    return { r: r * 255, g: g * 255, b: b * 255 };
}

// `rgbToHex`
// Converts an RGB color to hex
// Assumes r, g, and b are contained in the set [0, 255]
// Returns a 3 or 6 character hex
function rgbToHex(r, g, b, allow3Char) {

    var hex = [
        pad2(mathRound(r).toString(16)),
        pad2(mathRound(g).toString(16)),
        pad2(mathRound(b).toString(16))
    ];

    // Return a 3 character hex if possible
    if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
        return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
    }

    return hex.join("");
}

// `rgbaToHex`
// Converts an RGBA color plus alpha transparency to hex
// Assumes r, g, b are contained in the set [0, 255] and
// a in [0, 1]. Returns a 4 or 8 character rgba hex
function rgbaToHex(r, g, b, a, allow4Char) {

    var hex = [
        pad2(mathRound(r).toString(16)),
        pad2(mathRound(g).toString(16)),
        pad2(mathRound(b).toString(16)),
        pad2(convertDecimalToHex(a))
    ];

    // Return a 4 character hex if possible
    if (allow4Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1) && hex[3].charAt(0) == hex[3].charAt(1)) {
        return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
    }

    return hex.join("");
}

// `rgbaToArgbHex`
// Converts an RGBA color to an ARGB Hex8 string
// Rarely used, but required for "toFilter()"
function rgbaToArgbHex(r, g, b, a) {

    var hex = [
        pad2(convertDecimalToHex(a)),
        pad2(mathRound(r).toString(16)),
        pad2(mathRound(g).toString(16)),
        pad2(mathRound(b).toString(16))
    ];

    return hex.join("");
}

// `equals`
// Can be called with any tinycolor input
tinycolor.equals = function (color1, color2) {
    if (!color1 || !color2) { return false; }
    return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
};

tinycolor.random = function() {
    return tinycolor.fromRatio({
        r: mathRandom(),
        g: mathRandom(),
        b: mathRandom()
    });
};


// Modification Functions
// ----------------------
// Thanks to less.js for some of the basics here
// <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

function desaturate(color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.s -= amount / 100;
    hsl.s = clamp01(hsl.s);
    return tinycolor(hsl);
}

function saturate(color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.s += amount / 100;
    hsl.s = clamp01(hsl.s);
    return tinycolor(hsl);
}

function greyscale(color) {
    return tinycolor(color).desaturate(100);
}

function lighten (color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.l += amount / 100;
    hsl.l = clamp01(hsl.l);
    return tinycolor(hsl);
}

function brighten(color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var rgb = tinycolor(color).toRgb();
    rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * - (amount / 100))));
    rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * - (amount / 100))));
    rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * - (amount / 100))));
    return tinycolor(rgb);
}

function darken (color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.l -= amount / 100;
    hsl.l = clamp01(hsl.l);
    return tinycolor(hsl);
}

// Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
// Values outside of this range will be wrapped into this range.
function spin(color, amount) {
    var hsl = tinycolor(color).toHsl();
    var hue = (hsl.h + amount) % 360;
    hsl.h = hue < 0 ? 360 + hue : hue;
    return tinycolor(hsl);
}

// Combination Functions
// ---------------------
// Thanks to jQuery xColor for some of the ideas behind these
// <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

function complement(color) {
    var hsl = tinycolor(color).toHsl();
    hsl.h = (hsl.h + 180) % 360;
    return tinycolor(hsl);
}

function triad(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [
        tinycolor(color),
        tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
        tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
    ];
}

function tetrad(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [
        tinycolor(color),
        tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
        tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
        tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
    ];
}

function splitcomplement(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [
        tinycolor(color),
        tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
        tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
    ];
}

function analogous(color, results, slices) {
    results = results || 6;
    slices = slices || 30;

    var hsl = tinycolor(color).toHsl();
    var part = 360 / slices;
    var ret = [tinycolor(color)];

    for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
        hsl.h = (hsl.h + part) % 360;
        ret.push(tinycolor(hsl));
    }
    return ret;
}

function monochromatic(color, results) {
    results = results || 6;
    var hsv = tinycolor(color).toHsv();
    var h = hsv.h, s = hsv.s, v = hsv.v;
    var ret = [];
    var modification = 1 / results;

    while (results--) {
        ret.push(tinycolor({ h: h, s: s, v: v}));
        v = (v + modification) % 1;
    }

    return ret;
}

// Utility Functions
// ---------------------

tinycolor.mix = function(color1, color2, amount) {
    amount = (amount === 0) ? 0 : (amount || 50);

    var rgb1 = tinycolor(color1).toRgb();
    var rgb2 = tinycolor(color2).toRgb();

    var p = amount / 100;

    var rgba = {
        r: ((rgb2.r - rgb1.r) * p) + rgb1.r,
        g: ((rgb2.g - rgb1.g) * p) + rgb1.g,
        b: ((rgb2.b - rgb1.b) * p) + rgb1.b,
        a: ((rgb2.a - rgb1.a) * p) + rgb1.a
    };

    return tinycolor(rgba);
};


// Readability Functions
// ---------------------
// <http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef (WCAG Version 2)

// `contrast`
// Analyze the 2 colors and returns the color contrast defined by (WCAG Version 2)
tinycolor.readability = function(color1, color2) {
    var c1 = tinycolor(color1);
    var c2 = tinycolor(color2);
    return (Math.max(c1.getLuminance(),c2.getLuminance())+0.05) / (Math.min(c1.getLuminance(),c2.getLuminance())+0.05);
};

// `isReadable`
// Ensure that foreground and background color combinations meet WCAG2 guidelines.
// The third argument is an optional Object.
//      the 'level' property states 'AA' or 'AAA' - if missing or invalid, it defaults to 'AA';
//      the 'size' property states 'large' or 'small' - if missing or invalid, it defaults to 'small'.
// If the entire object is absent, isReadable defaults to {level:"AA",size:"small"}.

// *Example*
//    tinycolor.isReadable("#000", "#111") => false
//    tinycolor.isReadable("#000", "#111",{level:"AA",size:"large"}) => false
tinycolor.isReadable = function(color1, color2, wcag2) {
    var readability = tinycolor.readability(color1, color2);
    var wcag2Parms, out;

    out = false;

    wcag2Parms = validateWCAG2Parms(wcag2);
    switch (wcag2Parms.level + wcag2Parms.size) {
        case "AAsmall":
        case "AAAlarge":
            out = readability >= 4.5;
            break;
        case "AAlarge":
            out = readability >= 3;
            break;
        case "AAAsmall":
            out = readability >= 7;
            break;
    }
    return out;

};

// `mostReadable`
// Given a base color and a list of possible foreground or background
// colors for that base, returns the most readable color.
// Optionally returns Black or White if the most readable color is unreadable.
// *Example*
//    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:false}).toHexString(); // "#112255"
//    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:true}).toHexString();  // "#ffffff"
//    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"large"}).toHexString(); // "#faf3f3"
//    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"small"}).toHexString(); // "#ffffff"
tinycolor.mostReadable = function(baseColor, colorList, args) {
    var bestColor = null;
    var bestScore = 0;
    var readability;
    var includeFallbackColors, level, size ;
    args = args || {};
    includeFallbackColors = args.includeFallbackColors ;
    level = args.level;
    size = args.size;

    for (var i= 0; i < colorList.length ; i++) {
        readability = tinycolor.readability(baseColor, colorList[i]);
        if (readability > bestScore) {
            bestScore = readability;
            bestColor = tinycolor(colorList[i]);
        }
    }

    if (tinycolor.isReadable(baseColor, bestColor, {"level":level,"size":size}) || !includeFallbackColors) {
        return bestColor;
    }
    else {
        args.includeFallbackColors=false;
        return tinycolor.mostReadable(baseColor,["#fff", "#000"],args);
    }
};


// Big List of Colors
// ------------------
// <http://www.w3.org/TR/css3-color/#svg-color>
var names = tinycolor.names = {
    aliceblue: "f0f8ff",
    antiquewhite: "faebd7",
    aqua: "0ff",
    aquamarine: "7fffd4",
    azure: "f0ffff",
    beige: "f5f5dc",
    bisque: "ffe4c4",
    black: "000",
    blanchedalmond: "ffebcd",
    blue: "00f",
    blueviolet: "8a2be2",
    brown: "a52a2a",
    burlywood: "deb887",
    burntsienna: "ea7e5d",
    cadetblue: "5f9ea0",
    chartreuse: "7fff00",
    chocolate: "d2691e",
    coral: "ff7f50",
    cornflowerblue: "6495ed",
    cornsilk: "fff8dc",
    crimson: "dc143c",
    cyan: "0ff",
    darkblue: "00008b",
    darkcyan: "008b8b",
    darkgoldenrod: "b8860b",
    darkgray: "a9a9a9",
    darkgreen: "006400",
    darkgrey: "a9a9a9",
    darkkhaki: "bdb76b",
    darkmagenta: "8b008b",
    darkolivegreen: "556b2f",
    darkorange: "ff8c00",
    darkorchid: "9932cc",
    darkred: "8b0000",
    darksalmon: "e9967a",
    darkseagreen: "8fbc8f",
    darkslateblue: "483d8b",
    darkslategray: "2f4f4f",
    darkslategrey: "2f4f4f",
    darkturquoise: "00ced1",
    darkviolet: "9400d3",
    deeppink: "ff1493",
    deepskyblue: "00bfff",
    dimgray: "696969",
    dimgrey: "696969",
    dodgerblue: "1e90ff",
    firebrick: "b22222",
    floralwhite: "fffaf0",
    forestgreen: "228b22",
    fuchsia: "f0f",
    gainsboro: "dcdcdc",
    ghostwhite: "f8f8ff",
    gold: "ffd700",
    goldenrod: "daa520",
    gray: "808080",
    green: "008000",
    greenyellow: "adff2f",
    grey: "808080",
    honeydew: "f0fff0",
    hotpink: "ff69b4",
    indianred: "cd5c5c",
    indigo: "4b0082",
    ivory: "fffff0",
    khaki: "f0e68c",
    lavender: "e6e6fa",
    lavenderblush: "fff0f5",
    lawngreen: "7cfc00",
    lemonchiffon: "fffacd",
    lightblue: "add8e6",
    lightcoral: "f08080",
    lightcyan: "e0ffff",
    lightgoldenrodyellow: "fafad2",
    lightgray: "d3d3d3",
    lightgreen: "90ee90",
    lightgrey: "d3d3d3",
    lightpink: "ffb6c1",
    lightsalmon: "ffa07a",
    lightseagreen: "20b2aa",
    lightskyblue: "87cefa",
    lightslategray: "789",
    lightslategrey: "789",
    lightsteelblue: "b0c4de",
    lightyellow: "ffffe0",
    lime: "0f0",
    limegreen: "32cd32",
    linen: "faf0e6",
    magenta: "f0f",
    maroon: "800000",
    mediumaquamarine: "66cdaa",
    mediumblue: "0000cd",
    mediumorchid: "ba55d3",
    mediumpurple: "9370db",
    mediumseagreen: "3cb371",
    mediumslateblue: "7b68ee",
    mediumspringgreen: "00fa9a",
    mediumturquoise: "48d1cc",
    mediumvioletred: "c71585",
    midnightblue: "191970",
    mintcream: "f5fffa",
    mistyrose: "ffe4e1",
    moccasin: "ffe4b5",
    navajowhite: "ffdead",
    navy: "000080",
    oldlace: "fdf5e6",
    olive: "808000",
    olivedrab: "6b8e23",
    orange: "ffa500",
    orangered: "ff4500",
    orchid: "da70d6",
    palegoldenrod: "eee8aa",
    palegreen: "98fb98",
    paleturquoise: "afeeee",
    palevioletred: "db7093",
    papayawhip: "ffefd5",
    peachpuff: "ffdab9",
    peru: "cd853f",
    pink: "ffc0cb",
    plum: "dda0dd",
    powderblue: "b0e0e6",
    purple: "800080",
    rebeccapurple: "663399",
    red: "f00",
    rosybrown: "bc8f8f",
    royalblue: "4169e1",
    saddlebrown: "8b4513",
    salmon: "fa8072",
    sandybrown: "f4a460",
    seagreen: "2e8b57",
    seashell: "fff5ee",
    sienna: "a0522d",
    silver: "c0c0c0",
    skyblue: "87ceeb",
    slateblue: "6a5acd",
    slategray: "708090",
    slategrey: "708090",
    snow: "fffafa",
    springgreen: "00ff7f",
    steelblue: "4682b4",
    tan: "d2b48c",
    teal: "008080",
    thistle: "d8bfd8",
    tomato: "ff6347",
    turquoise: "40e0d0",
    violet: "ee82ee",
    wheat: "f5deb3",
    white: "fff",
    whitesmoke: "f5f5f5",
    yellow: "ff0",
    yellowgreen: "9acd32"
};

// Make it easy to access colors via `hexNames[hex]`
var hexNames = tinycolor.hexNames = flip(names);


// Utilities
// ---------

// `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
function flip(o) {
    var flipped = { };
    for (var i in o) {
        if (o.hasOwnProperty(i)) {
            flipped[o[i]] = i;
        }
    }
    return flipped;
}

// Return a valid alpha value [0,1] with all invalid values being set to 1
function boundAlpha(a) {
    a = parseFloat(a);

    if (isNaN(a) || a < 0 || a > 1) {
        a = 1;
    }

    return a;
}

// Take input from [0, n] and return it as [0, 1]
function bound01(n, max) {
    if (isOnePointZero(n)) { n = "100%"; }

    var processPercent = isPercentage(n);
    n = mathMin(max, mathMax(0, parseFloat(n)));

    // Automatically convert percentage into number
    if (processPercent) {
        n = parseInt(n * max, 10) / 100;
    }

    // Handle floating point rounding errors
    if ((Math.abs(n - max) < 0.000001)) {
        return 1;
    }

    // Convert into [0, 1] range if it isn't already
    return (n % max) / parseFloat(max);
}

// Force a number between 0 and 1
function clamp01(val) {
    return mathMin(1, mathMax(0, val));
}

// Parse a base-16 hex value into a base-10 integer
function parseIntFromHex(val) {
    return parseInt(val, 16);
}

// Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
// <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
function isOnePointZero(n) {
    return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
}

// Check to see if string passed in is a percentage
function isPercentage(n) {
    return typeof n === "string" && n.indexOf('%') != -1;
}

// Force a hex value to have 2 characters
function pad2(c) {
    return c.length == 1 ? '0' + c : '' + c;
}

// Replace a decimal with it's percentage value
function convertToPercentage(n) {
    if (n <= 1) {
        n = (n * 100) + "%";
    }

    return n;
}

// Converts a decimal to a hex value
function convertDecimalToHex(d) {
    return Math.round(parseFloat(d) * 255).toString(16);
}
// Converts a hex value to a decimal
function convertHexToDecimal(h) {
    return (parseIntFromHex(h) / 255);
}

var matchers = (function() {

    // <http://www.w3.org/TR/css3-values/#integers>
    var CSS_INTEGER = "[-\\+]?\\d+%?";

    // <http://www.w3.org/TR/css3-values/#number-value>
    var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

    // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
    var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

    // Actual matching.
    // Parentheses and commas are optional, but not required.
    // Whitespace can take the place of commas or opening paren
    var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
    var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

    return {
        CSS_UNIT: new RegExp(CSS_UNIT),
        rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
        rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
        hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
        hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
        hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
        hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
        hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
        hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
    };
})();

// `isValidCSSUnit`
// Take in a single string / number and check to see if it looks like a CSS unit
// (see `matchers` above for definition).
function isValidCSSUnit(color) {
    return !!matchers.CSS_UNIT.exec(color);
}

// `stringInputToObject`
// Permissive string parsing.  Take in a number of formats, and output an object
// based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
function stringInputToObject(color) {

    color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
    var named = false;
    if (names[color]) {
        color = names[color];
        named = true;
    }
    else if (color == 'transparent') {
        return { r: 0, g: 0, b: 0, a: 0, format: "name" };
    }

    // Try to match string input using regular expressions.
    // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
    // Just return an object and let the conversion functions handle that.
    // This way the result will be the same whether the tinycolor is initialized with string or object.
    var match;
    if ((match = matchers.rgb.exec(color))) {
        return { r: match[1], g: match[2], b: match[3] };
    }
    if ((match = matchers.rgba.exec(color))) {
        return { r: match[1], g: match[2], b: match[3], a: match[4] };
    }
    if ((match = matchers.hsl.exec(color))) {
        return { h: match[1], s: match[2], l: match[3] };
    }
    if ((match = matchers.hsla.exec(color))) {
        return { h: match[1], s: match[2], l: match[3], a: match[4] };
    }
    if ((match = matchers.hsv.exec(color))) {
        return { h: match[1], s: match[2], v: match[3] };
    }
    if ((match = matchers.hsva.exec(color))) {
        return { h: match[1], s: match[2], v: match[3], a: match[4] };
    }
    if ((match = matchers.hex8.exec(color))) {
        return {
            r: parseIntFromHex(match[1]),
            g: parseIntFromHex(match[2]),
            b: parseIntFromHex(match[3]),
            a: convertHexToDecimal(match[4]),
            format: named ? "name" : "hex8"
        };
    }
    if ((match = matchers.hex6.exec(color))) {
        return {
            r: parseIntFromHex(match[1]),
            g: parseIntFromHex(match[2]),
            b: parseIntFromHex(match[3]),
            format: named ? "name" : "hex"
        };
    }
    if ((match = matchers.hex4.exec(color))) {
        return {
            r: parseIntFromHex(match[1] + '' + match[1]),
            g: parseIntFromHex(match[2] + '' + match[2]),
            b: parseIntFromHex(match[3] + '' + match[3]),
            a: convertHexToDecimal(match[4] + '' + match[4]),
            format: named ? "name" : "hex8"
        };
    }
    if ((match = matchers.hex3.exec(color))) {
        return {
            r: parseIntFromHex(match[1] + '' + match[1]),
            g: parseIntFromHex(match[2] + '' + match[2]),
            b: parseIntFromHex(match[3] + '' + match[3]),
            format: named ? "name" : "hex"
        };
    }

    return false;
}

function validateWCAG2Parms(parms) {
    // return valid WCAG2 parms for isReadable.
    // If input parms are invalid, return {"level":"AA", "size":"small"}
    var level, size;
    parms = parms || {"level":"AA", "size":"small"};
    level = (parms.level || "AA").toUpperCase();
    size = (parms.size || "small").toLowerCase();
    if (level !== "AA" && level !== "AAA") {
        level = "AA";
    }
    if (size !== "small" && size !== "large") {
        size = "small";
    }
    return {"level":level, "size":size};
}

// Node: Export function
if (typeof module !== "undefined" && module.exports) {
    module.exports = tinycolor;
}
// AMD/requirejs: Define the module
else if (typeof define === 'function' && define.amd) {
    define(function () {return tinycolor;});
}
// Browser: Expose to window
else {
    window.tinycolor = tinycolor;
}

})(Math);

},{}],21:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Input for parsers.
 */
class Input {
    /**
     * Make Input class instances.
     * @param source input source for parsers
     * @param whitespace regex that parsers should skip
     */
    constructor(source, whitespace) {
        this.source = source;
        this.whitespace = whitespace;
    }
    copy(source) {
        return new Input(source, this.whitespace);
    }
}
exports.Input = Input;

},{}],22:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const Input_1 = require("./Input");
/**
 * Parser is like a function expect some input to parse.
 */
class Parser {
    constructor(fn, name) {
        this.name = name;
        this.fn = input => {
            // trim white spaces
            if (input.whitespace) {
                let execResult = input.whitespace.exec(input.source);
                if (execResult !== null) {
                    input = input.copy(input.source.substr(execResult[0].length));
                }
            }
            return fn(input);
        };
    }
    /**
     * Set parser name
     */
    named(name) {
        this.name = name;
        return this;
    }
    /**
     * Parse input! if `input` is string, skips whitespace `/^\s+/` when parsing.
     */
    of(input) {
        let src;
        if (typeof input === "string") {
            src = new Input_1.Input(input, /^\s+/);
        }
        else {
            src = input;
        }
        return this.fn(src);
    }
    /**
     * Parse input, same as `of`
     */
    parse(input) {
        return this.of(input);
    }
    map(mapper) {
        return new Parser(input => this.of(input).map(mapper), "map");
    }
    /**
     * sequence
     */
    then(q) {
        return new Parser(input => {
            const ret = this.of(input);
            if (ret instanceof Success) {
                return force(q).of(ret.rest).map(result2 => [ret.result, result2]);
            }
            else {
                return new Failure(input, ret.message, ret.parserName);
            }
        }, "then");
    }
    /**
     * ordered choice
     */
    or(q) {
        return new Parser(input => {
            const ret = this.of(input);
            if (ret instanceof Success) {
                return ret;
            }
            else {
                return force(q).of(input);
            }
        }, "or");
    }
    /**
     * zero-or-more
     */
    rep() {
        return repeat(() => this);
    }
    /**
     * one-or-more
     */
    rep1() {
        return repeat1(() => this);
    }
    /**
     * optional
     */
    opt() {
        return option(() => this);
    }
    /**
     * not-predicate
     */
    not() {
        return notPred(() => this);
    }
    /**
     * and-predicate
     */
    guard() {
        return andPred(() => this);
    }
    /**
     * ( ~> )
     * same as sequence, but discard left result
     */
    saveR(q) {
        return this.then(q).map(tpl => tpl[1]).named("saveR");
    }
    /**
     * ( <~ )
     * same as sequence, but discard right result
     */
    saveL(q) {
        return this.then(q).map(tpl => tpl[0]).named("saveL");
    }
    /**
     * 2nd parser depends on the result of the 1st parser.
     */
    into(fq) {
        return new Parser(input => {
            const ret = this.of(input);
            if (ret instanceof Success) {
                return fq(ret.result).of(ret.rest);
            }
            else {
                return new Failure(input, ret.message, ret.parserName);
            }
        }, "into");
    }
    /**
     * Repeatedly use one or more `this` parser, separated by `sep`. Accumulate only the results of `this` parser.
     */
    rep1sep(sep) {
        return rep1sep(() => this, sep);
    }
}
exports.Parser = Parser;
function force(p) {
    if (p instanceof Parser) {
        return p;
    }
    else {
        return p();
    }
}
class Success {
    constructor(rest, result) {
        this.rest = rest;
        this.result = result;
    }
    getResult() {
        return this.result;
    }
    map(fn) {
        return new Success(this.rest, fn(this.result));
    }
}
exports.Success = Success;
class Failure {
    constructor(rest, message, parserName) {
        this.rest = rest;
        this.message = message;
        this.parserName = parserName;
    }
    map(fn) {
        return new Failure(this.rest, this.message, this.parserName);
    }
    getResult() {
        throw "no result in failure";
    }
}
exports.Failure = Failure;
/**
 * Always success.
 */
function success(v) {
    return new Parser(input => new Success(input, v), "success");
}
exports.success = success;
/**
 * Always failure.
 */
function failure(message) {
    return new Parser(input => new Failure(input, message, "failure"), "failure");
}
exports.failure = failure;
function option(p) {
    return new Parser(input => {
        const ret = force(p).of(input);
        if (ret instanceof Success) {
            return ret;
        }
        else {
            return new Success(input, undefined);
        }
    }, "option");
}
exports.option = option;
function repeat(p) {
    return new Parser(input => {
        let rest = input;
        const results = [];
        while (true) {
            const ret = force(p).of(rest);
            if (ret instanceof Success) {
                rest = ret.rest;
                results.push(ret.result);
            }
            else {
                break;
            }
        }
        return new Success(rest, results);
    }, "repeat");
}
exports.repeat = repeat;
function repeat1(p) {
    return force(p).then(force(p).rep()).map(cons => {
        cons[1].unshift(cons[0]);
        return cons[1];
    }).named("repeat1");
}
exports.repeat1 = repeat1;
function notPred(p) {
    return new Parser(input => {
        const ret = force(p).of(input);
        if (ret instanceof Success) {
            return new Failure(input, `enable to parse input in ${force(p).name}`, "notPred");
        }
        else {
            return new Success(input, undefined);
        }
    }, "notPred");
}
exports.notPred = notPred;
function andPred(p) {
    return new Parser(input => {
        const ret = force(p).of(input);
        if (ret instanceof Success) {
            return new Success(input, undefined);
        }
        else {
            return new Failure(input, `unable to parse input in ${force(p).name}`, "andPred");
        }
    }, "andPred");
}
exports.andPred = andPred;
/**
 * Sequence parser that has many sub parsers.
 */
function sequence(...ps) {
    return new Parser(input => {
        const result = [];
        let rest = input;
        for (let p of ps) {
            const ret = force(p).of(rest);
            if (ret instanceof Success) {
                rest = ret.rest;
                result.push(ret.result);
            }
            else {
                return new Failure(rest, ret.message, ret.parserName);
            }
        }
        return new Success(rest, result);
    }, "sequence");
}
exports.sequence = sequence;
/**
 * Same as sequence function
 */
function seq(...ps) {
    return sequence(...ps);
}
exports.seq = seq;
function rep1sep(p, sep) {
    return force(p).then(() => (force(sep).then(p)).rep()).map(ret => {
        const result = [ret[0]];
        for (let pair of ret[1]) {
            result.push(pair[1]);
        }
        return result;
    });
}
exports.rep1sep = rep1sep;

},{"./Input":21}],23:[function(require,module,exports){
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./Parser"));
__export(require("./parsers"));
__export(require("./Input"));

},{"./Input":21,"./Parser":22,"./parsers":24}],24:[function(require,module,exports){
/**
 * Other useful parsers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Parser_1 = require("./Parser");
/**
 * Parse specified string literal
 * @param str expect string
 */
function literal(str) {
    return new Parser_1.Parser(input => {
        if (input.source.startsWith(str)) {
            return new Parser_1.Success(input.copy(input.source.substr(str.length)), str);
        }
        else {
            return new Parser_1.Failure(input, `input does not start with ${str}`, `literal[${str}]`);
        }
    }, `literal[${str}]`);
}
exports.literal = literal;
/**
 * Same as literal function
 */
function lt(str) {
    return literal(str);
}
exports.lt = lt;
/**
 * Parse string matches the regex
 */
function regex(regexp) {
    const r = typeof regexp === "string" ? new RegExp(regexp) : regexp;
    return new Parser_1.Parser(input => {
        if (input.source.search(r) === 0) {
            const result = r.exec(input.source)[0];
            const rest = input.copy(input.source.substr(result.length));
            return new Parser_1.Success(rest, result);
        }
        else {
            return new Parser_1.Failure(input, `input does not match with regex ${regexp}`, `regex[${regexp}]`);
        }
    }, `regex[${regexp}]`);
}
exports.regex = regex;
/**
 * Same as regex function
 */
function r(regexp) {
    return regex(regexp);
}
exports.r = r;
/**
 * Decimal number parser (ex 3.14)
 */
exports.decimal = regex(/[+-]?[0-9]+(\.[0-9]*)?([eE][+-]?[0-9]+)?/).map(elem => Number(elem)).named("decimal");
/**
 * Integer number parser
 */
exports.integer = regex(/[+-]?\d+/).map(elem => Number(elem)).named("integer");
/**
 * Email parser. The regex is the same as `input[type=email]` in HTML5.
 */
exports.email = regex(/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*/).named("email");

},{"./Parser":22}]},{},[5]);
