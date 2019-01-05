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
  private _radius = 4;
  private _tolerance = 0.01;

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
      const geometry = new THREE.CylinderGeometry(this._radius, this._radius, 4, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      this._mill = new THREE.Mesh(geometry, material);
      this._mill.geometry.rotateX(Math.PI / 2);
      this._mill.position.x = 20;
      this._mill.position.y = -10;
    }
    return this._mill;
  }

  public translateX(scene: THREE.Scene, sens: number, value: number) {
    let iteration = value / 0.01;
    for (; iteration > 0 && this._detection.collisisionDetection(scene, this.mill, this._tolerance) === false; iteration--) {
      this.mill.translateX(this._tolerance / 2 * sens);
    }
    this.mill.translateX(this._tolerance / 2 * -sens);
  }

  public translateY(scene: THREE.Scene, sens: number, value: number) {
    let iteration = value / 0.01;
    for (; iteration > 0 && this._detection.collisisionDetection(scene, this.mill, this._tolerance) === false; iteration--) {
      this.mill.translateY(this._tolerance / 2 * sens);
    }
    this.mill.translateY(this._tolerance / 2 * -sens);
  }

  public moveToZ(scene: THREE.Scene, from: THREE.Mesh, value: number): PlanarUtils {
    // Fix plane level
    this._layer.constant = value;
    this._mill.translateZ(this._layer.constant - this._mill.position.z);

    this._detection.intersect(this._radius, this._layer, from);
    this._detection.collisisionDetection(scene, this._mill, this._tolerance);

    this.mill.translateX(this._detection.bottomLeft.x - this._mill.position.x - this._radius);
    this.mill.translateY(this._detection.bottomLeft.y - this._mill.position.y + this._radius);

    return this._detection;
  }

}
