import { Component, OnInit } from '@angular/core';
import { Directive, ElementRef, Input, ContentChild, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { SceneComponent } from '../scene/scene.component';
import { ControlsComponent } from '../controls/controls.component';
import { StlLoaderService } from 'src/app/services/three/stl-loader.service';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Directive({
  selector: 'three-renderer'
})
export class RendererComponent {

  @Input() height: number;
  @Input() width: number;
  @Input() options: any;

  @ContentChild(SceneComponent) sceneComp: SceneComponent;
  @ContentChild(ControlsComponent) orbitComponent: ControlsComponent;

  private renderer: THREE.WebGLRenderer;

  constructor(
    private elementRef: ElementRef,
    private stlLoaderService: StlLoaderService) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.shadowMap.enabled = true;
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

  public onKeydown(event) {
    this.scene.onKeydown(event);
  }
  
  public onLayerChange() {
    this.scene.onLayerChange(this.options.layer);
    this.scene.showLayer(this.options.layer.visible);
  }

  public onCameraChange() {
    this.scene.camera.position.set(
      this.options.camera.position.x,
      this.options.camera.position.y,
      this.options.camera.position.z);
  }

  public onDebugChange() {
    // activate normals
    this.scene.normals(this.options.normals);
    // activate wireframe
    this.scene.wireframe(this.options.wireframe);
    // activate axis
    this.scene.axis(this.options.axesHelper);
    // activate ground
    this.scene.showGround(this.options.ground);
  }

  get scene() {
    return this.sceneComp;
  }

  get camera() {
    return this.sceneComp.camera;
  }

  ngOnChanges(changes) {
    const widthChng = changes.width && changes.width.currentValue;
    const heightChng = changes.height && changes.height.currentValue;
    if (widthChng || heightChng) {
      this.renderer.setSize(this.width, this.height);
    }
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.setPixelRatio(Math.floor(window.devicePixelRatio));
    this.renderer.setSize(this.width, this.height);

    if (this.orbitComponent) {
      this.orbitComponent.setupControls(this.camera, this.renderer);
    }

    this.render(false);
  }

  render(checked: boolean) {
    if (this.orbitComponent) {
      this.orbitComponent.updateControls(this.scene.scene, this.camera);
    }

    if (checked) {
      this.options.camera.position.x = this.camera.position.x;
      this.options.camera.position.y = this.camera.position.y;
      this.options.camera.position.z = this.camera.position.z;
    }

    this.renderer.render(this.scene.scene, this.camera);

    requestAnimationFrame(() => this.render(true));
  }

}
