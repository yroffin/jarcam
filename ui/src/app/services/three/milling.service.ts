import { Injectable } from '@angular/core';

import * as THREE from 'three';
import * as _ from 'lodash';
import { PlanarUtils } from 'src/app/services/three/planar-utils';
import { Area } from 'src/app/services/three/area.class';
import { MillPosition } from 'src/app/services/paperjs/paperjs-model';
import { ParametersService } from 'src/app/stores/parameters.service';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MillingService {

  private _areas: Area[];
  private _layer: THREE.Plane;
  private _radius = 1;
  private _tolerance = 0.01;

  radiusStream: Observable<number>;
  radiusSubscription: Subscription;


  constructor(
    private parametersService: ParametersService
  ) {
    this.radiusStream = this.parametersService.radius();
    this.radiusSubscription = this.radiusStream.subscribe(
      (radius: number) => {
        this.setRadius(radius);
      },
      (err) => console.error(err),
      () => {
      }
    );
  }

  public get layer() {
    if (!this._layer) {
      // Add layer
      this._layer = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
    }
    return this._layer;
  }

  private setRadius(radius: number) {
    console.log('Set radius', radius);
    this._radius = radius;
  }

  public moveToZ(scene: THREE.Scene, from: THREE.Group, value: number): Area[] {
    // Fix plane level
    this._layer.constant = value;

    this._areas = PlanarUtils.intersect(this._radius, this._layer, from);

    return this._areas;
  }

  public getAreas(): Area[] {
    return this._areas;
  }

  public getStart(): MillPosition {
    return {
      x: 0,
      y: 0,
      radius: this._radius
    };
  }

}
