import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

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
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';

import { SliderModule } from 'primeng/slider';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FieldsetModule } from 'primeng/fieldset';
import { PanelModule } from 'primeng/panel';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { ListboxModule } from 'primeng/listbox';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { CodeHighlighterModule } from 'primeng/codehighlighter';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarModule } from 'primeng/menubar';
import { SidebarModule } from 'primeng/sidebar';

import { StlViewComponent } from './components/stl-view/stl-view.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { RendererComponent } from './components/three/renderer/renderer.component';

import { StlLoaderService } from './services/three/stl-loader.service';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MillingService } from 'src/app/services/three/milling.service';
import { ToolpathViewComponent } from './components/toolpath-view/toolpath-view.component';
import { ParametersService } from 'src/app/stores/parameters.service';

@NgModule({
  declarations: [
    AppComponent,
    StlViewComponent,
    HomePageComponent,
    RendererComponent,
    ToolpathViewComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot({
      parameters: ParametersService.reducer
    }),
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    /*
     * primeng
     */
    SliderModule,
    InputSwitchModule,
    PanelModule,
    FieldsetModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    CalendarModule,
    TableModule,
    ListboxModule,
    TooltipModule,
    CheckboxModule,
    ToastModule,
    MessagesModule,
    MessageModule,
    TabViewModule,
    RadioButtonModule,
    AccordionModule,
    DialogModule,
    CodeHighlighterModule,
    InputTextModule,
    MenubarModule,
    SidebarModule,
    /*
     * material
     */
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
    MatCardModule,
    MatTabsModule,
    MatDividerModule
  ],
  providers: [
    StlLoaderService,
    MillingService,
    ParametersService,
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } }
  ],
  entryComponents: [
  ],
  bootstrap: [AppComponent],
  schemas: [
  ]
})
export class AppModule { }
