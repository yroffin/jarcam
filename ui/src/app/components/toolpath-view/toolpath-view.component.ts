import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
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
    this.project.view.scale(7, -7);
    this.project.view.onResize = (event) => {
      // Whenever the view is resized, move the path to its center:
      this.project.activeLayer.position = this.project.view.center;
      this.project.view.draw();
    };
  }

  public onLayerChange() {
    this.render();
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
          closed: true
        });
        areaPath.name = area.name;
        areaPath.strokeColor = 'gray';
        areaPath.strokeWidth = 0.2;
        areaPath.simplify(0.00001);
        if (area.isBound) {
          this.bound.addChild(areaPath);
        } else {
          areaPath.simplify(0.00001);
          areaPath.onMouseEnter = function (event) {
            this.selected = true;
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
      derived = this.contour(path, 4, 2);
    });
  }

  contour(path: Path, distance: number, step: number): Path {
    return this.rawContour(path, distance, step);
  }

  rawContourOld(path: Path, distance: number, step: number): Path {
    const contour = new Path();
    contour.strokeColor = 'brown';
    contour.strokeWidth = 0.2;
    contour.closed = true;
    contour.selected = true;

    const copy = new Path.Circle(path.bounds.center, 20);
    for (let offset = 0; offset < path.length; offset++) {
      let nearest = copy.getNearestPoint(path.getPointAt(offset));
      contour.add(nearest);
    }
    copy.remove();

    return contour;
  }

  rawContour(path: Path, distance: number, step: number): Path {
    const contour = new Path();
    contour.strokeColor = 'brown';
    contour.strokeWidth = 0.2;
    contour.closed = true;
    contour.selected = true;

    const bounds = path.bounds;
    const vector = path.bounds.topCenter.subtract(path.bounds.center);
    vector.length += 20;

    const shape = new Path.Circle(vector, distance);
    shape.strokeColor = 'red';
    shape.selected = false;

    const chemin = new Path.Circle(path.bounds.center, vector.length);
    chemin.strokeColor = 'red';
    chemin.selected = false;

    for (let circle = -180; circle <= 180; circle += step, vector.angle += step) {
      const copy = shape.clone();
      // Fix position far away of this path
      const pos = path.bounds.center.add(vector);
      copy.position.x = pos.x;
      copy.position.y = pos.y;
      // Compute direction
      const direction = copy.position.subtract(path.bounds.center);
      direction.length = 0.1;
      for (; path.getIntersections(copy).length === 0;) {
        copy.position.x -= direction.x;
        copy.position.y -= direction.y;
      }
      // Retract object
      copy.position.x += direction.x;
      copy.position.y += direction.y;
      contour.add(copy.bounds.center);
      copy.remove();
    }
    shape.remove();
    chemin.remove();
    return contour;
  }

  next(path: Path, distance: number, begin: number, end: number, angle: number): Point {
    const from = path.getPointAt(begin);
    const to = path.getPointAt(end);
    const vector = to.subtract(from);
    vector.angle += angle;
    vector.length = distance;
    return from.add(vector);
  }
}
