import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Selector } from '@ngrx/store';

// State Type
export interface AppState {
  feature: ParametersState;
}

export interface LayerBean {
  visible: boolean;
  top: number;
}

export interface DebugBean {
  axesHelper: boolean;
  wireframe: boolean;
  normals: boolean;
  ground: boolean;
}

// State Type
export interface ParametersState {
  layer: LayerBean;
  debug: DebugBean;
  camera: any;
}

// Les types des differentes actions
export const CHANGE_LAYER = 'CHANGE_LAYER';
export const CHANGE_DEBUG = 'CHANGE_DEBUG';

// Les actions
export class ChangeLayer implements Action {
  readonly type = CHANGE_LAYER;
  payload: any;
}

export class ChangeDebug implements Action {
  readonly type = CHANGE_DEBUG;
  payload: any;
}

export type AllActions = ChangeLayer | ChangeDebug;

// Initial state
export const initialState: ParametersState = {
  // layers
  layer: {
    visible: true,
    top: 6836,
  },

  // debug
  debug: {
    axesHelper: true,
    wireframe: false,
    normals: false,
    ground: false
  },

  // Camera
  camera: {
    position: { x: 0, y: 0, z: 0 },
  },
};

@Injectable({
  providedIn: 'root'
})
export class ParametersService {

  // globalState
  getParametersState: any;

  // layerState
  getLayerState: Selector<object, LayerBean>;

  // cameraState
  getDebugState: Selector<object, DebugBean>;

  constructor(
    private _store: Store<ParametersState>
  ) {
    // globalState
    this.getParametersState = createFeatureSelector<ParametersState>('parameters');

    // layerState
    this.getLayerState = createSelector(this.getParametersState, (state: ParametersState) => state.layer);

    // debugState
    this.getDebugState = createSelector(this.getParametersState, (state: ParametersState) => state.debug);
  }

  // REDUCER
  public static reducer(
    state = initialState,
    action: AllActions
  ): ParametersState {
    switch (action.type) {
      case CHANGE_LAYER: {
        return {
          layer: action.payload,
          debug: state.debug,
          camera: state.camera
        };
      }

      case CHANGE_DEBUG: {
        const nstate = {
          layer: state.layer,
          debug: {
            axesHelper: action.payload.axesHelper === undefined ? state.debug.axesHelper : action.payload.axesHelper,
            wireframe: action.payload.wireframe === undefined ? state.debug.wireframe : action.payload.wireframe,
            normals: action.payload.normals === undefined ? state.debug.normals : action.payload.normals,
            ground: action.payload.ground === undefined ? state.debug.ground : action.payload.ground,
          },
          camera: state.camera
        };
        return nstate;
      }

      default:
        return state;
    }
  }

  /**
     * select this store service
     */
  public layers(): Observable<LayerBean> {
    return this._store.select(this.getLayerState);
  }

  /**
     * select this store service
     */
  public debugs(): Observable<DebugBean> {
    return this._store.select(this.getDebugState);
  }

  /**
 * dispatch
 * @param action dispatch action
 */
  public dispatch(action: AllActions) {
    this._store.dispatch(action);
  }
}
