import * as THREE from 'three';
import * as _ from 'lodash';
import { Area } from 'src/app/services/three/area.class';

class Segment {
    start: THREE.Vector3;
    end: THREE.Vector3;
    linked: boolean;
    normal: THREE.Vector3;
}

export class PlanarUtils {

    public areas: Array<Area>;

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
    }

    /**
     * compute all chains
     */
    private findAllChains(segments: Segment[], areas: Array<Area>): void {
        let chain: Array<Segment>;
        let offset = 1;
        chain = this.findNextChain(segments);
        while (chain && chain.length > 0) {
            const localArea: Area = new Area('shape#' + offset++);

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

            let indice = 0;
            _.each(chain, (element: Segment) => {
                if (indice === 0) {
                    localArea.add(element.start.x, element.start.y, element.normal.x, element.normal.y);
                }
                localArea.add(element.end.x, element.end.y, element.normal.x, element.normal.y);
                indice++;
            });

            localArea.meshes.push(lineSegment);

            areas.push(localArea);

            // Find next chain
            chain = this.findNextChain(segments);
        }
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