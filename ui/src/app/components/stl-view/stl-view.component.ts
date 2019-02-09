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
import { AutoUnsubscribe } from 'src/app/services/utility/decorators';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from 'src/app/services/utility/storage.service';
import { WorkbenchService } from 'src/app/services/workbench.service';
import { Subscription } from 'rxjs';

@AutoUnsubscribe()
@Component({
  selector: 'app-stl-view',
  templateUrl: './stl-view.component.html',
  styleUrls: ['./stl-view.component.css']
})
export class StlViewComponent implements AfterViewInit, OnInit {

  @ViewChild('renderView') rendererView: ElementRef;
  @ViewChild(RendererComponent) rendererComponent: RendererComponent;

  public selected = 0;

  private progress = 0;
  private progressObserver;

  radius: number;
  radiusStream: Observable<number>;
  radiusSubscription: Subscription;

  constructor(
    private elementRef: ElementRef,
    private route: ActivatedRoute,
    private workbenchService: WorkbenchService,
    private parametersService: ParametersService,
    private storageService: StorageService
  ) {
    this.radiusStream = this.parametersService.radius();
    this.radiusSubscription = this.radiusStream.subscribe(
      (radius: number) => {
        this.radius = radius;
      },
      (err) => console.error(err),
      () => {
      }
    );
  }

  ngOnInit() {
    // get param
    const lastLoaded = this.route.snapshot.queryParams['lastLoaded'];
    if (lastLoaded) {
      const data = this.storageService.load('lastLoaded');
      this.workbenchService.loadBinary(data, () => {
      });
    }
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
