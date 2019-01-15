import * as THREE from 'three';
import { Point } from 'paper';

export class AreaPoint {
    public origin: Point;
    public normal: Point;
}

export class Area {
    public name: string;
    public meshes: THREE.Object3D[];

    public _points: AreaPoint[];

    public isBound = false;

    public constructor(name: string) {
        this.name = name;
        this.meshes = [];
        this._points = [];
    }

    public add(px: number, py: number, nx: number, ny: number) {
        this._points.push({
            origin: new Point(px, py),
            normal: new Point(nx, ny)
        });
    }

    public points() {
        return this._points;
    }

    public isOpen(): boolean {
        return this.area() - this.areaNormal() < 0;
    }

    private area(): number {
        const shape: Array<THREE.Vector2> = [];
        _.each(this._points, (point: AreaPoint) => {
            shape.push(new THREE.Vector2(point.origin.x, point.origin.y));
        });
        return Math.abs(THREE.ShapeUtils.area(shape));
    }

    private areaNormal(): number {
        const shape: Array<THREE.Vector2> = [];
        _.each(this._points, (point: AreaPoint) => {
            shape.push(new THREE.Vector2(point.origin.x + point.normal.x, point.origin.y + point.normal.y));
        });
        return Math.abs(THREE.ShapeUtils.area(shape));
    }
}
