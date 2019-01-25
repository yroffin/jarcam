import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { RendererComponent } from '../three/renderer/renderer.component';
import { HostListener, Input } from '@angular/core';
import { ElementRef } from '@angular/core';

import * as _ from 'lodash';
import { ToolpathViewComponent } from 'src/app/components/toolpath-view/toolpath-view.component';
import { MatTabGroup, getMatInputUnsupportedTypeError } from '@angular/material';
import { AppComponent } from 'src/app/app.component';
import { Store } from '@ngrx/store';
import { ParametersState, ParametersService } from 'src/app/stores/parameters.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-stl-view',
  templateUrl: './stl-view.component.html',
  styleUrls: ['./stl-view.component.css']
})
export class StlViewComponent implements AfterViewInit {

  @ViewChild('renderView') rendererView: ElementRef;
  @ViewChild(RendererComponent) rendererComponent: RendererComponent;

  public selected = 0;

  private progress = 0;
  private progressObserver;

  constructor(
    private elementRef: ElementRef
  ) {
  }

  ngAfterViewInit() {
    this.resetWidthHeight();
  }

  @HostListener('window:resize')
  @HostListener('window:vrdisplaypresentchange')
  resetWidthHeight() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.rendererComponent.setSize(width, height);
  }
}
