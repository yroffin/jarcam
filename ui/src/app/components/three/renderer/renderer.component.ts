import { Component, OnChanges, AfterViewInit } from '@angular/core';
import { Directive, ElementRef, Input, ContentChild, ViewChild } from '@angular/core';

import * as THREE from 'three';
import * as OrbitControls from 'three-orbitcontrols';

import { SceneDirective } from '../scene/scene.component';
import { StlLoaderService } from 'src/app/services/three/stl-loader.service';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-renderer',
  templateUrl: './renderer.component.html',
  styleUrls: ['./renderer.component.css']
})
export class RendererComponent implements AfterViewInit {

  @Input() options: any;

  @Input() orbit = true;
  @Input() cameraPosition;
  @Input() lightColor = 0xffffff;
  @Input() lightPosition;

  @ViewChild('threeView') threeCanvas: ElementRef;
  @ViewChild(SceneDirective) sceneComp: SceneDirective;

  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;

  // Camera
  viewAngle = 45;
  near = 1;
  far = 1000;
  private camera: THREE.PerspectiveCamera;

  // Lights
  private light: THREE.PointLight;
  private helper: THREE.PointLightHelper;

  constructor(
    private stlLoaderService: StlLoaderService) {
  }

  public onKeydown(event) {
    this.sceneComp.onKeydown(event);
  }

  public onLayerChange() {
    this.sceneComp.onLayerChange(this.options.layer);
    this.sceneComp.showLayer(this.options.layer.visible);
  }

  public onCameraChange() {
    this.camera.position.set(
      this.options.camera.position.x,
      this.options.camera.position.y,
      this.options.camera.position.z);
  }

  public onDebugChange() {
    // activate normals
    this.sceneComp.normals(this.options.normals);
    // activate wireframe
    this.sceneComp.wireframe(this.options.wireframe);
    // activate axis
    this.sceneComp.axis(this.options.axesHelper);
    // activate ground
    this.sceneComp.showGround(this.options.ground);
  }

  get scene() {
    return this.sceneComp.scene;
  }

  ngAfterViewInit() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.threeCanvas.nativeElement
    });

    this.renderer.setPixelRatio(Math.floor(window.devicePixelRatio));

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      this.viewAngle,
      800 / 600,
      this.near,
      this.far);
    this.setPosition(this.camera, this.cameraPosition);
    this.camera.up.set(0, 0, 1);
    this.camera.lookAt(this.scene.position);

    // Orbit control
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = this.orbit;

    // Lights
    this.light = new THREE.PointLight(this.lightColor, 1, 1000);
    this.setPosition(this.light, this.lightPosition);
    this.helper = new THREE.PointLightHelper(this.light, 10, 0xff0000);

    // Scene
    this.camera.lookAt(this.scene.position);
    this.scene.add(this.camera);
    this.scene.add(this.light);
    this.scene.add(this.helper);

    this.updateControls(this.scene, this.camera);

    const callback = (args) => {
      requestAnimationFrame(callback);
      this.render();
    };

    requestAnimationFrame(callback);
  }

  public setSize(width: number, height: number) {
    this.renderer.setSize(width, height);
    this.updateAspect(width / height);
  }

  render() {
    this.updateControls(this.scene, this.camera);

    this.options.camera.position.x = this.camera.position.x;
    this.options.camera.position.y = this.camera.position.y;
    this.options.camera.position.z = this.camera.position.z;

    this.renderer.render(this.scene, this.camera);
  }

  updateAspect(ratio) {
    if (this.camera) {
      this.camera.aspect = ratio;
      this.camera.updateProjectionMatrix();
    }
  }

  load(url: string, done: any) {
    this.stlLoaderService.loadStl(
      this.sceneComp.scene,
      url,
      (geometry: THREE.BufferGeometry) => {
        this.sceneComp.setGeometryPiece(geometry);
        done();
      },
      () => {
      },
      () => {
      });
  }

  setPosition(target: THREE.Object3D, position: Array<number>) {
    target.position.set(
      position[0],
      position[1],
      position[2]);
  }

  updateControls(scene, camera) {
    if (this.controls) {
      this.controls.update();
    }
  }


}
