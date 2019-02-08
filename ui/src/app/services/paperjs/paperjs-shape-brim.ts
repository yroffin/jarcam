import { PaperJSShapeBrimInterface } from 'src/app/services/paperjs/paperjs-interface';
import { ShapeGroup, Journey } from 'src/app/services/paperjs/paperjs-model';
import { Group, Path, Point, Rectangle, CurveLocation, Segment } from 'paper';
import { AreaPoint, Area } from 'src/app/services/three/area.class';

import * as _ from 'lodash';
import { PaperJSUtils } from 'src/app/services/paperjs/paperjs-utils';
import { ScanPiecesBean } from 'src/app/stores/parameters.service';

export class PaperJSShapeBrim implements PaperJSShapeBrimInterface {

    constructor() {
    }

    public brim(
        shapes: ShapeGroup,
        segment: Path,
        brimMode: string,
        pointer: Point,
        radius, minx, maxx, miny, maxy: number): boolean {
        // Store all points in a map
        const nearests: Point[] = [];

        if (brimMode !== 'inline') {
            _.each(shapes.opened.children, (shape: Path) => {
                const result = shape.hitTest(pointer);
                if (result) {
                    console.log(result);
                }
                nearests.push(shape.getNearestPoint(pointer));
            });
        } else {
            _.each(shapes.closed.children, (shape: Path) => {
                const result = shape.hitTest(pointer);
                if (result) {
                    console.log(result);
                }
                nearests.push(shape.getNearestPoint(pointer));
            });
        }

        const takes = _.sortBy(_.flatMap(nearests, (pt: Point) => {
            return {
                point: pt,
                distance: pointer.getDistance(pt)
            };
        }), (element) => {
            return element.distance;
        });

        switch (brimMode) {
            case 'inline': {
                // Compute distance
                const dists = _.take(takes, 1);
                // Only 2 points is relevant
                if (dists.length === 1) {
                    const closest = _.take(_.sortBy(_.flatMap(shapes.closePath.children, (path: Path) => {
                        return {
                            point: path.bounds.center,
                            distance: dists[0].point.getDistance(path.bounds.center)
                        };
                    }), (element) => {
                        return element.distance;
                    }), 1);

                    if (closest.length > 0) {
                        segment.removeSegments();
                        segment.add(dists[0].point);
                        segment.add(closest[0].point);
                        return true;
                    }
                }
            }
                break;
            case 'cross': {
                // Compute distance
                const dists = _.take(takes, 2);
                // Only 2 points is relevant
                if (dists.length === 2) {
                    segment.removeSegments();
                    segment.add(dists[0]);
                    segment.add(dists[1]);
                    return true;
                }
            }
                break;
            case 'border-minx':
                return this.border(takes, segment, () => {
                    let border = pointer.y <= miny ? miny : pointer.y;
                    border = border >= maxy ? maxy : border;
                    return new Point(minx - radius, border);
                });
            case 'border-maxx':
                return this.border(takes, segment, () => {
                    let border = pointer.y <= miny ? miny : pointer.y;
                    border = border >= maxy ? maxy : border;
                    return new Point(maxx + radius, border);
                });
            case 'border-miny':
                return this.border(takes, segment, () => {
                    let border = pointer.x <= minx ? minx : pointer.x;
                    border = border >= maxx ? maxx : border;
                    return new Point(border, miny - radius);
                });
            case 'border-maxy':
                return this.border(takes, segment, () => {
                    let border = pointer.x <= minx ? minx : pointer.x;
                    border = border >= maxx ? maxx : border;
                    return new Point(border, maxy + radius);
                });
        }
        return false;
    }

    public border(takes: any, segment: Path, compute: () => Point): boolean {
        // Compute distance
        const dists = _.take(takes, 1);
        // Only 1 points is relevant
        if (dists.length === 1) {
            segment.removeSegments();
            const point = compute();
            segment.add(point);
            segment.add(dists.pop());
            return true;
        }
        return false;
    }

}
