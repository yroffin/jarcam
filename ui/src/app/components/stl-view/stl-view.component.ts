import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { RendererComponent } from '../three/renderer/renderer.component';
import { HostListener, Input } from '@angular/core';
import { ElementRef } from '@angular/core';

import * as _ from 'lodash';
import { ToolpathViewComponent } from 'src/app/components/toolpath-view/toolpath-view.component';
import { MatTabGroup, getMatInputUnsupportedTypeError } from '@angular/material';
import { AppComponent } from 'src/app/app.component';
import { Store } from '@ngrx/store';
import { SET_BRIM, CHANGE_SLICE, CHANGE_RADIUS, CHANGE_LAYER, LayerBean, CHANGE_DEBUG } from 'src/app/stores/parameters.service';
import { ParametersState, ParametersService, ScanPiecesBean } from 'src/app/stores/parameters.service';
import { Observable } from 'rxjs';
import { AutoUnsubscribe } from 'src/app/services/utility/decorators';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from 'src/app/services/utility/storage.service';
import { WorkbenchService } from 'src/app/services/workbench.service';
import { Subscription } from 'rxjs';
import { BrimBean } from 'src/app/services/paperjs/paperjs-model';
import { CanDisplaySideBar } from 'src/app/interfaces/types';

@AutoUnsubscribe()
@Component({
  selector: 'app-stl-view',
  templateUrl: './stl-view.component.html',
  styleUrls: ['./stl-view.component.css']
})
export class StlViewComponent implements AfterViewInit, OnInit, CanDisplaySideBar {

  @ViewChild(RendererComponent) rendererComponent: RendererComponent;

  public display = false;
  public selected = 0;

  private progress = 0;
  private progressObserver;

  axesHelper: boolean;
  wireframe: boolean;
  normals: boolean;
  ground: boolean;

  slice: number;
  sliceStream: Observable<number>;
  sliceSubscription: Subscription;

  radius: number;
  radiusStream: Observable<number>;
  radiusSubscription: Subscription;

  layer: LayerBean;
  layerStream: Observable<LayerBean>;
  layerSubscription: Subscription;

  scanPiecesStream: Observable<ScanPiecesBean>;
  scanPieces: ScanPiecesBean;
  scanPiecesSubscription: Subscription;

  public layerIndex = 0;
  public layerMin = 0;
  public layerMax = 0;
  public layerArray = [];

  constructor(
    private elementRef: ElementRef,
    private route: ActivatedRoute,
    private workbenchService: WorkbenchService,
    private parametersService: ParametersService,
    private storageService: StorageService
  ) {
    this.axesHelper = true;
    this.wireframe = false;
    this.normals = false;
    this.ground = false;

    this.sliceStream = this.parametersService.slice();
    this.sliceSubscription = this.sliceStream.subscribe(
      (slice: number) => {
        this.slice = slice;
      },
      (err) => console.error(err),
      () => {
      }
    );
    this.radiusStream = this.parametersService.radius();
    this.radiusSubscription = this.radiusStream.subscribe(
      (radius: number) => {
        this.radius = radius;
      },
      (err) => console.error(err),
      () => {
      }
    );
    this.layerStream = this.parametersService.layers();
    this.layerSubscription = this.layerStream.subscribe(
      (layer: LayerBean) => {
        this.layer = layer;
      },
      (err) => console.error(err),
      () => {
      }
    );
    this.scanPiecesStream = this.parametersService.scanPieces();
    this.scanPiecesSubscription = this.scanPiecesStream.subscribe(
      (scanPieces: ScanPiecesBean) => {
        this.scanPieces = scanPieces;
        this.layerIndex = 0;
        this.layerMin = 0;
        this.layerMax = scanPieces.allZ.length - 1;
        this.layerArray = scanPieces.allZ;
        this.onLayerChange();
      },
      (err) => console.error(err),
      () => {
      }
    );
  }

  ngOnInit() {
    // get param
    const lastLoaded = this.route.snapshot.queryParams['lastLoaded'];
    if (lastLoaded) {
      const data = this.storageService.load('lastLoaded');
      this.workbenchService.loadBinary(data, () => {
      });
    }
  }

  showSideBar() {
    this.display = true;
  }

  ngAfterViewInit() {
    this.resetWidthHeight();
  }

  public onSliceChange() {
    this.parametersService.dispatch({
      type: CHANGE_SLICE,
      payload: {
        slice: this.slice
      }
    });
  }

  public onRadiusChange() {
    this.parametersService.dispatch({
      type: CHANGE_RADIUS,
      payload: {
        radius: this.radius
      }
    });
  }

  public onLayerChange() {
    this.layer.top = this.layerArray.length === 0 ? 0 : this.layerArray[this.layerIndex];
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

  @HostListener('window:resize')
  @HostListener('window:vrdisplaypresentchange')
  resetWidthHeight() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.rendererComponent.setSize(width, height);
  }
}
