import { Component, Input, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { PaperScope, Project, Path, Shape, Point, Size, Group, Color, PointText, Matrix } from 'paper';

import * as _ from 'lodash';

import { ElementRef } from '@angular/core';
import { MillingService } from '../../services/three/milling.service';

@Component({
  selector: 'app-toolpath-view',
  templateUrl: './toolpath-view.component.html',
  styleUrls: ['./toolpath-view.component.css']
})
export class ToolpathViewComponent implements OnInit, AfterViewInit {

  @ViewChild('paperView') paperCanvas: ElementRef;

  @Input() options: any;

  private width = window.innerWidth;
  private height = window.innerHeight;

  scope: PaperScope;
  project: Project;

  openArea: Group;
  bound: Group;

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
      this.project.activeLayer.position = this.project.view.center;
      this.project.view.draw();
    };
  }

  public onLayerChange() {
    this.render();
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

  render() {
    const start = new Date().getTime();
    this.project.clear();

    this.gridHelper(140, 1);

    this.init();
    this.firstPass();

    this.project.activeLayer.position = this.project.view.center;
    console.log('Elapse contour time', new Date().getTime() - start);
  }

  init() {
    this.openArea = new Group();
    this.bound = new Group();

    _.each(this.millingService.getAreas(), (area) => {
      if (area.isOpen() || area.isBound) {
        const segments = [];
        _.each(area.vertices2d, (vertice) => {
          segments.push([vertice.x, vertice.y]);
        });
        const areaPath = new Path({
          segments: segments,
          selected: false,
          closed: true,
          name: area.name,
          strokeColor: 'red',
          strokeWidth: 0.1
        });
        if (area.isBound) {
          this.bound.addChild(areaPath);
        } else {
          areaPath.onMouseEnter = function (event) {
            this.selected = true;
            console.log('name', this.name);
          };
          areaPath.onMouseLeave = function (event) {
            this.selected = false;
          };
          this.openArea.addChild(areaPath);
        }
      }
    });
  }

  firstPass() {
    let derived;
    _.each(this.openArea.children, (path: Path) => {
      derived = this.contour(path, 4, 10, 0.05, false, true);
    });
  }

  contour(path: Path, distance: number, smoothAngle: number, precision: number, circle: boolean, simplify: boolean): Group {
    const contourGroup = new Group();

    const contour = new Path();
    contour.strokeColor = 'brown';
    contour.strokeWidth = 0.2;
    contour.closed = true;
    contour.selected = true;
    contour.name = path.name + '.contour';


    const normals = this.calcNormals(path, distance, smoothAngle);
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

    return contourGroup;
  }

  calcNormals(path: Path, distance: number, smoothAngle: number): Path[] {
    const normals: Path[] = [];

    let previous = path.getNormalAt(0);
    const clockwise = path.clockwise;

    const start = new Date().getTime();
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
      if (Math.abs(directed) > 45) {
        for (let a = Math.abs(directed); a > 0; a -= smoothAngle) {
          const backCircle = normal.clone();
          backCircle.angle -= 180 - a;
          normals.push(this.addNormal(segment.point, segment.point.add(backCircle)));
        }
      }

      const vector = this.addNormal(segment.point, target);
      normals.push(vector);
      previous = normal.clone();
    });
    console.log('Elapse contour normals', new Date().getTime() - start);

    return normals;
  }

  addNormal(from: Point, to: Point): Path {
    const path = new Path.Line(from, to);
    path.strokeColor = 'blue';
    path.strokeWidth = 0.1;
    return path;
  }
}
