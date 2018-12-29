import { Directive, OnInit, AfterContentInit } from '@angular/core';
import { Input } from '@angular/core';

import * as THREE from 'three';

@Directive({
  selector: 'three-perspective-camera'
})
export class CamerasComponent implements OnInit, AfterContentInit {

  @Input() height: number;
  @Input() width: number;
  @Input() positions;

  viewAngle: number = 45;
  near: number = 1;
  far: number = 1000;
  camera: THREE.PerspectiveCamera;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      this.viewAngle,
      this.aspect,
      this.near,
      this.far);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  get aspect(): number {
    return this.width / this.height;
  }

  ngOnInit() {
  }

  ngAfterContentInit() {
    this.camera.position.set(
      this.positions[0],
      this.positions[1],
      this.positions[2]);
    this.updateAspect(this.width / this.height);
  }

  ngOnChanges(changes) {
    const widthChng = changes.width && changes.width.currentValue;
    const heightChng = changes.height && changes.height.currentValue;

    if (widthChng || heightChng) {
      this.updateAspect(this.width / this.height);
    }
  }

  updateAspect(ratio) {
    if (this.camera) {
      this.camera.aspect = ratio;
      this.camera.updateProjectionMatrix();
    }
  }

}
