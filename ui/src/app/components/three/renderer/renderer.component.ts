import { Component, OnChanges, AfterViewInit } from '@angular/core';
import { Directive, ElementRef, Input, ContentChild, ViewChild } from '@angular/core';

import * as THREE from 'three';
import * as OrbitControls from 'three-orbitcontrols';

import { SceneDirective } from '../scene/scene.component';
import { StlLoaderService } from 'src/app/services/three/stl-loader.service';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-renderer',
  templateUrl: './renderer.component.html',
  styleUrls: ['./renderer.component.css']
})
export class RendererComponent implements AfterViewInit {

  private width = window.innerWidth;
  private height = window.innerHeight;

  @Input() orbit = true;
  @Input() cameraPosition;
  @Input() lightColor = 0xffffff;
  @Input() lightPosition;

  @ViewChild('cubeView') cubeCanvas: ElementRef;
  @ViewChild('threeView') threeCanvas: ElementRef;
  @ViewChild(SceneDirective) sceneComp: SceneDirective;

  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;

  // Camera
  viewAngle = 45;
  near = 1;
  far = 1000;
  private camera: THREE.PerspectiveCamera;

  private renderCube: THREE.WebGLRenderer;
  private sceneCube: THREE.Scene;
  private cameraCube: THREE.PerspectiveCamera;
  private cube: THREE.Mesh;

  // Lights
  private light: THREE.PointLight;
  private helper: THREE.PointLightHelper;
  private infos = [];

  constructor(
    private stlLoaderService: StlLoaderService) {
  }

  get scene() {
    return this.sceneComp.scene;
  }

  ngAfterViewInit() {
    this.renderCube = new THREE.WebGLRenderer({
      canvas: this.cubeCanvas.nativeElement,
      antialias: true
    });
    this.renderCube.setClearColor(0x000000, 1);
    this.renderCube.setPixelRatio(Math.floor(window.devicePixelRatio));

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.threeCanvas.nativeElement
    });

    this.renderer.setPixelRatio(Math.floor(window.devicePixelRatio));

    // Control
    this.cubeControl();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      this.viewAngle,
      window.innerWidth / window.innerHeight,
      this.near,
      this.far);
    this.setPosition(this.camera, this.cameraPosition);
    this.camera.up.set(0, 0, 1);
    this.camera.lookAt(this.scene.position);

    // Orbit control
    this.controls = new OrbitControls(this.camera, this.renderCube.domElement);
    this.controls.enabled = this.orbit;

    // Lights
    this.light = new THREE.PointLight(this.lightColor, 1, 1000);
    this.setPosition(this.light, this.lightPosition);
    this.helper = new THREE.PointLightHelper(this.light, 10, 0xff0000);

    // Scene
    this.camera.lookAt(this.scene.position);
    this.scene.background = new THREE.Color(0xf0f0f0);
    this.scene.add(this.camera);
    this.scene.add(this.light);
    this.scene.add(this.helper);

    this.updateControls(this.scene, this.camera);

    const callback = (args) => {
      requestAnimationFrame(callback);
      this.render();
    };

    requestAnimationFrame(callback);
  }

  public cubeControl() {
    // Create scene for cue track ball
    this.sceneCube = new THREE.Scene();
    this.sceneCube.background = new THREE.Color(0xf0f0f0);
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshPhongMaterial({ color: 0x156289, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true });
    this.cube = new THREE.Mesh(geometry, material);
    this.sceneCube.add(this.cube);
    let light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(0, 200, 0);
    this.sceneCube.add(light);
    light = new THREE.PointLight(0xf0f0f0, 1, 0);
    light.position.set(100, 200, 100);
    this.sceneCube.add(light);
    light = new THREE.PointLight(0x8f8f8f, 1, 0);
    light.position.set(-100, -200, -100);
    this.sceneCube.add(light);
    this.cameraCube = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerWidth,
      1,
      1000);
    this.cameraCube.up.set(0, 0, 1);
    this.setPosition(this.cameraCube, [-180, -180, 0]);
    this.cameraCube.lookAt(this.cube.position);
  }

  public setSize(width: number, height: number) {
    this.renderer.setSize(width, height);
    this.updateAspect(width / height);
  }

  render() {
    this.updateControls(this.scene, this.camera);

    this.renderer.render(this.scene, this.camera);
    this.renderCube.render(this.sceneCube, this.cameraCube);

    this.infos = [];
    this.infos.push(`camera.position.x : ${this.camera.position.x}`);
    this.infos.push(`camera.position.y : ${this.camera.position.y}`);
    this.infos.push(`camera.position.z : ${this.camera.position.z}`);
  }

  updateAspect(ratio) {
    if (this.camera) {
      this.camera.aspect = ratio;
      this.camera.updateProjectionMatrix();
    }
  }

  load(url: string, done: any) {
    this.stlLoaderService.loadStl(
      this.sceneComp.scene,
      url,
      (geometry: THREE.BufferGeometry) => {
        this.sceneComp.setGeometryPiece(geometry);
        done();
      },
      () => {
      },
      () => {
      });
  }

  setPosition(target: THREE.Object3D, position: Array<number>) {
    target.position.set(
      position[0],
      position[1],
      position[2]);
  }

  updateControls(scene, camera) {
    if (this.controls) {
      this.cube.rotation.x = this.camera.rotation.x;
      this.cube.rotation.y = this.camera.rotation.y;
      this.cube.rotation.z = this.camera.rotation.z;
      this.controls.update();
    }
  }


}
