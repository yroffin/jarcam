import * as THREE from 'three';
import * as _ from 'lodash';
import { Area } from 'src/app/services/three/area.class';
import { MathUtils } from 'src/app/services/math-utils';
import { StringUtils } from 'src/app/services/string-utils';
import { Point, Path, Group, CompoundPath } from 'paper';

class Segment {
    public from: Point;
    public to: Point;
    private linked: boolean;
    private tag: number;
    private norm: Point;
    private z: number;

    private _from: THREE.Vector3;
    private _to: THREE.Vector3;
    private _normal: THREE.Vector3;

    constructor(x1: number, y1: number, x2: number, y2: number, nx: number, ny: number, z: number, linked: boolean) {
        this.from = new Point(x1, y1);
        this.to = new Point(x2, y2);
        this.linked = linked;
        this.norm = new Point(nx, ny);
        this.z = z;
        this.tag = -1;

        this._from = new THREE.Vector3(this.from.x, this.from.y, this.z);
        this._to = new THREE.Vector3(this.to.x, this.to.y, this.z);
        this._normal = new THREE.Vector3(this.norm.x, this.norm.y, this.z);
    }

    public isTagged(tag: number): boolean {
        return this.tag === tag;
    }

    public setTag(tag: number): void {
        this.tag = tag;
    }

    public getFrom(): THREE.Vector3 {
        return this._from;
    }

    public getTo(): THREE.Vector3 {
        return this._to;
    }

    public getNormal(): THREE.Vector3 {
        return this._normal;
    }

    public getZ(): number {
        return this.z;
    }

    public isLinked(): boolean {
        return this.linked;
    }
}

class MetaData {
    public guid: string;
    public ordered: boolean;
    public normal: THREE.Vector3;
    private z: number;

    constructor(z: number, normal: THREE.Vector3) {
        this.ordered = false;
        this.normal = normal;
        this.z = z;
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
                const segment = new Segment(arr[0].x, arr[0].y, arr[1].x, arr[1].y, face.normal.x, face.normal.y, layer.constant, false);
                segments.push(segment);
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
    private static createGroups(lines: Path.Line[]): Group[] {
        let reste = _.filter(lines, (line) => {
            return !line.data.guid;
        });
        const groups: Group[] = [];
        while (reste.length !== 0) {
            // Build group
            const group = this.hittest(reste);
            // Compute order
            const newGroup = this.orderGroup(group);
            newGroup.data = group.data;
            group.remove();
            // Push it
            groups.push(newGroup);
            // Fix remainder
            reste = _.filter(lines, (line) => {
                return !line.data.guid;
            });
        }
        return groups;
    }

    /**
     * order group
     * @param group group to order
     */
    private static orderGroup(group: Group): Group {
        const newGroup = new Group();
        _.each(group.children, (line: Path.Line) => {
            console.log(`${line.getPointAt(0)} => ${line.getPointAt(line.length)}`);
        });
        console.log(`done`);
        let current: Path.Line = <Path.Line>group.children[0];
        current.data.ordered = true;
        newGroup.addChild(current);
        while (current !== undefined) {
            console.log(`${current.getPointAt(0)} => ${current.getPointAt(current.length)}`);
            const remainder = _.filter(group.children, (line: Path.Line) => {
                return !line.data.ordered;
            });
            let newCurrent = this.findByStart(current, remainder);
            if (newCurrent) {
                newCurrent.data.ordered = true;
                newGroup.addChild(newCurrent);
                current = newCurrent;
            } else {
                newCurrent = this.findByEnd(current, remainder);
                if (newCurrent) {
                    newCurrent.reverse();
                    newCurrent.data.ordered = true;
                    newGroup.addChild(newCurrent);
                    current = newCurrent;
                } else {
                    current = newCurrent;
                }
            }
        }

        return newGroup;
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
     * create a group
     * @param lines all lines
     */
    private static hittest(lines: Path.Line[]): Group {
        const guid = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

        const group = new Group();
        group.data = guid();
        group.addChild(lines[0]);
        while (this._hittest(group, group.data, lines)) {
        }
        return group;
    }

    /**
     * check for hits
     * @param group group to check
     * @param lines all lines
     */
    private static _hittest(group: Group, guid: string, lines: Path.Line[]): boolean {
        let hit = false;
        _.each(group.children, (item: Path.Line) => {
            item.data.guid = guid;
        });
        const untagged = _.filter(lines, (line: Path.Line) => {
            return (line.data.guid !== guid);
        });
        _.each(untagged, (line: Path.Line) => {
            if (group.hitTestAll(line.getPointAt(0), {
                tolerance: 0.01
            }) !== null
                || group.hitTestAll(line.getPointAt(line.length), {
                    tolerance: 0.01
                }) !== null) {
                group.addChild(line);
                hit = true;
            }
        });
        _.each(group.children, (item: Path.Line) => {
            item.data.guid = guid;
        });
        return hit;
    }

    /**
     * compute all chains
     */
    private static findAllChains(name: string, segments: Segment[], areas: Array<Area>): void {
        let lines = _.flatMap(segments, (segment: Segment) => {
            const line = new Path.Line({
                from: segment.from,
                to: segment.to,
                intert: false,
                data: new MetaData(segment.getZ(), segment.getNormal())
            });
            return line;
        });

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
            if (it.isLinked() === true) {
                return false;
            }
            return current.to.getDistance(it.from) < 0.01;
        });
        if (nextByStart) {
            nextByStart.linked = true;
            return new Segment(
                nextByStart.getFrom().x, nextByStart.getFrom().y,
                nextByStart.getTo().x, nextByStart.getTo().y,
                nextByStart.getNormal().x, nextByStart.getNormal().y,
                nextByStart.getZ(), true);
        }
        const nextByEnd = _.find(segments, (it: Segment) => {
            if (it.isLinked() === true) {
                return false;
            }
            return current.to.getDistance(it.to) < 0.01;
        });
        if (nextByEnd) {
            nextByEnd.linked = true;
            return new Segment(
                nextByEnd.getTo().x, nextByEnd.getTo().y,
                nextByEnd.getFrom().x, nextByEnd.getFrom().y,
                nextByEnd.getNormal().x, nextByEnd.getNormal().y,
                nextByEnd.getZ(), true);
        }
    }
}
