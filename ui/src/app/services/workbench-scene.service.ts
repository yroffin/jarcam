import { Injectable } from '@angular/core';
import { Axis } from 'src/app/services/three/axis.class';
import { LayerBean, DebugBean, ParametersService, SCAN_PIECES } from 'src/app/stores/parameters.service';
import { Observable } from 'rxjs';
import { MillingService } from 'src/app/services/three/milling.service';
import { Grid } from 'src/app/services/three/grid.class';

import * as THREE from 'three';
import * as _ from 'lodash';
import { StlLoaderService } from 'src/app/services/three/stl-loader.service';
import { PlanarUtils } from 'src/app/services/three/planar-utils';
import { ScanMeshes } from 'src/app/services/three/scan-meshes';
import { MeshPhongMaterial } from 'three';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkbenchSceneService {

  public scene: THREE.Scene;

  private group: THREE.Group;
  private slices: THREE.Object3D[];
  private layerHelper: THREE.PlaneHelper;

  private normal: THREE.Mesh;
  private helpers: THREE.FaceNormalsHelper[];
  private _axis: Axis;

  private ground: THREE.Mesh;

  private layer: LayerBean;
  private scan: any;
  private debug: DebugBean;
  private slice: number;

  layerStream: Observable<LayerBean>;
  debugStream: Observable<DebugBean>;
  sliceStream: Observable<number>;

  layerSubscription: Subscription;
  debugSubscription: Subscription;
  sliceSubscription: Subscription;

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
    this.slices = [];

    // Axis
    this._axis = new Axis(this.scene, false);

    // Observable
    this.layerStream = this.parametersService.layers();
    this.debugStream = this.parametersService.debugs();
    this.sliceStream = this.parametersService.slice();

    // Subscribe
    this.sliceSubscription = this.sliceStream.subscribe(
      (slice: number) => {
        this.onSliceChange(slice);
      },
      (err) => console.error(err),
      () => {
      }
    );

    this.layerSubscription = this.layerStream.subscribe(
      (layer: LayerBean) => {
        this.layer = layer;
        if (this.group) {
          this.onLayerChange(this.layer);
          this.showLayer(this.layer.visible);
        }
      },
      (err) => console.error(err),
      () => {
      }
    );

    // Subscribe
    this.debugSubscription = this.debugStream.subscribe(
      (debug: DebugBean) => {
        this.debug = debug;
        if (this.group) {
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

  private factoryPiece(originalGeometry: THREE.BufferGeometry): THREE.Mesh[] {
    // Cf. https://threejs.org/docs/#api/en/materials/MeshToonMaterial
    class MeshToonMaterial extends THREE.MeshPhongMaterial {
      defines: any;
      gradientMap: any;
      constructor(parameters) {
        super(parameters);
        this.defines = { 'TOON': '' };
        this.type = 'MeshToonMaterial';
        this.gradientMap = null;
        this.setValues(parameters);
      }
      public isMeshToonMaterial(): boolean {
        return true;
      }
    }

    const meshes = [];
    const geometry = new THREE.Geometry().fromBufferGeometry(originalGeometry);
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    // move object with global bouding gemometry
    geometry.translate(
      -geometry.boundingBox.min.x - (geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2,
      -geometry.boundingBox.min.y - (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2,
      -geometry.boundingBox.min.z);

    const isolatedGeometries = ScanMeshes.findObjects(geometry);

    const material = new MeshToonMaterial({
      lights: true,
      transparent: true,
      color: 0xff6688,
      opacity: 0.7,
    });

    let indice = 0;
    _.each(isolatedGeometries, (isolatedGeometry) => {
      const mesh = new THREE.Mesh(isolatedGeometry, material);
      mesh.name = 'object#' + indice;
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      meshes.push(mesh);
      indice++;
    });

    return meshes;
  }

  /**
   * load a new geometry
   * @param originalGeometry loaded geometry
   */
  public setGeometryPiece(originalGeometry: THREE.BufferGeometry) {
    if (this.group) {
      this.scene.remove(this.group);
      this.group.remove();
    }
    /**
     * Build group from this geometry
     */
    const meshes = this.factoryPiece(originalGeometry);
    this.group = new THREE.Group();
    _.each(meshes, (mesh) => {
      this.group.add(mesh);
    });
    console.log(this.group);
    this.scene.add(this.group);

    // Slice
    this.onSliceChange(this.slice);

    // Layer
    this.onLayerChange(this.layer);
  }

  private onSliceChange(slice: number) {
    this.slice = slice;
    /*
     * Scan all pieces in group
     */
    if (this.group) {
      this.scan = ScanMeshes.scan(this.group, this.slice);
      this.parametersService.dispatch({
        type: SCAN_PIECES,
        payload: {
          minx: this.scan.minx,
          maxx: this.scan.maxx,
          miny: this.scan.miny,
          maxy: this.scan.maxy,
          minz: this.scan.minz,
          maxz: this.scan.maxz,
          allZ: this.scan.allZ
        }
      });
    }
  }

  public infos() {
    const infos = [];
    if (this.scan) {
      infos.push(`scan.minx : ${this.scan.minx}`);
      infos.push(`scan.maxx : ${this.scan.maxx}`);
      infos.push(`scan.miny : ${this.scan.miny}`);
      infos.push(`scan.maxy : ${this.scan.maxy}`);
      infos.push(`scan.minz : ${this.scan.minz}`);
      infos.push(`scan.maxz : ${this.scan.maxz}`);
    }
    return infos;
  }

  public onLayerChange(layer: LayerBean) {
    // Move to Z
    const areas = this.millingService.moveToZ(this.scene, this.group, layer.top);

    // remove previous slicing object
    _.each(this.slices, (child) => {
      this.scene.remove(child);
    });

    // compute new slice
    this.slices = [];

    // add new slicing object and infos
    _.each(areas, (area) => {
      _.each(area.meshes, (child) => {
        this.slices.push(child);
        this.scene.add(child);
      });
      this.slices.push(area.normals);
      this.scene.add(area.normals);
    });
    this.showLayer(this.layer.visible);
  }

  wireframe(enable: boolean) {
    if (this.group) {
      _.each(this.group.children, (element) => {
        (<THREE.MeshNormalMaterial>element.material).wireframe = enable;
      });
    }
  }

  normals(enable: boolean) {
    if (this.group) {
      if (!this.helpers) {
        this.helpers = [];
        _.each(this.group.children, (element) => {
          const material = new THREE.MeshNormalMaterial();
          this.normal = new THREE.Mesh(element.geometry, material);
          // TODO convert helper to array
          const helper = new THREE.FaceNormalsHelper(this.normal, 2, 0x00ff00, 1);
          this.helpers.push(helper);
          this.scene.add(helper);
        });
      }
      _.each(this.helpers, (helper) => {
        helper.visible = enable;
      });
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

  private showLayer(enable: boolean) {
    this.layerHelper.visible = enable;
    _.each(this.slices, (slice: THREE.Object3D) => {
      slice.visible = enable;
    });
  }

  public axis(enable: boolean) {
    this._axis.enable(enable);
  }
}
