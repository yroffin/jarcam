import * as THREE from 'three';
import * as _ from 'lodash';

class Segment {
    start: THREE.Vector3;
    end: THREE.Vector3;
    normal: THREE.Vector3;
    linked: boolean;
}

export class Normal {
    origin: THREE.Vector3;
    direction: THREE.Vector3;
}

class RayCast {
    meshes: THREE.Object3D[];
    raycasters: Normal[];
}

export class PlanarUtils {

    private _store: RayCast;

    public PlanarUtils() {
    }

    public intersect(layer: THREE.Plane, from: THREE.Mesh) {
        this._store = PlanarUtils.planeIntersect(layer, from);
    }

    get meshes(): THREE.Object3D[] {
        return this._store.meshes;
    }

    get raycasters(): Normal[] {
        return this._store.raycasters;
    }

    public collisisionDetection(scene: THREE.Scene, target: THREE.Mesh, tolerance: number): boolean {
        scene.updateMatrixWorld(false);
        return this.collisisionDetectionRaw(this._store.raycasters, target, tolerance);
    }

    /**
     * find all raycaster touching target with a tolerance distance
     * @param raycasters 
     * @param target 
     * @param tolerance 
     */
    public collisisionDetectionRaw(raycasters: Normal[], target: THREE.Mesh, tolerance: number): boolean {
        // Compute
        let raycaster = new THREE.Raycaster();
        let collision = _.filter(raycasters, (ray) => {
            // Fix origin and destinations
            raycaster.set(ray.origin, ray.direction);
            // Find intersection
            let intersects = raycaster.intersectObject(target, false);
            let touch = _.filter(intersects, (intersect) => {
                // Check tolerance
                return intersect.distance <= tolerance;
            });
            return touch.length > 0;
        });
        return collision.length > 0;
    }

    private static planeIntersect(layer: THREE.Plane, from: THREE.Mesh): RayCast {
        let fromGeometry = (<THREE.Geometry>from.geometry);
        let meshes: THREE.Object3D[] = [];
        let raycasters: Normal[] = [];

        // find all matching faces
        let keep: THREE.Face3[] = _.filter((fromGeometry).faces, (face: THREE.Face3) => {
            let l1 = new THREE.Line3(fromGeometry.vertices[face.a], fromGeometry.vertices[face.b]);
            let l2 = new THREE.Line3(fromGeometry.vertices[face.b], fromGeometry.vertices[face.c]);
            let l3 = new THREE.Line3(fromGeometry.vertices[face.c], fromGeometry.vertices[face.a]);
            return layer.intersectsLine(l1) || layer.intersectsLine(l2) || layer.intersectsLine(l3);
        });

        // find all intersections as segments
        let segments: Segment[] = [];
        _.each(keep, (face) => {
            let l1 = new THREE.Line3(fromGeometry.vertices[face.a], fromGeometry.vertices[face.b]);
            let l2 = new THREE.Line3(fromGeometry.vertices[face.b], fromGeometry.vertices[face.c]);
            let l3 = new THREE.Line3(fromGeometry.vertices[face.c], fromGeometry.vertices[face.a]);
            let arr: THREE.Vector3[] = [];
            let output;
            output = new THREE.Vector3();
            let i1 = layer.intersectLine(l1, output);
            if (i1) arr.push(output);
            output = new THREE.Vector3();
            let i2 = layer.intersectLine(l2, output);
            if (i2) arr.push(output);
            output = new THREE.Vector3();
            let i3 = layer.intersectLine(l3, output);
            if (i3) arr.push(output);

            // push it
            segments.push({
                start: arr[0],
                end: arr[1],
                linked: false,
                normal: face.normal
            });
        });

        // Find all chain
        let chain: Segment[];
        chain = this.findNextChain(segments);
        while (chain && chain.length > 0) {

            let geometry = new THREE.Geometry();
            _.each(chain, (line: Segment) => {
                geometry.vertices.push(line.start);
                geometry.vertices.push(line.end);
                geometry.vertices.push(line.start);
                let target = line.start.clone();
                target.x += line.normal.x;
                target.y += line.normal.y;
                target.z += line.normal.z;
                geometry.vertices.push(target);
                raycasters.push(<Normal>{
                    origin: line.start.clone(),
                    direction: line.normal.clone().normalize()
                });
            });

            let line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
                color: 0x3949AB,
                linewidth: 10,
            }))

            meshes.push(line);

            // Find next chain
            chain = this.findNextChain(segments);
        }

        return {
            meshes: meshes,
            raycasters: raycasters
        }
    }

    private static findNextChain(segments: Segment[]): Segment[] {
        let chain: Segment[] = [];
        let current = _.find(segments, (segment) => {
            return segment.linked === false;
        })
        if (current) {
            current.linked = true;
            while (current) {
                chain.push(current);
                current = this.findNext(current, segments);
            }
        }
        return chain;
    }

    private static findNext(current: Segment, segments: Segment[]): Segment {
        let nextByStart = _.find(segments, (it: Segment) => {
            if (it.linked === true) return false;
            return this.compare(current.end, it.start);
        });
        if (nextByStart) {
            nextByStart.linked = true;
            return {
                start: nextByStart.start,
                end: nextByStart.end,
                normal: nextByStart.normal,
                linked: true
            };
        }
        let nextByEnd = _.find(segments, (it: Segment) => {
            if (it.linked === true) return false;
            return this.compare(current.end, it.end);
        });
        if (nextByEnd) {
            nextByEnd.linked = true;
            return {
                start: nextByEnd.end,
                end: nextByEnd.start,
                normal: nextByEnd.normal,
                linked: true
            };
        }
    }

    private static compare(left: THREE.Vector3, right: THREE.Vector3): boolean {
        return Math.round(left.x * 10000 + Number.EPSILON) / 10000 === Math.round(right.x * 10000 + Number.EPSILON) / 10000
            && Math.round(left.y * 10000 + Number.EPSILON) / 10000 === Math.round(right.y * 10000 + Number.EPSILON) / 10000
            && Math.round(left.z * 10000 + Number.EPSILON) / 10000 === Math.round(right.z * 10000 + Number.EPSILON) / 10000;
    }

}