import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { StlViewComponent } from './components/stl-view/stl-view.component';
import { ToolpathViewComponent } from './components/toolpath-view/toolpath-view.component';

const appRoutes: Routes = [
  { path: 'scene', component: StlViewComponent },
  { path: 'slice', component: ToolpathViewComponent },
  { path: '',
    redirectTo: '/scene',
    pathMatch: 'full'
  },
  { path: '**', component: StlViewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { enableTracing: false })],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
