import * as THREE from 'three';
import * as _ from 'lodash';
import { Area } from 'src/app/services/three/area.class';
import { MathUtils } from 'src/app/services/math-utils';
import { StringUtils } from 'src/app/services/string-utils';

class Segment {
    start: THREE.Vector3;
    end: THREE.Vector3;
    linked: boolean;
    normal: THREE.Vector3;
}

export class PlanarUtils {

    /**
     * planar intersect compute
     */
    public static intersect(radius: number, layer: THREE.Plane, group: THREE.Group): Area[] {
        const segments: Segment[] = [];
        // Reset
        const areas: Area[] = [];
        _.each(group.children, (from: THREE.Mesh) => {
            const fromGeometry = (<THREE.Geometry>from.geometry);

            // find all matching faces
            let keep: THREE.Face3[] = PlanarUtils.filter(fromGeometry, layer);

            // find all matching faces
            const manifoldUp: THREE.Face3[] = _.filter(keep, (face: THREE.Face3) => {
                return face.normal.z === 1;
            });

            // find all matching faces
            const manifoldDown: THREE.Face3[] = _.filter(keep, (face: THREE.Face3) => {
                return face.normal.z === -1;
            });

            if (manifoldUp.length > 0) {
                return;
            }

            if (manifoldDown.length > 0) {
                layer.constant += 0.05;
                keep = PlanarUtils.filter(fromGeometry, layer);
            }

            // find all intersections as segments
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
            PlanarUtils.findAllChains(from.name, segments, areas);
        });

        // Sort area by X, then X
        return _.sortBy(areas, (area: Area) => {
            const bound = area.position();
            return bound.y * 1000000 + bound.x;
        });
    }

    /**
     * filter geometry with layer
     * @param geometry geometry
     * @param layer layer
     */
    private static filter(geometry: THREE.Geometry, layer: THREE.Plane): THREE.Face3[] {
        // find all matching faces
        const keep: THREE.Face3[] = _.filter(geometry.faces, (face: THREE.Face3) => {
            const l1 = new THREE.Line3(geometry.vertices[face.a], geometry.vertices[face.b]);
            const l2 = new THREE.Line3(geometry.vertices[face.b], geometry.vertices[face.c]);
            const l3 = new THREE.Line3(geometry.vertices[face.c], geometry.vertices[face.a]);
            const intersect = layer.intersectsLine(l1) || layer.intersectsLine(l2) || layer.intersectsLine(l3);
            const touch = Math.abs(layer.distanceToPoint(geometry.vertices[face.a])) === 0
                || Math.abs(layer.distanceToPoint(geometry.vertices[face.b])) === 0
                || Math.abs(layer.distanceToPoint(geometry.vertices[face.c])) === 0;
            return intersect || touch;
        });
        return keep;
    }

    /**
     * compute all chains
     */
    private static findAllChains(name: string, segments: Segment[], areas: Array<Area>): void {
        let chain: Array<Segment>;
        let offset = 1;
        chain = PlanarUtils.findNextChain(segments);
        while (chain && chain.length > 0) {
            const localArea: Area = new Area(name + '.shape#' + offset++);

            // Build contour
            const geometry = new THREE.Geometry();
            _.each(chain, (element: Segment) => {
                geometry.vertices.push(element.start);
                geometry.vertices.push(element.end);
            });

            localArea.meshes.push(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
                name: 'contour',
                color: 0x3949AB,
                linewidth: 10,
            })));

            // Build normals
            const normals = new THREE.Geometry();
            _.each(chain, (element: Segment) => {
                // First normal
                normals.vertices.push(element.start);
                let end = element.start.clone();
                end.x += element.normal.x;
                end.y += element.normal.y;
                end.z += element.normal.z;
                normals.vertices.push(end);
                // Segment between 2 normals
                normals.vertices.push(element.start);
                normals.vertices.push(element.end);
                // Normal on end vertice
                normals.vertices.push(element.end);
                end = element.end.clone();
                end.x += element.normal.x;
                end.y += element.normal.y;
                end.z += element.normal.z;
                normals.vertices.push(end);
            });

            localArea.normals = new THREE.LineSegments(normals, new THREE.LineBasicMaterial({
                name: 'normals',
                color: 0x000000,
                linewidth: 10,
                visible: true
            }));

            // Build contour for 2D render
            let indice = 0;
            _.each(chain, (element: Segment) => {
                if (indice === 0) {
                    localArea.add(
                        element.start.x,
                        element.start.y,
                        element.normal.x,
                        element.normal.y);
                }
                localArea.add(
                    element.end.x,
                    element.end.y,
                    element.normal.x,
                    element.normal.y);
                indice++;
            });

            areas.push(localArea);

            // Find next chain
            chain = PlanarUtils.findNextChain(segments);
        }
    }

    private static findNextChain(segments: Segment[]): Segment[] {
        const chain: Segment[] = [];
        let current = _.find(segments, (segment) => {
            return segment.linked === false;
        });
        if (current) {
            current.linked = true;
            while (current) {
                chain.push(current);
                current = PlanarUtils.findNext(current, segments);
            }
        }
        return chain;
    }

    private static findNext(current: Segment, segments: Segment[]): Segment {
        const nextByStart = _.find(segments, (it: Segment) => {
            if (it.linked === true) {
                return false;
            }
            return PlanarUtils.compare(current.end, it.start);
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
            return PlanarUtils.compare(current.end, it.end);
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

    /**
     * simple comparaison of two vector
     * @param left left
     * @param right right
     */
    private static compare(left: THREE.Vector3, right: THREE.Vector3): boolean {
        return this.formatter(left.x) === this.formatter(right.x)
            && this.formatter(left.y) === this.formatter(right.y);
    }

    private static formatter(value: number) {
        return StringUtils.format('%5.4f', [value]);
    }
}
