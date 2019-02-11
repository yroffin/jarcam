import { Point, Group } from 'paper';
import { Path } from 'paper';

export class MillPosition {
    x: number;
    y: number;
    radius: number;
}

export class Journey {
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
    openPath?: Group;
    closePath?: Group;
    journeys: Journey[];
}
