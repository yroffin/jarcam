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
    // controlled by menu
    //loadUrl: getQueryParam('loadUrl') || "", // to load a STL from a link
    currentLayerNumber: 0,
    layerHeight: 0.2,
    nozzleSize: 0.4,
    contours: true,
    extrusionLines: true,
    axesHelper: false,
    wireframe: false,
    normals: false,
    points: false,

    camera: {
      position: { x: 0, y: 0, z: 0 },
    },

    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },

    // internal
    epsilon: 1e-10, // in mm,
    target: undefined
  }

  constructor(private element: ElementRef, private stlLoaderService: StlLoaderService) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    this.gui = new dat.GUI({
      width: 400,
      autoPlace: true
    })

    element.nativeElement.appendChild(this.gui.domElement);


    let target = this;
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
    }

    let cameras = this.gui.addFolder('Camera')
    let camera = cameras.addFolder('Position')
    let xp = camera.add(this.options.camera.position, 'x', -500, 500).onChange(onCameraChange);
    camera.add(this.options.camera.position, 'y', -500, 500).onChange(onCameraChange);
    camera.add(this.options.camera.position, 'z', -500, 500).onChange(onCameraChange);

    let transformations = this.gui.addFolder('Transformations')
    let rotation = transformations.addFolder('Rotation')
    rotation.add(this.options.rotation, 'x', -100, 100).onChange(this.onObjectLoaded);
    rotation.add(this.options.rotation, 'y', -100, 100).onChange(this.onObjectLoaded);
    rotation.add(this.options.rotation, 'z', -100, 100).onChange(this.onObjectLoaded);

    let scale = transformations.addFolder('Scale')
    scale.add(this.options.scale, 'x').onChange(this.onObjectLoaded);
    scale.add(this.options.scale, 'y').onChange(this.onObjectLoaded);
    scale.add(this.options.scale, 'z').onChange(this.onObjectLoaded);

    let debug = this.gui.addFolder('Debugging Options')
    debug.add(this.options, 'axesHelper').onChange(updateDebugVisibility)
    debug.add(this.options, 'wireframe').onChange(updateDebugVisibility)
    debug.add(this.options, 'normals').onChange(updateDebugVisibility)
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
