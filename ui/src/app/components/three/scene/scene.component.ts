import { Component, OnInit } from '@angular/core';
import { Directive, ElementRef, Input, ContentChild, ViewChild } from '@angular/core';

import * as THREE from 'three';
import * as _ from 'lodash';

import { CamerasComponent } from '../cameras/cameras.component';
import { LightsComponent } from '../lights/lights.component';

class Segment {
  start: THREE.Vector3;
  end: THREE.Vector3;
  linked: boolean;
}

@Directive({
  selector: 'three-scene'
})
export class SceneComponent implements OnInit {

  public scene: THREE.Scene;

  private mesh: THREE.Mesh;
  private slice: THREE.Object3D[];

  private normal: THREE.Mesh;
  private helper: THREE.FaceNormalsHelper;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.GridHelper(500, 50));

    // Add layer
    this.layer = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    this.layerHelper = new THREE.PlaneHelper(this.layer, 1, 0xffff00);
    this.scene.add(this.layerHelper);

    // slice group
    this.slice = [];

    this.scene.background = new THREE.Color().setHSL(0.6, 0, 1);
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
    class MeshToonMaterial extends THREE.MeshPhongMaterial {
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
    this.mesh.name = 'piece';
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;

    this.scene.add(this.mesh);
  }

  public onLayerChange(layer: any) {
    this.planeIntersect(layer);
  }

  public planeIntersect(layer: any) {
    let mesh = (<THREE.Geometry>this.mesh.geometry);
    this.layer.constant = layer.top / 1000;

    // find all matching faces
    let keep: THREE.Face3[] = _.filter((<THREE.Geometry>this.mesh.geometry).faces, (face: THREE.Face3) => {
      let l1 = new THREE.Line3(mesh.vertices[face.a], mesh.vertices[face.b]);
      let l2 = new THREE.Line3(mesh.vertices[face.b], mesh.vertices[face.c]);
      let l3 = new THREE.Line3(mesh.vertices[face.c], mesh.vertices[face.a]);
      return this.layer.intersectsLine(l1) || this.layer.intersectsLine(l2) || this.layer.intersectsLine(l3);
    });

    // find all intersections as segments
    let segments: Segment[] = [];
    _.each(keep, (face) => {
      let l1 = new THREE.Line3(mesh.vertices[face.a], mesh.vertices[face.b]);
      let l2 = new THREE.Line3(mesh.vertices[face.b], mesh.vertices[face.c]);
      let l3 = new THREE.Line3(mesh.vertices[face.c], mesh.vertices[face.a]);
      let arr: THREE.Vector3[] = [];
      let output;
      output = new THREE.Vector3();
      let i1 = this.layer.intersectLine(l1, output);
      if (i1) arr.push(output);
      output = new THREE.Vector3();
      let i2 = this.layer.intersectLine(l2, output);
      if (i2) arr.push(output);
      output = new THREE.Vector3();
      let i3 = this.layer.intersectLine(l3, output);
      if (i3) arr.push(output);

      // push it
      segments.push({
        start: arr[0],
        end: arr[1],
        linked: false
      });
    });

    // remove previous slicing object
    _.each(this.slice, (child) => {
      this.scene.remove(child);
    });
    this.slice = [];

    // Find all chain
    let chain: Segment[];
    chain = this.findNextChain(segments);
    while (chain && chain.length > 0) {

      let geometry = new THREE.Geometry();
      _.each(chain, (line: Segment) => {
        geometry.vertices.push(line.start);
        geometry.vertices.push(line.end);
      });

      let line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
        color: 0x3949AB,
        linewidth: 10,
      }))

      this.slice.push(line);
      this.scene.add(line);

      // Find next chain
      chain = this.findNextChain(segments);
    }
  }

  findNextChain(segments: Segment[]): Segment[] {
    let chain: Segment[] = [];
    let current = _.find(segments, (segment) => {
      return segment.linked === false;
    })
    if (current) {
      current.linked = true;
      while (current) {
        chain.push(current);
        current = this.findNext(current, segments);
      }
    }
    return chain;
  }

  findNext(current: Segment, segments: Segment[]): Segment {
    let nextByStart = _.find(segments, (it: Segment) => {
      if (it.linked === true) return false;
      return this.compare(current.end, it.start);
    });
    if (nextByStart) {
      nextByStart.linked = true;
      return {
        start: nextByStart.start,
        end: nextByStart.end,
        linked: true
      };
    }
    let nextByEnd = _.find(segments, (it: Segment) => {
      if (it.linked === true) return false;
      return this.compare(current.end, it.end);
    });
    if (nextByEnd) {
      nextByEnd.linked = true;
      return {
        start: nextByEnd.end,
        end: nextByEnd.start,
        linked: true
      };
    }
  }

  compare(left: THREE.Vector3, right: THREE.Vector3): boolean {
    return Math.round(left.x * 10000 + Number.EPSILON) / 10000 === Math.round(right.x * 10000 + Number.EPSILON) / 10000
      && Math.round(left.y * 10000 + Number.EPSILON) / 10000 === Math.round(right.y * 10000 + Number.EPSILON) / 10000
      && Math.round(left.z * 10000 + Number.EPSILON) / 10000 === Math.round(right.z * 10000 + Number.EPSILON) / 10000;
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

  private layer: THREE.Plane;
  private layerHelper: THREE.PlaneHelper;

  public showLayer(enable: boolean) {
    this.layerHelper.visible = enable;
    _.each(this.slice, (slice: THREE.Object3D) => {
      slice.visible = enable;
    });
  }
}
