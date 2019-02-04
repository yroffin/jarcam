import { Component, OnChanges, AfterViewInit } from '@angular/core';
import { Directive, ElementRef, Input, ContentChild, ViewChild } from '@angular/core';

import * as THREE from 'three';
import * as OrbitControls from 'three-orbitcontrols';

import { StlLoaderService } from 'src/app/services/three/stl-loader.service';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { WorkbenchService } from 'src/app/services/workbench.service';
import { AutoUnsubscribe } from 'src/app/services/utility/decorators';

@AutoUnsubscribe()
@Component({
  selector: 'app-renderer',
  templateUrl: './renderer.component.html',
  styleUrls: ['./renderer.component.css']
})
export class RendererComponent implements AfterViewInit {

  public width = window.innerWidth;
  public height = window.innerHeight;

  @Input() orbit = true;

  @ViewChild('cubeView') cubeCanvas: ElementRef;
  @ViewChild('threeView') threeCanvas: ElementRef;

  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private renderCube: THREE.WebGLRenderer;

  public infos = [];

  constructor(
    private workbenchService: WorkbenchService) {
  }

  ngAfterViewInit() {
    // Cube
    this.renderCube = new THREE.WebGLRenderer({
      canvas: this.cubeCanvas.nativeElement,
      antialias: true
    });
    this.renderCube.setClearColor(0x000000, 1);
    this.renderCube.setPixelRatio(Math.floor(window.devicePixelRatio));

    // World
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.threeCanvas.nativeElement
    });
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setPixelRatio(Math.floor(window.devicePixelRatio));

    // Orbit control
    this.controls = new OrbitControls(this.workbenchService.getWorldCamera(), this.renderCube.domElement);
    this.controls.enabled = this.orbit;

    this.updateControls();

    const callback = (args) => {
      requestAnimationFrame(callback);
      this.render();
    };

    requestAnimationFrame(callback);
  }

  public setSize(width: number, height: number) {
    this.renderer.setSize(width, height);
    this.workbenchService.updateAspect(width / height);
  }

  render() {
    this.updateControls();

    this.renderer.render(this.workbenchService.getWorldScene(), this.workbenchService.getWorldCamera());
    this.renderCube.render(this.workbenchService.getCubeScene(), this.workbenchService.getCubeCamera());

    this.infos = this.workbenchService.infos();
  }

  load(url: string, done: any) {
    this.workbenchService.load(url, done);
  }

  loadFromBinary(bin: any, done: any) {
    this.workbenchService.loadBinary(bin, done);
  }

  updateControls() {
    if (this.controls) {
      this.workbenchService.updateCube();
      this.controls.update();
    }
  }


}
