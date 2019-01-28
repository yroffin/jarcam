import { Component, Input, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { PaperScope, Project, Path, Shape, Point, Size, Group, Color, PointText, Matrix, Rectangle, Segment } from 'paper';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

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
import { ParametersService, ScanPiecesBean, LayerBean } from 'src/app/stores/parameters.service';
import { Observable } from 'rxjs';
import { DialogGcodeComponent } from 'src/app/components/dialog-gcode/dialog-gcode.component';

@Component({
  selector: 'app-toolpath-view',
  templateUrl: './toolpath-view.component.html',
  styleUrls: ['./toolpath-view.component.css']
})
export class ToolpathViewComponent implements OnInit, AfterViewInit {

  @ViewChild('paperView') paperCanvas: ElementRef;

  private zoom = 5;

  private slicer: PaperJSSlicer;
  private shapes: ShapeGroup;

  scanPieces: Observable<ScanPiecesBean>;
  layers: Observable<LayerBean>;

  public options: {
    layer: LayerBean,
    scanPieces: ScanPiecesBean
  };

  constructor(
    private appComponent: AppComponent,
    private parametersService: ParametersService,
    private millingService: MillingService,
    public dialog: MatDialog
  ) {
    this.scanPieces = this.parametersService.scanPieces();
    this.layers = this.parametersService.layers();
    this.options = {
      layer: {
        top: 0,
        visible: true
      },
      scanPieces: {
        minz: 0,
        maxz: 0,
        allZ: []
      }
    };
  }

  ngOnInit() {
    this.layers.subscribe(
      (layer: LayerBean) => {
        this.options.layer = layer;
      },
      (err) => console.error(err),
      () => {
      }
    );
    this.scanPieces.subscribe(
      (scanPieces: ScanPiecesBean) => {
        this.options.scanPieces = scanPieces;
      },
      (err) => console.error(err),
      () => {
      }
    );
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
    this.shapes = this.slicer.render(false, true);
  }

  public onToolChange() {
    this.slicer.onToolChange(this.zoom);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogGcodeComponent, {
      width: '100%',
      data: {
        gcode: PaperJSGcode.buildGcode(this.shapes.opened, this.options.layer.top, this.options.scanPieces.maxz, this.shapes.aroundJourney)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

}

