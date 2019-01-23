import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ParametersService, CHANGE_LAYER, CHANGE_DEBUG } from 'src/app/stores/parameters.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public options: any;

  title = 'ui';

  items: MenuItem[];
  display = false;

  constructor(private parametersService: ParametersService) {
    this.options = {
      // layers
      layer: {
        visible: false,
        top: 6836,
      },

      // debug
      axesHelper: true,
      wireframe: false,
      normals: false,
      ground: false,

      // Camera
      camera: {
        position: { x: 0, y: 0, z: 0 },
      },

      // Toolpath
      toolpath: {
        zoom: { value: 5 },
      },
    };
  }

  ngOnInit() {
    this.items = [
      {
        icon: 'pi pi-fw pi-align-justify',
        command: (event) => {
          this.display = true;
        }
      },
      {
        label: 'View',
        icon: 'pi pi-fw pi-eye',
        items: [
          {
            label: 'Scene', icon: 'pi pi-fw pi-clone', routerLink: ['/scene']
          },
          {
            label: 'Slice', icon: 'pi pi-fw pi-replay', routerLink: ['/slice']
          }
        ]
      }
    ];
  }

  public onLayerChange() {
    this.parametersService.dispatch({
      type: CHANGE_LAYER,
      payload: {
        visible: this.options.layer.visible,
        top: this.options.layer.top
      }
    });
  }

  public onLayerVisibilityChange() {
    this.parametersService.dispatch({
      type: CHANGE_LAYER,
      payload: {
        visible: this.options.layer.visible,
        top: this.options.layer.top
      }
    });
  }

  public onDebugChange(event?, name?: string) {
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
    this.parametersService.dispatch({
      type: CHANGE_DEBUG,
      payload: {
        axesHelper: this.options.axesHelper,
        normals: this.options.normals,
        wireframe: this.options.wireframe,
        ground: this.options.ground
      }
    });
  }
}
