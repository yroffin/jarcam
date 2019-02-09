import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ParametersService, CHANGE_LAYER, CHANGE_DEBUG, DebugBean, LayerBean, ScanPiecesBean } from 'src/app/stores/parameters.service';
import { Observable } from 'rxjs';
import { WorkbenchService } from 'src/app/services/workbench.service';
import { StorageService } from 'src/app/services/utility/storage.service';
import { PaperJSSlicer } from 'src/app/services/paperjs/paperjs-slicer';
import { MillingService } from 'src/app/services/three/milling.service';
import { ElementRef } from '@angular/core';
import * as _ from 'lodash';
import { DatePipe } from '@angular/common';
import { AutoUnsubscribe } from 'src/app/services/utility/decorators';
import { Subscription } from 'rxjs';

@AutoUnsubscribe()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  @ViewChild('fileInput') fileInput;
  @ViewChild('gcodeView') paperCanvas: ElementRef;

  title = 'ui';

  items: MenuItem[];
  display = false;

  axesHelper: boolean;
  wireframe: boolean;
  normals: boolean;
  ground: boolean;

  radius: number;
  layer: LayerBean;
  scanPieces: ScanPiecesBean;
  debug: DebugBean;

  layersStream: Observable<LayerBean>;
  debugsStream: Observable<DebugBean>;
  scanPiecesStream: Observable<ScanPiecesBean>;
  radiusStream: Observable<number>;
  layersSubscription: Subscription;
  debugsSubscription: Subscription;
  scanPiecesSubscription: Subscription;
  radiusSubscription: Subscription;

  public layerIndex = 0;
  public layerMin = 0;
  public layerMax = 0;
  public layerArray = [];

  constructor(
    private parametersService: ParametersService,
    private millingService: MillingService,
    private workbenchService: WorkbenchService,
    private storageService: StorageService) {
    this.layer = {
      visible: false,
      top: 0,
    };
    this.axesHelper = false;
    this.wireframe = false;
    this.normals = false;
    this.ground = false;
    this.layersStream = this.parametersService.layers();
    this.debugsStream = this.parametersService.debugs();
    this.scanPiecesStream = this.parametersService.scanPieces();
    this.radiusStream = this.parametersService.radius();
  }

  ngOnInit() {
    this.items = [
      {
        icon: 'pi pi-fw pi-align-justify',
        command: (event) => {
          this.display = true;
        }
      },
      {
        label: 'File',
        items: [
          {
            label: 'Open', icon: 'pi pi-fw pi-file', command: (event) => {
              this.load();
            }
          },
          {
            label: 'Gcode', icon: 'pi pi-fw pi-save', command: (event) => {
              this.gcodeBuild();
            }
          }
        ]
      },
      {
        label: 'View',
        items: [
          {
            label: 'Scene', icon: 'pi pi-fw pi-clone', routerLink: ['/scene']
          },
          {
            label: 'Slice', icon: 'pi pi-fw pi-replay', routerLink: ['/slice']
          }
        ]
      }
    ];
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
        this.layer = layer;
      },
      (err) => console.error(err),
      () => {
      }
    );
    this.debugsSubscription = this.debugsStream.subscribe(
      (debug: DebugBean) => {
        this.debug = debug;
      },
      (err) => console.error(err),
      () => {
      }
    );
    this.scanPiecesSubscription = this.scanPiecesStream.subscribe(
      (scanPieces: ScanPiecesBean) => {
        setTimeout(() => {
          this.scanPieces = scanPieces;
          this.layerIndex = 0;
          this.layerMin = 0;
          this.layerMax = scanPieces.allZ.length - 1;
          this.layerArray = scanPieces.allZ;
          this.onLayerChange();
        }, 1);
      },
      (err) => console.error(err),
      () => {
      }
    );

    this._load();
  }

  public load() {
    this.fileInput.nativeElement.click();
  }

  public gcodeBuild() {
    const slicer = new PaperJSSlicer(this.paperCanvas.nativeElement);

    // Init slice
    slicer.init(
      this.scanPieces,
      1,
      this.radius);

    const saveLayer: LayerBean = {
      top: 0,
      visible: true
    };

    // Header
    let gcode = slicer.header(this.scanPieces.maxz);

    // Iterate on all Z to build this piece
    _.each(_.reverse(_.clone(this.scanPieces.allZ)), (top: number) => {
      const currentLayer: LayerBean = {
        top: top,
        visible: true
      };
      this.workbenchService.onLayerChange(currentLayer);

      // Render shape
      const shapes = slicer.render(this.millingService.getAreas(), false, false);

      // Calc gcode
      gcode += slicer.gcode(
        currentLayer.top,
        this.scanPieces.maxz,
        shapes.journeys);
    });

    // Download
    this.download(gcode);

    // Restore old layer position
    this.onLayerChange();
  }

  private download(myOutputData: string) {
    const datePipe = new DatePipe('en-US');
    const fileName = 'export-' + datePipe.transform(new Date(), 'yyyyMMdd-HHmmss') + '.txt';
    const a: any = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    const file = new Blob([myOutputData], { type: 'application/text' });
    const fileURL = window.URL.createObjectURL(file);
    a.href = fileURL;
    a.download = fileName;
    a.click();
  }

  private _load() {
    // Check the support for the File API support
    if (window.Blob) {
      this.fileInput.nativeElement.addEventListener('change', () => {
        // Set the extension for the file
        const fileExtension = /stl.*/;
        // Get the file object
        const fileTobeRead = this.fileInput.nativeElement.files[0];
        // Initialize the FileReader object to read the 2file
        const fileReader = new FileReader();
        fileReader.onload = () => {
          this.storageService.save('lastLoaded', fileReader.result);
          this.workbenchService.loadBinary(fileReader.result, () => {
          });
        };
        fileReader.readAsBinaryString(fileTobeRead);
      }, false);
    } else {
      throw <Error>{
        stack: 'Files are not supported'
      };
    }
  }

  public onLayerChange() {
    this.layer.top = this.layerArray[this.layerIndex];
    this.parametersService.dispatch({
      type: CHANGE_LAYER,
      payload: {
        visible: this.layer.visible,
        top: this.layer.top
      }
    });
  }

  public onLayerVisibilityChange() {
    this.parametersService.dispatch({
      type: CHANGE_LAYER,
      payload: {
        visible: this.layer.visible,
        top: this.layer.top
      }
    });
  }

  public onDebugChange(event?, name?: string) {
    switch (name) {
      case 'axisHelper':
        this.axesHelper = event.checked;
        break;
      case 'normals':
        this.normals = event.checked;
        break;
      case 'wireframe':
        this.wireframe = event.checked;
        break;
      case 'ground':
        this.ground = event.checked;
        break;
    }
    this.parametersService.dispatch({
      type: CHANGE_DEBUG,
      payload: {
        axesHelper: this.axesHelper,
        normals: this.normals,
        wireframe: this.wireframe,
        ground: this.ground
      }
    });
  }
}
