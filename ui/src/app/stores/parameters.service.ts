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

export interface ScanPiecesBean {
  minx: number;
  maxx: number;
  miny: number;
  maxy: number;
  minz: number;
  maxz: number;
  allZ: number[];
}

// State Type
export interface ParametersState {
  layer: LayerBean;
  debug: DebugBean;
  brimMode: string;
  scanPieces: ScanPiecesBean;
}

// Les types des differentes actions
export const CHANGE_LAYER = 'CHANGE_LAYER';
export const CHANGE_DEBUG = 'CHANGE_DEBUG';
export const SCAN_PIECES = 'SCAN_PIECES';
export const CHANGE_BRIMMODE = 'CHANGE_BRIMMODE';

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
export type AllActions = ChangeLayer | ChangeDebug | ScanPieces | ChangeBimMode;


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

  brimMode: 'cross'
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

  // debug
  getScanPieces: Selector<object, ScanPiecesBean>;

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
          scanPieces: state.scanPieces,
          brimMode: state.brimMode
        };
      }

      case CHANGE_BRIMMODE: {
        return {
          layer: state.layer,
          debug: state.debug,
          scanPieces: state.scanPieces,
          brimMode: action.payload.brimMode
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
          brimMode: state.brimMode
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
   * dispatch
   * @param action dispatch action
   */
  public dispatch(action: AllActions) {
    this._store.dispatch(action);
  }
}
