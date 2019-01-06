import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { RendererComponent } from '../three/renderer/renderer.component';
import { HostListener, Input } from '@angular/core';
import { NgModule } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ContentChild } from '@angular/core';
import { HostBinding } from '@angular/core';

import Voronoi from 'voronoi';
import paper from 'paper';
import * as _ from 'lodash';

@Component({
  selector: 'app-stl-view',
  templateUrl: './stl-view.component.html',
  styleUrls: ['./stl-view.component.css']
})
export class StlViewComponent implements AfterViewInit {

  @Input() ngModel: any;
  @Input() height: number;
  @Input() width: number;

  @ViewChild('renderView') rendererView: ElementRef;
  @ViewChild(RendererComponent) rendererComponent: RendererComponent;

  public selected = 0;

  private options = {
    // layers
    layer: {
      visible: false,
      top: 4000,
    },

    // debug
    axesHelper: true,
    wireframe: false,
    normals: false,
    ground: false,

    camera: {
      position: { x: 0, y: 0, z: 0 },
    },
  };

  constructor(
    private elementRef: ElementRef
  ) {
  }

  ngAfterViewInit() {
    this.rendererComponent.load('/assets/cube.stl', () => {
      this.options.layer.visible = true;
      this.rendererComponent.onLayerChange();
      this.rendererComponent.onDebugChange();
    });
    this.resetWidthHeight();
  }

  onSelectedChange(event) {
    this.selected = event;
  }

  @HostListener('window:resize')
  @HostListener('window:vrdisplaypresentchange')
  resetWidthHeight() {
    this.width = this.rendererView.nativeElement.clientWidth;
    this.height = this.rendererView.nativeElement.clientHeight;
    this.rendererComponent.setSize(this.width, this.height);
    console.log('resize', this.width, this.height);
  }

  public onKeydown(event) {
    this.rendererComponent.onKeydown(event);
  }

  format(): string {
    return Math.round(this.options.camera.position.x) + ','
      + Math.round(this.options.camera.position.y) + ','
      + Math.round(this.options.camera.position.z);
  }

  onLayerVisibilityChange(event) {
    this.options.layer.visible = event.checked;
    this.rendererComponent.onLayerChange();
  }

  onLayerChange(event) {
    this.rendererComponent.onLayerChange();
  }

  onCameraChange(event) {
    this.rendererComponent.onCameraChange();
  }

  onDebugChange(event, name: string) {
    switch (name) {
      case 'axisHelper':
        this.options.axesHelper = event.checked;
        break;
      case 'normals':
        this.options.normals = event.checked;
        break;
      case 'wireframe':
        this.options.wireframe = event.checked;
        break;
      case 'ground':
        this.options.ground = event.checked;
        break;
    }
    this.rendererComponent.onDebugChange();
  }
}
