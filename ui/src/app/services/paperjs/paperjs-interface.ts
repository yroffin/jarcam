import { ShapeGroup, Journey } from 'src/app/services/paperjs/paperjs-model';
import { Area } from 'src/app/services/three/area.class';
import { ScanPiecesBean } from 'src/app/stores/parameters.service';
import { Group } from 'paper';

export interface PaperJSShapeBuilderInterface {
    build(areas: Array<Area>, radius: number, domInsert: boolean): ShapeGroup;
}

export interface PaperJSShapeAroundInterface {
    around(shapes: ShapeGroup, minx: number, maxx: number, miny: number, maxy: number, radius: number, domInsert: boolean): Journey[];
}

export interface PaperJSSimulatorInterface {
    simulation(journeys: Journey[], radius: number, domInsert: boolean);
}

export interface PaperJSGcodeInterface {
    build(
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        current: number,
        maxz: number,
        radius: number,
        journeys: Journey[]): string;
}
