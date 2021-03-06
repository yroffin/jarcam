import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Path, Point } from 'paper';
import { TreeNode } from 'primeng/api';

import * as _ from 'lodash';

import { MillingService } from '../../services/three/milling.service';
import { AppComponent } from 'src/app/app.component';
import { PaperJSUtils } from 'src/app/services/paperjs/paperjs-utils';
import { ShapeGroup, BrimBean } from 'src/app/services/paperjs/paperjs-model';
import { PaperJSSlicer } from 'src/app/services/paperjs/paperjs-slicer';
import { ParametersService, ScanPiecesBean, LayerBean, CHANGE_BRIMMODE, SET_BRIM, CHANGE_LAYER } from 'src/app/stores/parameters.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { WorkbenchService } from 'src/app/services/workbench.service';
import { StorageService } from 'src/app/services/utility/storage.service';
import { AutoUnsubscribe } from 'src/app/services/utility/decorators';
import { Subscription } from 'rxjs';
import { PaperJSShapeBrimInterface } from 'src/app/services/paperjs/paperjs-interface';
import { PaperJSShapeBrim } from 'src/app/services/paperjs/paperjs-shape-brim';
import { CanDisplaySideBar } from 'src/app/interfaces/types';
import { MessageService } from 'primeng/components/common/messageservice';
import { PaperComponent } from '../renderer/paper/paper.component';

@AutoUnsubscribe()
@Component({
  selector: 'app-toolpath-view',
  templateUrl: './toolpath-view.component.html',
  styleUrls: ['./toolpath-view.component.css'],
  providers: [MessageService]
})
export class ToolpathViewComponent implements OnInit, AfterViewInit, CanDisplaySideBar {

  @ViewChild(PaperComponent) paperComponent: PaperComponent;

  public zoom = 5;
  public infos: TreeNode[];

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

  public options: {
    layer: LayerBean,
    scanPieces: ScanPiecesBean
    brims: BrimBean[]
  };

  private brim: PaperJSShapeBrimInterface = new PaperJSShapeBrim();
  private selectedBrim: Path;

  constructor(
    private appComponent: AppComponent,
    private messageService: MessageService,
    private parametersService: ParametersService,
    private millingService: MillingService,
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
    const l = this.route.snapshot.queryParams['layer'];
    if (l) {
      this.parametersService.dispatch({
        type: CHANGE_LAYER,
        payload: {
          visible: true,
          top: Number(l)
        }
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
          this.slicer.refreshBrims(this.options.brims, 3);
        }
      },
      (err) => console.error(err),
      () => {
      }
    );
  }

  ngAfterViewInit() {
    console.log('Render slice of current layer');
    this.slicer = new PaperJSSlicer(this.paperComponent.project);

    // get param
    const lastLoaded = this.route.snapshot.queryParams['lastLoaded'];
    if (lastLoaded) {
      const data = this.storageService.load('lastLoaded');
      this.workbenchService.loadBinary(data, () => {
        this.sliceInit();
      });
    } else {
      this.sliceInit();
    }
  }

  showSideBar() {
    this.display = true;
  }

  sliceInit() {
    // Init slice
    this.slicer.init(
      this.options.scanPieces,
      this.zoom,
      this.radius);

    // Render shape
    this.shapes = this.slicer.render(this.millingService.getAreas(), false, true);
    this.slicer.refreshBrims(this.options.brims, 3);

    this.selectedBrim = new Path({
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
        this.selectedBrim,
        this.brimMode,
        event.point,
        this.radius,
        bound,
        this.options.scanPieces.minx, this.options.scanPieces.maxx, this.options.scanPieces.miny, this.options.scanPieces.maxy);
    };

    setTimeout(() => {
      this.buildInfo();
    }, 1);
  }

  public buildInfo() {
    // Build info
    this.infos = [
      {
        'data': {
          'name': 'Opened shapes',
          'type': 'Folder',
          'description': ''
        },
        'children': []
      },
      {
        'data': {
          'name': 'Closed shapes',
          'type': 'Folder',
          'description': ''
        },
        'children': []
      }
    ];
    // Opened
    _.each(this.shapes.opened.children, (shape: Path) => {
      this.infos[0].children.push({
        'data': {
          'name': shape.name,
          'type': 'Shape',
          'description': 'Opened shape with ' + shape.segments.length + ' segment(s)'
        },
        'children': []
      });
    });
    this.infos[0].data.description = this.infos[0].children.length + ' shapes(s)';
    // Closed
    _.each(this.shapes.closed.children, (shape: Path) => {
      this.infos[1].children.push({
        'data': {
          'name': shape.name,
          'type': 'Shape',
          'description': 'Closed shape with ' + shape.segments.length + ' segment(s)'
        },
        'children': []
      });
    });
    this.infos[1].data.description = this.infos[1].children.length + ' shapes(s)';
  }

  public zoomin(event: any) {
    this.zoom += Math.abs(event.deltaY) / 10;
    this.slicer.onToolChange(this.zoom);
  }

  public zoomout(event: any) {
    this.zoom -= Math.abs(event.deltaY) / 10;
    this.zoom = this.zoom < 1 ? 1 : this.zoom;
    this.slicer.onToolChange(this.zoom);
  }

  public selectBrim() {
    if (this.selectedBrim.data.points) {
      this.parametersService.dispatch({
        type: SET_BRIM,
        payload: {
          brim: _.concat(this.selectedBrim.data, this.options.brims)
        }
      });
    }
  }

  public setBrimMode() {
    this.slicer.setBrimMode(this.brimMode);
    this.parametersService.dispatch({
      type: CHANGE_BRIMMODE,
      payload: {
        brimMode: this.brimMode
      }
    });
  }

  gcodeCopy(): void {
    // Copy gcode to clipboard
    const el = document.createElement('textarea');
    el.value = this.slicer.sampleGcode(
      this.options.layer.top,
      this.options.scanPieces.maxz, this.options.brims, 3,
      this.shapes.journeys);
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    this.messageService.add({ severity: 'success', summary: 'Gcode copied to clipboard', detail: el.value.length + ' byte(s)' });
    document.body.removeChild(el);
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
