import { Component, Input, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { PaperScope, Project, Path, Shape, Point, Size, Group, Color, PointText, Matrix, Rectangle, Segment } from 'paper';

import * as _ from 'lodash';

import { ElementRef } from '@angular/core';
import { MillingService } from '../../services/three/milling.service';
import { Area, AreaPoint } from 'src/app/services/three/area.class';
import { injectElementRef } from '@angular/core/src/render3/view_engine_compatibility';
import { AppComponent } from 'src/app/app.component';
import { PaperJSUtils } from 'src/app/services/paperjs/paperjs-utils';
import { Journey, ShapeGroup } from 'src/app/services/paperjs/paperjs-model';
import { PaperJSGcode } from 'src/app/services/paperjs/paperjs-gcode';
import { PaperJSContour } from 'src/app/services/paperjs/paperjs-contour';

declare var Prism: any;

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

  private scope: PaperScope;
  private project: Project;

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

    this.project.view.scale(this.zoom, -this.zoom);
    this.project.view.onResize = (event) => {
      // Whenever the view is resized, move the path to its center:
      this.project.view.center = new Point(0, 0);
      this.project.view.draw();
    };

    // center view
    this.project.view.center = new Point(0, 0);

    const shapes = this.render(true, true);

    setTimeout(() => {
      this.gcode = PaperJSGcode.buildGcode(shapes.opened, shapes.aroundJourney);
      this.copyToClipboard(this.gcode);
      Prism.highlightElement(this.gcodeArea.nativeElement);
    }, 1);
  }

  public onToolChange() {
    const target = this.zoom / this.project.view.scaling.x;
    this.project.view.scale(target, target);
  }

  render(fill: boolean, domInsert: boolean): ShapeGroup {
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
    const inner = PaperJSUtils.bounds(shapes.opened, 0);
    const boundContour = new Path.Rectangle({
      from: new Point(inner.left, inner.top),
      to: new Point(inner.right, inner.bottom),
      strokeColor: 'red',
      strokeWidth: 0.05,
      selected: true,
      insert: true
    });

    // Compute path
    shapes.aroundJourney = this.around(shapes, 4, boundContour.bounds);
    const journeyAll = this.computePath(shapes, 0, this.millingService.radius(), boundContour.bounds, [], false, domInsert);

    if (fill) {
      _.each(shapes.aroundJourney, (journey) => {
        const circle = new Path.Circle({
          center: journey.position,
          radius: 1,
          strokeColor: 'red',
          strokeWidth: 0.05,
          fillColor: 'black'
        });

        for (let indice = 0; indice < journey.path.length; indice += 0.2) {
          const tool = new Path.Circle({
            center: journey.path.getPointAt(indice),
            radius: this.millingService.radius()
          });
          tool.strokeColor = 'red';
          tool.strokeWidth = 0.05;
        }
      });
    }

    return shapes;
  }

  copyToClipboard(str) {
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
  buildShape(domInsert: boolean): ShapeGroup {
    const shapeGroup: ShapeGroup = {
      opened: new Group(),
      closed: new Group()
    };

    const start = this.millingService.getStart();
    this.tool = new Path.Circle({
      center: new Point(start.x, start.y),
      radius: this.millingService.radius(),
      insert: domInsert
    });
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
        shapeGroup.opened.addChild(areaPath);
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
  openedShape(opened: Group, domInsert: boolean): Group {
    const group: Group = new Group();
    _.each(opened.children, (path: Path) => {
      const contour = PaperJSContour.contour(true, path, this.millingService.radius(), 10, 0.2, false, domInsert);
      group.addChild(contour);
    });
    return group;
  }

  /**
   * build contour on closed shape
   * @param closed group
   * @param domInsert should insert it in dom ?
   */
  closedShape(closed: Group, domInsert: boolean): Group {
    const group: Group = new Group();
    _.each(closed.children, (path: Path) => {
      const contour = PaperJSContour.contour(false, path, this.millingService.radius(), 10, 0.2, false, domInsert);
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
  computePath(
    shapeGroup: ShapeGroup,
    offset: number,
    len: number,
    area: Rectangle,
    journeys: Journey[],
    showContour: boolean,
    domInsert: boolean): Journey[] {
    if (area.width > 0) {
      const clone = area.clone();
      clone.x += len;
      clone.height -= len;
      clone.width -= len * 2;
      // Fill this area
      journeys.push(this.union(shapeGroup, area, showContour));
      this.computePath(shapeGroup, offset + 1, len, clone, journeys, showContour, domInsert);
    }
    return journeys;
  }

  /**
   * find all journey around elements
   */
  around(shapeGroup: ShapeGroup, len: number, area: Rectangle): Journey[] {
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
  union(shapeGroup: ShapeGroup, area: Rectangle, domInsert: boolean): Journey {
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
  modifyParcours(current: Path, add: Path): void {
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
