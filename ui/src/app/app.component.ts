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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  @ViewChild('fileInput') fileInput;
  @ViewChild('gcodeView') paperCanvas: ElementRef;

  public options: any;

  title = 'ui';

  items: MenuItem[];
  display = false;

  layers: Observable<LayerBean>;
  debugs: Observable<DebugBean>;

  scanPieces: Observable<ScanPiecesBean>;

  private layerIndex = 0;
  private layerMin = 0;
  private layerMax = 0;
  private layerArray = [];

  constructor(
    private parametersService: ParametersService,
    private millingService: MillingService,
    private workbenchService: WorkbenchService,
    private storageService: StorageService) {
    this.options = {
      // layers
      layer: {
        visible: false,
        top: 0,
      },

      // debug
      debug: {
        axesHelper: false,
        wireframe: false,
        normals: false,
        ground: false
      }
    };
    this.layers = this.parametersService.layers();
    this.debugs = this.parametersService.debugs();
    this.scanPieces = this.parametersService.scanPieces();
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
    this.layers.subscribe(
      (layer: LayerBean) => {
        this.options.layer = layer;
      },
      (err) => console.error(err),
      () => {
      }
    );
    this.debugs.subscribe(
      (debug: DebugBean) => {
        this.options.debug = debug;
      },
      (err) => console.error(err),
      () => {
      }
    );
    this.scanPieces.subscribe(
      (scanPieces: ScanPiecesBean) => {
        setTimeout(() => {
          this.options.scanPieces = scanPieces;
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
      this.options.scanPieces,
      1,
      this.millingService.radius());

    const saveLayer: LayerBean = {
      top: 0,
      visible: true
    };

    // Header
    let gcode = slicer.header(this.options.scanPieces.maxz);

    // Iterate on all Z to build this piece
    _.each(_.reverse(_.clone(this.options.scanPieces.allZ)), (top: number) => {
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
        this.options.scanPieces.maxz,
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
    this.options.layer.top = this.layerArray[this.layerIndex];
    this.parametersService.dispatch({
      type: CHANGE_LAYER,
      payload: {
        visible: this.options.layer.visible,
        top: this.options.layer.top
      }
    });
  }

  public onLayerVisibilityChange() {
    this.parametersService.dispatch({
      type: CHANGE_LAYER,
      payload: {
        visible: this.options.layer.visible,
        top: this.options.layer.top
      }
    });
  }

  public onDebugChange(event?, name?: string) {
    switch (name) {
      case 'axisHelper':
        this.options.axesHelper = event.checked;
        break;
      case 'normals':
        this.options.normals = event.checked;
        break;
      case 'wireframe':
        this.options.wireframe = event.checked;
        break;
      case 'ground':
        this.options.ground = event.checked;
        break;
    }
    this.parametersService.dispatch({
      type: CHANGE_DEBUG,
      payload: {
        axesHelper: this.options.axesHelper,
        normals: this.options.normals,
        wireframe: this.options.wireframe,
        ground: this.options.ground
      }
    });
  }
}
