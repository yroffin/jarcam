import { Component, OnInit } from '@angular/core';
import { Directive, ElementRef, Input, ContentChild, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { SceneComponent } from '../scene/scene.component';
import { ControlsComponent } from '../controls/controls.component';
import { StlLoaderService } from 'src/app/services/three/stl-loader.service';

@Directive({
  selector: 'three-renderer'
})
export class RendererComponent {

  @Input() height: number;
  @Input() width: number;

  @ContentChild(SceneComponent) sceneComp: SceneComponent;
  @ContentChild(ControlsComponent) orbitComponent: ControlsComponent;

  private renderer: THREE.WebGLRenderer;

  constructor(private element: ElementRef, private stlLoaderService: StlLoaderService) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
  }

  load(url: string) {
    this.stlLoaderService.loadStl(
      this.sceneComp.scene,
      url,
      () => {
        console.log('loaded', url);
      },
      () => {
      },
      () => {
      });
  }

  get scene() {
    return this.sceneComp.scene;
  }

  get camera() {
    return this.sceneComp.camera;
  }

  ngOnChanges(changes) {
    const widthChng = changes.width && changes.width.currentValue;
    const heightChng = changes.height && changes.height.currentValue;
    if (widthChng || heightChng) {
      console.log('resize',this.width, this.height)
      this.renderer.setSize(this.width, this.height);
    }
  }

  ngAfterContentInit() {
    this.renderer.setSize(this.width, this.height);
    this.element.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.setPixelRatio(Math.floor(window.devicePixelRatio));

    if (this.orbitComponent) {
      this.orbitComponent.setupControls(this.camera, this.renderer);
    }

    this.render();
  }

  render() {
    if (this.orbitComponent) {
      this.orbitComponent.updateControls(this.scene, this.camera);
    }

    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(() => this.render());
  }

}
