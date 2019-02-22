import * as THREE from 'three';
import * as _ from 'lodash';
import { Area } from 'src/app/services/three/area.class';
import { MathUtils } from 'src/app/services/math-utils';
import { StringUtils } from 'src/app/services/string-utils';
import { Point, Path, Group, CompoundPath } from 'paper';

class MetaData {
    public guid: string;
    public ordered: boolean;
    public normal: Point;
    private z: number;

    constructor(z: number, normal: Point) {
        this.ordered = false;
        this.normal = normal;
        this.z = z;
        this.guid = undefined;
    }

    public vector(point: Point, z: number): THREE.Vector3 {
        return new THREE.Vector3(point.x, point.y, z);
    }
}

export class PlanarUtils {

    /**
     * planar intersect compute
     */
    public static intersect(radius: number, layer: THREE.Plane, group: THREE.Group): Area[] {
        // Reset
        const areas: Area[] = [];
        _.each(group.children, (from: THREE.Mesh) => {
            const lines: Path.Line[] = [];
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
                layer.constant += 0.1;
                keep = PlanarUtils.filter(fromGeometry, layer);
            }

            // find all intersections as segments
            _.each(keep, (face) => {
                const l1 = new THREE.Line3(fromGeometry.vertices[face.a], fromGeometry.vertices[face.b]);
                const l2 = new THREE.Line3(fromGeometry.vertices[face.b], fromGeometry.vertices[face.c]);
                const l3 = new THREE.Line3(fromGeometry.vertices[face.a], fromGeometry.vertices[face.c]);
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
                const line = new Path.Line({
                    from: new Point(arr[0].x, arr[0].y),
                    to: new Point(arr[1].x, arr[1].y),
                    intert: false,
                    data: new MetaData(layer.constant, new Point(face.normal.x, face.normal.y))
                });
                lines.push(line);
            });

            // Find all chain
            PlanarUtils.findAllChains(from.name, lines, areas);
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
    private static createGroups(lines: Path.Line[]): Group[] {
        let remainder = _.filter(lines, (line) => {
            return !line.data.guid;
        });
        const groups: Group[] = [];
        while (remainder.length !== 0) {
            // Compute order
            const newGroup = this.orderGroup(remainder);
            // Push it
            groups.push(newGroup);
            // Fix remainder
            remainder = _.filter(lines, (line) => {
                return !line.data.guid;
            });
        }
        return groups;
    }

    /**
     * order group
     * @param group group to order
     */
    private static orderGroup(lines: Path.Line[]): Group {
        const guid = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

        const group = new Group();
        group.data = guid();

        // find first line with no guid
        let current = _.find(lines, (line) => {
            return !line.data.guid;
        });
        current.data.guid = group.data;
        group.addChild(current);
        while (current !== undefined) {
            const remainder = _.filter(lines, (line: Path.Line) => {
                return !line.data.guid;
            });
            let newCurrent = this.findByStart(current, remainder);
            if (newCurrent) {
                newCurrent.data.guid = group.data;
                group.addChild(newCurrent);
                current = newCurrent;
            } else {
                newCurrent = this.findByEnd(current, remainder);
                if (newCurrent) {
                    newCurrent.reverse();
                    newCurrent.data.guid = group.data;
                    group.addChild(newCurrent);
                    current = newCurrent;
                } else {
                    current = newCurrent;
                }
            }
        }

        return group;
    }

    private static findByStart(current: Path.Line, lines: Path.Line[]): Path.Line {
        return _.find(lines, (line) => {
            return current.getPointAt(current.length).getDistance(line.getPointAt(0)) < 0.001;
        });
    }

    private static findByEnd(current: Path.Line, lines: Path.Line[]): Path.Line {
        return _.find(lines, (line) => {
            return current.getPointAt(current.length).getDistance(line.getPointAt(line.length)) < 0.001;
        });
    }

    /**
     * compute all chains
     */
    private static findAllChains(name: string, lines: Path.Line[], areas: Array<Area>): void {
        // Add a group
        const groups = this.createGroups(lines);

        let offset = 1;
        _.each(groups, (group) => {
            const localArea: Area = new Area(name + '.shape#' + offset++);

            let index = 0;

            // Build contour
            const geometry = new THREE.Geometry();
            _.each(group.children, (element: Path.Line) => {
                geometry.vertices.push(element.data.vector(element.getPointAt(0), element.data.z));
                geometry.vertices.push(element.data.vector(element.getPointAt(element.length), element.data.z));
            });

            localArea.meshes.push(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
                name: 'contour',
                color: 0x3949AB,
                linewidth: 10,
            })));

            // Build normals
            const normals = new THREE.Geometry();
            _.each(group.children, (element: Path.Line) => {
                const from = element.data.vector(element.getPointAt(0), element.data.z);
                const to = element.data.vector(element.getPointAt(element.length), element.data.z);
                // First normal
                normals.vertices.push(from);
                let end = from.clone();
                end.x += element.data.normal.x;
                end.y += element.data.normal.y;
                end.z += element.data.normal.z;
                normals.vertices.push(end);
                // Segment between 2 normals
                normals.vertices.push(from);
                normals.vertices.push(to);
                // Normal on end vertice
                normals.vertices.push(to);
                end = to.clone();
                end.x += element.data.normal.x;
                end.y += element.data.normal.y;
                end.z += element.data.normal.z;
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
            _.each(group.children, (element: Path.Line) => {
                const from = element.data.vector(element.getPointAt(0), element.data.z);
                const to = element.data.vector(element.getPointAt(element.length), element.data.z);
                if (indice === 0) {
                    localArea.add(
                        from.x,
                        from.y,
                        element.data.normal.x,
                        element.data.normal.y);
                }
                localArea.add(
                    to.x,
                    to.y,
                    element.data.normal.x,
                    element.data.normal.y);
                indice++;
            });

            areas.push(localArea);
        });
    }
}
