import { PaperJSShapeBrimInterface } from 'src/app/services/paperjs/paperjs-interface';
import { ShapeGroup, Journey, TouchBean, BrimBean, PointBean } from 'src/app/services/paperjs/paperjs-model';
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
        radius, area: Path, minx, maxx, miny, maxy: number): boolean {
        // Store all points in a map
        const nearests: TouchBean[] = [];

        if (brimMode !== 'inline') {
            _.each(shapes.opened.children, (shape: Path) => {
                nearests.push({
                    id: shape.name,
                    touch: shape.getNearestPoint(pointer)
                });
            });
        } else {
            _.each(shapes.closed.children, (shape: Path) => {
                nearests.push({
                    id: shape.name,
                    touch: shape.getNearestPoint(pointer)
                });
            });
        }

        const takes: TouchBean[] = _.sortBy(_.flatMap(nearests, (nearest: TouchBean) => {
            return <TouchBean>{
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
                        return <TouchBean>{
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
                        segment.data = new BrimBean();
                        segment.data.points = [
                            <PointBean>{x: dists[0].touch.x, y: dists[0].touch.y},
                            <PointBean>{x: closest[0].touch.x, y: closest[0].touch.y}];
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
                    segment.data = new BrimBean();
                    segment.data.points = [
                        <PointBean>{x: dists[0].touch.x, y: dists[0].touch.y},
                        <PointBean>{x: dists[1].touch.x, y: dists[1].touch.y}];
                    return true;
                }
            }
                break;
            case 'border':
                return this.border(takes, segment, area);
        }
        return false;
    }

    /**
     * build border
     * @param takes all neareast point to shape
     * @param segment result
     * @param area rect area
     */
    private border(takes: any, segment: Path, area: Path): boolean {
        // Compute distance
        const dists: TouchBean[] = _.take(takes, 1);
        // Only 1 points is relevant
        if (dists.length === 1) {
            segment.removeSegments();
            const point = area.getNearestPoint(dists[0].touch);
            segment.add(point);
            segment.add(dists[0].touch);
            segment.data = new BrimBean();
            segment.data.points = [point, dists[0].touch];
            segment.data.points = [<PointBean>{x: point.x, y: point.y}, <PointBean>{x: dists[0].touch.x, y: dists[0].touch.y}];
            return true;
        }
        return false;
    }

}
