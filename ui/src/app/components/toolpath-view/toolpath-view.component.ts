import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { PaperScope, Project, Path, Shape, Point, Size, Group, Color } from 'paper';

import * as _ from 'lodash';

import { ElementRef } from '@angular/core';
import { MillingService } from '../../services/three/milling.service';

@Component({
  selector: 'app-toolpath-view',
  templateUrl: './toolpath-view.component.html',
  styleUrls: ['./toolpath-view.component.css']
})
export class ToolpathViewComponent implements OnInit, AfterViewInit {

  @ViewChild('paperView') paperCanvas: ElementRef;

  private width = window.innerWidth;
  private height = window.innerHeight;

  scope: PaperScope;
  project: Project;

  constructor(private millingService: MillingService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.scope = new PaperScope();
    this.project = new Project(this.paperCanvas.nativeElement);
    this.project.view.scale(5, -5);
    this.project.view.onResize = (event) => {
      // Whenever the view is resized, move the path to its center:
      this.project.activeLayer.position = this.project.view.center;
      this.project.view.draw();
    };
  }

  public onLayerChange() {
    this.render();
  }

  gridHelper(size: number, step: number) {
    let x, y;

    let segments = [];
    for (y = -size; y < size; y += step) {
      segments.push([-size, y], [size, y], [0, y], [0, y + step]);
    }

    const gridX = new Path({
      segments: segments,
      selected: false
    });

    gridX.strokeColor = 'blue';
    gridX.strokeWidth = 0.01;

    segments = [];
    for (x = -size; x < size; x += step) {
      segments.push([x, -size], [x, size], [x, 0], [x + step, 0]);
    }

    const gridY = new Path({
      segments: segments,
      selected: false
    });

    gridY.strokeColor = 'blue';
    gridY.strokeWidth = 0.01;

    const axeX = new Path({
      segments: [[-size, 0], [size, 0], [size - 5, 5], [size - 5, -5], [size, 0]]
    });
    axeX.strokeColor = 'red';
    const axeY = new Path({
      segments: [[0, -size], [0, size], [5, size - 5], [-5, size - 5], [0, size]]
    });
    axeY.strokeColor = 'green';
  }

  render() {
    console.log('draw');
    this.project.clear();

    this.gridHelper(140, 1);

    const groups = new Group();

    _.each(this.millingService.getAreas(), (area) => {
      const segments = [];
      _.each(area.vertices2d, (vertice) => {
        segments.push([vertice.x, vertice.y]);
      });
      const areaPath = new Path({
        segments: segments,
        selected: false
      });
      areaPath.strokeColor = 'gray';
      areaPath.strokeWidth = 0.2;
      areaPath.simplify(0.00001);
      groups.addChild(areaPath);
    });

    this.project.activeLayer.position = this.project.view.center;
  }
}
