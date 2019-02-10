import { PaperJSShapeBrimInterface } from 'src/app/services/paperjs/paperjs-interface';
import { ShapeGroup, Journey, TouchBean } from 'src/app/services/paperjs/paperjs-model';
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
        const nearests: TouchBean[] = [];

        if (brimMode !== 'inline') {
            _.each(shapes.opened.children, (shape: Path) => {
                const result = shape.hitTest(pointer);
                nearests.push({
                    id: shape.name,
                    touch: shape.getNearestPoint(pointer)
                });
            });
        } else {
            _.each(shapes.closed.children, (shape: Path) => {
                const result = shape.hitTest(pointer);
                nearests.push({
                    id: shape.name,
                    touch: shape.getNearestPoint(pointer)
                });
            });
        }

        const takes: TouchBean[] = _.sortBy(_.flatMap(nearests, (nearest: TouchBean) => {
            return <TouchBean> {
                id: nearest.id,
                touch: nearest.touch,
                distance: pointer.getDistance(nearest.touch)
            };
        }), (element) => {
            return element.distance;
        });

        switch (brimMode) {
            case 'inline': {
                // Compute distance
                const dists: TouchBean[] = _.take(takes, 1);
                // Only 2 points is relevant
                if (dists.length === 1) {
                    const closest = _.take(_.sortBy(_.flatMap(shapes.closePath.children, (path: Path) => {
                        return <TouchBean> {
                            id: path.name,
                            touch: path.bounds.center,
                            distance: dists[0].touch.getDistance(path.bounds.center)
                        };
                    }), (element) => {
                        return element.distance;
                    }), 1);

                    if (closest.length > 0) {
                        segment.removeSegments();
                        segment.add(dists[0].touch);
                        segment.add(closest[0].touch);
                        segment.data = {
                            inline: {
                                from: dists[0],
                                to: closest[0]
                            }
                        };
                        return true;
                    }
                }
            }
                break;
            case 'cross': {
                // Compute distance
                const dists: TouchBean[] = _.take(takes, 2);
                // Only 2 points is relevant
                if (dists.length === 2) {
                    segment.removeSegments();
                    segment.add(dists[0].touch);
                    segment.add(dists[1].touch);
                    segment.data = {
                        cross: {
                            from: dists[0],
                            to: dists[1]
                        }
                    };
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
        const dists: TouchBean[] = _.take(takes, 1);
        // Only 1 points is relevant
        if (dists.length === 1) {
            segment.removeSegments();
            const point = compute();
            segment.add(point);
            segment.add(dists[0].touch);
            segment.data = {
                border: {
                    from: dists[0],
                    to: point
                }
            };
            return true;
        }
        return false;
    }

}
