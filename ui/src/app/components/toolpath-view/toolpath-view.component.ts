import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import Voronoi from 'voronoi';
import paper from 'paper';
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

  constructor(private millingService: MillingService) {
  }

  ngOnInit() {
    const canvas = this.paperCanvas.nativeElement;
    paper.setup(canvas);
  }

  ngAfterViewInit() {
    this.render();
  }

  render() {
    const canvas = this.paperCanvas.nativeElement;

    const voronoi = new Voronoi();
    const bbox = { xl: 0, xr: canvas.width, yt: 0, yb: canvas.height }; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
    const sites = [{ x: 200, y: -200 }, { x: 50, y: 250 }, { x: 400, y: 100 } /* , ... */];

    // a 'vertex' is an object exhibiting 'x' and 'y' properties. The
    // Voronoi object will add a unique 'voronoiId' property to all
    // sites. The 'voronoiId' can be used as a key to lookup the associated cell
    // in diagram.cells.

    const diagram = voronoi.compute(sites, bbox);
    console.log('Time', diagram.execTime);

    _.each(sites, (site) => {
      const point = new paper.Point(site.x, site.y);
      const shape = new paper.Shape.Circle(point, 2);
      shape.strokeColor = 'green';
    });
    _.each(diagram.vertices, (vertice) => {
      const point = new paper.Point(vertice.x, vertice.y);
      const shape = new paper.Shape.Circle(point, 2);
      shape.strokeColor = 'black';
    });
    _.each(diagram.edges, (edge) => {
      const point = new paper.Point(edge.x, edge.y);
      const shape = new paper.Shape.Circle(point, 2);
      shape.strokeColor = 'red';
    });
  }
}
