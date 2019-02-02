/*
 Copyright (c) 2014-2017, Jan Bösenberg & Jürg Lehni

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

import { Path, Segment, Curve, Point } from 'paper';
import { Group } from 'paper';
import * as Numerical from './numerical.js';

class CurveExt extends Curve {
    public static getPeaks(v) {
        const x0 = v[0], y0 = v[1],
            x1 = v[2], y1 = v[3],
            x2 = v[4], y2 = v[5],
            x3 = v[6], y3 = v[7],
            ax = -x0 + 3 * x1 - 3 * x2 + x3,
            bx = 3 * x0 - 6 * x1 + 3 * x2,
            cx = -3 * x0 + 3 * x1,
            ay = -y0 + 3 * y1 - 3 * y2 + y3,
            by = 3 * y0 - 6 * y1 + 3 * y2,
            cy = -3 * y0 + 3 * y1,
            tMin = /*#=*/Numerical.CURVETIME_EPSILON,
            tMax = 1 - tMin,
            roots = [];
        Numerical.solveCubic(
            9 * (ax * ax + ay * ay),
            9 * (ax * bx + by * ay),
            2 * (bx * bx + by * by) + 3 * (cx * ax + cy * ay),
            (cx * bx + by * cy),
            // Exclude 0 and 1 as we don't count them as peaks.
            roots, tMin, tMax);
        return roots.sort();
    }
}

export class PaperJSOffset {

    public static offsetPath(path, offset, insert: boolean): Path {
        const outerPath = new Path({ insert: insert }),
            epsilon = Numerical.GEOMETRIC_EPSILON,
            enforeArcs = true;
        for (let i = 0; i < path.curves.length; i++) {
            const curve = path.curves[i];
            if (curve.hasLength(epsilon)) {
                const segments = PaperJSOffset.getOffsetSegments(curve, offset),
                    start = segments[0];
                if (outerPath.isEmpty()) {
                    outerPath.addSegments(segments);
                } else {
                    const lastCurve = outerPath.lastCurve;
                    if (!lastCurve.point2.isClose(start.point, epsilon)) {
                        if (enforeArcs || lastCurve.getTangentAt(1, true).dot(start.point.subtract(curve.point1)) >= 0) {
                            PaperJSOffset.addRoundJoin(outerPath, start.point, curve.point1, Math.abs(offset));
                        } else {
                            // Connect points with a line
                            outerPath.lineTo(start.point);
                        }
                    }
                    outerPath.lastSegment.handleOut = start.handleOut;
                    outerPath.addSegments(segments.slice(1));
                }
            }
        }
        if (path.isClosed()) {
            if (!outerPath.lastSegment.point.isClose(outerPath.firstSegment.point, epsilon) && (enforeArcs ||
                outerPath.lastCurve.getTangentAt(1, true).dot(outerPath.firstSegment.point.subtract(path.firstSegment.point)) >= 0)) {
                this.addRoundJoin(outerPath, outerPath.firstSegment.point, path.firstSegment.point, Math.abs(offset));
            }
            outerPath.closePath();
        }
        return outerPath;
    }

    /**
     * Creates an offset for the specified curve and returns the segments of
     * that offset path.
     *
     * @param curve the curve to be offset
     * @param offset the offset distance
     * @returns an array of segments describing the offset path
     */
    private static getOffsetSegments(curve, offset): any {
        if (curve.isStraight()) {
            const n = curve.getNormalAtTime(0.5).multiply(offset),
                p1 = curve.point1.add(n),
                p2 = curve.point2.add(n);
            return [new Segment(p1), new Segment(p2)];
        } else {
            const curves = this.splitCurveForOffseting(curve),
                segments = [];
            for (let i = 0, l = curves.length; i < l; i++) {
                const offsetCurves = this.getOffsetCurves(curves[i], offset, 0);
                let prevSegment;
                for (let j = 0, m = offsetCurves.length; j < m; j++) {
                    const curve1 = offsetCurves[j],
                        segment = curve.segment1;
                    if (prevSegment) {
                        prevSegment.handleOut = segment.handleOut;
                    } else {
                        segments.push(segment);
                    }
                    segments.push(prevSegment = curve1.segment2);
                }
            }
            return segments;
        }
    }

    /**
     * Approach for Curve Offsetting based on:
     *   "A New Shape Control and Classification for Cubic Bézier Curves"
     *   Shi-Nine Yang and Ming-Liang Huang
     */
    private static offsetCurve_middle(curve, offset) {
        const
            p1 = curve.point1.add(curve.getNormalAt(0).multiply(offset)),
            p2 = curve.point2.add(curve.getNormalAt(1).multiply(offset)),
            pt = curve.getNormalAt(0.5).add(
                curve.getNormalAt(0.5).multiply(offset)),
            t1 = curve.getTangentAt(0),
            t2 = curve.getTangentAt(1),
            div = t1.cross(t2) * 3 / 4,
            d = pt.multiply(2).subtract(p1.add(p2)),
            a = d.cross(t2) / div,
            b = d.cross(t1) / div;
        return new Curve(p1, t1.multiply(a), t2.multiply(-b), p2);
    }

    private static offsetCurve_average(curve: Curve, offset) {
        const p1 = curve.point1.add(curve.getNormalAt(0).multiply(offset)),
            p2 = curve.point2.add(curve.getNormalAt(1).multiply(offset)),
            t = this.getAverageTangentTime(curve),
            u = 1 - t,
            pt = curve.getPointAt(t).add(
                curve.getNormalAt(t).multiply(offset)),
            t1 = curve.getTangentAt(0),
            t2 = curve.getTangentAt(1),
            div = t1.cross(t2) * 3 * t * u;

        const v2 = pt.subtract(
            p1.multiply(u * u * (1 + 2 * t)).add(
                p2.multiply(t * t * (3 - 2 * t)))),
            a = v2.cross(t2) / (div * u),
            b = v2.cross(t1) / (div * t);
        return new Curve(p1, t1.multiply(a), t2.multiply(-b), p2);
    }

    /**
     * This algorithm simply scales the curve so its end points are at the
     * calculated offsets of the original end points.
     */
    private static offsetCurve_simple(crv, dist) {
        // calculate end points of offset curve
        const p1 = crv.point1.add(crv.getNormalAtTime(0).multiply(dist));
        const p4 = crv.point2.add(crv.getNormalAtTime(1).multiply(dist));
        // get scale ratio
        const pointDist = crv.point1.getDistance(crv.point2);
        // TODO: Handle cases when pointDist == 0
        let f = p1.getDistance(p4) / pointDist;
        if (crv.point2.subtract(crv.point1).dot(p4.subtract(p1)) < 0) {
            f = -f; // probably more correct than connecting with line
        }
        // Scale handles and generate offset curve
        return new Curve(p1, crv.handle1.multiply(f), crv.handle2.multiply(f), p4);
    }

    private static getOffsetCurves(curve1, offset, method) {
        const errorThreshold = 0.01,
            radius = Math.abs(offset);

        function offsetCurce(curve: Curve, curves, recursion) {
            let offsetCurve;
            switch (method) {
                case 'middle':
                    offsetCurve = this.offsetCurve_middle(curve, offset);
                    break;
                case 'average':
                    offsetCurve = this.offsetCurve_average(curve, offset);
                    break;
                case 'simple':
                    offsetCurve = this.offsetCurve_simple(curve, offset);
                    break;
            }
            const count = 16;
            let error = 0;
            for (let i = 1; i < count; i++) {
                const t = i / count,
                    p = curve.getPointAt(t),
                    n = curve.getNormalAt(t),
                    roots = offsetCurve.getCurveLineIntersections(p.x, p.y, n.x, n.y);
                let dist = 2 * radius;
                for (let j = 0, l = roots.length; j < l; j++) {
                    const d = offsetCurve.getPointAt(roots[j]).getDistance(p);
                    if (d < dist) {
                        dist = d;
                    }
                }
                const err = Math.abs(radius - dist);
                if (err > error) {
                    error = err;
                }
            }
            if (error > errorThreshold && recursion++ < 8) {
                if (error === radius) {
                    // console.log(cv);
                }
                const curve2 = curve.divideAtTime(this.getAverageTangentTime(curve));
                offsetCurce(curve, curves, recursion);
                offsetCurce(curve2, curves, recursion);
            } else {
                curves.push(offsetCurve);
            }
            return curves;
        }

        return offsetCurce(curve1, [], 0);
    }

    /**
     * Split curve into sections that can then be treated individually by an
     * offset algorithm.
     */
    private static splitCurveForOffseting(curve: Curve) {
        const curves = [curve.clone()], // Clone so path is not modified.
            that = this;
        if (curve.isStraight()) {
            return curves;
        }

        function splitAtRoots(index, roots) {
            for (let i = 0, prevT, l = roots && roots.length; i < l; i++) {
                const t = roots[i],
                    curve1 = curves[index].divideAtTime(
                        // Renormalize curve-time for multiple roots:
                        i ? (t - prevT) / (1 - prevT) : t);
                prevT = t;
                if (curve1) {
                    curves.splice(++index, 0, curve1);
                }
            }
        }

        // Recursively splits the specified curve if the angle between the two
        // handles is too large (we use 60° as a threshold).
        function splitLargeAngles(index, recursion) {
            const curve1: Curve = curves[index],
                n1 = curve1.getNormalAt(0),
                n2r = curve1.getNormalAt(1),
                n2 = new Point(-n2r.x, -n2r.y),
                cos = n1.dot(n2);
            if (cos > -0.5 && ++recursion < 4) {
                curves.splice(index + 1, 0,
                    curve1.divideAtTime(this.getAverageTangentTime(curve1)));
                splitLargeAngles(index + 1, recursion);
                splitLargeAngles(index, recursion);
            }
        }

        // Split curves at cusps and inflection points.
        const info = curve.classify();
        if (info.roots && info.type !== 'loop') {
            splitAtRoots(0, info.roots);
        }

        // Split sub-curves at peaks.
        for (let i = curves.length - 1; i >= 0; i--) {
            splitAtRoots(i, CurveExt.getPeaks(curves[i].values));
        }

        // Split sub-curves with too large angle between handles.
        for (let i = curves.length - 1; i >= 0; i--) {
            //splitLargeAngles(i, 0);
        }
        return curves;
    }

    /**
     * Returns the first curve-time where the curve has its tangent in the same
     * direction as the average of the tangents at its beginning and end.
     */
    private static getAverageTangentTime(curve: Curve) {
        const tan = curve.getTangentAt(0).add(curve.getTangentAt(1)),
            tx = tan.x,
            ty = tan.y,
            abs = Math.abs,
            flip = abs(ty) < abs(tx),
            s = flip ? ty / tx : tx / ty,
            ia = flip ? 1 : 0, // the abscissa index
            io = ia ^ 1,       // the ordinate index
            a0 = curve.values[ia + 0], o0 = curve.values[io + 0],
            a1 = curve.values[ia + 2], o1 = curve.values[io + 2],
            a2 = curve.values[ia + 4], o2 = curve.values[io + 4],
            a3 = curve.values[ia + 6], o3 = curve.values[io + 6],
            aA = -a0 + 3 * a1 - 3 * a2 + a3,
            aB = 3 * a0 - 6 * a1 + 3 * a2,
            aC = -3 * a0 + 3 * a1,
            oA = -o0 + 3 * o1 - 3 * o2 + o3,
            oB = 3 * o0 - 6 * o1 + 3 * o2,
            oC = -3 * o0 + 3 * o1,
            roots = [],
            epsilon = Numerical.CURVETIME_EPSILON,
            count = Numerical.solveQuadratic(
                3 * (aA - s * oA),
                2 * (aB - s * oB),
                aC - s * oC, roots,
                epsilon, 1 - epsilon);
        // Fall back to 0.5, so we always have a place to split...
        return count > 0 ? roots[0] : 0.5;
    }

    private static addRoundJoin(path, dest, center, radius) {
        // return path.lineTo(dest);
        const middle = path.lastSegment.point.add(dest).divide(2),
            through = center.add(middle.subtract(center).normalize(radius));
        path.arcTo(through, dest);
    }
}
