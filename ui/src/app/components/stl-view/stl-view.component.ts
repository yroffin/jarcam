import { Component, OnInit, OnChanges, AfterContentInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { RendererComponent } from '../three/renderer/renderer.component';
import { HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-stl-view',
  templateUrl: './stl-view.component.html',
  styleUrls: ['./stl-view.component.css']
})
export class StlViewComponent implements OnInit, OnChanges, AfterContentInit {

  @Input() ngModel: any;
  @Input() height: number;
  @Input() width: number;

  @ViewChild(RendererComponent) rendererComponent: RendererComponent;

  constructor() { }

  ngOnInit() {
  }

  ngAfterContentInit() {
    this.rendererComponent.load('/assets/sittingMeerkat_L.stl');
    this.resetWidthHeight();
  }

  ngOnChanges(changes) {
    if(changes.ngModel && changes.ngModel.currentValue) {
      console.log('changes', changes);
    }
  }

  @HostListener('window:resize')
  @HostListener('window:vrdisplaypresentchange')
  resetWidthHeight() {
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    console.log('window resize', this.width, this.height);
  }

  public toggle() {
    this.rendererComponent.load('/assets/sittingMeerkat_L.stl');
  }
}
