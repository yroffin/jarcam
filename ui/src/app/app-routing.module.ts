import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { StlViewComponent } from './components/stl-view/stl-view.component';
import { ToolpathViewComponent } from './components/toolpath-view/toolpath-view.component';

const appRoutes: Routes = [
  { path: 'stl-view', component: StlViewComponent },
  { path: 'toolpath-view', component: ToolpathViewComponent },
  { path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  { path: '**', component: HomePageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { enableTracing: false })],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
