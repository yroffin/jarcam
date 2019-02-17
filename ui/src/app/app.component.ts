import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import {
  ParametersService,
  CHANGE_LAYER, CHANGE_DEBUG, DebugBean, LayerBean, ScanPiecesBean, ParametersBean, SET_BRIM
} from 'src/app/stores/parameters.service';
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
import { BrimBean, JourneyClass } from 'src/app/services/paperjs/paperjs-model';
import { CanDisplaySideBar } from 'src/app/interfaces/types';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogParametersComponent } from 'src/app/components/dialog-parameters/dialog-parameters.component';
import { Dialog } from 'primeng/dialog';
import { HttpClient } from '@angular/common/http';
import { OverlayPanel } from 'primeng/overlaypanel';
import { DomSanitizer } from '@angular/platform-browser';
import { Pipe } from '@angular/core';
import { PipeTransform } from '@angular/core/src/change_detection/pipe_transform';

@AutoUnsubscribe()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  @ViewChild('op') op: OverlayPanel;
  @ViewChild('fileInput') fileInput;
  @ViewChild('gcodeView') paperCanvas: ElementRef;

  private displayDlg = false;
  private displayHelp = false;

  title = 'ui';

  items: MenuItem[];

  radius: number;
  radiusStream: Observable<number>;
  radiusSubscription: Subscription;

  scanPiecesStream: Observable<ScanPiecesBean>;
  scanPieces: ScanPiecesBean;
  scanPiecesSubscription: Subscription;

  brims: BrimBean[] = [];
  brimStream: Observable<BrimBean[]>;
  brimSubscription: Subscription;

  parameters: ParametersBean;
  parametersStream: Observable<ParametersBean>;
  parametersSubscription: Subscription;

  private svg = '';
  private parameterTable = [
  ];

  private activated: CanDisplaySideBar;
  private dialogSubscription: Subscription;

  public layerIndex = 0;
  public layerMin = 0;
  public layerMax = 0;
  public layerArray = [];

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private parametersService: ParametersService,
    private millingService: MillingService,
    private workbenchService: WorkbenchService,
    private storageService: StorageService) {
    this.radiusStream = this.parametersService.radius();
    this.brimStream = this.parametersService.brims();
    this.scanPiecesStream = this.parametersService.scanPieces();
    this.scanPiecesSubscription = this.scanPiecesStream.subscribe(
      (scanPieces: ScanPiecesBean) => {
        this.scanPieces = scanPieces;
      },
      (err) => console.error(err),
      () => {
      }
    );
    this.parametersStream = this.parametersService.parameters();
    this.parametersSubscription = this.parametersStream.subscribe(
      (parameters: ParametersBean) => {
        this.parameterTable = [];
        _.each(parameters, (v, k) => {
          this.parameterTable.push({
            name: k,
            value: v
          });
        });
      },
      (err) => console.error(err),
      () => {
      }
    );
  }

  ngOnInit() {
    this.items = [
      {
        icon: 'pi pi-fw pi-align-justify',
        command: (event) => {
          this.activated.showSideBar();
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
          },
          {
            label: 'View', icon: 'pi pi-fw pi-view', command: (event) => {
              window.open('http://nraynaud.github.io/webgcode/', '_blank');
              window.focus();
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
    this.brimSubscription = this.brimStream.subscribe(
      (brims: BrimBean[]) => {
        this.brims = brims;
      },
      (err) => console.error(err),
      () => {
      }
    );

    const data: BrimBean[] = this.storageService.loadAsObject('lastBrimConfig');
    this.parametersService.dispatch({
      type: SET_BRIM,
      payload: {
        brim: data
      }
    });

    this._load();
  }

  onActivate(component: CanDisplaySideBar) {
    this.activated = component;
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
    let gcode = slicer.header(this.scanPieces.maxz, this.brims, 4);
    let gcodeContour = '';
    let gcodeFill = '';

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
      gcodeContour += slicer.gcode(currentLayer.top, this.scanPieces.maxz, JourneyClass.contour, shapes.journeys);
      gcodeFill += slicer.gcode(currentLayer.top, this.scanPieces.maxz, JourneyClass.fill, shapes.journeys);
    });

    // Build global GCODE
    gcode += gcodeContour;
    gcode += gcodeFill;

    // Header
    gcode += slicer.footer(this.scanPieces.maxz, this.brims, 4);

    // Download
    this.download(gcode);

    // Restore old layer position
    this.parametersService.dispatch({
      type: CHANGE_LAYER,
      payload: {
        visible: saveLayer.visible,
        top: saveLayer.top
      }
    });
  }

  /**
   * download
   * @param myOutputData download
   */
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

  validate(): void {
    this.displayDlg = false;
  }

  public refresh(event, key: string) {
    this.http.get('https://raw.githubusercontent.com/yroffin/jarcam/master/ui/helps/' + key + '.svg',
      { responseType: 'text' }).subscribe((res) => {
        this.svg = res;
        this.displayHelp = true;
      });
  }
}
