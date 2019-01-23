import { Component, OnInit } from '@angular/core';
import { Directive, ElementRef, Input, ContentChild, ViewChild } from '@angular/core';

import * as THREE from 'three';
import * as _ from 'lodash';

import { PlanarUtils } from '../../../services/three/planar-utils';
import { MillingService } from 'src/app/services/three/milling.service';
import { Axis } from '../../../services/three/axis.class';
import { Grid } from '../../../services/three/grid.class';
import { ParametersService, ParametersState, LayerBean, DebugBean } from 'src/app/stores/parameters.service';
import { Observable } from 'rxjs';

@Directive({
  selector: 'app-scene'
})
export class SceneDirective implements OnInit {

  public scene: THREE.Scene;

  private mesh: THREE.Mesh;
  private slice: THREE.Object3D[];
  private layerHelper: THREE.PlaneHelper;

  private normal: THREE.Mesh;
  private helper: THREE.FaceNormalsHelper;
  private _axis: Axis;

  private ground: THREE.Mesh;

  layers: Observable<LayerBean>;
  debugs: Observable<DebugBean>;

  constructor(
    private parametersService: ParametersService,
    private millingService: MillingService
  ) {
    // Create scene
    this.scene = new THREE.Scene();

    // add grid helper
    const helper = Grid.GridHelper(200, 200);
    this.scene.add(helper);

    // Add layer helper
    this.layerHelper = new THREE.PlaneHelper(this.millingService.layer, 5, 0xffffff);
    this.scene.add(this.layerHelper);

    // Add mill to scene
    this.scene.add(this.millingService.mill);

    // slice group
    this.slice = [];

    // Axis
    this._axis = new Axis(this.scene, false);

    // Observable
    this.layers = this.parametersService.layers();
    this.debugs = this.parametersService.debugs();
  }

  ngOnInit() {
    this.layers.subscribe(
      (layer: LayerBean) => {
        if (this.mesh) {
          this.onLayerChange(layer);
          this.showLayer(layer.visible);
        }
      },
      (err) => console.error(err),
      () => {
      }
    );
    this.debugs.subscribe(
      (debug: DebugBean) => {
        console.log(debug);
        this.normals(debug.normals);
        this.axis(debug.axesHelper);
        this.wireframe(debug.wireframe);
        this.showGround(debug.ground);
      },
      (err) => console.error(err),
      () => {
      }
    );
  }

  private factoryPiece(originalGeometry: THREE.BufferGeometry): THREE.Mesh {
    // Cf. https://threejs.org/docs/#api/en/materials/MeshToonMaterial
    class MeshToonMaterial extends THREE.MeshPhongMaterial {
      public isMeshToonMaterial(): boolean {
        return true;
      }
    }

    const geometry = new THREE.Geometry().fromBufferGeometry(originalGeometry);
    geometry.computeVertexNormals();

    const material = new MeshToonMaterial({
      lights: true,
      transparent: true,
      opacity: 0.5,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'piece';
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    return mesh;
  }


  public setGeometryPiece(originalGeometry: THREE.BufferGeometry) {
    this.mesh = this.factoryPiece(originalGeometry);
    this.scene.add(this.mesh);
  }

  public onLayerChange(layer: any) {
    const planar = this.millingService.moveToZ(this.scene, this.mesh, layer.top / 1000);

    // remove previous slicing object
    _.each(this.slice, (child) => {
      this.scene.remove(child);
    });

    // compute new slice
    this.slice = [];

    // add new slicing object and infos
    _.each(planar.areas, (area) => {
      _.each(area.meshes, (child) => {
        this.slice.push(child);
        this.scene.add(child);
      });
      this.slice.push(area.normals);
      this.scene.add(area.normals);
    });
  }

  wireframe(enable: boolean) {
    if (this.mesh) {
      (<THREE.MeshNormalMaterial>this.mesh.material).wireframe = enable;
    }
  }

  normals(enable: boolean) {
    if (this.mesh) {
      if (!this.helper) {
        const material = new THREE.MeshNormalMaterial();
        this.normal = new THREE.Mesh(this.mesh.geometry, material);
        this.helper = new THREE.FaceNormalsHelper(this.normal, 2, 0x00ff00, 1);
        this.scene.add(this.helper);
      }
      this.helper.visible = enable;
      this.normal.visible = enable;
    }
  }

  public showGround(enable: boolean) {
    if (!this.ground) {
      this.ground = new THREE.Mesh(
        new THREE.PlaneGeometry(500, 500),
        new THREE.MeshBasicMaterial({
          color: 0xFF0000,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
        }));
      this.ground.rotateX(Math.PI / 2);
      this.scene.add(this.ground);
    }
    this.ground.visible = enable;
  }

  public showLayer(enable: boolean) {
    this.layerHelper.visible = enable;
    _.each(this.slice, (slice: THREE.Object3D) => {
      slice.visible = enable;
    });
  }

  public axis(enable: boolean) {
    this._axis.enable(enable);
  }
}
