import { Path, Point, PointText, Shape } from 'paper';
import * as _ from 'lodash';
import { Group } from 'paper';
import { PaperJSUtils } from 'src/app/services/paperjs/paperjs-utils';
import { PaperJSOffset } from 'src/app/services/paperjs/paperjs-offset';

export class PaperJSContour {
    /**
     * build contour around this path
     * @param open is area open
     * @param path the path area
     * @param distance the distance
     * @param smoothAngle smoothing angle
     * @param precision precision to remove any median hitting the contour
     * @param circle draw circle (debug)
     * @param simplify apply simplify on path
     * @param domInsert insert normals in dom
     */
    public static contour(
        open: boolean,
        path: Path,
        distance: number,
        smoothAngle: number,
        precision: number,
        circle: boolean,
        domInsert: boolean): Path {

        const contour = new Path();
        contour.strokeColor = 'black';
        contour.strokeWidth = 0.2;
        contour.dashArray = [2, 0.5];
        contour.closed = true;
        contour.selected = false;
        contour.name = path.name + '.contour';
        contour.visible = true;

        if (path.clockwise) {
            path.reverse();
        }

        let cnt: Path;
        if (open) {
            cnt = PaperJSOffset.offsetPath(path, -distance, false);
        } else {
            cnt = PaperJSOffset.offsetPath(path, distance, false);
        }
        cnt.strokeWidth = 0.2;
        cnt.strokeColor = 'black';
        cnt.selected = false;

        const hittest = new Path.Circle({
            center: new Point(0, 0),
            radius: distance - precision,
            insert: domInsert
        });

        for (let indice = 0; indice < cnt.length; indice++) {
            const point = cnt.getPointAt(indice);
            hittest.position.x = point.x;
            hittest.position.y = point.y;

            if (!hittest.intersects(path)) {
                contour.add(point);
            }
        }

        cnt.remove();

        PaperJSUtils.display(contour.bounds.bottomRight, contour.name);

        return contour;
    }

    /**
     * compute all median
     * @param open is this area is open
     * @param path the path area
     * @param distance the distance for contour
     * @param smoothAngle angle for smoothing straight contour
     * @param domInsert display (debug) any graphic helper
     */
    private static calcNormals(open: boolean, path: Path, distance: number, smoothAngle: number, domInsert: boolean): Path[] {
        const normals: Path[] = [];

        if (path.clockwise) {
            path.reverse();
        }

        let indice = 0;
        for (; indice < path.segments.length; indice++) {
            const segment = path.segments[indice % path.segments.length];

            const lvector: Point = path.segments[(indice + path.segments.length - 1) % path.segments.length].point.subtract(segment.point);
            const rvector: Point = path.segments[(indice + path.segments.length + 1) % path.segments.length].point.subtract(segment.point);
            const angle = (lvector.angle - rvector.angle + 360) % 360;
            const mangle = Math.abs(angle) / 2;

            lvector.length = distance;
            rvector.length = distance;
            const median: Point = rvector.rotate(mangle);

            if (open) {
                // Change direction is too high
                // Smooth path
                if (mangle > 90) {
                    let lmedian: Point = lvector.rotate(-90);
                    normals.push(PaperJSUtils.createVector(segment.point, segment.point.add(lmedian), domInsert));
                    for (; (lmedian.angle - median.angle + 360) % 360 > smoothAngle;) {
                        lmedian = lmedian.rotate(-smoothAngle);
                        normals.push(PaperJSUtils.createVector(segment.point, segment.point.add(lmedian), domInsert));
                    }
                }
            }

            // Add median
            if (open) {
                const vector = PaperJSUtils.createVector(segment.point, segment.point.add(median), domInsert);
                normals.push(vector);
            } else {
                const vector = PaperJSUtils.createVector(segment.point, segment.point.subtract(median), domInsert);
                normals.push(vector);
            }

            if (open) {
                // Change direction is too high
                // Smooth path, after median
                if (mangle > 90) {
                    let rmedian: Point = median.rotate(-smoothAngle);
                    normals.push(PaperJSUtils.createVector(segment.point, segment.point.add(rmedian), domInsert));
                    for (; (rmedian.angle - rvector.angle + 360) % 360 > (90 + smoothAngle);) {
                        rmedian = rmedian.rotate(-smoothAngle);
                        normals.push(PaperJSUtils.createVector(segment.point, segment.point.add(rmedian), domInsert));
                    }
                }
            }
        }

        return normals;
    }
}
