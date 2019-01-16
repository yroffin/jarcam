import { Component, Input, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { PaperScope, Project, Path, Shape, Point, Size, Group, Color, PointText, Matrix, Rectangle } from 'paper';

import * as _ from 'lodash';

import { ElementRef } from '@angular/core';
import { MillingService } from '../../services/three/milling.service';
import { Area, AreaPoint } from 'src/app/services/three/area.class';
import { injectElementRef } from '@angular/core/src/render3/view_engine_compatibility';

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

  @Input() options: any;

  private width = window.innerWidth;
  private height = window.innerHeight;

  scope: PaperScope;
  project: Project;

  openArea: Group;
  openPath: Path[];
  closedArea: Group;

  bound: Path;
  tool: Path;
  public gcode: string;

  constructor(private millingService: MillingService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.scope = new PaperScope();
    this.project = new Project(this.paperCanvas.nativeElement);
    this.project.view.scale(this.options.toolpath.zoom.value, -this.options.toolpath.zoom.value);
    this.project.view.onResize = (event) => {
      // Whenever the view is resized, move the path to its center:
      this.project.view.center = new Point(0, 0);
      this.project.view.draw();
    };
  }

  public onLayerChange() {
    this.render(false);
    Prism.highlightElement(this.gcodeArea.nativeElement);
  }

  public onToolChange() {
    const target = this.options.toolpath.zoom.value / this.project.view.scaling.x;
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

    gridX.strokeColor = 'blue';
    gridX.strokeWidth = 0.01;

    segments = [];
    for (x = -size; x < size; x += step) {
      segments.push([x, -size], [x, size], [x, 0], [x + step, 0]);
    }

    const gridY = new Path({
      segments: segments,
      selected: false
    });

    gridY.strokeColor = 'blue';
    gridY.strokeWidth = 0.01;

    const axeX = new Path({
      segments: [[-size, 0], [size, 0], [size - 5, 5], [size - 5, -5], [size, 0]]
    });
    axeX.strokeColor = 'red';
    const axeY = new Path({
      segments: [[0, -size], [0, size], [5, size - 5], [-5, size - 5], [0, size]]
    });
    axeY.strokeColor = 'green';
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
    const bounds = this.secondPass();

    // Compute bound
    const inner = this.bounds(0);
    const boundContour = new Path.Rectangle({
      from: new Point(inner.left, inner.top),
      to: new Point(inner.right, inner.bottom),
      strokeColor: 'red',
      strokeWidth: 0.05,
      selected: true,
      insert: true
    });;

    // Compute path
    const journeyAround = this.around(4, boundContour.bounds);
    const journeyAll = this.computePath(0, 4, boundContour.bounds, []);

    if (fill) {
      _.each(journeyAround, (journey) => {
        for (let indice = 0; indice < journey.path.length; indice += 0.2) {
          const circle = new Path.Circle(journey.path.getPointAt(indice), 4);
          circle.strokeColor = 'red';
          circle.strokeWidth = 0.05;
        }
      });

      _.each(journeyAll, (journey) => {
        for (let indice = 0; indice < journey.path.length; indice += 0.2) {
          const circle = new Path.Circle(journey.path.getPointAt(indice), 4);
          circle.strokeColor = 'red';
          circle.strokeWidth = 0.05;
        }
      });
    }

    this.gcode = this.buildGcode(journeyAround);

    console.log('Elapse contour time', new Date().getTime() - start);
  }

  buildGcode(journey: Journey[]): string {
    const inner = this.bounds(4);

    let gcode = '; Translate ' + inner.left + ' ' + inner.top + '\n';
    _.each(journey, (journey) => {
      for (let indice = 0; indice < journey.path.length; indice += 0.2) {
        const point = journey.path.getPointAt(indice);
        gcode += 'G01 X' + Math.round(point.x * 100 + Number.EPSILON) / 100 + ' Y' + Math.round(point.x * 100 + Number.EPSILON) / 100 + '\n';
      }
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
          strokeWidth: 0.1
        });
        areaPath.onMouseEnter = function (event) {
          this.selected = true;
          console.log('name', this.name);
        };
        areaPath.onMouseLeave = function (event) {
          this.selected = false;
        };
        this.openArea.addChild(areaPath);
      } else {
        if (area.isBound) {
          this.bound = new Path({
            segments: segments,
            selected: false,
            closed: true,
            name: area.name,
            strokeColor: 'purple',
            strokeWidth: 0.2
          });
        } else {
          const areaPath = new Path({
            segments: segments,
            selected: false,
            closed: true,
            name: area.name,
            strokeColor: 'yellow',
            strokeWidth: 0.2
          });
          this.closedArea.addChild(areaPath);
        }
      }
    });
  }

  firstPass(): Path[] {
    const group = [];
    _.each(this.openArea.children, (path: Path) => {
      const contour = this.contour(true, path, 4, 10, 0.05, false, false);
      group.push(contour.contour);
    });
    return group;
  }

  secondPass(): any {
    const group = [];
    _.each(this.closedArea.children, (path: Path) => {
      const contour = this.contour(false, path, 4, 10, 0.05, false, false);
      group.push(contour);
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
    }
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
    const detectors: Journey[] = _.flatMap(this.openPath, (contour: Path) => {
      const center = contour.bounds.center;
      return {
        path: new Path.Rectangle({
          from: new Point(center.x - 0.25, contour.bounds.top + 3),
          to: new Point(center.x + 0.25, area.left),
          strokeColor: 'yellow',
          strokeWidth: 0.2,
          selected: true,
          insert: false
        }),
        position: new Point(center.x - 0.25, area.y)
      };
    });

    // scan elements to contour
    const elements = _.flatMap(this.openPath, (contour) => {
      return {
        path: contour,
        touch: false
      };
    });

    _.each(detectors, (detector) => {
      // Find all crossing element
      const crossings = _.filter(elements, (element) => {
        const intersections = detector.path.getIntersections(element.path);
        if (intersections.length > 0) {
          return true;
        }
        return false;
      });
      // Cross it
      _.each(crossings, (crossing) => {
        const unite = detector.path.unite(crossing.path);
        crossing.touch = true;
        detector.path.copyContent(unite);
        unite.remove();
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

  contour(open: boolean, path: Path, distance: number, smoothAngle: number, precision: number, circle: boolean, simplify: boolean): any {
    const contour = new Path();
    contour.strokeColor = 'brown';
    contour.strokeWidth = 0.2;
    contour.closed = true;
    contour.selected = false;
    contour.name = path.name + '.contour';


    const normals = this.calcNormals(open, path, distance, smoothAngle);
    const hittest = new Path.Circle(new Point(0, 0), distance - precision);

    let indice = 0;
    _.each(normals, (normal: Path) => {
      const position = normal.segments[1].point;
      indice++;
      hittest.position.x = position.x;
      hittest.position.y = position.y;
      hittest.name = path.name + '.circle#' + indice;

      if (!hittest.intersects(path)) {
        contour.add(normal.segments[1].point);
        normal.remove();
      }

      if (circle) {
        hittest.strokeColor = 'blue';
        hittest.strokeWidth = 0.005;
        hittest.clone();
      } else {
        normal.remove();
      }
    });

    if (circle) {
      hittest.remove();
    }

    if (simplify) {
      contour.simplify(0.001);
    }

    return {
      contour: contour
    };
  }

  calcNormals(open: boolean, path: Path, distance: number, smoothAngle: number): Path[] {
    const start = new Date().getTime();
    const normals: Path[] = [];

    let previous = path.getNormalAt(0);
    let clockwise;
    if (open) {
      clockwise = path.clockwise;
    } else {
      clockwise = !path.clockwise;
    }

    _.each(path.segments, (segment) => {
      const offset = path.getOffsetOf(segment.point);
      const normal = path.getNormalAt(offset);
      normal.length = distance;
      let target;
      if (clockwise) {
        target = segment.point.add(normal);
      } else {
        target = segment.point.subtract(normal);
      }

      // Change direction is too high
      // Smooth path
      const directed = previous.getDirectedAngle(normal);

      if (open) {
        if (Math.abs(directed) > 45) {
          for (let a = Math.abs(directed); a > 0; a -= smoothAngle) {
            const backCircle = normal.clone();
            backCircle.angle -= 180 - a;
            normals.push(this.addNormal(segment.point, segment.point.add(backCircle)));
          }
        }
      }

      const vector = this.addNormal(segment.point, target);
      normals.push(vector);
      previous = normal.clone();
    });
    console.log('Elapse contour normals', path.name, new Date().getTime() - start);

    return normals;
  }

  addNormal(from: Point, to: Point): Path {
    const path = new Path.Line({
      from: from,
      to: to,
      strokeColor: 'blue',
      strokeWidth: 0.1,
      insert: false
    });
    return path;
  }
}
