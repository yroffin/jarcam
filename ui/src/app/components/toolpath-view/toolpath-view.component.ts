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
import { Journey, ShapeGroup, TouchBean, BrimBean } from 'src/app/services/paperjs/paperjs-model';
import { PaperJSGcode } from 'src/app/services/paperjs/paperjs-gcode';
import { PaperJSContour } from 'src/app/services/paperjs/paperjs-contour';
import { PaperJSSlicer } from 'src/app/services/paperjs/paperjs-slicer';
import { ParametersService, ScanPiecesBean, LayerBean, CHANGE_BRIMMODE, SET_BRIM } from 'src/app/stores/parameters.service';
import { Observable } from 'rxjs';
import { DialogGcodeComponent } from 'src/app/components/dialog-gcode/dialog-gcode.component';
import { ActivatedRoute } from '@angular/router';
import { WorkbenchService } from 'src/app/services/workbench.service';
import { StorageService } from 'src/app/services/utility/storage.service';
import { AutoUnsubscribe } from 'src/app/services/utility/decorators';
import { Subscription } from 'rxjs';
import { PaperJSShapeBrimInterface } from 'src/app/services/paperjs/paperjs-interface';
import { PaperJSShapeBrim } from 'src/app/services/paperjs/paperjs-shape-brim';

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
  public brimMode = 'cross';
  public display = false;
  private radius = 4;

  scanPiecesStream: Observable<ScanPiecesBean>;
  scanPiecesSubscription: Subscription;

  layersStream: Observable<LayerBean>;
  layersSubscription: Subscription;

  radiusStream: Observable<number>;
  radiusSubscription: Subscription;

  brimStream: Observable<BrimBean[]>;
  brimSubscription: Subscription;

  dialogSubscription: Subscription;

  public options: {
    layer: LayerBean,
    scanPieces: ScanPiecesBean
    brims: BrimBean[]
  };

  private brim: PaperJSShapeBrimInterface = new PaperJSShapeBrim();

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
    this.brimStream = this.parametersService.brims();
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
      },
      brims: []
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
    this.brimSubscription = this.brimStream.subscribe(
      (brims: BrimBean[]) => {
        this.options.brims = brims;
        if (this.slicer) {
          this.slicer.refreshBrims(this.options.brims);
        }
      },
      (err) => console.error(err),
      () => {
      }
    );
  }

  ngAfterViewInit() {
    this.sliceInit();
  }

  sliceInit() {
    console.log('Render slice of current layer');
    this.slicer = new PaperJSSlicer(this.paperCanvas.nativeElement);

    // Init slice
    this.slicer.init(
      this.options.scanPieces,
      this.zoom,
      this.radius);

    // Render shape
    this.shapes = this.slicer.render(this.millingService.getAreas(), false, true);
    this.slicer.refreshBrims(this.options.brims);

    const brim = new Path({
      fillColor: 'orange',
      strokeColor: 'red',
      insert: true
    });

    // Compute bound
    const inner = PaperJSUtils.bounds(
      this.options.scanPieces.minx,
      this.options.scanPieces.maxx,
      this.options.scanPieces.miny,
      this.options.scanPieces.maxy,
      this.radius * 2);

    // Build contour
    const bound = new Path.Rectangle({
      from: new Point(inner.left, inner.top),
      to: new Point(inner.right, inner.bottom),
      strokeColor: 'red',
      strokeWidth: 0.5,
      fillColor: 'white',
      selected: false,
      visible: true,
      insert: true
    });
    bound.sendToBack();

    // Handler for brim capture
    bound.onMouseMove = (event) => {
      this.brim.brim(
        this.shapes,
        brim,
        this.brimMode,
        event.point,
        this.radius,
        bound,
        this.options.scanPieces.minx, this.options.scanPieces.maxx, this.options.scanPieces.miny, this.options.scanPieces.maxy);
    };
    brim.onClick = (event) => {
      this.parametersService.dispatch({
        type: SET_BRIM,
        payload: {
          brim: _.concat(brim.data, this.options.brims)
        }
      });
    };
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
        gcode: this.slicer.sampleGcode(
          this.options.layer.top,
          this.options.scanPieces.maxz, this.options.brims, 3,
          this.shapes.journeys)
      }
    });

    this.dialogSubscription = dialogRef.afterClosed().subscribe(result => {
    });
  }

  saveBrims(): void {
    this.storageService.saveAsObject('lastBrimConfig', this.options.brims);
  }

  clearBrims(): void {
    this.parametersService.dispatch({
      type: SET_BRIM,
      payload: {
        brim: []
      }
    });
  }
}
