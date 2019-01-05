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

export class Area {
    public meshes: THREE.Object3D[];
    public raycasters: Normal[];
    public isBound: boolean;
}

export class PlanarUtils {

    public areas: Area[];

    public bounds: THREE.Object3D[];
    public topLeft: THREE.Vector3;
    public topRight: THREE.Vector3;
    public bottomRight: THREE.Vector3;
    public bottomLeft: THREE.Vector3;

    public PlanarUtils() {
    }

    public intersect(radius: number, layer: THREE.Plane, from: THREE.Mesh) {
        this.planeIntersect(radius, layer, from);
    }

    public collisisionDetection(scene: THREE.Scene, target: THREE.Mesh, tolerance: number): boolean {
        scene.updateMatrixWorld(false);
        return this.collisisionDetectionRaw(this.areas, target, tolerance);
    }

    /**
     * find all raycaster touching target with a tolerance distance
     */
    public collisisionDetectionRaw(areas: Area[], target: THREE.Mesh, tolerance: number): boolean {
        const touched = _.filter(areas, (area) => {
            // Compute
            const raycaster = new THREE.Raycaster();
            const collision = _.filter(area.raycasters, (ray) => {
                // Fix origin and destinations
                raycaster.set(ray.origin, ray.direction);
                // Find intersection
                const intersects = raycaster.intersectObject(target, false);
                const touch = _.filter(intersects, (intersect) => {
                    // Check tolerance
                    return intersect.distance < tolerance;
                });
                return touch.length > 0;
            });
            return collision.length > 0;
        });
        return touched.length > 0;
    }

    /**
     * planar intersect compute
     */
    private planeIntersect(radius: number, layer: THREE.Plane, from: THREE.Mesh): void {
        const fromGeometry = (<THREE.Geometry>from.geometry);

        // Reset
        this.bounds = [];
        this.areas = [];

        // find all matching faces
        const keep: THREE.Face3[] = _.filter((fromGeometry).faces, (face: THREE.Face3) => {
            const l1 = new THREE.Line3(fromGeometry.vertices[face.a], fromGeometry.vertices[face.b]);
            const l2 = new THREE.Line3(fromGeometry.vertices[face.b], fromGeometry.vertices[face.c]);
            const l3 = new THREE.Line3(fromGeometry.vertices[face.c], fromGeometry.vertices[face.a]);
            return layer.intersectsLine(l1) || layer.intersectsLine(l2) || layer.intersectsLine(l3);
        });

        // find all intersections as segments
        const segments: Segment[] = [];
        _.each(keep, (face) => {
            const l1 = new THREE.Line3(fromGeometry.vertices[face.a], fromGeometry.vertices[face.b]);
            const l2 = new THREE.Line3(fromGeometry.vertices[face.b], fromGeometry.vertices[face.c]);
            const l3 = new THREE.Line3(fromGeometry.vertices[face.c], fromGeometry.vertices[face.a]);
            const arr: THREE.Vector3[] = [];
            let output;
            output = new THREE.Vector3();
            const i1 = layer.intersectLine(l1, output);
            if (i1) {
                arr.push(output.clone());
            }
            output = new THREE.Vector3();
            const i2 = layer.intersectLine(l2, output);
            if (i2) {
                arr.push(output.clone());
            }
            output = new THREE.Vector3();
            const i3 = layer.intersectLine(l3, output);
            if (i3) {
                arr.push(output.clone());
            }

            // push it
            segments.push({
                start: arr[0],
                end: arr[1],
                linked: false,
                normal: face.normal
            });
        });

        // Find all chain
        this.findAllChains(segments, this.areas);

        // find all bounds
        this.findAllBounds(radius, this.areas);
    }

    /**
     * compute all chains
     */
    private findAllChains(segments: Segment[], areas: Array<Area>): void {
        let chain: Array<Segment>;
        chain = this.findNextChain(segments);
        while (chain && chain.length > 0) {
            const localArea: Area = {
                isBound: false,
                meshes: [],
                raycasters: []
            };

            // Build contour
            const geometry = new THREE.Geometry();
            _.each(chain, (element: Segment) => {
                geometry.vertices.push(element.start);
                geometry.vertices.push(element.end);
            });

            const lineSegment = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
                name: 'contour',
                color: 0x3949AB,
                linewidth: 10,
            }));

            localArea.meshes.push(lineSegment);

            // Build raycaster
            const rayGeometry = new THREE.Geometry();
            _.each(chain, (element: Segment) => {
                const direction = element.normal.clone().normalize();

                // Normal has to be store in raycasters with an origin
                // And a destination

                _.each(this.split(element.start, element.end, 0.1), (vertice) => {
                    rayGeometry.vertices.push(vertice);
                    rayGeometry.vertices.push(new THREE.Vector3(vertice.x + direction.x, vertice.y + direction.y, vertice.z + direction.z));
                    localArea.raycasters.push(<Normal>{
                        origin: vertice,
                        direction: direction
                    });
                });
            });

            // Build raycaster geometry
            const rayLines = new THREE.LineSegments(rayGeometry, new THREE.LineBasicMaterial({
                name: 'raycasters',
                color: 0x3849BB,
                linewidth: 10,
            }));

            localArea.meshes.push(rayLines);

            areas.push(localArea);

            // Find next chain
            chain = this.findNextChain(segments);
        }
    }

    private findAllBounds(radius: number, areas: Array<Area>): void {
        let chain: Segment[];
        chain = this.findNextBoundingSegment(radius, areas);

        const localArea: Area = {
            isBound: true,
            meshes: [],
            raycasters: []
        };

        // Build contour
        const geometry = new THREE.Geometry();
        _.each(chain, (line: Segment) => {
            geometry.vertices.push(line.start);
            geometry.vertices.push(line.end);
        });

        const lineSegment = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
            name: 'bound',
            color: 0x4049AB,
            linewidth: 10,
        }));

        localArea.meshes.push(lineSegment);

        // Build raycaster
        const rayGeometry = new THREE.Geometry();
        _.each(chain, (line: Segment) => {
            const direction = line.normal.clone().normalize();

            // Normal has to be store in raycasters with an origin
            // And a destination

            _.each(this.split(line.start, line.end, 0.1), (vertice) => {
                rayGeometry.vertices.push(vertice);
                rayGeometry.vertices.push(new THREE.Vector3(vertice.x + direction.x, vertice.y + direction.y, vertice.z + direction.z));
                localArea.raycasters.push(<Normal>{
                    origin: vertice,
                    direction: direction
                });
            });
        });

        // Build raycaster geometry
        const rayLines = new THREE.LineSegments(rayGeometry, new THREE.LineBasicMaterial({
            name: 'raycasters',
            color: 0x3849BB,
            linewidth: 10,
        }));

        localArea.meshes.push(rayLines);

        // Add this local area
        areas.push(localArea);
    }

    /**
     * compute all bounds
     */
    public findNextBoundingSegment(radius: number, areas: Array<Area>): Segment[] {
        const segments: Segment[] = [];

        let top: Normal = areas[0].raycasters[0];
        let bottom: Normal = areas[0].raycasters[0];
        let left: Normal = areas[0].raycasters[0];
        let right: Normal = areas[0].raycasters[0];

        _.each(areas, (area) => {
            _.each(area.raycasters, (raycaster: Normal) => {
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

            const topVertice = top.origin.clone();
            const bottomVertice = bottom.origin.clone();
            const leftVertice = left.origin.clone();
            const rightVertice = right.origin.clone();

            topVertice.x -= radius * 2.05;
            bottomVertice.x += radius * 2.05;
            leftVertice.y -= radius * 2.05;
            rightVertice.y += radius * 2.05;

            this.topLeft = topVertice;
            this.topRight = topVertice.clone();
            this.bottomRight = bottomVertice;
            this.bottomLeft = bottomVertice.clone();

            const boundingGeometry = new THREE.Geometry();
            this.topLeft.y = leftVertice.y;
            this.topRight.y = rightVertice.y;
            this.bottomRight.y = rightVertice.y;
            this.bottomLeft.y = leftVertice.y;
        });

        segments.push({
            start: this.topLeft.clone(),
            end: this.topRight.clone(),
            linked: false,
            normal: new THREE.Vector3(1, 0, 0)
        });
        segments.push({
            start: this.topRight.clone(),
            end: this.bottomRight.clone(),
            linked: false,
            normal: new THREE.Vector3(0, -1, 0)
        });
        segments.push({
            start: this.bottomRight.clone(),
            end: this.bottomLeft.clone(),
            linked: false,
            normal: new THREE.Vector3(-1, 0, 0)
        });
        segments.push({
            start: this.bottomLeft.clone(),
            end: this.topLeft.clone(),
            linked: false,
            normal: new THREE.Vector3(0, 1, 0)
        });

        return segments;
    }

    public split(a: THREE.Vector3, b: THREE.Vector3, distance: number): THREE.Vector3[] {
        const geometry = new THREE.Geometry();
        _.each(this.splitWithDuplicates(a, b, distance), (vertices) => {
            geometry.vertices.push(vertices);
        });
        geometry.mergeVertices();
        return geometry.vertices;
    }

    private splitWithDuplicates(a: THREE.Vector3, b: THREE.Vector3, distance: number): THREE.Vector3[] {
        const result: THREE.Vector3[] = [];
        const geometry = new THREE.Geometry();
        geometry.vertices.push(a);
        geometry.vertices.push(b);
        geometry.computeBoundingSphere();
        if ((geometry.boundingSphere.radius * 2) > distance) {
            _.each(this.split(a, geometry.boundingSphere.center, distance), (vertice) => {
                result.push(vertice);
            });
            _.each(this.split(geometry.boundingSphere.center, b, distance), (vertice) => {
                result.push(vertice);
            });
            result.push(a);
            result.push(b);
            return result;
        }
        return result;
    }

    private findNextChain(segments: Segment[]): Segment[] {
        const chain: Segment[] = [];
        let current = _.find(segments, (segment) => {
            return segment.linked === false;
        });
        if (current) {
            current.linked = true;
            while (current) {
                chain.push(current);
                current = this.findNext(current, segments);
            }
        }
        return chain;
    }

    private findNext(current: Segment, segments: Segment[]): Segment {
        const nextByStart = _.find(segments, (it: Segment) => {
            if (it.linked === true) {
                return false;
            }
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
        const nextByEnd = _.find(segments, (it: Segment) => {
            if (it.linked === true) {
                return false;
            }
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

    private compare(left: THREE.Vector3, right: THREE.Vector3): boolean {
        return Math.round(left.x * 10000 + Number.EPSILON) / 10000 === Math.round(right.x * 10000 + Number.EPSILON) / 10000
            && Math.round(left.y * 10000 + Number.EPSILON) / 10000 === Math.round(right.y * 10000 + Number.EPSILON) / 10000
            && Math.round(left.z * 10000 + Number.EPSILON) / 10000 === Math.round(right.z * 10000 + Number.EPSILON) / 10000;
    }

}