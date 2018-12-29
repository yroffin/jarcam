import { Injectable } from '@angular/core';

import * as THREE from 'three';
import * as _ from 'lodash';
import { PlanarUtils } from 'src/app/services/three/planar-utils';

@Injectable({
  providedIn: 'root'
})
export class MillingService {

  private _mill: THREE.Mesh;
  private _detection: PlanarUtils;
  private _layer: THREE.Plane;

  constructor() {
    // Detection
    this._detection = new PlanarUtils();
  }

  public get layer() {
    if (!this._layer) {
      // Add layer
      this._layer = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
    }
    return this._layer;
  }

  public get mill() {
    if (!this._mill) {
      // Add mill
      let geometry = new THREE.CylinderGeometry(4, 4, 4, 32);
      let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      this._mill = new THREE.Mesh(geometry, material);
      this._mill.geometry.rotateX(Math.PI / 2);
      this._mill.position.x = 14;
      this._mill.position.y = -10;
    }
    return this._mill;
  }

  public translateX(scene: THREE.Scene, sens: number, value: number) {
    let iteration = value / 0.01;
    for (; iteration > 0 && this._detection.collisisionDetection(scene, this.mill, 0.01) == false; iteration--) {
      this.mill.translateX(0.01 * sens)
    }
    this.mill.translateX(0.01 * -sens)
  }

  public translateY(scene: THREE.Scene, sens: number, value: number) {
    let iteration = value / 0.01;
    for (; iteration > 0 && this._detection.collisisionDetection(scene, this.mill, 0.01) == false; iteration--) {
      this.mill.translateY(0.01 * sens)
    }
    this.mill.translateY(0.01 * -sens)
  }

  public moveToZ(scene: THREE.Scene, from: THREE.Mesh, value: number): THREE.Object3D[] {
    // Fix plane level
    this._layer.constant = value;
    this._mill.translateZ(this._layer.constant - this._mill.position.z);

    this._detection.intersect(this._layer, from);
    this._detection.collisisionDetection(scene, this._mill, 0.01);

    return this._detection.meshes;
  }

}
