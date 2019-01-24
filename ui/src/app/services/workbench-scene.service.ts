import { Injectable } from '@angular/core';
import { Axis } from 'src/app/services/three/axis.class';
import { LayerBean, DebugBean, ParametersService } from 'src/app/stores/parameters.service';
import { Observable } from 'rxjs';
import { MillingService } from 'src/app/services/three/milling.service';
import { Grid } from 'src/app/services/three/grid.class';

import * as THREE from 'three';
import * as _ from 'lodash';
import { StlLoaderService } from 'src/app/services/three/stl-loader.service';

@Injectable({
  providedIn: 'root'
})
export class WorkbenchSceneService {

  public scene: THREE.Scene;

  private mesh: THREE.Mesh;
  private slice: THREE.Object3D[];
  private layerHelper: THREE.PlaneHelper;

  private normal: THREE.Mesh;
  private helper: THREE.FaceNormalsHelper;
  private _axis: Axis;

  private ground: THREE.Mesh;

  private layer: LayerBean;
  private debug: DebugBean;

  layers: Observable<LayerBean>;
  debugs: Observable<DebugBean>;

  constructor(
    private parametersService: ParametersService,
    private millingService: MillingService,
    private stlLoaderService: StlLoaderService
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

    // Subscribe
    this.layers.subscribe(
      (layer: LayerBean) => {
        this.layer = layer;
        if (this.mesh) {
          this.onLayerChange(this.layer);
          this.showLayer(this.layer.visible);
        }
      },
      (err) => console.error(err),
      () => {
      }
    );

    // Subscribe
    this.debugs.subscribe(
      (debug: DebugBean) => {
        this.debug = debug;
        if (this.mesh) {
          this.normals(this.debug.normals);
          this.wireframe(this.debug.wireframe);
        }
        this.showGround(this.debug.ground);
        this.axis(this.debug.axesHelper);
      },
      (err) => console.error(err),
      () => {
      }
    );
  }

  load(url: string, done: any) {
    this.stlLoaderService.loadStl(
      url,
      (geometry: THREE.BufferGeometry) => {
        this.setGeometryPiece(geometry);
        done();
      },
      () => {
      },
      () => {
      });
  }

  loadBinary(bin: any, done: any) {
    this.stlLoaderService.loadStlFromBinary(
      bin,
      (geometry: THREE.BufferGeometry) => {
        this.setGeometryPiece(geometry);
        done();
      },
      () => {
      },
      () => {
      });
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
    this.onLayerChange(this.layer);
    this.showLayer(this.layer.visible);
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
