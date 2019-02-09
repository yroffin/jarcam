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
import { ParametersService, ScanPiecesBean, LayerBean, CHANGE_BRIMMODE } from 'src/app/stores/parameters.service';
import { Observable } from 'rxjs';
import { DialogGcodeComponent } from 'src/app/components/dialog-gcode/dialog-gcode.component';
import { ActivatedRoute } from '@angular/router';
import { WorkbenchService } from 'src/app/services/workbench.service';
import { StorageService } from 'src/app/services/utility/storage.service';
import { AutoUnsubscribe } from 'src/app/services/utility/decorators';
import { Subscription } from 'rxjs';

@AutoUnsubscribe()
@Component({
  selector: 'app-toolpath-view',
  templateUrl: './toolpath-view.component.html',
  styleUrls: ['./toolpath-view.component.css']
})
export class ToolpathViewComponent implements OnInit, AfterViewInit {

  @ViewChild('paperView') paperCanvas: ElementRef;

  public zoom = 5;

  private slicer: PaperJSSlicer;
  private shapes: ShapeGroup;
  private brimMode = 'cross';
  private radius = 4;

  scanPiecesStream: Observable<ScanPiecesBean>;
  layersStream: Observable<LayerBean>;
  radiusStream: Observable<number>;

  layersSubscription: Subscription;
  scanPiecesSubscription: Subscription;
  radiusSubscription: Subscription;
  dialogSubscription: Subscription;

  public options: {
    layer: LayerBean,
    scanPieces: ScanPiecesBean
  };

  constructor(
    private appComponent: AppComponent,
    private parametersService: ParametersService,
    private millingService: MillingService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private workbenchService: WorkbenchService,
    private storageService: StorageService
  ) {
    this.scanPiecesStream = this.parametersService.scanPieces();
    this.layersStream = this.parametersService.layers();
    this.radiusStream = this.parametersService.radius();
    this.options = {
      layer: {
        top: 0,
        visible: true
      },
      scanPieces: {
        minx: 0,
        maxx: 0,
        miny: 0,
        maxy: 0,
        minz: 0,
        maxz: 0,
        allZ: []
      }
    };
  }

  ngOnInit() {
    // get param
    const lastLoaded = this.route.snapshot.queryParams['lastLoaded'];
    if (lastLoaded) {
      const data = this.storageService.load('lastLoaded');
      this.workbenchService.loadBinary(data, () => {
      });
    }
    this.radiusSubscription = this.radiusStream.subscribe(
      (radius: number) => {
        this.radius = radius;
      },
      (err) => console.error(err),
      () => {
      }
    );
    this.layersSubscription = this.layersStream.subscribe(
      (layer: LayerBean) => {
        this.options.layer = layer;
      },
      (err) => console.error(err),
      () => {
      }
    );
    this.scanPiecesSubscription = this.scanPiecesStream.subscribe(
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
      this.options.scanPieces,
      this.zoom,
      this.radius);

    // Render shape
    this.shapes = this.slicer.render(this.millingService.getAreas(), false, true);
  }

  public onToolChange() {
    this.slicer.onToolChange(this.zoom);
  }

  public onClick() {
    this.slicer.setBrimMode(this.brimMode);
    this.parametersService.dispatch({
      type: CHANGE_BRIMMODE,
      payload: {
        brimMode: this.brimMode
      }
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogGcodeComponent, {
      width: '100%',
      data: {
        gcode: this.slicer.gcode(
          this.options.layer.top,
          this.options.scanPieces.maxz,
          this.shapes.journeys)
      }
    });

    this.dialogSubscription = dialogRef.afterClosed().subscribe(result => {
    });
  }

}

