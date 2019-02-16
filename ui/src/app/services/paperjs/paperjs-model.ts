import { Point, Group } from 'paper';
import { Path } from 'paper';

export class MillPosition {
    x: number;
    y: number;
    radius: number;
}

export enum JourneyClass {
    fill,
    contour
}

export class Journey {
    class?: JourneyClass;
    position: Point;
    path: Path;
}

export class PointBean {
    x: number;
    y: number;
}

export class BrimBean {
    points: PointBean[];
}

export class TouchBean {
    id: string;
    touch: Point;
    distance?: number;
}

export class ShapeGroup {
    opened: Group;
    closed: Group;
    openFinePath?: Group;
    closeFinePath?: Group;
    openRawPath?: Group;
    closeRawPath?: Group;
    journeys: Journey[];
}
