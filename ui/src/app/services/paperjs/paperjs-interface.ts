import { ShapeGroup, Journey, BrimBean, JourneyClass } from 'src/app/services/paperjs/paperjs-model';
import { Area } from 'src/app/services/three/area.class';
import { ScanPiecesBean } from 'src/app/stores/parameters.service';
import { Group, Path, Point } from 'paper';

export interface PaperJSShapeBrimInterface {
    brim(
        shapes: ShapeGroup,
        segment: Path,
        brimMode: string,
        pointer: Point,
        radius: number, area: Path,
        minx: number, maxx: number, miny: number, maxy: number): boolean;
}

export interface PaperJSShapeBuilderInterface {
    build(areas: Array<Area>, radius: number, domInsert: boolean): ShapeGroup;
}

export interface PaperJSShapeAroundInterface {
    /**
     * compute journey
     * tolerance is used to compute path around for fill path
     */
    around(shapes: ShapeGroup,
        minx: number, maxx: number, miny: number, maxy: number, radius: number, tolerance: number, domInsert: boolean): Journey[];
}

export interface PaperJSSimulatorInterface {
    simulation(journeys: Journey[], radius: number, domInsert: boolean);
}

export interface PaperJSGcodeInterface {
    header(
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        maxz: number, brims: BrimBean[], brimSize: number): string;
    build(
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        current: number,
        maxz: number,
        klass: JourneyClass,
        journeys: Journey[]): string;
    footer(
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        maxz: number, brims: BrimBean[], brimSize: number): string;
}
