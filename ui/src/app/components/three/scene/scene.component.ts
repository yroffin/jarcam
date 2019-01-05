import { Component, OnInit } from '@angular/core';
import { Directive, ElementRef, Input, ContentChild, ViewChild } from '@angular/core';

import * as THREE from 'three';
import * as _ from 'lodash';

import { CamerasComponent } from '../cameras/cameras.component';
import { LightsComponent } from '../lights/lights.component';
import { PlanarUtils } from '../../../services/three/planar-utils';
import { MillingService } from 'src/app/services/three/milling.service';
import { Axis } from 'src/app/services/three/axis.class';

@Directive({
  selector: 'three-scene'
})
export class SceneComponent implements OnInit {

  public scene: THREE.Scene;

  private mesh: THREE.Mesh;
  private slice: THREE.Object3D[];
  private layerHelper: THREE.PlaneHelper;

  private normal: THREE.Mesh;
  private helper: THREE.FaceNormalsHelper;
  private _axis: Axis;

  private ground: THREE.Mesh;

  constructor(private millingService: MillingService) {
    // Create scene
    this.scene = new THREE.Scene();

    // add grid helper
    const helper = this.GridHelper(200, 200);
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

    // back ground
    this.scene.background = new THREE.Color().setHSL(0.6, 0, 1);
    this.scene.fog = new THREE.Fog(0xffffff, 1, 5000);
  }

  GridHelper(size, divisions, color1?, color2?) {
    size = size || 10;
    divisions = divisions || 10;
    color1 = new THREE.Color(color1 !== undefined ? color1 : 0x444444);
    color2 = new THREE.Color(color2 !== undefined ? color2 : 0x888888);

    const center = divisions / 2;
    const step = size / divisions;
    const halfSize = size / 2;

    const vertices = [], colors = [];

    for (let i = 0, j = 0, k = - halfSize; i <= divisions; i++ , k += step) {

      vertices.push(- halfSize, k, 0, halfSize, k, 0);
      vertices.push(k, - halfSize, 0, k, halfSize, 0);

      const color = i === center ? color1 : color2;

      color.toArray(colors, j); j += 3;
      color.toArray(colors, j); j += 3;
      color.toArray(colors, j); j += 3;
      color.toArray(colors, j); j += 3;

    }

    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

    return new THREE.LineSegments(geometry, material);
  }

  @ContentChild(CamerasComponent) cameraComp: CamerasComponent;
  @ContentChild(LightsComponent) lightComps: LightsComponent;

  ngOnInit() {
  }

  get camera() {
    return this.cameraComp.camera;
  }

  ngAfterContentInit() {
    this.camera.lookAt(this.scene.position);
    this.scene.add(this.camera);
    this.scene.add(this.lightComps.light);
    this.scene.add(this.lightComps.helper);
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

  public onKeydown(event) {
    switch (event.key) {
      case 'z':
        this.millingService.translateX(this.scene, -5, 5);
        break;
      case 's':
        this.millingService.translateX(this.scene, 5, 5);
        break;
      case 'q':
        this.millingService.translateY(this.scene, -5, 5);
        break;
      case 'd':
        this.millingService.translateY(this.scene, 5, 5);
        break;
      default:
    }
  }

  public onLayerChange(layer: any) {
    const planar = this.millingService.moveToZ(this.scene, this.mesh, layer.top / 1000);

    // remove previous slicing object
    _.each(this.slice, (child) => {
      this.scene.remove(child);
    });

    // compute new slice
    this.slice = [];

    // add new slicing object
    _.each(planar.areas, (area) => {
      _.each(area.meshes, (child) => {
        this.slice.push(child);
        this.scene.add(child);
      });
    });
  }

  wireframe(enable: boolean) {
    (<THREE.MeshNormalMaterial>this.mesh.material).wireframe = enable;
  }

  normals(enable: boolean) {
    if (!this.helper) {
      const material = new THREE.MeshNormalMaterial();
      this.normal = new THREE.Mesh(this.mesh.geometry, material);
      this.helper = new THREE.FaceNormalsHelper(this.normal, 2, 0x00ff00, 1);
      this.scene.add(this.helper);
    }
    this.helper.visible = enable;
    this.normal.visible = enable;
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
