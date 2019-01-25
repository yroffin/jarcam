import { Injectable } from '@angular/core';

import * as THREE from 'three';
import * as _ from 'lodash';
import { PlanarUtils } from 'src/app/services/three/planar-utils';
import { Area } from 'src/app/services/three/area.class';


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
      this._mill.position.x = 0;
      this._mill.position.y = 0;
    }
    return this._mill;
  }

  public radius(): number {
    return this._radius;
  }

  public setRadius(radius: number) {
    this._radius = radius;
    const geometry = new THREE.CylinderGeometry(this._radius, this._radius, 4, 32);
    this._mill.geometry = geometry;
  }

  public moveToZ(scene: THREE.Scene, from: THREE.Mesh, value: number): PlanarUtils {
    // Fix plane level
    this._layer.constant = value;
    this._mill.translateZ(this._layer.constant - this._mill.position.z);

    this._detection.intersect(this._radius, this._layer, from);

    return this._detection;
  }

  public getAreas(): Array<Area> {
    return this._detection.areas;
  }

  public getStart(): any {
    if (this.mill) {
      return {
        x: this._mill.position.x,
        y: this._mill.position.y,
        radius: this._radius
      };
    } else {
      return {
        x: 0,
        y: 0,
        radius: 10
      };
    }
  }

}
