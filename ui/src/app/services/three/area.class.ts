import * as THREE from 'three';
import { Point } from 'paper';
import * as _ from 'lodash';

export class AreaPoint {
    public origin: Point;
    public normal: Point;
}

export class Area {
    public name: string;
    public meshes: THREE.Object3D[];
    public normals: THREE.Object3D;

    private internalPoints: AreaPoint[];

    public constructor(name: string) {
        this.name = name;
        this.meshes = [];
        this.internalPoints = [];
    }

    public add(px: number, py: number, nx: number, ny: number) {
        if (this.internalPoints.length > 0) {
            if (this.internalPoints[0].origin.x === px && this.internalPoints[0].origin.y === py) {
                return;
            }
        }
        this.internalPoints.push({
            origin: new Point(px, py),
            normal: new Point(nx, ny)
        });
    }

    public points() {
        return this.internalPoints;
    }

    public isOpen(): boolean {
        return (this.area() - this.areaNormal()) < 0;
    }

    public area(): number {
        const shape: Array<THREE.Vector2> = [];
        _.each(this.internalPoints, (point: AreaPoint) => {
            shape.push(new THREE.Vector2(point.origin.x, point.origin.y));
        });
        return Math.abs(THREE.ShapeUtils.area(shape));
    }

    public areaNormal(): number {
        const shape: Array<THREE.Vector2> = [];
        _.each(this.internalPoints, (point: AreaPoint) => {
            shape.push(new THREE.Vector2(point.origin.x + point.normal.x, point.origin.y + point.normal.y));
        });
        return Math.abs(THREE.ShapeUtils.area(shape));
    }
}
