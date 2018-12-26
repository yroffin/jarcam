import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule, MAT_CHECKBOX_CLICK_ACTION } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';


import { StlViewComponent } from './components/stl-view/stl-view.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { CamerasComponent } from './components/three/cameras/cameras.component';
import { ControlsComponent } from './components/three/controls/controls.component';
import { LightsComponent } from './components/three/lights/lights.component';
import { RendererComponent } from './components/three/renderer/renderer.component';
import { SceneComponent } from './components/three/scene/scene.component';

import { StlLoaderService } from './services/three/stl-loader.service';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material';
import { NO_ERRORS_SCHEMA } from '@angular/core';

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
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    MatSliderModule,
    MatInputModule,
    MatSidenavModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatCardModule
  ],
  providers: [
    StlLoaderService,
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}}
  ],
  entryComponents: [
  ],
  bootstrap: [AppComponent],
  schemas: [
    NO_ERRORS_SCHEMA
  ]
})
export class AppModule { }
