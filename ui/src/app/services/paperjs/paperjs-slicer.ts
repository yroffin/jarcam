import { Path, Point, PointText, PaperScope, Project, Rectangle, CurveLocation, Segment, Item } from 'paper';
import * as _ from 'lodash';
import { Group } from 'paper';
import { PaperJSUtils } from 'src/app/services/paperjs/paperjs-utils';
import { ElementRef } from '@angular/core';
import { PaperJSGcode } from 'src/app/services/paperjs/paperjs-gcode';
import { ShapeGroup, Journey } from 'src/app/services/paperjs/paperjs-model';
import { Area, AreaPoint } from 'src/app/services/three/area.class';
import { PaperJSContour } from 'src/app/services/paperjs/paperjs-contour';
import { ScanPiecesBean } from 'src/app/stores/parameters.service';
import { PaperJSShapeBuilder } from 'src/app/services/paperjs/paperjs-shape-builder';
import {
    PaperJSShapeBuilderInterface,
    PaperJSShapeAroundInterface,
    PaperJSSimulatorInterface,
    PaperJSGcodeInterface,
    PaperJSShapeBrimInterface
} from 'src/app/services/paperjs/paperjs-interface';
import { PaperJSShapeContour } from 'src/app/services/paperjs/paperjs-shape-contour';
import { PaperJSSimulator } from 'src/app/services/paperjs/paperjs-tool-simulator';
import { PaperJSShapeBrim } from 'src/app/services/paperjs/paperjs-shape-brim';

export class PaperJSSlicer {

    private radius: number;
    private scanPieces: ScanPiecesBean;

    private zoom = 5;
    private scope: PaperScope;
    private project: Project;
    private brimMode = 'cross';

    private shaper: PaperJSShapeBuilderInterface = new PaperJSShapeBuilder();
    private contourer: PaperJSShapeAroundInterface = new PaperJSShapeContour();
    private simulator: PaperJSSimulatorInterface = new PaperJSSimulator();
    private gcoder: PaperJSGcodeInterface = new PaperJSGcode();
    private brim: PaperJSShapeBrimInterface = new PaperJSShapeBrim();

    /**
     * constructor
     * @param target html element ref
     */
    constructor(target?: HTMLCanvasElement) {
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
    init(scanPieces: ScanPiecesBean, zoom: number, radius: number) {
        this.scanPieces = scanPieces;
        this.zoom = zoom;
        this.radius = radius;
    }

    public onToolChange(zoom: number) {
        this.zoom = zoom;
        const target = this.zoom / this.project.view.scaling.x;
        this.project.view.scale(target, target);
    }

    /**
     * set brim mode
     */
    public setBrimMode(brimMode: string): void {
        this.brimMode = brimMode;
    }

    /**
     * render this layer
     * @param fill fill it (simulate tool path)
     * @param domInsert insert it (not when computing only
     */
    public render(areas: Array<Area>, fill: boolean, domInsert: boolean): ShapeGroup {
        if (this.project === undefined) {
            return;
        }

        // Clear area for rendering a new one
        this.project.clear();

        // Add grid only in domInsert mode
        if (domInsert) {
            const size = Math.max(
                Math.abs(this.scanPieces.maxx),
                Math.abs(this.scanPieces.minx),
                Math.abs(this.scanPieces.maxy),
                Math.abs(this.scanPieces.miny)) + 10;
            PaperJSUtils.gridHelper(size, 1);
        }

        // Init the areas
        const shapes = this.shaper.build(areas, this.radius, domInsert);

        // Compute path around shape
        shapes.journeys = this.contourer.around(
            shapes,
            this.scanPieces.minx,
            this.scanPieces.maxx,
            this.scanPieces.miny,
            this.scanPieces.maxy, this.radius, domInsert);

        if (domInsert) {
            const segment = new Path({
                fillColor: 'orange',
                strokeColor: 'red'
            });

            // Compute bound
            const inner = PaperJSUtils.bounds(
                this.scanPieces.minx, this.scanPieces.maxx, this.scanPieces.miny, this.scanPieces.maxy, this.radius);

            // Build contour
            const boundContour = new Path.Rectangle({
                from: new Point(inner.left, inner.top),
                to: new Point(inner.right, inner.bottom),
                strokeColor: 'red',
                strokeWidth: 0.5,
                fillColor: 'white',
                selected: false,
                visible: true,
                insert: domInsert
            });
            boundContour.sendToBack();

            // Handler for brim capture
            boundContour.onMouseMove = (event) => {
                this.brim.brim(
                    shapes,
                    segment,
                    this.brimMode,
                    event.point,
                    this.radius,
                    this.scanPieces.minx, this.scanPieces.maxx, this.scanPieces.miny, this.scanPieces.maxy);
            };
        }

        if (fill) {
            this.simulator.simulation(shapes.journeys, this.radius, domInsert);
        }

        return shapes;
    }

    public header(
        maxz: number): string {
        return this.gcoder.header(
            this.scanPieces.minx,
            this.scanPieces.maxx,
            this.scanPieces.miny,
            this.scanPieces.maxy,
            maxz);
    }

    /**
     * build gcode
     * @param current current Z
     * @param maxz maxZ
     * @param radius tool radius
     * @param journeys all fill journey
     */
    public gcode(
        current: number,
        maxz: number,
        journeys: Journey[]): string {
        return this.gcoder.build(
            this.scanPieces.minx,
            this.scanPieces.maxx,
            this.scanPieces.miny,
            this.scanPieces.maxy,
            current, maxz, journeys);
    }

    /**
     * copy str to clipboard
     * @param str str
     */
    private copyToClipboard(str) {
        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }
}
