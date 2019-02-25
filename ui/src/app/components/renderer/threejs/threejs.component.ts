import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ElementRef, Input, ViewChild } from '@angular/core';
import * as _ from 'lodash';

import * as THREE from 'three';
import * as OrbitControls from 'three-orbitcontrols';
import { WorkbenchService } from 'src/app/services/workbench.service';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { ParametersService, LayerBean } from 'src/app/stores/parameters.service';
import { AutoUnsubscribe } from 'src/app/services/utility/decorators';
import { TreeNode } from 'primeng/api';
import { StringUtils } from 'src/app/services/string-utils';

@AutoUnsubscribe()
@Component({
  selector: 'app-threejs',
  templateUrl: './threejs.component.html',
  styleUrls: ['./threejs.component.css']
})
export class ThreejsComponent implements OnInit, AfterViewInit, OnDestroy {

  public width = window.innerWidth;
  public height = window.innerHeight;

  @Input() orbit = true;
  @Input() infos: TreeNode[];

  @ViewChild('cubeView') cubeCanvas: ElementRef;
  @ViewChild('threeView') threeCanvas: ElementRef;

  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private renderCube: THREE.WebGLRenderer;
  private callback: any;

  layer: LayerBean;
  layerStream: Observable<LayerBean>;
  layerSubscription: Subscription;

  constructor(
    private workbenchService: WorkbenchService,
    private parametersService: ParametersService) {
  }

  ngOnInit() {
    this.layerStream = this.parametersService.layers();
    this.layerSubscription = this.layerStream.subscribe(
      (layer: LayerBean) => {
        this.layer = layer;
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

    this.callback = (args) => {
      if (this.renderer) {
        requestAnimationFrame(this.callback);
        this.render();
      }
    };

    requestAnimationFrame(this.callback);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.callback);
    this.renderCube.forceContextLoss();
    this.renderer.forceContextLoss();
    this.renderCube.dispose();
    this.renderer.dispose();
    this.renderer = null;
  }

  public setSize(width: number, height: number) {
    this.renderer.setSize(width, height);
    this.workbenchService.updateAspect(width / height);
  }

  render() {
    this.updateControls();

    this.renderer.render(this.workbenchService.getWorldScene(), this.workbenchService.getWorldCamera());
    this.renderCube.render(this.workbenchService.getCubeScene(), this.workbenchService.getCubeCamera());

    this.infos = this.buildInfo();
  }

  public buildInfo() {
    // Build info
    const infos = [
      {
        data: {
          name: 'Info',
          type: 'Folder',
          description: ''
        },
        expanded: true,
        children: []
      }
    ];
    // Opened
    _.each(this.workbenchService.infos(), (info: any) => {
      infos[0].children.push({
        data: {
          name: info.description,
          type: 'Information',
          description: StringUtils.format('%5.3f', [info.value])
        },
        children: []
      });
    });
    infos[0].data.description = infos[0].children.length + ' info(s)';
    return infos;
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
