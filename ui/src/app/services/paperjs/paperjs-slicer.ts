import { Path, Point, PointText, PaperScope, Project, Rectangle, CurveLocation, Segment } from 'paper';
import * as _ from 'lodash';
import { Group } from 'paper';
import { PaperJSUtils } from 'src/app/services/paperjs/paperjs-utils';
import { ElementRef } from '@angular/core';
import { PaperJSGcode } from 'src/app/services/paperjs/paperjs-gcode';
import { ShapeGroup, Journey } from 'src/app/services/paperjs/paperjs-model';
import { Area, AreaPoint } from 'src/app/services/three/area.class';
import { PaperJSContour } from 'src/app/services/paperjs/paperjs-contour';
import { ScanPiecesBean } from 'src/app/stores/parameters.service';

export class PaperJSSlicer {

    private x: number;
    private y: number;
    private radius: number;
    private areas: Array<Area>;
    private scanPieces: ScanPiecesBean;

    private zoom = 5;
    private scope: PaperScope;
    private project: Project;

    /**
     * constructor
     * @param target html element ref
     */
    constructor(target: HTMLCanvasElement) {
        this.scope = new PaperScope();
        this.project = new Project(target);

        this.project.currentStyle = {
            fontFamily: 'roboto'
        };

        this.project.view.scale(this.zoom, -this.zoom);
        this.project.view.onResize = (event) => {
            // Whenever the view is resized, move the path to its center:
            this.project.view.center = new Point(0, 0);
            this.project.view.draw();
        };

        // center view
        this.project.view.center = new Point(0, 0);
    }

    /**
     * init
     * @param areas areas
     * @param zoom zoom
     * @param x x
     * @param y y
     * @param radius mill radius
     */
    init(scanPieces: ScanPiecesBean, areas: Array<Area>, zoom: number, x: number, y: number, radius: number) {
        this.scanPieces = scanPieces;
        this.areas = areas;
        this.zoom = zoom;
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    public onToolChange(zoom: number) {
        this.zoom = zoom;
        const target = this.zoom / this.project.view.scaling.x;
        this.project.view.scale(target, target);
    }

    public render(fill: boolean, domInsert: boolean): ShapeGroup {
        this.project.clear();

        // Add grid only in domInsert mode
        if (domInsert) {
            PaperJSUtils.gridHelper(140, 1);
        }

        // init the areas
        const shapes = this.buildShape(domInsert);

        // open area
        shapes.openPath = this.openedShape(shapes.opened, domInsert);

        // closed area and bound
        shapes.closePath = this.closedShape(shapes.closed, domInsert);

        // Compute bound
        const inner = PaperJSUtils.bounds(this.scanPieces, this.radius);
        const boundContour = new Path.Rectangle({
            from: new Point(inner.left, inner.top),
            to: new Point(inner.right, inner.bottom),
            strokeColor: 'red',
            strokeWidth: 0.5,
            selected: false,
            visible: false,
            insert: domInsert
        });

        // Compute path
        shapes.aroundJourney = this.around(shapes, 4, boundContour.bounds);

        const area = new Path.Rectangle({
            from: new Point(inner.left, inner.top),
            to: new Point(inner.right, inner.bottom),
            strokeColor: 'red',
            strokeWidth: 0.5,
            selected: false,
            insert: false,
            visible: false
        });

        shapes.fillJourney = this.computePath(shapes, 0, this.radius, area.bounds, [], false, domInsert);

        if (fill) {
            _.each(shapes.fillJourney, (journey) => {
                const circle = new Path.Circle({
                    center: journey.position,
                    radius: 1,
                    strokeColor: 'red',
                    strokeWidth: 0.5,
                    fillColor: 'black',
                    insert: domInsert
                });

                for (let indice = 0; indice < journey.path.length; indice += 0.2) {
                    const tool = new Path.Circle({
                        center: journey.path.getPointAt(indice),
                        radius: this.radius,
                        dashArray: [1, indice / journey.path.length],
                        insert: domInsert
                    });
                    tool.strokeColor = 'black';
                    tool.strokeWidth = 0.05;
                }
            });
        }

        return shapes;
    }

    private copyToClipboard(str) {
        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }

    /**
     * build all shape
     * @param domInsert should insert in dom ?
     */
    private buildShape(domInsert: boolean): ShapeGroup {
        const shapeGroup: ShapeGroup = {
            opened: new Group(),
            closed: new Group()
        };

        const tool = new Path.Circle({
            center: new Point(this.x, this.y),
            radius: this.radius,
            insert: domInsert
        });
        tool.strokeColor = 'purple';

        _.each(this.areas, (area: Area) => {
            const segments = [];
            _.each(area.points(), (vertice: AreaPoint) => {
                segments.push([vertice.origin.x, vertice.origin.y]);
            });

            if (area.isOpen()) {
                const areaPath = new Path({
                    segments: segments,
                    selected: false,
                    closed: true,
                    name: area.name,
                    strokeColor: 'red',
                    strokeWidth: 0.1,
                    visible: true
                });
                areaPath.onMouseEnter = function (event) {
                    this.selected = true;
                };
                areaPath.onMouseLeave = function (event) {
                    this.selected = false;
                };
                shapeGroup.opened.addChild(areaPath);
            } else {
                const areaPath = new Path({
                    segments: segments,
                    selected: false,
                    closed: true,
                    name: area.name,
                    strokeColor: 'purple',
                    strokeWidth: 0.2,
                    visible: true
                });
                areaPath.onMouseEnter = function (event) {
                    this.selected = true;
                };
                areaPath.onMouseLeave = function (event) {
                    this.selected = false;
                };
                shapeGroup.closed.addChild(areaPath);
            }
        });

        return shapeGroup;
    }

    /**
     * build contour on opened shape
     * @param closed group
     * @param domInsert should insert it in dom ?
     */
    private openedShape(opened: Group, domInsert: boolean): Group {
        const group: Group = new Group();
        _.each(opened.children, (path: Path) => {
            const contour = PaperJSContour.contour(true, path, this.radius, 10, 0.05, false, domInsert);
            group.addChild(contour);
        });
        return group;
    }

    /**
     * build contour on closed shape
     * @param closed group
     * @param domInsert should insert it in dom ?
     */
    private closedShape(closed: Group, domInsert: boolean): Group {
        const group: Group = new Group();
        _.each(closed.children, (path: Path) => {
            const contour = PaperJSContour.contour(false, path, this.radius, 10, 0.05, false, domInsert);
            group.addChild(contour);
        });
        return group;
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
    private computePath(
        shapeGroup: ShapeGroup,
        offset: number,
        radius: number,
        area: Rectangle,
        journeys: Journey[],
        showContour: boolean,
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

    /**
     * find all journey around elements
     */
    private around(shapeGroup: ShapeGroup, len: number, area: Rectangle): Journey[] {
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
     * unify all path
     * @param shapeGroup the current context
     * @param area the area
     * @param domInsert should insert this path ?
     */
    private union(shapeGroup: ShapeGroup, area: Rectangle, domInsert: boolean): Journey {
        const path = new Path.Rectangle({
            point: area.point,
            size: area.size,
            insert: domInsert
        });
        path.strokeColor = 'black';
        path.strokeWidth = 0.5;

        _.each(shapeGroup.openPath.children, (contour) => {
            this.modifyParcours(path, contour);
        });

        return {
            path: path,
            position: area.point
        };
    }

    /**
     * unite parcours and piece
     * @param parcours base path
     * @param piece path to add
     */
    private modifyParcours(current: Path, add: Path): void {
        const intersections = add.getIntersections(current);
        if (intersections.length > 0) {
            for (let i = 0; i < intersections.length; i += 2) {
                const path = current.unite(add);
                path.strokeColor = 'blue';
                path.strokeWidth = 0.2;
                current.copyContent(path);
                path.remove();
            }
        }
    }
}
