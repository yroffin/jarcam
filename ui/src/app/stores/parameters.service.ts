import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Selector } from '@ngrx/store';
import { BrimBean } from 'src/app/services/paperjs/paperjs-model';
import * as _ from 'lodash';

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

export interface ScanPiecesBean {
  minx: number;
  maxx: number;
  miny: number;
  maxy: number;
  minz: number;
  maxz: number;
  allZ: number[];
}

export interface ParametersBean {
  radius: number;
  slice: number;
}

// State Type
export interface ParametersState {
  layer: LayerBean;
  debug: DebugBean;
  brimMode: string;
  parameters: ParametersBean;
  scanPieces: ScanPiecesBean;
  brims: BrimBean[];
}

// Les types des differentes actions
export const CHANGE_LAYER = 'CHANGE_LAYER';
export const CHANGE_DEBUG = 'CHANGE_DEBUG';
export const SCAN_PIECES = 'SCAN_PIECES';
export const CHANGE_BRIMMODE = 'CHANGE_BRIMMODE';
export const CHANGE_RADIUS = 'CHANGE_RADIUS';
export const CHANGE_SLICE = 'CHANGE_SLICE';
export const SET_BRIM = 'SET_BRIM';

// Les actions
export class ChangeLayer implements Action {
  readonly type = CHANGE_LAYER;
  payload: any;
}

export class ChangeBimMode implements Action {
  readonly type = CHANGE_BRIMMODE;
  payload: any;
}

export class ChangeDebug implements Action {
  readonly type = CHANGE_DEBUG;
  payload: any;
}

export class ScanPieces implements Action {
  readonly type = SCAN_PIECES;
  payload: any;
}

export class ChangeRadius implements Action {
  readonly type = CHANGE_RADIUS;
  payload: any;
}

export class ChangeSlice implements Action {
  readonly type = CHANGE_SLICE;
  payload: any;
}

export class AddBrim implements Action {
  readonly type = SET_BRIM;
  payload: any;
}

export type AllActions = ChangeLayer | ChangeDebug | ScanPieces | ChangeBimMode | ChangeRadius | ChangeSlice | AddBrim;


// Initial state
export const initialState: ParametersState = {
  // layers
  layer: {
    visible: true,
    top: 0,
  },

  // debug
  debug: {
    axesHelper: true,
    wireframe: false,
    normals: false,
    ground: false
  },

  // pieces
  scanPieces: {
    minx: 0,
    maxx: 0,
    miny: 0,
    maxy: 0,
    minz: 0,
    maxz: 0,
    allZ: []
  },

  parameters: {
    radius: 4,
    slice: 0.5,
  },

  brimMode: 'cross',
  brims: []
};

@Injectable({
  providedIn: 'root'
})
export class ParametersService {

  // globalState
  getParametersState: any;

  // layerState
  getLayerState: Selector<object, LayerBean>;

  // debug
  getDebugState: Selector<object, DebugBean>;

  // scan piece
  getScanPieces: Selector<object, ScanPiecesBean>;

  // radius
  getRadius: Selector<object, number>;

  // slice
  getSlice: Selector<object, number>;

  // brims
  getBrims: Selector<object, BrimBean[]>;

  // parameters
  getParameterss: Selector<object, ParametersBean>;

  constructor(
    private _store: Store<ParametersState>
  ) {
    // globalState
    this.getParametersState = createFeatureSelector<ParametersState>('parameters');

    // layerState
    this.getLayerState = createSelector(this.getParametersState, (state: ParametersState) => state.layer);

    // debugState
    this.getDebugState = createSelector(this.getParametersState, (state: ParametersState) => state.debug);

    // scanPieces
    this.getScanPieces = createSelector(this.getParametersState, (state: ParametersState) => state.scanPieces);

    // radius
    this.getRadius = createSelector(this.getParametersState, (state: ParametersState) => state.parameters.radius);

    // slice
    this.getSlice = createSelector(this.getParametersState, (state: ParametersState) => state.parameters.slice);

    // brims
    this.getBrims = createSelector(this.getParametersState, (state: ParametersState) => state.brims);

    // parameters
    this.getParameterss = createSelector(this.getParametersState, (state: ParametersState) => state.parameters);
  }

  // REDUCER
  public static reducer(
    state = initialState,
    action: AllActions
  ): ParametersState {
    switch (action.type) {
      case SET_BRIM: {
        return {
          layer: state.layer,
          debug: state.debug,
          scanPieces: state.scanPieces,
          brimMode: state.brimMode,
          parameters: state.parameters,
          brims: _.concat([], action.payload.brim)
        };
      }

      case CHANGE_LAYER: {
        return {
          layer: action.payload,
          debug: state.debug,
          scanPieces: state.scanPieces,
          brimMode: state.brimMode,
          parameters: state.parameters,
          brims: state.brims
        };
      }

      case CHANGE_BRIMMODE: {
        return {
          layer: state.layer,
          debug: state.debug,
          scanPieces: state.scanPieces,
          brimMode: action.payload.brimMode,
          parameters: state.parameters,
          brims: state.brims
        };
      }

      case CHANGE_RADIUS: {
        return {
          layer: state.layer,
          debug: state.debug,
          scanPieces: state.scanPieces,
          brimMode: state.brimMode,
          parameters: {
            slice: state.parameters.slice,
            radius: action.payload.radius
          },
          brims: state.brims
        };
      }

      case CHANGE_SLICE: {
        return {
          layer: state.layer,
          debug: state.debug,
          scanPieces: state.scanPieces,
          brimMode: state.brimMode,
          parameters: {
            slice: action.payload.slice,
            radius: state.parameters.radius
          },
          brims: state.brims
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
          scanPieces: state.scanPieces,
          brimMode: state.brimMode,
          parameters: state.parameters,
          brims: state.brims
        };
        return nstate;
      }

      case SCAN_PIECES: {
        return {
          layer: state.layer,
          debug: state.debug,
          scanPieces: {
            minx: action.payload.minx,
            maxx: action.payload.maxx,
            miny: action.payload.miny,
            maxy: action.payload.maxy,
            minz: action.payload.minz,
            maxz: action.payload.maxz,
            allZ: action.payload.allZ
          },
          parameters: state.parameters,
          brims: state.brims,
          brimMode: state.brimMode
        };
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
     * select this store service
     */
  public scanPieces(): Observable<ScanPiecesBean> {
    return this._store.select(this.getScanPieces);
  }

  /**
   * select this store service
   */
  public radius(): Observable<number> {
    return this._store.select(this.getRadius);
  }

  /**
   * select this store service
   */
  public slice(): Observable<number> {
    return this._store.select(this.getSlice);
  }

  /**
   * select this store service
   */
  public brims(): Observable<BrimBean[]> {
    return this._store.select(this.getBrims);
  }

  /**
   * select this store service
   */
  public parameters(): Observable<ParametersBean> {
    return this._store.select(this.getParameterss);
  }

  /**
   * dispatch
   * @param action dispatch action
   */
  public dispatch(action: AllActions) {
    console.log('dispatch', action.type, action.payload);
    this._store.dispatch(action);
  }
}
