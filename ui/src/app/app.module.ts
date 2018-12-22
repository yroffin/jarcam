import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { StlViewComponent } from './components/stl-view/stl-view.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { CamerasComponent } from './components/three/cameras/cameras.component';
import { ControlsComponent } from './components/three/controls/controls.component';
import { LightsComponent } from './components/three/lights/lights.component';
import { RendererComponent } from './components/three/renderer/renderer.component';
import { SceneComponent } from './components/three/scene/scene.component';

import { StlLoaderService } from './services/three/stl-loader.service';

@NgModule({
  declarations: [
    AppComponent,
    StlViewComponent,
    HomePageComponent,
    CamerasComponent,
    ControlsComponent,
    LightsComponent,
    RendererComponent,
    SceneComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MatButtonModule
  ],
  providers: [
    StlLoaderService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
