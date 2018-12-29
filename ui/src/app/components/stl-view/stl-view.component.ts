import { Component, OnInit, OnChanges, AfterContentInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { RendererComponent } from '../three/renderer/renderer.component';
import { HostListener, Input } from '@angular/core';
import { NgModule } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ContentChild } from '@angular/core';
import { HostBinding } from '@angular/core';

@Component({
  selector: 'app-stl-view',
  templateUrl: './stl-view.component.html',
  styleUrls: ['./stl-view.component.css']
})
export class StlViewComponent implements OnInit, OnChanges {

  @Input() ngModel: any;
  @Input() height: number;
  @Input() width: number;

  @ViewChild('renderView') rendererView: ElementRef;
  @ViewChild(RendererComponent) rendererComponent: RendererComponent;

  public val3 = 0;

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
  }

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
  }

  ngAfterContentInit() {
    this.rendererComponent.load('/assets/cube.stl');
    this.resetWidthHeight();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.height = this.rendererView.nativeElement.clientHeight;
      this.width = this.rendererView.nativeElement.clientWidth;
      this.options.layer.visible = true;
      this.rendererComponent.onLayerChange();
      this.rendererComponent.onDebugChange();
    });
  }

  ngOnChanges(changes) {
    if (changes.ngModel && changes.ngModel.currentValue) {
    }
  }

  @HostListener('window:resize')
  @HostListener('window:vrdisplaypresentchange')
  resetWidthHeight() {
    this.height = window.innerHeight;
    this.width = window.innerWidth;
  }

  public onKeydown(event) {
    this.rendererComponent.onKeydown(event);
  }

  public toggle() {
    this.rendererComponent.load('/assets/sittingMeerkat_L.stl');
  }

  format(): string {
    return Math.round(this.options.camera.position.x) + ',' + Math.round(this.options.camera.position.y) + ',' + Math.round(this.options.camera.position.z);
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
