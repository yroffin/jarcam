import { Component, OnInit } from '@angular/core';
import { Directive, ElementRef, Input, ContentChild, ViewChild } from '@angular/core';

import * as THREE from 'three';
import * as _ from 'lodash';

import { CamerasComponent } from '../cameras/cameras.component';
import { LightsComponent } from '../lights/lights.component';
import { PlanarUtils } from '../../../services/three/planar-utils';

@Directive({
  selector: 'three-scene'
})
export class SceneComponent implements OnInit {

  public scene: THREE.Scene;

  private mesh: THREE.Mesh;
  private mill: THREE.Mesh;

  private slice: THREE.Object3D[];
  private detection: PlanarUtils;

  private normal: THREE.Mesh;
  private helper: THREE.FaceNormalsHelper;

  constructor() {
    // Create scene
    this.scene = new THREE.Scene();

    // add grid helper
    let helper = this.GridHelper(200, 200);
    this.scene.add(helper);

    // Add layer
    this.layer = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
    this.layerHelper = new THREE.PlaneHelper(this.layer, 5, 0xffffff);
    this.scene.add(this.layerHelper);

    // Add mill
    let geometry = new THREE.CylinderGeometry(4, 4, 4, 32);
    let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.mill = new THREE.Mesh(geometry, material);
    this.mill.geometry.rotateX(Math.PI / 2);
    this.mill.position.x = 14;
    this.mill.position.y = -10;
    this.scene.add(this.mill);

    // Detection
    this.detection = new PlanarUtils();

    // slice group
    this.slice = [];

    this.scene.background = new THREE.Color().setHSL(0.6, 0, 1);
    this.scene.fog = new THREE.Fog(0xffffff, 1, 5000);
  }

  GridHelper(size, divisions, color1?, color2?) {
    size = size || 10;
    divisions = divisions || 10;
    color1 = new THREE.Color(color1 !== undefined ? color1 : 0x444444);
    color2 = new THREE.Color(color2 !== undefined ? color2 : 0x888888);

    var center = divisions / 2;
    var step = size / divisions;
    var halfSize = size / 2;

    var vertices = [], colors = [];

    for (var i = 0, j = 0, k = - halfSize; i <= divisions; i++ , k += step) {

      vertices.push(- halfSize, k, 0, halfSize, k, 0);
      vertices.push(k, - halfSize, 0, k, halfSize, 0);

      var color = i === center ? color1 : color2;

      color.toArray(colors, j); j += 3;
      color.toArray(colors, j); j += 3;
      color.toArray(colors, j); j += 3;
      color.toArray(colors, j); j += 3;

    }

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

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

    const meshes = [
    ];

    for (let mesh of meshes) {
      if (mesh.object) {
        this.scene.add(mesh.object);
      } else if (mesh.attachScene) {
        mesh.attachScene(this.scene);
      }
    }
  }

  public setGeometryPiece(originalGeometry: THREE.BufferGeometry) {
    this.mesh = PlanarUtils.factoryPiece(originalGeometry);
    this.scene.add(this.mesh);
  }

  public onKeydown(event) {
    switch (event.key) {
      case 'q':
        this.translateX(-1, 1);
        break;
      case 'd':
        this.translateX(1, 1);
        break;
      case 's':
        this.translateY(-1, 1);
        break;
      case 'z':
        this.translateY(1, 1);
        break;
      default:
    }
  }

  public translateX(sens: number, value: number) {
    let iteration = value / 0.01;
    for (; iteration > 0 && this.detection.collisisionDetection(this.scene, this.mill, 0.01) == false; iteration--) {
      this.mill.translateX(0.01 * sens)
    }
    this.mill.translateX(0.01 * -sens)
  }

  public translateY(sens: number, value: number) {
    let iteration = value / 0.01;
    for (; iteration > 0 && this.detection.collisisionDetection(this.scene, this.mill, 0.01) == false; iteration--) {
      this.mill.translateY(0.01 * sens)
    }
    this.mill.translateY(0.01 * -sens)
  }

  public onLayerChange(layer: any) {
    this.planeIntersect(layer);
    this.detection.collisisionDetection(this.scene, this.mill, 0.01);
  }

  public planeIntersect(layer: any) {
    // Fix plane level
    this.layer.constant = layer.top / 1000;
    this.mill.translateZ(this.layer.constant - this.mill.position.z);

    // remove previous slicing object
    _.each(this.slice, (child) => {
      this.scene.remove(child);
    });

    // compute new slice
    let raycast = this.detection.intersect(this.layer, this.mesh);
    this.slice = this.detection.meshes;

    // add new slicing object
    _.each(this.slice, (child) => {
      this.scene.add(child);
    });
  }

  wireframe(enable: boolean) {
    (<THREE.MeshNormalMaterial>this.mesh.material).wireframe = enable;
  }

  normals(enable: boolean) {
    if (!this.helper) {
      let material = new THREE.MeshNormalMaterial();
      this.normal = new THREE.Mesh(this.mesh.geometry, material);
      this.helper = new THREE.FaceNormalsHelper(this.normal, 2, 0x00ff00, 1);
      this.scene.add(this.helper);
    }
    this.helper.visible = enable;
    this.normal.visible = enable;
  }

  private radius: number = 0.5;
  private height: number = 50;
  private xAxisMesh: THREE.Mesh;
  private yAxisMesh: THREE.Mesh;
  private zAxisMesh: THREE.Mesh;

  axis(enable: boolean) {
    if (!this.xAxisMesh) {
      let arrowGeometry = new THREE.CylinderGeometry(0, 2 * this.radius, this.height / 5);

      // Red for X
      let xAxisMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
      let xAxisGeometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height);
      this.xAxisMesh = new THREE.Mesh(xAxisGeometry, xAxisMaterial);
      let xArrowMesh = new THREE.Mesh(arrowGeometry, xAxisMaterial);
      this.xAxisMesh.add(xArrowMesh);
      xArrowMesh.position.y += this.height / 2;
      this.xAxisMesh.rotation.z -= 90 * Math.PI / 180;
      this.xAxisMesh.position.x += this.height / 2;
      this.scene.add(this.xAxisMesh);

      // Green for Y
      let yAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
      let yAxisGeometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height);
      this.yAxisMesh = new THREE.Mesh(yAxisGeometry, yAxisMaterial);
      let yArrowMesh = new THREE.Mesh(arrowGeometry, yAxisMaterial);
      this.yAxisMesh.add(yArrowMesh);
      yArrowMesh.position.y += this.height / 2
      this.yAxisMesh.position.y += this.height / 2
      this.scene.add(this.yAxisMesh);

      // And blue for Z
      let zAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x0000FF });
      let zAxisGeometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height);
      this.zAxisMesh = new THREE.Mesh(zAxisGeometry, zAxisMaterial);
      let zArrowMesh = new THREE.Mesh(arrowGeometry, zAxisMaterial);
      this.zAxisMesh.add(zArrowMesh);
      this.zAxisMesh.rotation.x += 90 * Math.PI / 180
      zArrowMesh.position.y += this.height / 2
      this.zAxisMesh.position.z += this.height / 2
      this.scene.add(this.zAxisMesh);
    }
    this.xAxisMesh.visible = enable;
    this.yAxisMesh.visible = enable;
    this.zAxisMesh.visible = enable;
  }

  private ground: THREE.Mesh;

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

  private layer: THREE.Plane;
  private layerHelper: THREE.PlaneHelper;

  public showLayer(enable: boolean) {
    this.layerHelper.visible = enable;
    _.each(this.slice, (slice: THREE.Object3D) => {
      slice.visible = enable;
    });
  }
}
