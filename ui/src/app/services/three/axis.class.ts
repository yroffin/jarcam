import * as THREE from 'three';

export class Axis {

  private radius: number = 0.5;
  private height: number = 50;
  private xAxisMesh: THREE.Mesh;
  private yAxisMesh: THREE.Mesh;
  private zAxisMesh: THREE.Mesh;

  constructor(scene: THREE.Scene, enable: boolean) {
    this.create(scene, enable)
  }

  public enable(enable: boolean) {
    this.xAxisMesh.visible = enable;
    this.yAxisMesh.visible = enable;
    this.zAxisMesh.visible = enable;
  }

  private create(scene: THREE.Scene, enable: boolean) {
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
      scene.add(this.xAxisMesh);

      // Green for Y
      let yAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
      let yAxisGeometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height);
      this.yAxisMesh = new THREE.Mesh(yAxisGeometry, yAxisMaterial);
      let yArrowMesh = new THREE.Mesh(arrowGeometry, yAxisMaterial);
      this.yAxisMesh.add(yArrowMesh);
      yArrowMesh.position.y += this.height / 2
      this.yAxisMesh.position.y += this.height / 2
      scene.add(this.yAxisMesh);

      // And blue for Z
      let zAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x0000FF });
      let zAxisGeometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height);
      this.zAxisMesh = new THREE.Mesh(zAxisGeometry, zAxisMaterial);
      let zArrowMesh = new THREE.Mesh(arrowGeometry, zAxisMaterial);
      this.zAxisMesh.add(zArrowMesh);
      this.zAxisMesh.rotation.x += 90 * Math.PI / 180
      zArrowMesh.position.y += this.height / 2
      this.zAxisMesh.position.z += this.height / 2
      scene.add(this.zAxisMesh);
    }
    this.xAxisMesh.visible = enable;
    this.yAxisMesh.visible = enable;
    this.zAxisMesh.visible = enable;
  }

}
