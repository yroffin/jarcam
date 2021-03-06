import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { WorkbenchSceneService } from 'src/app/services/workbench-scene.service';
import { LayerBean } from 'src/app/stores/parameters.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class WorkbenchService {

  // Default position
  private cameraPosition = [80, 80, 80];
  private lightPosition = [0, 0, 80];
  private lightColor = 0xffffff;

  // Camera
  viewAngle = 45;
  near = 1;
  far = 1000;

  // World
  private worldScene: THREE.Scene;
  private worldCamera: THREE.PerspectiveCamera;
  private worldMaterial: THREE.Mesh;

  // Cube
  private cubeScene: THREE.Scene;
  private cubeCamera: THREE.PerspectiveCamera;
  private cubeMaterial: THREE.Mesh;

  // Lights
  private light: THREE.PointLight;
  private helper: THREE.PointLightHelper;

  constructor(
    private workbenchSceneService: WorkbenchSceneService,
  ) {
    this.worldScene = this.workbenchSceneService.scene;

    // Camera
    this.worldCamera = new THREE.PerspectiveCamera(
      this.viewAngle,
      window.innerWidth / window.innerHeight,
      this.near,
      this.far);
    this.setPosition(this.worldCamera, this.cameraPosition);
    this.worldCamera.up.set(0, 0, 1);
    this.worldCamera.lookAt(this.worldScene.position);

    // Lights
    this.light = new THREE.PointLight(this.lightColor, 1, 1000);
    this.setPosition(this.light, this.lightPosition);
    this.helper = new THREE.PointLightHelper(this.light, 10, 0xff0000);

    // Scene
    this.worldCamera.lookAt(this.worldScene.position);
    this.worldScene.background = new THREE.Color(0xf0f0f0);
    this.worldScene.add(this.worldCamera);
    this.worldScene.add(this.light);
    this.worldScene.add(this.helper);

    const txt1 = new THREE.TextureLoader();
    const txt2 = new THREE.TextureLoader();
    const txt3 = new THREE.TextureLoader();
    const txt4 = new THREE.TextureLoader();
    const txt5 = new THREE.TextureLoader();
    const txt6 = new THREE.TextureLoader();

    // Create scene for cue track ball
    this.cubeScene = new THREE.Scene();
    this.cubeScene.background = new THREE.Color(0xf0f0f0);
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const materials = [
      new THREE.MeshPhongMaterial({
        map: txt1.load('assets/left.png'),
        color: 0xFFFFFF, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true
      }),
      new THREE.MeshPhongMaterial({
        map: txt2.load('assets/right.png'),
        color: 0xFFFFFF, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true
      }),
      new THREE.MeshPhongMaterial({
        map: txt3.load('assets/up.png'),
        color: 0xFFFFFF, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true
      }),
      new THREE.MeshPhongMaterial({
        map: txt4.load('assets/down.png'),
        color: 0xFFFFFF, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true
      }),
      new THREE.MeshPhongMaterial({
        map: txt5.load('assets/back.png'),
        color: 0xFFFFFF, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true
      }),
      new THREE.MeshPhongMaterial({
        map: txt6.load('assets/front.png'),
        color: 0xFFFFFF, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true
      })
    ];
    this.cubeMaterial = new THREE.Mesh(geometry, materials);
    this.cubeScene.add(this.cubeMaterial);
    let light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(0, 200, 0);
    this.cubeScene.add(light);
    light = new THREE.PointLight(0xf0f0f0, 1, 0);
    light.position.set(100, 200, 100);
    this.cubeScene.add(light);
    light = new THREE.PointLight(0x8f8f8f, 1, 0);
    light.position.set(-100, -200, -100);
    this.cubeScene.add(light);
    this.cubeCamera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerWidth,
      1,
      1000);
    this.cubeCamera.up.set(0, 0, 1);
    this.setPosition(this.cubeCamera, [-180, -180, 0]);
    this.cubeCamera.lookAt(this.cubeMaterial.position);
  }

  load(url: string, done: any) {
    this.workbenchSceneService.load(url, done);
  }

  loadBinary(bin: any, done: any) {
    this.workbenchSceneService.loadBinary(bin, done);
  }

  getWorldScene(): THREE.Scene {
    return this.worldScene;
  }

  getCubeScene(): THREE.Scene {
    return this.cubeScene;
  }

  getWorldCamera(): THREE.PerspectiveCamera {
    return this.worldCamera;
  }

  getCubeCamera(): THREE.PerspectiveCamera {
    return this.cubeCamera;
  }

  updateAspect(ratio) {
    if (this.worldCamera) {
      this.worldCamera.aspect = ratio;
      this.worldCamera.updateProjectionMatrix();
    }
  }

  updateCube() {
    this.cubeMaterial.rotation.x = this.worldCamera.rotation.x;
    this.cubeMaterial.rotation.y = this.worldCamera.rotation.y;
    this.cubeMaterial.rotation.z = this.worldCamera.rotation.z;
  }

  infos() {
    const infos = [];
    infos.push({description: 'camera.position.x', value: this.worldCamera.position.x});
    infos.push({description: 'camera.position.y', value: this.worldCamera.position.y});
    infos.push({description: 'camera.position.z', value: this.worldCamera.position.z});
    _.each(this.workbenchSceneService.infos(), (info) => {
      infos.push({description: info.description, value: info.value});
    });
    return infos;
  }

  public onLayerChange(layer: LayerBean) {
    this.workbenchSceneService.onLayerChange(layer);
  }

  setPosition(target: THREE.Object3D, position: Array<number>) {
    target.position.set(
      position[0],
      position[1],
      position[2]);
  }
}
