import { Component, OnInit } from '@angular/core';
import { Directive, ElementRef, Input, ContentChild, ViewChild } from '@angular/core';

import * as THREE from 'three';

import { CamerasComponent } from '../cameras/cameras.component';
import { LightsComponent } from '../lights/lights.component';

@Directive({
  selector: 'three-scene'
})
export class SceneComponent implements OnInit {

  public scene: THREE.Scene;

  private mesh: THREE.Mesh;

  private normal: THREE.Mesh;
  private helper: THREE.FaceNormalsHelper;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.GridHelper(500, 50));


    this.scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
    this.scene.fog = new THREE.Fog(0xffffff, 1, 5000);
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

  setGeometryPiece(originalGeometry: THREE.BufferGeometry) {
    // Cf. https://threejs.org/docs/#api/en/materials/MeshToonMaterial
    class MeshToonMaterial extends THREE.MeshPhongMaterial{
      public isMeshToonMaterial(): boolean {
        return true;
      }
    }

    let geometry = new THREE.Geometry().fromBufferGeometry(originalGeometry);
    geometry.computeVertexNormals();

    let material = new MeshToonMaterial({
      lights: true,
      transparent: true,
      opacity: 0.5,
    });

    let m = new THREE.Matrix4()

    m = m.premultiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    m = m.premultiply(new THREE.Matrix4().makeRotationX(0 / 180 * Math.PI));
    m = m.premultiply(new THREE.Matrix4().makeRotationY(0 / 180 * Math.PI));
    m = m.premultiply(new THREE.Matrix4().makeRotationZ(0 / 180 * Math.PI));
    m = m.premultiply(new THREE.Matrix4().makeScale(1, 1, 1));

    geometry.applyMatrix(m)
    geometry.applyMatrix(function () {
      geometry.computeBoundingBox()
      let minX = geometry.boundingBox.min.x
      let minY = geometry.boundingBox.min.y
      let minZ = geometry.boundingBox.min.z
      let m = new THREE.Matrix4()
      m = m.premultiply(new THREE.Matrix4().makeTranslation(-minX, -minY, -minZ))
      return m
    }())

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name ='piece';
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;

    console.log('setPiece', this.mesh);
    this.scene.add(this.mesh);
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

      let xAxisMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
      let xAxisGeometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height);
      this.xAxisMesh = new THREE.Mesh(xAxisGeometry, xAxisMaterial);
      let xArrowMesh = new THREE.Mesh(arrowGeometry, xAxisMaterial);
      this.xAxisMesh.add(xArrowMesh);
      xArrowMesh.position.y += this.height / 2;
      this.xAxisMesh.rotation.z -= 90 * Math.PI / 180;
      this.xAxisMesh.position.x += this.height / 2;
      this.scene.add(this.xAxisMesh);

      let yAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
      let yAxisGeometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height);
      this.yAxisMesh = new THREE.Mesh(yAxisGeometry, yAxisMaterial);
      let yArrowMesh = new THREE.Mesh(arrowGeometry, yAxisMaterial);
      this.yAxisMesh.add(yArrowMesh);
      yArrowMesh.position.y += this.height / 2
      this.yAxisMesh.position.y += this.height / 2
      this.scene.add(this.yAxisMesh);

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

}
