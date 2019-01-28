import { Injectable } from '@angular/core';

import * as THREE from 'three';
import * as _ from 'lodash';
import { PlanarUtils } from 'src/app/services/three/planar-utils';
import { Area } from 'src/app/services/three/area.class';
import { MillPosition } from 'src/app/services/paperjs/paperjs-model';


@Injectable({
  providedIn: 'root'
})
export class MillingService {

  private _areas: Area[];
  private _mill: THREE.Mesh;
  private _layer: THREE.Plane;
  private _radius = 4;
  private _tolerance = 0.01;

  constructor() {
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

  public moveToZ(scene: THREE.Scene, from: THREE.Group, value: number): Area[] {
    // Fix plane level
    this._layer.constant = value;
    this._mill.translateZ(this._layer.constant - this._mill.position.z);

    this._areas = PlanarUtils.intersect(this._radius, this._layer, from);

    return this._areas;
  }

  public getAreas(): Area[] {
    return this._areas;
  }

  public getStart(): MillPosition {
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
