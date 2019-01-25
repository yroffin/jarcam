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
import { PaperJSSlicer } from 'src/app/services/paperjs/paperjs-slicer';

declare var Prism: any;

@Component({
  selector: 'app-toolpath-view',
  templateUrl: './toolpath-view.component.html',
  styleUrls: ['./toolpath-view.component.css']
})
export class ToolpathViewComponent implements OnInit, AfterViewInit {

  @ViewChild('paperView') paperCanvas: ElementRef;
  @ViewChild('gcodeArea') gcodeArea: ElementRef;

  private zoom = 5;

  private slicer: PaperJSSlicer;
  public gcode: string;

  constructor(
    private appComponent: AppComponent,
    private millingService: MillingService
  ) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.slicer = new PaperJSSlicer(this.paperCanvas.nativeElement);

    // Init slice
    this.slicer.init(
      this.millingService.getAreas(),
      this.zoom,
      this.millingService.getStart().x,
      this.millingService.getStart().y,
      this.millingService.radius());

    // Render shape
    const shapes = this.slicer.render(false, true);

    setTimeout(() => {
      // build gcode
      this.gcode = PaperJSGcode.buildGcode(shapes.opened, shapes.aroundJourney);
    }, 1);
  }

  public onToolChange() {
    this.slicer.onToolChange(this.zoom);
  }
}
