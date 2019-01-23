import { Component, Input, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { PaperScope, Project, Path, Shape, Point, Size, Group, Color, PointText, Matrix, Rectangle, Segment } from 'paper';

import * as _ from 'lodash';

import { ElementRef } from '@angular/core';
import { MillingService } from '../../services/three/milling.service';
import { Area, AreaPoint } from 'src/app/services/three/area.class';
import { injectElementRef } from '@angular/core/src/render3/view_engine_compatibility';
import { AppComponent } from 'src/app/app.component';

declare var Prism: any;

class Journey {
  position: Point;
  path: Path;
}

@Component({
  selector: 'app-toolpath-view',
  templateUrl: './toolpath-view.component.html',
  styleUrls: ['./toolpath-view.component.css']
})
export class ToolpathViewComponent implements OnInit, AfterViewInit {

  @ViewChild('paperView') paperCanvas: ElementRef;
  @ViewChild('gcodeArea') gcodeArea: ElementRef;

  private width = window.innerWidth;
  private height = window.innerHeight;
  private zoom = 5;

  scope: PaperScope;
  project: Project;

  openArea: Group;
  closedArea: Group;

  openPath: Path[];
  closePath: Path[];

  bound: Path;
  tool: Path;
  public gcode: string;

  constructor(
    private appComponent: AppComponent,
    private millingService: MillingService
  ) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.scope = new PaperScope();
    this.project = new Project(this.paperCanvas.nativeElement);

    this.project.currentStyle = {
      fontFamily: 'roboto'
    };

    this.project.view.scale(this.appComponent.options.toolpath.zoom.value, -this.appComponent.options.toolpath.zoom.value);
    this.project.view.onResize = (event) => {
      // Whenever the view is resized, move the path to its center:
      this.project.view.center = new Point(0, 0);
      this.project.view.draw();
    };

    this.render(false);
  }

  public onLayerChange() {
    return;
    setTimeout(() => {
      this.render(false);
    }, 1);
  }

  public onToolChange() {
    const target = this.zoom / this.project.view.scaling.x;
    this.project.view.scale(target, target);
  }

  gridHelper(size: number, step: number) {
    let x, y;

    let segments = [];
    for (y = -size; y < size; y += step) {
      segments.push([-size, y], [size, y], [0, y], [0, y + step]);
    }

    const gridX = new Path({
      segments: segments,
      selected: false
    });

    gridX.strokeColor = 'grey';
    gridX.strokeWidth = 0.05;

    segments = [];
    for (x = -size; x < size; x += step) {
      segments.push([x, -size], [x, size], [x, 0], [x + step, 0]);
    }

    const gridY = new Path({
      segments: segments,
      selected: false
    });

    gridY.strokeColor = 'grey';
    gridY.strokeWidth = 0.05;

    const axeX = new Path({
      segments: [[-size, 0], [size, 0], [size - 5, 5], [size - 5, -5], [size, 0]]
    });
    axeX.strokeColor = 'red';
    axeX.strokeWidth = 0.2;

    const axeY = new Path({
      segments: [[0, -size], [0, size], [5, size - 5], [-5, size - 5], [0, size]]
    });
    axeY.strokeColor = 'green';
    axeY.strokeWidth = 0.2;
  }

  render(fill: boolean) {
    const start = new Date().getTime();
    this.project.clear();

    this.gridHelper(140, 1);

    // center view
    this.project.view.center = new Point(0, 0);

    this.init();

    // open area
    this.openPath = this.firstPass();

    // closed area and bound
    this.closePath= this.secondPass();

    // Compute bound
    const inner = this.bounds(0);
    const boundContour = new Path.Rectangle({
      from: new Point(inner.left, inner.top),
      to: new Point(inner.right, inner.bottom),
      strokeColor: 'red',
      strokeWidth: 0.05,
      selected: true,
      insert: true
    });

    // Compute path
    const journeyAround = this.around(4, boundContour.bounds);
    const journeyAll = this.computePath(0, 4, boundContour.bounds, []);

    if (true) {
      _.each(journeyAround, (journey) => {
        const circle = new Path.Circle({
          center: journey.position,
          radius: 1,
          strokeColor: 'red',
          strokeWidth: 0.05,
          fillColor: 'black'
        });

        for (let indice = 0; indice < journey.path.length; indice += 0.2) {
          const circle = new Path.Circle(journey.path.getPointAt(indice), 4);
          circle.strokeColor = 'red';
          circle.strokeWidth = 0.05;
        }
      });
      /*
            _.each(journeyAll, (journey) => {
              for (let indice = 0; indice < journey.path.length; indice += 0.2) {
                const circle = new Path.Circle(journey.path.getPointAt(indice), 4);
                circle.strokeColor = 'red';
                circle.strokeWidth = 0.05;
              }
            });*/
    }

    this.gcode = this.buildGcode(journeyAround);
    this.copyToClipboard(this.gcode);
    Prism.highlightElement(this.gcodeArea.nativeElement);
  }

  copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  buildGcode(journeys: Journey[]): string {
    const inner = this.bounds(0);

    let gcode = '(Translate ' + inner.left + ' ' + inner.top + ')\n';
    gcode += 'G90 (Absolute Positioning)\n';
    gcode += 'M03 S18000 (Spindle CW on)\n';
    gcode += 'G0 Z8   (move to 8mm on the Z axis)\n';
    gcode += 'G0 F900 (set the feedrate to 900mm/minute)\n';

    let it = 0;
    _.each(journeys, (journey: Journey) => {
      gcode += '(Shape ' + journey.path.name + ')\n';
      const start = journey.position.clone();
      start.x -= inner.left;
      start.y -= inner.top;
      gcode += '(Start ' + start + ')\n';
      gcode += 'G0 Z8   (move to 8mm on the Z axis)\n';
      gcode += 'G0 X' + Math.round(start.x * 100 + Number.EPSILON) / 100 + ' Y' + Math.round(start.y * 100 + Number.EPSILON) / 100 + '\n';
      gcode += 'G1 Z6   (move to 8mm on the Z axis)\n';
      // path begin can be away from start
      let offset = journey.path.getOffsetOf(journey.position);
      for (let indice = offset; indice < journey.path.length + offset; indice += 0.2) {
        const point = journey.path.getPointAt(indice % journey.path.length);
        point.x -= inner.left;
        point.y -= inner.top;
        gcode += 'G1 X' + Math.round(point.x * 100 + Number.EPSILON) / 100 + ' Y' + Math.round(point.y * 100 + Number.EPSILON) / 100 + '\n';
      }
      it++;
    });

    return gcode;
  }

  init() {
    this.openArea = new Group();
    this.closedArea = new Group();

    const start = this.millingService.getStart();
    this.tool = new Path.Circle(new Point(start.x, start.y), 4);
    this.tool.strokeColor = 'purple';

    _.each(this.millingService.getAreas(), (area: Area) => {
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
          strokeWidth: 0.2,
          visible: true
        });
        areaPath.onMouseEnter = function (event) {
          this.selected = true;
        };
        areaPath.onMouseLeave = function (event) {
          this.selected = false;
        };
        this.openArea.addChild(areaPath);
      } else {
        const areaPath = new Path({
          segments: segments,
          selected: false,
          closed: true,
          name: area.name,
          strokeColor: 'red',
          strokeWidth: 0.2,
          visible: true
        });
        this.closedArea.addChild(areaPath);
      }
    });
  }

  firstPass(): Path[] {
    const group = [];
    _.each(this.openArea.children, (path: Path) => {
      const contour = this.contour(true, path, 4, 10, 0.2, false, false, false);
      group.push(contour.contour);
    });
    return group;
  }

  secondPass(): any {
    const group = [];
    _.each(this.closedArea.children, (path: Path) => {
      const contour = this.contour(false, path, 4, 10, 0.2, false, false, false);
      group.push(contour.contour);
    });
    return group;
  }

  bounds(distance: number): any {
    // Compute bound
    let top = 0, bottom = 0, left = 0, right = 0;
    _.each(this.openPath, (path: Path) => {
      if (path.bounds.top < top) {
        top = path.bounds.top;
      }
      if (path.bounds.bottom > bottom) {
        bottom = path.bounds.bottom;
      }
      if (path.bounds.left < left) {
        left = path.bounds.left;
      }
      if (path.bounds.right > right) {
        right = path.bounds.right;
      }
    });

    return {
      top: top - distance,
      left: left - distance,
      bottom: bottom + distance,
      right: right + distance
    };
  }

  computePath(offset: number, len: number, area: Rectangle, journeys: Journey[]): Journey[] {
    if (area.width > 0) {
      const clone = area.clone();
      clone.x += len;
      clone.height -= len;
      clone.width -= len * 2;
      // Fill this area
      journeys.push(this.fill(area));
      this.computePath(offset + 1, len, clone, journeys);
    }
    return journeys;
  }

  /**
   * find all journey around elements
   */
  around(len: number, area: Rectangle): Journey[] {
    // Search all element in path with a tiny area
    const detectors: Journey[] = [];

    _.each(this.openPath, (contour: Path) => {
      const center = contour.bounds.center;
      detectors.push(<Journey>{
        path: contour,
        position: contour.getPointAt(0)
      });
    });

    _.each(this.closePath, (contour: Path) => {
      const center = contour.bounds.center;
      detectors.push(<Journey>{
        path: contour,
        position: contour.getPointAt(0)
      });
    });

    return detectors;
  }

  fill(area: Rectangle): Journey {
    const path = new Path.Rectangle({
      point: area.point,
      size: area.size,
      insert: false
    });
    path.strokeColor = 'black';
    path.strokeWidth = 0.5;

    _.each(this.openPath, (contour) => {
      this.modifyParcours(path, contour);
    });

    return {
      path: path,
      position: area.point
    };
  }

  modifyParcours(parcours, piece): void {
    const intersections = piece.getIntersections(parcours);
    if (intersections.length > 0) {
      for (let i = 0; i < intersections.length; i += 2) {
        const path = parcours.unite(piece);
        path.strokeColor = 'blue';
        path.strokeWidth = 0.2;
        parcours.copyContent(path);
        path.remove();
      }
    }
  }

  /**
   * build contour around this path
   * @param open is area open
   * @param path the path area
   * @param distance the distance
   * @param smoothAngle smoothing angle
   * @param precision precision to remove any median hitting the contour
   * @param circle draw circle (debug)
   * @param simplify apply simplify on path
   * @param insert insert normals in project
   */
  contour(
    open: boolean,
    path: Path,
    distance: number,
    smoothAngle: number,
    precision: number,
    circle: boolean,
    simplify: boolean,
    insert: boolean): any {
    const contour = new Path();
    contour.strokeColor = 'yellow';
    contour.strokeWidth = 0.2;
    contour.closed = true;
    contour.selected = false;
    contour.name = path.name + '.contour';
    contour.visible = true;


    const normals = this.calcNormals(open, path, distance, smoothAngle, insert);
    const hittest = new Path.Circle(new Point(0, 0), distance - precision);

    let indice = 0;
    _.each(normals, (normal: Path) => {
      const position = normal.segments[1].point;
      indice++;
      hittest.position.x = position.x;
      hittest.position.y = position.y;
      hittest.name = path.name + '.circle#' + indice;
      hittest.strokeColor = 'blue';

      if (!hittest.intersects(path)) {
        contour.add(normal.segments[1].point);
        normal.remove();
      }

      if (circle) {
        hittest.strokeColor = 'purple';
        hittest.strokeWidth = 0.05;
        hittest.clone();
        normal.strokeColor = 'purple';
      } else {
        normal.remove();
      }
    });

    hittest.remove();

    if (simplify) {
      contour.simplify(0.001);
    }

    this.display(contour.bounds.bottomRight, contour.name);

    return {
      contour: contour
    };
  }

  display(center: Point, message: string): void {
    // Angle Label
    const text = new PointText({
      point: center,
      content: message,
      fillColor: 'yellow',
      fontSize: 1.5,
    });
    text.scale(1, -1);
  }

  /**
   * compute all median
   * @param open is this area is open
   * @param path the path area
   * @param distance the distance for contour
   * @param smoothAngle angle for smoothing straight contour
   * @param show display (debug) any graphic helper
   */
  calcNormals(open: boolean, path: Path, distance: number, smoothAngle: number, show: boolean): Path[] {
    const normals: Path[] = [];

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
          normals.push(this.addNormal(segment.point, segment.point.add(lmedian), show));
          for (; (lmedian.angle - median.angle + 360) % 360 > smoothAngle;) {
            lmedian = lmedian.rotate(-smoothAngle);
            normals.push(this.addNormal(segment.point, segment.point.add(lmedian), show));
          }
        }
      }

      // Add median
      if (open) {
        const vector = this.addNormal(segment.point, segment.point.add(median), show);
        normals.push(vector);
      } else {
        const vector = this.addNormal(segment.point, segment.point.subtract(median), show);
        normals.push(vector);
      }

      if (open) {
        // Change direction is too high
        // Smooth path, after median
        if (mangle > 90) {
          let rmedian: Point = median.rotate(-smoothAngle);
          normals.push(this.addNormal(segment.point, segment.point.add(rmedian), show));
          for (; (rmedian.angle - rvector.angle + 360) % 360 > (90 + smoothAngle);) {
            rmedian = rmedian.rotate(-smoothAngle);
            normals.push(this.addNormal(segment.point, segment.point.add(rmedian), show));
          }
        }
      }
    }

    return normals;
  }

  /**
   * add a new median
   * @param from point from
   * @param to point to
   * @param insert insert in graphic ?
   */
  addNormal(from: Point, to: Point, insert: boolean): Path {
    const path = new Path.Line({
      from: from,
      to: to,
      strokeColor: 'yellow',
      strokeWidth: 0.2,
      insert: insert
    });
    return path;
  }
}
