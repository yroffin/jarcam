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
    bounds: THREE.Object3D[];
    raycasters: Normal[];
}

export class PlanarUtils {

    private _store: RayCast;

    public PlanarUtils() {
    }

    public intersect(radius: number, layer: THREE.Plane, from: THREE.Mesh) {
        this._store = PlanarUtils.planeIntersect(radius, layer, from);
    }

    get meshes(): THREE.Object3D[] {
        return this._store.meshes;
    }

    get bounds(): THREE.Object3D[] {
        return this._store.bounds;
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
                return intersect.distance < tolerance;
            });
            return touch.length > 0;
        });
        return collision.length > 0;
    }

    /**
     * planar intersect compute
     * @param radius 
     * @param layer 
     * @param from 
     */
    private static planeIntersect(radius: number, layer: THREE.Plane, from: THREE.Mesh): RayCast {
        let fromGeometry = (<THREE.Geometry>from.geometry);
        let meshes: THREE.Object3D[] = [];
        let bounds: THREE.Object3D[] = [];
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
            if (i1) arr.push(output.clone());
            output = new THREE.Vector3();
            let i2 = layer.intersectLine(l2, output);
            if (i2) arr.push(output.clone());
            output = new THREE.Vector3();
            let i3 = layer.intersectLine(l3, output);
            if (i3) arr.push(output.clone());

            // push it
            segments.push({
                start: arr[0],
                end: arr[1],
                linked: false,
                normal: face.normal
            });
        });

        // Find all chain
        this.findAllChains(segments, meshes, raycasters);

        // find all bounds
        this.findAllBounds(radius, bounds, raycasters)

        return {
            meshes: meshes,
            raycasters: raycasters,
            bounds: bounds
        }
    }

    /**
     * compute all chains
     * @param segments 
     * @param meshes 
     * @param raycasters 
     */
    private static findAllChains(segments: Segment[], meshes: THREE.Object3D[], raycasters: Normal[]): void {
        let chain: Segment[];
        chain = this.findNextChain(segments);
        while (chain && chain.length > 0) {

            // Build contour
            let geometry = new THREE.Geometry();
            _.each(chain, (line: Segment) => {
                geometry.vertices.push(line.start);
                geometry.vertices.push(line.end);
            });

            let line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
                name: 'contour',
                color: 0x3949AB,
                linewidth: 10,
            }))

            meshes.push(line);

            // Build raycaster
            let rayGeometry = new THREE.Geometry();
            _.each(chain, (line: Segment) => {
                let direction = line.normal.clone().normalize();

                // Normal has to be store in raycasters with an origin
                // And a destination

                _.each(PlanarUtils.split(line.start, line.end, 0.1), (vertice) => {
                    rayGeometry.vertices.push(vertice);
                    rayGeometry.vertices.push(new THREE.Vector3(vertice.x + direction.x, vertice.y + direction.y, vertice.z + direction.z));
                    raycasters.push(<Normal>{
                        origin: vertice,
                        direction: direction
                    });
                });
            });

            // Build raycaster geometry
            let rayLines = new THREE.LineSegments(rayGeometry, new THREE.LineBasicMaterial({
                name: 'raycasters',
                color: 0x3849BB,
                linewidth: 10,
            }))

            meshes.push(rayLines);

            // Find next chain
            chain = this.findNextChain(segments);
        }
    }

    private static findAllBounds(radius: number, meshes: THREE.Object3D[], raycasters: Normal[]): void {
        let chain: Segment[];
        chain = this.findNextBoundingSegment(radius, raycasters);

        // Build contour
        let geometry = new THREE.Geometry();
        _.each(chain, (line: Segment) => {
            geometry.vertices.push(line.start);
            geometry.vertices.push(line.end);
        });

        let line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
            name: 'bound',
            color: 0x4049AB,
            linewidth: 10,
        }))

        meshes.push(line);

        // Build raycaster
        let rayGeometry = new THREE.Geometry();
        _.each(chain, (line: Segment) => {
            let direction = line.normal.clone().normalize();

            // Normal has to be store in raycasters with an origin
            // And a destination

            _.each(PlanarUtils.split(line.start, line.end, 0.1), (vertice) => {
                rayGeometry.vertices.push(vertice);
                rayGeometry.vertices.push(new THREE.Vector3(vertice.x + direction.x, vertice.y + direction.y, vertice.z + direction.z));
                raycasters.push(<Normal>{
                    origin: vertice,
                    direction: direction
                });
            });
        });

        // Build raycaster geometry
        let rayLines = new THREE.LineSegments(rayGeometry, new THREE.LineBasicMaterial({
            name: 'raycasters',
            color: 0x3849BB,
            linewidth: 10,
        }))

        meshes.push(rayLines);
    }

    /**
     * compute all bounds
     * @param radius 
     * @param bounds 
     * @param raycasters 
     */
    public static findNextBoundingSegment(radius: number, raycasters: Normal[]): Segment[] {
        let segments: Segment[] = [];

        let top: Normal = raycasters[0];
        let bottom: Normal = raycasters[0];
        let left: Normal = raycasters[0];
        let right: Normal = raycasters[0];
        _.each(raycasters, (raycaster: Normal) => {
            if (raycaster.origin.x < top.origin.x) {
                top = raycaster;
            }
            if (raycaster.origin.x > bottom.origin.x) {
                bottom = raycaster;
            }
            if (raycaster.origin.y > right.origin.y) {
                right = raycaster;
            }
            if (raycaster.origin.y < left.origin.y) {
                left = raycaster;
            }
        });

        let topVertice = top.origin.clone();
        let bottomVertice = bottom.origin.clone();
        let leftVertice = left.origin.clone();
        let rightVertice = right.origin.clone();

        topVertice.x -= radius * 2.05;
        bottomVertice.x += radius * 2.05;
        leftVertice.y -= radius * 2.05;
        rightVertice.y += radius * 2.05;

        let topLeft: THREE.Vector3 = topVertice;
        let topRight: THREE.Vector3 = topVertice.clone();
        let bottomRight: THREE.Vector3 = bottomVertice;
        let bottomLeft: THREE.Vector3 = bottomVertice.clone();

        let boundingGeometry = new THREE.Geometry();
        topLeft.y = leftVertice.y;
        topRight.y = rightVertice.y;
        bottomRight.y = rightVertice.y;
        bottomLeft.y = leftVertice.y;

        segments.push({
            start: topLeft.clone(),
            end: topRight.clone(),
            linked: false,
            normal: new THREE.Vector3(1, 0, 0)
        });
        segments.push({
            start: topRight.clone(),
            end: bottomRight.clone(),
            linked: false,
            normal: new THREE.Vector3(0, -1, 0)
        });
        segments.push({
            start: bottomRight.clone(),
            end: bottomLeft.clone(),
            linked: false,
            normal: new THREE.Vector3(-1, 0, 0)
        });
        segments.push({
            start: bottomLeft.clone(),
            end: topLeft.clone(),
            linked: false,
            normal: new THREE.Vector3(0, 1, 0)
        });

        return segments;
    }

    public static split(a: THREE.Vector3, b: THREE.Vector3, distance: number): THREE.Vector3[] {
        let geometry = new THREE.Geometry();
        _.each(PlanarUtils.splitWithDuplicates(a, b, distance), (vertices) => {
            geometry.vertices.push(vertices);
        });
        geometry.mergeVertices();
        return geometry.vertices;
    }

    private static splitWithDuplicates(a: THREE.Vector3, b: THREE.Vector3, distance: number): THREE.Vector3[] {
        let result: THREE.Vector3[] = [];
        let geometry = new THREE.Geometry();
        geometry.vertices.push(a);
        geometry.vertices.push(b);
        geometry.computeBoundingSphere();
        if ((geometry.boundingSphere.radius * 2) > distance) {
            _.each(PlanarUtils.split(a, geometry.boundingSphere.center, distance), (vertice) => {
                result.push(vertice);
            });
            _.each(PlanarUtils.split(geometry.boundingSphere.center, b, distance), (vertice) => {
                result.push(vertice);
            });
            result.push(a);
            result.push(b);
            return result;
        }
        return result;
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