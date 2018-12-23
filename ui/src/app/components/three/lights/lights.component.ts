import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';

import * as THREE from 'three';
import { Directive } from '@angular/core';

@Directive({
  selector: 'three-point-light'
})
export class LightsComponent implements OnInit {

  @Input() color: string = '#FFFFFF';
  @Input() position: number[] = [250, 250, 0];

  object: THREE.PointLight;

  ngOnInit() {
    this.object = new THREE.PointLight(this.color);
    this.setPosition(this.position);
  }

  ngOnChanges(changes) {
    if(changes.position && changes.position.currentValue) {
      this.setPosition(this.position);
    }
  }

  setPosition(position) {
    this.object.position.set(
      position[0],
      position[1],
      position[2]);
  }

}
