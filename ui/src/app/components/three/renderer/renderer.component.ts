import { Component, OnInit } from '@angular/core';
import { Directive, ElementRef, Input, ContentChild, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { SceneComponent } from '../scene/scene.component';
import { ControlsComponent } from '../controls/controls.component';
import { StlLoaderService } from 'src/app/services/three/stl-loader.service';
import * as dat from 'dat.gui';

@Directive({
  selector: 'three-renderer'
})
export class RendererComponent {

  @Input() height: number;
  @Input() width: number;

  @ContentChild(SceneComponent) sceneComp: SceneComponent;
  @ContentChild(ControlsComponent) orbitComponent: ControlsComponent;

  private renderer: THREE.WebGLRenderer;
  private gui: any;

  private options = {
    // layers
    layer: {
      visible: false,
      top: 4000,
    },

    // debug
    axesHelper: false,
    wireframe: false,
    normals: false,
    ground: false,

    camera: {
      position: { x: 0, y: 0, z: 0 },
    },
  }

  constructor(private element: ElementRef, private stlLoaderService: StlLoaderService) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.shadowMap.enabled = true;

    this.gui = new dat.GUI({
      width: 400,
      autoPlace: true
    })

    element.nativeElement.appendChild(this.gui.domElement);


    let target = this;

    let onLayerChange = function () {
      target.onLayerChange(this.object);
      // activate layer
      target.scene.showLayer(this.object.visible);
    }

    let onCameraChange = function () {
      target.camera.position.x = this.object.x;
      target.camera.position.y = this.object.y;
      target.camera.position.z = this.object.z;
    }

    let updateDebugVisibility = function () {
      // activate normals
      target.scene.normals(this.object.normals);
      // activate wireframe
      target.scene.wireframe(this.object.wireframe);
      // activate axis
      target.scene.axis(this.object.axesHelper);
      // activate ground
      target.scene.showGround(this.object.ground);
    }

    let layers = this.gui.addFolder('Layer')
    let layer = layers.addFolder('Control')
    layer.add(this.options.layer, 'top', 0, 10000).onChange(onLayerChange);
    layer.add(this.options.layer, 'visible').onChange(onLayerChange)

    let cameras = this.gui.addFolder('Camera')
    let camera = cameras.addFolder('Position')
    camera.add(this.options.camera.position, 'x', -500, 500).onChange(onCameraChange);
    camera.add(this.options.camera.position, 'y', -500, 500).onChange(onCameraChange);
    camera.add(this.options.camera.position, 'z', -500, 500).onChange(onCameraChange);

    let debug = this.gui.addFolder('Debugging Options')
    debug.add(this.options, 'axesHelper').onChange(updateDebugVisibility)
    debug.add(this.options, 'wireframe').onChange(updateDebugVisibility)
    debug.add(this.options, 'normals').onChange(updateDebugVisibility)
    debug.add(this.options, 'ground').onChange(updateDebugVisibility)
  }

  load(url: string) {
    this.stlLoaderService.loadStl(
      this.sceneComp.scene,
      url,
      (geometry: THREE.BufferGeometry) => {
        this.scene.setGeometryPiece(geometry)
      },
      () => {
      },
      () => {
      });
  }

  private onLayerChange(layer: any) {
    this.scene.onLayerChange(layer);
  }

  get scene() {
    return this.sceneComp;
  }

  get camera() {
    return this.sceneComp.camera;
  }

  private onObjectLoaded() {
  }

  ngOnChanges(changes) {
    const widthChng = changes.width && changes.width.currentValue;
    const heightChng = changes.height && changes.height.currentValue;
    if (widthChng || heightChng) {
      console.log('resize', this.width, this.height)
      this.renderer.setSize(this.width, this.height);
    }
  }

  ngAfterContentInit() {
    this.element.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.setPixelRatio(Math.floor(window.devicePixelRatio));
    this.renderer.setSize(this.width, this.height);

    if (this.orbitComponent) {
      this.orbitComponent.setupControls(this.camera, this.renderer);
    }

    this.render();
  }

  render() {
    if (this.orbitComponent) {
      this.orbitComponent.updateControls(this.scene.scene, this.camera);
    }

    this.camera.lookAt(this.scene.scene.position);
    this.renderer.render(this.scene.scene, this.camera);

    this.options.camera.position.x = this.camera.position.x;
    this.options.camera.position.y = this.camera.position.y;
    this.options.camera.position.z = this.camera.position.z;
    this.gui.updateDisplay();

    requestAnimationFrame(() => this.render());
  }

}
