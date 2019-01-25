import { Point, Group } from 'paper';
import { Path } from 'paper';

export class Journey {
    position: Point;
    path: Path;
}

export class ShapeGroup {
    opened: Group;
    closed: Group;
    openPath?: Group;
    closePath?: Group;
    aroundJourney?: Journey[];
}
