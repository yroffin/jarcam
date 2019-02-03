import { PaperJSShapeAroundInterface } from 'src/app/services/paperjs/paperjs-interface';
import { ShapeGroup, Journey } from 'src/app/services/paperjs/paperjs-model';
import { Group, Path, Point, Rectangle, CurveLocation } from 'paper';
import { AreaPoint, Area } from 'src/app/services/three/area.class';

import * as _ from 'lodash';
import { PaperJSUtils } from 'src/app/services/paperjs/paperjs-utils';
import { ScanPiecesBean } from 'src/app/stores/parameters.service';

export class PaperJSShapeContour implements PaperJSShapeAroundInterface {

    constructor() {
    }

    /**
     * around all shape
     * @param domInsert should insert in dom ?
     */
    public around(shapes: ShapeGroup,
        minx: number, maxx: number, miny: number, maxy: number, radius: number, domInsert: boolean): Journey[] {
        // Compute bound
        const inner = PaperJSUtils.bounds(minx, maxx, miny, maxy, radius);

        // Build contour
        const boundContour = new Path.Rectangle({
            from: new Point(inner.left, inner.top),
            to: new Point(inner.right, inner.bottom),
            strokeColor: 'red',
            strokeWidth: 0.5,
            selected: false,
            visible: false,
            insert: domInsert
        });

        // Compute path around shape
        const aroundJourney = this._around(shapes);

        const area = new Path.Rectangle({
            from: new Point(inner.left, inner.top),
            to: new Point(inner.right, inner.bottom),
            strokeColor: 'red',
            strokeWidth: 0.5,
            selected: false,
            insert: false,
            visible: false
        });

        // Compute path for fill all area
        const fillJourney = this._computePath(shapes, radius, area.bounds, [], domInsert);

        const result: Journey[] = [];
        _.each(aroundJourney, (journey) => {
            result.push(journey);
        });
        _.each(fillJourney, (journey) => {
            result.push(journey);
        });
        return result;
    }

    /**
     * find all journey around elements
     */
    private _around(shapeGroup: ShapeGroup): Journey[] {
        // Search all element in path with a tiny area
        const detectors: Journey[] = [];

        _.each(shapeGroup.openPath.children, (contour: Path) => {
            const center = contour.bounds.center;
            detectors.push(<Journey>{
                path: contour,
                position: contour.getPointAt(0)
            });
        });

        _.each(shapeGroup.closePath.children, (contour: Path) => {
            const center = contour.bounds.center;
            detectors.push(<Journey>{
                path: contour,
                position: contour.getPointAt(0)
            });
        });

        return detectors;
    }

    /**
     * compute path
     * @param shapeGroup the shapes
     * @param offset offset
     * @param len len
     * @param area area
     * @param journeys journeys
     * @param showContour show path contour
     * @param domInsert dom insert ?
     */
    private _computePath(
        shapeGroup: ShapeGroup,
        radius: number,
        area: Rectangle,
        journeys: Journey[],
        domInsert: boolean): Journey[] {

        const journeylines: Path.Line[] = [];

        let occ = 0;
        let x = area.left;
        let previous;
        for (; x < area.right + radius; x += radius, occ++) {
            if (x >= area.right) {
                x = area.right;
            }

            const even = occ % 2 === 0;

            // Add a tool move to got to lext line
            if (previous !== undefined) {
                const joiner = new Path.Line({
                    from: even ? new Point(previous, area.top) : new Point(previous, area.bottom),
                    to: even ? new Point(x, area.top) : new Point(x, area.bottom),
                    strokeColor: 'black',
                    strokeWidth: 0.2,
                    selected: false,
                    dashArray: [2, 0.5],
                    // always true, joiner must not be reversed
                    data: { even: true },
                    insert: true
                });
                journeylines.push(joiner);
            }
            previous = x;

            const hittest = new Path.Line({
                from: new Point(x, area.top),
                to: new Point(x, area.bottom),
                strokeColor: 'purple',
                strokeWidth: 0.5,
                selected: false,
                insert: false
            });

            let allIntersects = [];
            _.each(shapeGroup.openPath.children, (opened: Path) => {
                const intersections = hittest.getIntersections(opened);
                const intersects = _.flatMap(intersections, (intersection: CurveLocation) => {
                    allIntersects.push({
                        shape: opened.name,
                        point: intersection.point
                    });
                    return intersection.point;
                });
            });
            allIntersects = _.sortBy(allIntersects, (intersect) => {
                return even ? intersect.point.y : -intersect.point.y;
            });

            const crossinglines: Path.Line[] = [];
            let from: Point = new Point(x, even ? area.top : area.bottom);
            _.each(allIntersects, (curve: any) => {
                crossinglines.push(new Path.Line({
                    from: even ? from : curve.point,
                    to: even ? curve.point : from,
                    strokeColor: 'black',
                    strokeWidth: 0.2,
                    selected: false,
                    dashArray: [2, 0.5],
                    data: { even: even },
                    insert: true
                }));
                from = curve.point;
            });
            crossinglines.push(new Path.Line({
                from: from,
                to: new Point(x, even ? area.bottom : area.top),
                strokeColor: 'black',
                strokeWidth: 0.2,
                selected: false,
                data: { even: even },
                dashArray: [2, 0.5],
                insert: true
            }));

            const touching = _.flatMap(crossinglines, (line: Path.Line) => {
                const touch = _.filter(shapeGroup.openPath.children, (opened: Path) => {
                    return opened.contains(line.bounds.center);
                });
                return {
                    line: line,
                    touching: touch.length > 0
                };
            });

            _.each(touching, (c) => {
                if (c.touching) {
                    c.line.remove();
                } else {
                    journeylines.push(c.line);
                }
            });

            hittest.remove();
        }

        // Build path
        let lastPosition = new Point(area.left, area.top);
        let journey: Journey = {
            position: new Point(area.left, area.top),
            path: new Path({
                strokeColor: 'black',
                strokeWidth: 0.2,
                selected: false,
                dashArray: [2, 0.5],
                insert: true
            })
        };
        journeys.push(journey);

        _.each(journeylines, (line: Path.Line) => {
            const from = line.getPointAt(line.data.even ? 0 : line.length);
            const to = line.getPointAt(line.data.even ? line.length : 0);
            // Check if we have to jump over a block
            if (!lastPosition.equals(from)) {
                journey = {
                    position: from,
                    path: new Path({
                        strokeColor: 'black',
                        strokeWidth: 0.2,
                        selected: false,
                        dashArray: [2, 0.5],
                        insert: true
                    })
                };
                journeys.push(journey);
            }
            journey.path.add(from);
            journey.path.add(to);
            lastPosition = to;
        });
        return journeys;
    }

}
