import { Component, OnInit, AfterContentInit } from '@angular/core';
import { Input } from '@angular/core';

import * as THREE from 'three';
import { Directive } from '@angular/core';

@Directive({
  selector: 'three-point-light'
})
export class LightsComponent implements OnInit, AfterContentInit {

  @Input() color: number = 0xffffff;
  @Input() position: number[];

  public light: THREE.PointLight;
  public helper: THREE.PointLightHelper;

  constructor() {
  }

  ngOnInit() {
    this.light = new THREE.PointLight(this.color, 1, 1000);
    this.setPosition(this.position);
    this.helper = new THREE.PointLightHelper( this.light, 10, 0xff0000 );
  }

  ngAfterContentInit() {
  }

  ngOnChanges(changes) {
    if (this.light && changes.position && changes.position.currentValue) {
      this.setPosition(this.position);
    }
  }

  setPosition(position) {
    this.light.position.set(
      position[0],
      position[1],
      position[2]);
  }

}
