import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ParametersService, CHANGE_LAYER, CHANGE_DEBUG, DebugBean, LayerBean, ScanPiecesBean } from 'src/app/stores/parameters.service';
import { Observable } from 'rxjs';
import { WorkbenchService } from 'src/app/services/workbench.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  @ViewChild('fileInput') fileInput;

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
    private workbenchService: WorkbenchService) {
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
        this.options.scanPieces = scanPieces;
        this.layerIndex = 0;
        this.layerMin = 0;
        this.layerMax = scanPieces.allZ.length;
        this.layerArray = scanPieces.allZ;
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
    this.options.layer.top = this.layerArray[this.layerIndex] * 1000;
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
