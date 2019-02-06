import { Component, OnChanges, OnInit, AfterViewInit } from '@angular/core';
import { Directive, ElementRef, Input, ContentChild, ViewChild } from '@angular/core';

import * as THREE from 'three';
import * as OrbitControls from 'three-orbitcontrols';

import { StlLoaderService } from 'src/app/services/three/stl-loader.service';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { WorkbenchService } from 'src/app/services/workbench.service';
import { AutoUnsubscribe } from 'src/app/services/utility/decorators';
import { ScanPiecesBean, ParametersService, CHANGE_LAYER, LayerBean } from 'src/app/stores/parameters.service';
import { Observable } from 'rxjs';

@AutoUnsubscribe()
@Component({
  selector: 'app-renderer',
  templateUrl: './renderer.component.html',
  styleUrls: ['./renderer.component.css']
})
export class RendererComponent implements OnInit, AfterViewInit {

  public width = window.innerWidth;
  public height = window.innerHeight;

  @Input() orbit = true;

  @ViewChild('cubeView') cubeCanvas: ElementRef;
  @ViewChild('threeView') threeCanvas: ElementRef;

  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private renderCube: THREE.WebGLRenderer;

  public layerIndex = 0;
  public layerMin = 0;
  public layerMax = 0;
  public layerArray = [];
  public layer: LayerBean = {
    top: 0,
    visible: true
  };

  scanPiecesStream: Observable<ScanPiecesBean>;
  scanPieces: ScanPiecesBean;

  public infos = [];

  constructor(
    private workbenchService: WorkbenchService,
    private parametersService: ParametersService) {
    this.scanPiecesStream = this.parametersService.scanPieces();
  }

  ngOnInit() {
    this.scanPiecesStream.subscribe(
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

  ngAfterViewInit() {
    // Cube
    this.renderCube = new THREE.WebGLRenderer({
      canvas: this.cubeCanvas.nativeElement,
      antialias: true
    });
    this.renderCube.setClearColor(0x000000, 1);
    this.renderCube.setPixelRatio(Math.floor(window.devicePixelRatio));

    // World
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.threeCanvas.nativeElement
    });
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setPixelRatio(Math.floor(window.devicePixelRatio));

    // Orbit control
    this.controls = new OrbitControls(this.workbenchService.getWorldCamera(), this.renderCube.domElement);
    this.controls.enabled = this.orbit;

    this.updateControls();

    const callback = (args) => {
      requestAnimationFrame(callback);
      this.render();
    };

    requestAnimationFrame(callback);
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

  public setSize(width: number, height: number) {
    this.renderer.setSize(width, height);
    this.workbenchService.updateAspect(width / height);
  }

  render() {
    this.updateControls();

    this.renderer.render(this.workbenchService.getWorldScene(), this.workbenchService.getWorldCamera());
    this.renderCube.render(this.workbenchService.getCubeScene(), this.workbenchService.getCubeCamera());

    this.infos = this.workbenchService.infos();
  }

  load(url: string, done: any) {
    this.workbenchService.load(url, done);
  }

  loadFromBinary(bin: any, done: any) {
    this.workbenchService.loadBinary(bin, done);
  }

  updateControls() {
    if (this.controls) {
      this.workbenchService.updateCube();
      this.controls.update();
    }
  }


}
