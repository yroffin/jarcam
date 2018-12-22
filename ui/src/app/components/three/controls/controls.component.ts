import { Component, OnInit, Directive } from '@angular/core';
import { Input } from '@angular/core';

import * as THREE from 'three';
import * as OrbitControlsFunction from 'three-orbit-controls'; 
const OrbitControls = OrbitControlsFunction(THREE); // OrbitControls is now your constructor 

@Directive({
  selector: 'three-orbit-controls'
})
export class ControlsComponent implements OnInit {

  @Input() enabled: boolean = true;

  controls: THREE.OrbitControls;

  ngOnInit() {
  }

  setupControls(camera, renderer) {
    this.controls = new OrbitControls(camera, renderer.domElement);
    this.controls.enabled = this.enabled;
  }

  updateControls(scene, camera) {
    this.controls.update();
  }

}
