(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./src/$$_lazy_route_resource lazy recursive":
/*!**********************************************************!*\
  !*** ./src/$$_lazy_route_resource lazy namespace object ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./src/$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/app-routing.module.ts":
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/*! exports provided: AppRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function() { return AppRoutingModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _components_home_page_home_page_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/home-page/home-page.component */ "./src/app/components/home-page/home-page.component.ts");
/* harmony import */ var _components_stl_view_stl_view_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/stl-view/stl-view.component */ "./src/app/components/stl-view/stl-view.component.ts");





var appRoutes = [
    { path: 'stl-view', component: _components_stl_view_stl_view_component__WEBPACK_IMPORTED_MODULE_4__["StlViewComponent"] },
    { path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    { path: '**', component: _components_home_page_home_page_component__WEBPACK_IMPORTED_MODULE_3__["HomePageComponent"] }
];
var AppRoutingModule = /** @class */ (function () {
    function AppRoutingModule() {
    }
    AppRoutingModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            imports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"].forRoot(appRoutes, { enableTracing: false })],
            exports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"]]
        })
    ], AppRoutingModule);
    return AppRoutingModule;
}());



/***/ }),

/***/ "./src/app/app.component.css":
/*!***********************************!*\
  !*** ./src/app/app.component.css ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".example-icon {\n    padding: 0 14px;\n  }\n  \n  .example-spacer {\n    flex: 1 1 auto;\n  }\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvYXBwLmNvbXBvbmVudC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7SUFDSSxnQkFBZ0I7R0FDakI7O0VBRUQ7SUFDRSxlQUFlO0dBQ2hCIiwiZmlsZSI6InNyYy9hcHAvYXBwLmNvbXBvbmVudC5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuZXhhbXBsZS1pY29uIHtcbiAgICBwYWRkaW5nOiAwIDE0cHg7XG4gIH1cbiAgXG4gIC5leGFtcGxlLXNwYWNlciB7XG4gICAgZmxleDogMSAxIGF1dG87XG4gIH0iXX0= */"

/***/ }),

/***/ "./src/app/app.component.html":
/*!************************************!*\
  !*** ./src/app/app.component.html ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<mat-toolbar color=\"primary\">\n  <mat-toolbar-row>\n    <mat-icon class=\"example-icon\" routerLink=\"/\">home</mat-icon>\n    <span class=\"example-spacer\"></span>\n    <mat-icon class=\"example-icon\" routerLink=\"/stl-view\">map</mat-icon>\n  </mat-toolbar-row>\n</mat-toolbar>\n\n<router-outlet></router-outlet>"

/***/ }),

/***/ "./src/app/app.component.ts":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");


var AppComponent = /** @class */ (function () {
    function AppComponent() {
        this.title = 'ui';
    }
    AppComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-root',
            template: __webpack_require__(/*! ./app.component.html */ "./src/app/app.component.html"),
            styles: [__webpack_require__(/*! ./app.component.css */ "./src/app/app.component.css")]
        })
    ], AppComponent);
    return AppComponent;
}());



/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/fesm5/platform-browser.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app-routing.module */ "./src/app/app-routing.module.ts");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/platform-browser/animations */ "./node_modules/@angular/platform-browser/fesm5/animations.js");
/* harmony import */ var _angular_material_menu__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/menu */ "./node_modules/@angular/material/esm5/menu.es5.js");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/esm5/button.es5.js");
/* harmony import */ var _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/toolbar */ "./node_modules/@angular/material/esm5/toolbar.es5.js");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/icon */ "./node_modules/@angular/material/esm5/icon.es5.js");
/* harmony import */ var _components_stl_view_stl_view_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./components/stl-view/stl-view.component */ "./src/app/components/stl-view/stl-view.component.ts");
/* harmony import */ var _components_home_page_home_page_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./components/home-page/home-page.component */ "./src/app/components/home-page/home-page.component.ts");
/* harmony import */ var _components_three_cameras_cameras_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./components/three/cameras/cameras.component */ "./src/app/components/three/cameras/cameras.component.ts");
/* harmony import */ var _components_three_controls_controls_component__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./components/three/controls/controls.component */ "./src/app/components/three/controls/controls.component.ts");
/* harmony import */ var _components_three_lights_lights_component__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./components/three/lights/lights.component */ "./src/app/components/three/lights/lights.component.ts");
/* harmony import */ var _components_three_renderer_renderer_component__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./components/three/renderer/renderer.component */ "./src/app/components/three/renderer/renderer.component.ts");
/* harmony import */ var _components_three_scene_scene_component__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./components/three/scene/scene.component */ "./src/app/components/three/scene/scene.component.ts");
/* harmony import */ var _services_three_stl_loader_service__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./services/three/stl-loader.service */ "./src/app/services/three/stl-loader.service.ts");


















var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_2__["NgModule"])({
            declarations: [
                _app_component__WEBPACK_IMPORTED_MODULE_4__["AppComponent"],
                _components_stl_view_stl_view_component__WEBPACK_IMPORTED_MODULE_10__["StlViewComponent"],
                _components_home_page_home_page_component__WEBPACK_IMPORTED_MODULE_11__["HomePageComponent"],
                _components_three_cameras_cameras_component__WEBPACK_IMPORTED_MODULE_12__["CamerasComponent"],
                _components_three_controls_controls_component__WEBPACK_IMPORTED_MODULE_13__["ControlsComponent"],
                _components_three_lights_lights_component__WEBPACK_IMPORTED_MODULE_14__["LightsComponent"],
                _components_three_renderer_renderer_component__WEBPACK_IMPORTED_MODULE_15__["RendererComponent"],
                _components_three_scene_scene_component__WEBPACK_IMPORTED_MODULE_16__["SceneComponent"]
            ],
            imports: [
                _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__["BrowserModule"],
                _app_routing_module__WEBPACK_IMPORTED_MODULE_3__["AppRoutingModule"],
                _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_5__["BrowserAnimationsModule"],
                _angular_material_menu__WEBPACK_IMPORTED_MODULE_6__["MatMenuModule"],
                _angular_material_button__WEBPACK_IMPORTED_MODULE_7__["MatButtonModule"],
                _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_8__["MatToolbarModule"],
                _angular_material_icon__WEBPACK_IMPORTED_MODULE_9__["MatIconModule"]
            ],
            providers: [
                _services_three_stl_loader_service__WEBPACK_IMPORTED_MODULE_17__["StlLoaderService"]
            ],
            bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_4__["AppComponent"]]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "./src/app/components/home-page/home-page.component.css":
/*!**************************************************************!*\
  !*** ./src/app/components/home-page/home-page.component.css ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2NvbXBvbmVudHMvaG9tZS1wYWdlL2hvbWUtcGFnZS5jb21wb25lbnQuY3NzIn0= */"

/***/ }),

/***/ "./src/app/components/home-page/home-page.component.html":
/*!***************************************************************!*\
  !*** ./src/app/components/home-page/home-page.component.html ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/home-page/home-page.component.ts":
/*!*************************************************************!*\
  !*** ./src/app/components/home-page/home-page.component.ts ***!
  \*************************************************************/
/*! exports provided: HomePageComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HomePageComponent", function() { return HomePageComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");


var HomePageComponent = /** @class */ (function () {
    function HomePageComponent() {
    }
    HomePageComponent.prototype.ngOnInit = function () {
    };
    HomePageComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-home-page',
            template: __webpack_require__(/*! ./home-page.component.html */ "./src/app/components/home-page/home-page.component.html"),
            styles: [__webpack_require__(/*! ./home-page.component.css */ "./src/app/components/home-page/home-page.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], HomePageComponent);
    return HomePageComponent;
}());



/***/ }),

/***/ "./src/app/components/stl-view/stl-view.component.css":
/*!************************************************************!*\
  !*** ./src/app/components/stl-view/stl-view.component.css ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2NvbXBvbmVudHMvc3RsLXZpZXcvc3RsLXZpZXcuY29tcG9uZW50LmNzcyJ9 */"

/***/ }),

/***/ "./src/app/components/stl-view/stl-view.component.html":
/*!*************************************************************!*\
  !*** ./src/app/components/stl-view/stl-view.component.html ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<three-renderer [height]=\"height\" [width]=\"800\">\n  <three-orbit-controls [enabled]=\"true\">\n  </three-orbit-controls>\n  <three-scene>\n    <three-perspective-camera [height]=\"height\" [width]=\"width\" [positions]=\"[-50, 0, 0]\">\n    </three-perspective-camera>\n    <three-point-light [position]=\"[0, 100, 0]\"></three-point-light>\n  </three-scene>\n</three-renderer>"

/***/ }),

/***/ "./src/app/components/stl-view/stl-view.component.ts":
/*!***********************************************************!*\
  !*** ./src/app/components/stl-view/stl-view.component.ts ***!
  \***********************************************************/
/*! exports provided: StlViewComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "StlViewComponent", function() { return StlViewComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _three_renderer_renderer_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../three/renderer/renderer.component */ "./src/app/components/three/renderer/renderer.component.ts");





var StlViewComponent = /** @class */ (function () {
    function StlViewComponent() {
    }
    StlViewComponent.prototype.ngOnInit = function () {
    };
    StlViewComponent.prototype.ngAfterContentInit = function () {
        this.rendererComponent.load('/assets/cube.stl');
        this.resetWidthHeight();
    };
    StlViewComponent.prototype.ngOnChanges = function (changes) {
        if (changes.ngModel && changes.ngModel.currentValue) {
            console.log('changes', changes);
        }
    };
    StlViewComponent.prototype.resetWidthHeight = function () {
        this.height = window.innerHeight;
        this.width = window.innerWidth;
        console.log('window resize', this.width, this.height);
    };
    StlViewComponent.prototype.toggle = function () {
        this.rendererComponent.load('/assets/sittingMeerkat_L.stl');
    };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object)
    ], StlViewComponent.prototype, "ngModel", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Number)
    ], StlViewComponent.prototype, "height", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Number)
    ], StlViewComponent.prototype, "width", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])(_three_renderer_renderer_component__WEBPACK_IMPORTED_MODULE_2__["RendererComponent"]),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", _three_renderer_renderer_component__WEBPACK_IMPORTED_MODULE_2__["RendererComponent"])
    ], StlViewComponent.prototype, "rendererComponent", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["HostListener"])('window:resize'),
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["HostListener"])('window:vrdisplaypresentchange'),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Function),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", []),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:returntype", void 0)
    ], StlViewComponent.prototype, "resetWidthHeight", null);
    StlViewComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-stl-view',
            template: __webpack_require__(/*! ./stl-view.component.html */ "./src/app/components/stl-view/stl-view.component.html"),
            styles: [__webpack_require__(/*! ./stl-view.component.css */ "./src/app/components/stl-view/stl-view.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], StlViewComponent);
    return StlViewComponent;
}());



/***/ }),

/***/ "./src/app/components/three/cameras/cameras.component.ts":
/*!***************************************************************!*\
  !*** ./src/app/components/three/cameras/cameras.component.ts ***!
  \***************************************************************/
/*! exports provided: CamerasComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CamerasComponent", function() { return CamerasComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");




var CamerasComponent = /** @class */ (function () {
    function CamerasComponent() {
        this.positions = [0, 0, 0];
        this.viewAngle = 75;
        this.near = 0.1;
        this.far = 10000;
    }
    Object.defineProperty(CamerasComponent.prototype, "aspect", {
        get: function () {
            return this.height / this.width;
        },
        enumerable: true,
        configurable: true
    });
    CamerasComponent.prototype.ngOnInit = function () {
        this.camera = new three__WEBPACK_IMPORTED_MODULE_2__["PerspectiveCamera"](this.viewAngle, this.aspect, this.near, this.far);
        this.camera.position.set(this.positions[0], this.positions[1], this.positions[2]);
        this.updateAspect(this.width / this.height);
    };
    CamerasComponent.prototype.ngOnChanges = function (changes) {
        var widthChng = changes.width && changes.width.currentValue;
        var heightChng = changes.height && changes.height.currentValue;
        if (widthChng || heightChng) {
            this.updateAspect(this.width / this.height);
        }
    };
    CamerasComponent.prototype.updateAspect = function (ratio) {
        if (this.camera) {
            this.camera.aspect = ratio;
            this.camera.updateProjectionMatrix();
        }
    };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Number)
    ], CamerasComponent.prototype, "height", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Number)
    ], CamerasComponent.prototype, "width", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object)
    ], CamerasComponent.prototype, "positions", void 0);
    CamerasComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Directive"])({
            selector: 'three-perspective-camera'
        })
    ], CamerasComponent);
    return CamerasComponent;
}());



/***/ }),

/***/ "./src/app/components/three/controls/controls.component.ts":
/*!*****************************************************************!*\
  !*** ./src/app/components/three/controls/controls.component.ts ***!
  \*****************************************************************/
/*! exports provided: ControlsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ControlsComponent", function() { return ControlsComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
/* harmony import */ var three_orbit_controls__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! three-orbit-controls */ "./node_modules/three-orbit-controls/index.js");
/* harmony import */ var three_orbit_controls__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(three_orbit_controls__WEBPACK_IMPORTED_MODULE_3__);





var OrbitControls = three_orbit_controls__WEBPACK_IMPORTED_MODULE_3__(three__WEBPACK_IMPORTED_MODULE_2__); // OrbitControls is now your constructor 
var ControlsComponent = /** @class */ (function () {
    function ControlsComponent() {
        this.enabled = true;
    }
    ControlsComponent.prototype.ngOnInit = function () {
    };
    ControlsComponent.prototype.setupControls = function (camera, renderer) {
        this.controls = new OrbitControls(camera, renderer.domElement);
        this.controls.enabled = this.enabled;
    };
    ControlsComponent.prototype.updateControls = function (scene, camera) {
        this.controls.update();
    };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Boolean)
    ], ControlsComponent.prototype, "enabled", void 0);
    ControlsComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Directive"])({
            selector: 'three-orbit-controls'
        })
    ], ControlsComponent);
    return ControlsComponent;
}());



/***/ }),

/***/ "./src/app/components/three/lights/lights.component.ts":
/*!*************************************************************!*\
  !*** ./src/app/components/three/lights/lights.component.ts ***!
  \*************************************************************/
/*! exports provided: LightsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LightsComponent", function() { return LightsComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");




var LightsComponent = /** @class */ (function () {
    function LightsComponent() {
        this.color = 0xffffff;
    }
    LightsComponent.prototype.ngOnInit = function () {
        this.light = new three__WEBPACK_IMPORTED_MODULE_2__["PointLight"](this.color, 1, 1000);
        this.setPosition(this.position);
        this.helper = new three__WEBPACK_IMPORTED_MODULE_2__["PointLightHelper"](this.light, 10, 0xff0000);
    };
    LightsComponent.prototype.ngAfterContentInit = function () {
    };
    LightsComponent.prototype.ngOnChanges = function (changes) {
        if (this.light && changes.position && changes.position.currentValue) {
            this.setPosition(this.position);
        }
    };
    LightsComponent.prototype.setPosition = function (position) {
        console.log('pisition', position);
        this.light.position.set(position[0], position[1], position[2]);
    };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Number)
    ], LightsComponent.prototype, "color", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Array)
    ], LightsComponent.prototype, "position", void 0);
    LightsComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Directive"])({
            selector: 'three-point-light'
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], LightsComponent);
    return LightsComponent;
}());



/***/ }),

/***/ "./src/app/components/three/renderer/renderer.component.ts":
/*!*****************************************************************!*\
  !*** ./src/app/components/three/renderer/renderer.component.ts ***!
  \*****************************************************************/
/*! exports provided: RendererComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RendererComponent", function() { return RendererComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
/* harmony import */ var _scene_scene_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../scene/scene.component */ "./src/app/components/three/scene/scene.component.ts");
/* harmony import */ var _controls_controls_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../controls/controls.component */ "./src/app/components/three/controls/controls.component.ts");
/* harmony import */ var src_app_services_three_stl_loader_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! src/app/services/three/stl-loader.service */ "./src/app/services/three/stl-loader.service.ts");
/* harmony import */ var dat_gui__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! dat.gui */ "./node_modules/dat.gui/build/dat.gui.module.js");







var RendererComponent = /** @class */ (function () {
    function RendererComponent(element, stlLoaderService) {
        this.element = element;
        this.stlLoaderService = stlLoaderService;
        this.options = {
            // layers
            layer: {
                visible: false,
                top: 4000,
            },
            // debug
            axesHelper: false,
            wireframe: false,
            normals: false,
            ground: false,
            camera: {
                position: { x: 0, y: 0, z: 0 },
            },
        };
        this.renderer = new three__WEBPACK_IMPORTED_MODULE_2__["WebGLRenderer"]({
            antialias: true,
            alpha: true
        });
        this.renderer.shadowMap.enabled = true;
        this.gui = new dat_gui__WEBPACK_IMPORTED_MODULE_6__["GUI"]({
            width: 400,
            autoPlace: true
        });
        element.nativeElement.appendChild(this.gui.domElement);
        var target = this;
        var onLayerChange = function () {
            target.onLayerChange(this.object);
            // activate layer
            target.scene.showLayer(this.object.visible);
        };
        var onCameraChange = function () {
            target.camera.position.x = this.object.x;
            target.camera.position.y = this.object.y;
            target.camera.position.z = this.object.z;
        };
        var updateDebugVisibility = function () {
            // activate normals
            target.scene.normals(this.object.normals);
            // activate wireframe
            target.scene.wireframe(this.object.wireframe);
            // activate axis
            target.scene.axis(this.object.axesHelper);
            // activate ground
            target.scene.showGround(this.object.ground);
        };
        var layers = this.gui.addFolder('Layer');
        var layer = layers.addFolder('Control');
        layer.add(this.options.layer, 'top', 0, 10000).onChange(onLayerChange);
        layer.add(this.options.layer, 'visible').onChange(onLayerChange);
        var cameras = this.gui.addFolder('Camera');
        var camera = cameras.addFolder('Position');
        camera.add(this.options.camera.position, 'x', -500, 500).onChange(onCameraChange);
        camera.add(this.options.camera.position, 'y', -500, 500).onChange(onCameraChange);
        camera.add(this.options.camera.position, 'z', -500, 500).onChange(onCameraChange);
        var debug = this.gui.addFolder('Debugging Options');
        debug.add(this.options, 'axesHelper').onChange(updateDebugVisibility);
        debug.add(this.options, 'wireframe').onChange(updateDebugVisibility);
        debug.add(this.options, 'normals').onChange(updateDebugVisibility);
        debug.add(this.options, 'ground').onChange(updateDebugVisibility);
    }
    RendererComponent.prototype.load = function (url) {
        var _this = this;
        this.stlLoaderService.loadStl(this.sceneComp.scene, url, function (geometry) {
            _this.scene.setGeometryPiece(geometry);
        }, function () {
        }, function () {
        });
    };
    RendererComponent.prototype.onLayerChange = function (layer) {
        this.scene.onLayerChange(layer);
    };
    Object.defineProperty(RendererComponent.prototype, "scene", {
        get: function () {
            return this.sceneComp;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RendererComponent.prototype, "camera", {
        get: function () {
            return this.sceneComp.camera;
        },
        enumerable: true,
        configurable: true
    });
    RendererComponent.prototype.onObjectLoaded = function () {
    };
    RendererComponent.prototype.ngOnChanges = function (changes) {
        var widthChng = changes.width && changes.width.currentValue;
        var heightChng = changes.height && changes.height.currentValue;
        if (widthChng || heightChng) {
            console.log('resize', this.width, this.height);
            this.renderer.setSize(this.width, this.height);
        }
    };
    RendererComponent.prototype.ngAfterContentInit = function () {
        this.element.nativeElement.appendChild(this.renderer.domElement);
        this.renderer.setPixelRatio(Math.floor(window.devicePixelRatio));
        this.renderer.setSize(this.width, this.height);
        if (this.orbitComponent) {
            this.orbitComponent.setupControls(this.camera, this.renderer);
        }
        this.render();
    };
    RendererComponent.prototype.render = function () {
        var _this = this;
        if (this.orbitComponent) {
            this.orbitComponent.updateControls(this.scene.scene, this.camera);
        }
        this.camera.lookAt(this.scene.scene.position);
        this.renderer.render(this.scene.scene, this.camera);
        this.options.camera.position.x = this.camera.position.x;
        this.options.camera.position.y = this.camera.position.y;
        this.options.camera.position.z = this.camera.position.z;
        this.gui.updateDisplay();
        requestAnimationFrame(function () { return _this.render(); });
    };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Number)
    ], RendererComponent.prototype, "height", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Number)
    ], RendererComponent.prototype, "width", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ContentChild"])(_scene_scene_component__WEBPACK_IMPORTED_MODULE_3__["SceneComponent"]),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", _scene_scene_component__WEBPACK_IMPORTED_MODULE_3__["SceneComponent"])
    ], RendererComponent.prototype, "sceneComp", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ContentChild"])(_controls_controls_component__WEBPACK_IMPORTED_MODULE_4__["ControlsComponent"]),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", _controls_controls_component__WEBPACK_IMPORTED_MODULE_4__["ControlsComponent"])
    ], RendererComponent.prototype, "orbitComponent", void 0);
    RendererComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Directive"])({
            selector: 'three-renderer'
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_core__WEBPACK_IMPORTED_MODULE_1__["ElementRef"], src_app_services_three_stl_loader_service__WEBPACK_IMPORTED_MODULE_5__["StlLoaderService"]])
    ], RendererComponent);
    return RendererComponent;
}());



/***/ }),

/***/ "./src/app/components/three/scene/scene.component.ts":
/*!***********************************************************!*\
  !*** ./src/app/components/three/scene/scene.component.ts ***!
  \***********************************************************/
/*! exports provided: SceneComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SceneComponent", function() { return SceneComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _cameras_cameras_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../cameras/cameras.component */ "./src/app/components/three/cameras/cameras.component.ts");
/* harmony import */ var _lights_lights_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../lights/lights.component */ "./src/app/components/three/lights/lights.component.ts");






var Segment = /** @class */ (function () {
    function Segment() {
    }
    return Segment;
}());
var SceneComponent = /** @class */ (function () {
    function SceneComponent() {
        this.radius = 0.5;
        this.height = 50;
        this.scene = new three__WEBPACK_IMPORTED_MODULE_2__["Scene"]();
        this.scene.add(new three__WEBPACK_IMPORTED_MODULE_2__["GridHelper"](500, 50));
        // Add layer
        this.layer = new three__WEBPACK_IMPORTED_MODULE_2__["Plane"](new three__WEBPACK_IMPORTED_MODULE_2__["Vector3"](0, -1, 0), 0);
        this.layerHelper = new three__WEBPACK_IMPORTED_MODULE_2__["PlaneHelper"](this.layer, 1, 0xffff00);
        this.scene.add(this.layerHelper);
        // slice group
        this.slice = [];
        this.scene.background = new three__WEBPACK_IMPORTED_MODULE_2__["Color"]().setHSL(0.6, 0, 1);
        this.scene.fog = new three__WEBPACK_IMPORTED_MODULE_2__["Fog"](0xffffff, 1, 5000);
    }
    SceneComponent.prototype.ngOnInit = function () {
    };
    Object.defineProperty(SceneComponent.prototype, "camera", {
        get: function () {
            return this.cameraComp.camera;
        },
        enumerable: true,
        configurable: true
    });
    SceneComponent.prototype.ngAfterContentInit = function () {
        this.camera.lookAt(this.scene.position);
        this.scene.add(this.camera);
        this.scene.add(this.lightComps.light);
        this.scene.add(this.lightComps.helper);
        var meshes = [];
        for (var _i = 0, meshes_1 = meshes; _i < meshes_1.length; _i++) {
            var mesh = meshes_1[_i];
            if (mesh.object) {
                this.scene.add(mesh.object);
            }
            else if (mesh.attachScene) {
                mesh.attachScene(this.scene);
            }
        }
    };
    SceneComponent.prototype.setGeometryPiece = function (originalGeometry) {
        // Cf. https://threejs.org/docs/#api/en/materials/MeshToonMaterial
        var MeshToonMaterial = /** @class */ (function (_super) {
            tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](MeshToonMaterial, _super);
            function MeshToonMaterial() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            MeshToonMaterial.prototype.isMeshToonMaterial = function () {
                return true;
            };
            return MeshToonMaterial;
        }(three__WEBPACK_IMPORTED_MODULE_2__["MeshPhongMaterial"]));
        var geometry = new three__WEBPACK_IMPORTED_MODULE_2__["Geometry"]().fromBufferGeometry(originalGeometry);
        geometry.computeVertexNormals();
        var material = new MeshToonMaterial({
            lights: true,
            transparent: true,
            opacity: 0.5,
        });
        var m = new three__WEBPACK_IMPORTED_MODULE_2__["Matrix4"]();
        m = m.premultiply(new three__WEBPACK_IMPORTED_MODULE_2__["Matrix4"]().makeRotationX(-Math.PI / 2));
        m = m.premultiply(new three__WEBPACK_IMPORTED_MODULE_2__["Matrix4"]().makeRotationX(0 / 180 * Math.PI));
        m = m.premultiply(new three__WEBPACK_IMPORTED_MODULE_2__["Matrix4"]().makeRotationY(0 / 180 * Math.PI));
        m = m.premultiply(new three__WEBPACK_IMPORTED_MODULE_2__["Matrix4"]().makeRotationZ(0 / 180 * Math.PI));
        m = m.premultiply(new three__WEBPACK_IMPORTED_MODULE_2__["Matrix4"]().makeScale(1, 1, 1));
        geometry.applyMatrix(m);
        geometry.applyMatrix(function () {
            geometry.computeBoundingBox();
            var minX = geometry.boundingBox.min.x;
            var minY = geometry.boundingBox.min.y;
            var minZ = geometry.boundingBox.min.z;
            var m = new three__WEBPACK_IMPORTED_MODULE_2__["Matrix4"]();
            m = m.premultiply(new three__WEBPACK_IMPORTED_MODULE_2__["Matrix4"]().makeTranslation(-minX, -minY, -minZ));
            return m;
        }());
        this.mesh = new three__WEBPACK_IMPORTED_MODULE_2__["Mesh"](geometry, material);
        this.mesh.name = 'piece';
        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;
        console.log('setPiece', this.mesh);
        this.scene.add(this.mesh);
    };
    SceneComponent.prototype.onLayerChange = function (layer) {
        this.planeIntersect(layer);
    };
    SceneComponent.prototype.planeIntersect = function (layer) {
        var _this = this;
        var mesh = this.mesh.geometry;
        this.layer.constant = layer.top / 1000;
        // find all matching faces
        var keep = lodash__WEBPACK_IMPORTED_MODULE_3__["filter"](this.mesh.geometry.faces, function (face) {
            var l1 = new three__WEBPACK_IMPORTED_MODULE_2__["Line3"](mesh.vertices[face.a], mesh.vertices[face.b]);
            var l2 = new three__WEBPACK_IMPORTED_MODULE_2__["Line3"](mesh.vertices[face.b], mesh.vertices[face.c]);
            var l3 = new three__WEBPACK_IMPORTED_MODULE_2__["Line3"](mesh.vertices[face.c], mesh.vertices[face.a]);
            return _this.layer.intersectsLine(l1) || _this.layer.intersectsLine(l2) || _this.layer.intersectsLine(l3);
        });
        // find all intersections as segments
        var segments = [];
        lodash__WEBPACK_IMPORTED_MODULE_3__["each"](keep, function (face) {
            var l1 = new three__WEBPACK_IMPORTED_MODULE_2__["Line3"](mesh.vertices[face.a], mesh.vertices[face.b]);
            var l2 = new three__WEBPACK_IMPORTED_MODULE_2__["Line3"](mesh.vertices[face.b], mesh.vertices[face.c]);
            var l3 = new three__WEBPACK_IMPORTED_MODULE_2__["Line3"](mesh.vertices[face.c], mesh.vertices[face.a]);
            var arr = [];
            var output;
            output = new three__WEBPACK_IMPORTED_MODULE_2__["Vector3"]();
            var i1 = _this.layer.intersectLine(l1, output);
            if (i1)
                arr.push(output);
            output = new three__WEBPACK_IMPORTED_MODULE_2__["Vector3"]();
            var i2 = _this.layer.intersectLine(l2, output);
            if (i2)
                arr.push(output);
            output = new three__WEBPACK_IMPORTED_MODULE_2__["Vector3"]();
            var i3 = _this.layer.intersectLine(l3, output);
            if (i3)
                arr.push(output);
            // push it
            segments.push({
                start: arr[0],
                end: arr[1],
                linked: false
            });
        });
        // remove previous slicing object
        lodash__WEBPACK_IMPORTED_MODULE_3__["each"](this.slice, function (child) {
            _this.scene.remove(child);
        });
        this.slice = [];
        // Find all chain
        var chain;
        chain = this.findNextChain(segments);
        var _loop_1 = function () {
            var geometry = new three__WEBPACK_IMPORTED_MODULE_2__["Geometry"]();
            lodash__WEBPACK_IMPORTED_MODULE_3__["each"](chain, function (line) {
                geometry.vertices.push(line.start);
                geometry.vertices.push(line.end);
            });
            var line = new three__WEBPACK_IMPORTED_MODULE_2__["LineSegments"](geometry, new three__WEBPACK_IMPORTED_MODULE_2__["LineBasicMaterial"]({
                color: 0x3949AB,
                linewidth: 10,
            }));
            this_1.slice.push(line);
            this_1.scene.add(line);
            // Find next chain
            chain = this_1.findNextChain(segments);
        };
        var this_1 = this;
        while (chain && chain.length > 0) {
            _loop_1();
        }
    };
    SceneComponent.prototype.findNextChain = function (segments) {
        var chain = [];
        var current = lodash__WEBPACK_IMPORTED_MODULE_3__["find"](segments, function (segment) {
            return segment.linked === false;
        });
        if (current) {
            current.linked = true;
            while (current) {
                chain.push(current);
                current = this.findNext(current, segments);
            }
        }
        return chain;
    };
    SceneComponent.prototype.findNext = function (current, segments) {
        var _this = this;
        var nextByStart = lodash__WEBPACK_IMPORTED_MODULE_3__["find"](segments, function (it) {
            if (it.linked === true)
                return false;
            return _this.compare(current.end, it.start);
        });
        if (nextByStart) {
            nextByStart.linked = true;
            return {
                start: nextByStart.start,
                end: nextByStart.end,
                linked: true
            };
        }
        var nextByEnd = lodash__WEBPACK_IMPORTED_MODULE_3__["find"](segments, function (it) {
            if (it.linked === true)
                return false;
            return _this.compare(current.end, it.end);
        });
        if (nextByEnd) {
            nextByEnd.linked = true;
            return {
                start: nextByEnd.end,
                end: nextByEnd.start,
                linked: true
            };
        }
    };
    SceneComponent.prototype.compare = function (left, right) {
        return Math.round(left.x * 10000 + Number.EPSILON) / 10000 === Math.round(right.x * 10000 + Number.EPSILON) / 10000
            && Math.round(left.y * 10000 + Number.EPSILON) / 10000 === Math.round(right.y * 10000 + Number.EPSILON) / 10000
            && Math.round(left.z * 10000 + Number.EPSILON) / 10000 === Math.round(right.z * 10000 + Number.EPSILON) / 10000;
    };
    SceneComponent.prototype.wireframe = function (enable) {
        this.mesh.material.wireframe = enable;
    };
    SceneComponent.prototype.normals = function (enable) {
        if (!this.helper) {
            var material = new three__WEBPACK_IMPORTED_MODULE_2__["MeshNormalMaterial"]();
            this.normal = new three__WEBPACK_IMPORTED_MODULE_2__["Mesh"](this.mesh.geometry, material);
            this.helper = new three__WEBPACK_IMPORTED_MODULE_2__["FaceNormalsHelper"](this.normal, 2, 0x00ff00, 1);
            this.scene.add(this.helper);
        }
        this.helper.visible = enable;
        this.normal.visible = enable;
    };
    SceneComponent.prototype.axis = function (enable) {
        if (!this.xAxisMesh) {
            var arrowGeometry = new three__WEBPACK_IMPORTED_MODULE_2__["CylinderGeometry"](0, 2 * this.radius, this.height / 5);
            var xAxisMaterial = new three__WEBPACK_IMPORTED_MODULE_2__["MeshBasicMaterial"]({ color: 0xFF0000 });
            var xAxisGeometry = new three__WEBPACK_IMPORTED_MODULE_2__["CylinderGeometry"](this.radius, this.radius, this.height);
            this.xAxisMesh = new three__WEBPACK_IMPORTED_MODULE_2__["Mesh"](xAxisGeometry, xAxisMaterial);
            var xArrowMesh = new three__WEBPACK_IMPORTED_MODULE_2__["Mesh"](arrowGeometry, xAxisMaterial);
            this.xAxisMesh.add(xArrowMesh);
            xArrowMesh.position.y += this.height / 2;
            this.xAxisMesh.rotation.z -= 90 * Math.PI / 180;
            this.xAxisMesh.position.x += this.height / 2;
            this.scene.add(this.xAxisMesh);
            var yAxisMaterial = new three__WEBPACK_IMPORTED_MODULE_2__["MeshBasicMaterial"]({ color: 0x00FF00 });
            var yAxisGeometry = new three__WEBPACK_IMPORTED_MODULE_2__["CylinderGeometry"](this.radius, this.radius, this.height);
            this.yAxisMesh = new three__WEBPACK_IMPORTED_MODULE_2__["Mesh"](yAxisGeometry, yAxisMaterial);
            var yArrowMesh = new three__WEBPACK_IMPORTED_MODULE_2__["Mesh"](arrowGeometry, yAxisMaterial);
            this.yAxisMesh.add(yArrowMesh);
            yArrowMesh.position.y += this.height / 2;
            this.yAxisMesh.position.y += this.height / 2;
            this.scene.add(this.yAxisMesh);
            var zAxisMaterial = new three__WEBPACK_IMPORTED_MODULE_2__["MeshBasicMaterial"]({ color: 0x0000FF });
            var zAxisGeometry = new three__WEBPACK_IMPORTED_MODULE_2__["CylinderGeometry"](this.radius, this.radius, this.height);
            this.zAxisMesh = new three__WEBPACK_IMPORTED_MODULE_2__["Mesh"](zAxisGeometry, zAxisMaterial);
            var zArrowMesh = new three__WEBPACK_IMPORTED_MODULE_2__["Mesh"](arrowGeometry, zAxisMaterial);
            this.zAxisMesh.add(zArrowMesh);
            this.zAxisMesh.rotation.x += 90 * Math.PI / 180;
            zArrowMesh.position.y += this.height / 2;
            this.zAxisMesh.position.z += this.height / 2;
            this.scene.add(this.zAxisMesh);
        }
        this.xAxisMesh.visible = enable;
        this.yAxisMesh.visible = enable;
        this.zAxisMesh.visible = enable;
    };
    SceneComponent.prototype.showGround = function (enable) {
        if (!this.ground) {
            this.ground = new three__WEBPACK_IMPORTED_MODULE_2__["Mesh"](new three__WEBPACK_IMPORTED_MODULE_2__["PlaneGeometry"](500, 500), new three__WEBPACK_IMPORTED_MODULE_2__["MeshBasicMaterial"]({
                color: 0xFF0000,
                transparent: true,
                opacity: 0.3,
                side: three__WEBPACK_IMPORTED_MODULE_2__["DoubleSide"],
            }));
            this.ground.rotateX(Math.PI / 2);
            this.scene.add(this.ground);
        }
        this.ground.visible = enable;
    };
    SceneComponent.prototype.showLayer = function (enable) {
        this.layerHelper.visible = enable;
        lodash__WEBPACK_IMPORTED_MODULE_3__["each"](this.slice, function (slice) {
            slice.visible = enable;
        });
    };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ContentChild"])(_cameras_cameras_component__WEBPACK_IMPORTED_MODULE_4__["CamerasComponent"]),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", _cameras_cameras_component__WEBPACK_IMPORTED_MODULE_4__["CamerasComponent"])
    ], SceneComponent.prototype, "cameraComp", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ContentChild"])(_lights_lights_component__WEBPACK_IMPORTED_MODULE_5__["LightsComponent"]),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", _lights_lights_component__WEBPACK_IMPORTED_MODULE_5__["LightsComponent"])
    ], SceneComponent.prototype, "lightComps", void 0);
    SceneComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Directive"])({
            selector: 'three-scene'
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], SceneComponent);
    return SceneComponent;
}());



/***/ }),

/***/ "./src/app/services/three/stl-loader.service.ts":
/*!******************************************************!*\
  !*** ./src/app/services/three/stl-loader.service.ts ***!
  \******************************************************/
/*! exports provided: StlLoaderService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "StlLoaderService", function() { return StlLoaderService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");



var StlLoaderService = /** @class */ (function () {
    function StlLoaderService() {
    }
    StlLoaderService.prototype.loadStl = function (scene, url, onLoadStl, onProgress, onError) {
        this.load(url, function (geometry) {
            onLoadStl(geometry);
        });
    };
    StlLoaderService.prototype.load = function (absoluteFileName, onLoad, onProgress, onError) {
        var that = this;
        // Loading tar file with an ajax request
        var xhr = new XMLHttpRequest();
        xhr.open("GET", absoluteFileName, true);
        xhr.responseType = "arraybuffer";
        xhr.onreadystatechange = function () {
            if (this.readyState == this.DONE) {
                if (xhr.status == 200) {
                    var byteArray = new Uint8Array(this.response);
                    var geometry = that.parse(this.response);
                    onLoad(geometry);
                }
                else {
                    throw new Error("Error HTTP " + xhr.status + " when loading file : " + absoluteFileName);
                }
            }
        };
        xhr.send(null);
    };
    StlLoaderService.prototype.parse = function (data) {
        var isBinary = function () {
            var expect, face_size, n_faces, reader;
            reader = new DataView(binData);
            face_size = (32 / 8 * 3) + ((32 / 8 * 3) * 3) + (16 / 8);
            n_faces = reader.getUint32(80, true);
            expect = 80 + (32 / 8) + (n_faces * face_size);
            if (expect === reader.byteLength) {
                return true;
            }
            // An ASCII STL data must begin with 'solid ' as the first six bytes.
            // However, ASCII STLs lacking the SPACE after the 'd' are known to be
            // plentiful.  So, check the first 5 bytes for 'solid'.
            // US-ASCII ordinal values for 's', 'o', 'l', 'i', 'd'
            var solid = [115, 111, 108, 105, 100];
            for (var i = 0; i < 5; i++) {
                // If solid[ i ] does not match the i-th byte, then it is not an
                // ASCII STL; hence, it is binary and return true.
                if (solid[i] != reader.getUint8(i, false))
                    return true;
            }
            // First 5 bytes read "solid"; declare it to be an ASCII STL
            return false;
        };
        var binData = this.ensureBinary(data);
        return isBinary() ? this.parseBinary(binData) : this.parseASCII(this.ensureString(data));
    };
    StlLoaderService.prototype.parseBinary = function (data) {
        var reader = new DataView(data);
        var faces = reader.getUint32(80, true);
        var r, g, b, hasColors = false, colors;
        var defaultR, defaultG, defaultB, alpha;
        // process STL header
        // check for default color in header ("COLOR=rgba" sequence).
        for (var index = 0; index < 80 - 10; index++) {
            if ((reader.getUint32(index, false) == 0x434F4C4F /*COLO*/) &&
                (reader.getUint8(index + 4) == 0x52 /*'R'*/) &&
                (reader.getUint8(index + 5) == 0x3D /*'='*/)) {
                hasColors = true;
                colors = [];
                defaultR = reader.getUint8(index + 6) / 255;
                defaultG = reader.getUint8(index + 7) / 255;
                defaultB = reader.getUint8(index + 8) / 255;
                alpha = reader.getUint8(index + 9) / 255;
            }
        }
        var dataOffset = 84;
        var faceLength = 12 * 4 + 2;
        var geometry = new three__WEBPACK_IMPORTED_MODULE_2__["BufferGeometry"]();
        var vertices = [];
        var normals = [];
        for (var face = 0; face < faces; face++) {
            var start = dataOffset + face * faceLength;
            var normalX = reader.getFloat32(start, true);
            var normalY = reader.getFloat32(start + 4, true);
            var normalZ = reader.getFloat32(start + 8, true);
            if (hasColors) {
                var packedColor = reader.getUint16(start + 48, true);
                if ((packedColor & 0x8000) === 0) {
                    // facet has its own unique color
                    r = (packedColor & 0x1F) / 31;
                    g = ((packedColor >> 5) & 0x1F) / 31;
                    b = ((packedColor >> 10) & 0x1F) / 31;
                }
                else {
                    r = defaultR;
                    g = defaultG;
                    b = defaultB;
                }
            }
            for (var i = 1; i <= 3; i++) {
                var vertexstart = start + i * 12;
                vertices.push(reader.getFloat32(vertexstart, true));
                vertices.push(reader.getFloat32(vertexstart + 4, true));
                vertices.push(reader.getFloat32(vertexstart + 8, true));
                normals.push(normalX, normalY, normalZ);
                if (hasColors) {
                    colors.push(r, g, b);
                }
            }
        }
        geometry.addAttribute('position', new three__WEBPACK_IMPORTED_MODULE_2__["BufferAttribute"](new Float32Array(vertices), 3));
        geometry.addAttribute('normal', new three__WEBPACK_IMPORTED_MODULE_2__["BufferAttribute"](new Float32Array(normals), 3));
        if (hasColors) {
            geometry.addAttribute('color', new three__WEBPACK_IMPORTED_MODULE_2__["BufferAttribute"](new Float32Array(colors), 3));
            // geometry.hasColors = true;
            // geometry.alpha = alpha;
        }
        return geometry;
    };
    StlLoaderService.prototype.parseASCII = function (data) {
        var geometry, length, patternFace, patternNormal, patternVertex, result, text;
        geometry = new three__WEBPACK_IMPORTED_MODULE_2__["BufferGeometry"]();
        patternFace = /facet([\s\S]*?)endfacet/g;
        var vertices = [];
        var normals = [];
        var normal = new three__WEBPACK_IMPORTED_MODULE_2__["Vector3"]();
        while ((result = patternFace.exec(data)) !== null) {
            text = result[0];
            patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;
            while ((result = patternNormal.exec(text)) !== null) {
                normal.x = parseFloat(result[1]);
                normal.y = parseFloat(result[3]);
                normal.z = parseFloat(result[5]);
            }
            patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;
            while ((result = patternVertex.exec(text)) !== null) {
                vertices.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));
                normals.push(normal.x, normal.y, normal.z);
            }
        }
        geometry.addAttribute('position', new three__WEBPACK_IMPORTED_MODULE_2__["BufferAttribute"](new Float32Array(vertices), 3));
        geometry.addAttribute('normal', new three__WEBPACK_IMPORTED_MODULE_2__["BufferAttribute"](new Float32Array(normals), 3));
        return geometry;
    };
    StlLoaderService.prototype.ensureString = function (buf) {
        if (typeof buf !== "string") {
            var array_buffer = new Uint8Array(buf);
            var strArray = [];
            for (var i = 0; i < buf.byteLength; i++) {
                strArray.push(String.fromCharCode(array_buffer[i])); // implicitly assumes little-endian
            }
            return strArray.join('');
        }
        else {
            return buf;
        }
    };
    StlLoaderService.prototype.ensureBinary = function (buf) {
        if (typeof buf === "string") {
            var array_buffer = new Uint8Array(buf.length);
            for (var i = 0; i < buf.length; i++) {
                array_buffer[i] = buf.charCodeAt(i) & 0xff; // implicitly assumes little-endian
            }
            return array_buffer.buffer || array_buffer;
        }
        else {
            return buf;
        }
    };
    StlLoaderService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])({
            providedIn: 'root'
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], StlLoaderService);
    return StlLoaderService;
}());



/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
var environment = {
    production: false
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hammerjs */ "./node_modules/hammerjs/hammer.js");
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(hammerjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/platform-browser-dynamic */ "./node_modules/@angular/platform-browser-dynamic/fesm5/platform-browser-dynamic.js");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");





if (_environments_environment__WEBPACK_IMPORTED_MODULE_4__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["enableProdMode"])();
}
Object(_angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_2__["platformBrowserDynamic"])().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_3__["AppModule"])
    .catch(function (err) { return console.error(err); });


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Users/yannick/Documents/git/jarcam/ui/src/main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map