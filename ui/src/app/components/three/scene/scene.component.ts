import { Component, OnInit } from '@angular/core';
import { Directive, ElementRef, Input, ContentChild, ContentChildren } from '@angular/core';

import * as THREE from 'three';

import { CamerasComponent } from '../cameras/cameras.component';
import { LightsComponent } from '../lights/lights.component';

@Directive({
  selector: 'three-scene'
})
export class SceneComponent implements OnInit {

  public scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
  }

  @ContentChild(CamerasComponent) cameraComp: CamerasComponent;
  @ContentChildren(LightsComponent) lightComps: LightsComponent;

  ngOnInit() {
  }

  get camera() {
    return this.cameraComp.camera;
  }

  ngAfterContentInit() {
    this.camera.lookAt(this.scene.position);
    this.scene.add(this.camera);

    const meshes = [
    ];

    for(let mesh of meshes) {
      if(mesh.object) {
        this.scene.add(mesh.object);
      } else if(mesh.attachScene) {
        mesh.attachScene(this.scene);
      }
    }
  }

}
