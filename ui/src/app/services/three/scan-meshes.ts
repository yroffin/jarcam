import * as THREE from 'three';
import * as _ from 'lodash';
import { Area } from 'src/app/services/three/area.class';
import { MathUtils } from 'src/app/services/math-utils';
import { ScanPiecesBean } from 'src/app/stores/parameters.service';

class FacesGroup {
    neighbours: THREE.Face3[];
    remainders: THREE.Face3[];
}

export class ScanMeshes {

    /**
     * scan pieces
     */
    public static scan(group: THREE.Group, slice: number): ScanPiecesBean {
        let minx = 0;
        let maxx = 0;
        let miny = 0;
        let maxy = 0;
        let minz = 0;
        let maxz = 0;

        const allZ = [minz, maxz];

        _.each(group.children, (from) => {
            const fromGeometry = (<THREE.Geometry>from.geometry);

            // find all matching surfaces
            const surfaces: THREE.Face3[] = _.filter((fromGeometry).faces, (face: THREE.Face3) => {
                // X
                minx = fromGeometry.vertices[face.a].x < minx ? fromGeometry.vertices[face.a].x : minx;
                minx = fromGeometry.vertices[face.b].x < minx ? fromGeometry.vertices[face.b].x : minx;
                minx = fromGeometry.vertices[face.c].x < minx ? fromGeometry.vertices[face.c].x : minx;
                maxx = fromGeometry.vertices[face.a].x > maxx ? fromGeometry.vertices[face.a].x : maxx;
                maxx = fromGeometry.vertices[face.b].x > maxx ? fromGeometry.vertices[face.b].x : maxx;
                maxx = fromGeometry.vertices[face.c].x > maxx ? fromGeometry.vertices[face.c].x : maxx;
                // Y
                miny = fromGeometry.vertices[face.a].y < miny ? fromGeometry.vertices[face.a].y : miny;
                miny = fromGeometry.vertices[face.b].y < miny ? fromGeometry.vertices[face.b].y : miny;
                miny = fromGeometry.vertices[face.c].y < miny ? fromGeometry.vertices[face.c].y : miny;
                maxy = fromGeometry.vertices[face.a].y > maxy ? fromGeometry.vertices[face.a].y : maxy;
                maxy = fromGeometry.vertices[face.b].y > maxy ? fromGeometry.vertices[face.b].y : maxy;
                maxy = fromGeometry.vertices[face.c].y > maxy ? fromGeometry.vertices[face.c].y : maxy;
                // Z
                minz = fromGeometry.vertices[face.a].z < minz ? fromGeometry.vertices[face.a].z : minz;
                minz = fromGeometry.vertices[face.b].z < minz ? fromGeometry.vertices[face.b].z : minz;
                minz = fromGeometry.vertices[face.c].z < minz ? fromGeometry.vertices[face.c].z : minz;
                maxz = fromGeometry.vertices[face.a].z > maxz ? fromGeometry.vertices[face.a].z : maxz;
                maxz = fromGeometry.vertices[face.b].z > maxz ? fromGeometry.vertices[face.b].z : maxz;
                maxz = fromGeometry.vertices[face.c].z > maxz ? fromGeometry.vertices[face.c].z : maxz;
                const normal = face.normal;
                return normal.z >= 0.01;
            });

            // Scann surfaces
            _.each(surfaces, (face: THREE.Face3) => {
                allZ.push(MathUtils.round(fromGeometry.vertices[face.a].z, 100));
                allZ.push(MathUtils.round(fromGeometry.vertices[face.b].z, 100));
                allZ.push(MathUtils.round(fromGeometry.vertices[face.c].z, 100));
            });
        });

        const sortedAllZ = _.orderBy(_.uniq(allZ), (value) => {
            return value;
        });

        // Insert slice
        const reduced = _.transform(sortedAllZ, (result, value) => {
            if (result.length === 0) {
                result.push(value);
            } else {
                let last = _.last(result) + slice;
                for (; last < value; last += slice) {
                    result.push(last);
                }
                result.push(value);
            }
        }, []);

        return {
            minx: minx,
            maxx: maxx,
            miny: miny,
            maxy: maxy,
            minz: minz,
            maxz: maxz,
            allZ: reduced
        };
    }

    /**
     * find isolated objects in this geometry
     * @param geometry geometry
     */
    public static findObjects(geometry: THREE.Geometry): THREE.Geometry[] {
        const result: THREE.Geometry[] = [];
        const faces: THREE.Face3[] = geometry.faces;
        const vertices: THREE.Vector3[] = geometry.vertices;

        // Copy faces
        let remainders: THREE.Face3[] = [];
        _.each(faces, (face: THREE.Face3) => {
            remainders.push(face);
        });
        for (; remainders.length !== 0;) {
            const first = remainders.pop();
            const neighbours: THREE.Face3[] = [first];
            const facesGroup = this.iterate(neighbours, {
                neighbours: [first],
                remainders: remainders
            }, vertices);
            remainders = facesGroup.remainders;

            const local = new THREE.Geometry();
            _.each(neighbours, (face: THREE.Face3) => {
                const it = local.vertices.length;
                local.vertices.push(
                    vertices[face.a].clone(),
                    vertices[face.b].clone(),
                    vertices[face.c].clone()
                );
                local.faces.push(new THREE.Face3(it, it + 1, it + 2, face.normal.clone()));
            });
            result.push(local);
        }
        return result;
    }

    /**
     * iterate to find all faces for one single object
     * @param globalNeighbours global faces
     * @param accu accu (for rec)
     * @param vertices vertices
     */
    private static iterate(
        globalNeighbours: THREE.Face3[],
        accu: FacesGroup,
        vertices: THREE.Vector3[]): FacesGroup {
        let remainders = accu.remainders;
        const neighbours: THREE.Face3[] = [];
        _.each(accu.neighbours, (next) => {
            accu.neighbours.push(next);
            const nextFacesGroup = this.findNeighbour(next, remainders, vertices);
            _.each(nextFacesGroup.neighbours, (neighbour) => {
                neighbours.push(neighbour);
            });
            remainders = nextFacesGroup.remainders;
        });
        // Dump all local neighbour to global neighbour
        _.each(neighbours, (neighbour) => {
            globalNeighbours.push(neighbour);
        });
        // Update remainder
        accu.remainders = remainders;
        if (neighbours.length > 0) {
            // We have tiil neighbours try with new one
            return ScanMeshes.iterate(globalNeighbours, {
                neighbours: neighbours,
                remainders: remainders
            }, vertices);
        }
        return accu;
    }

    /**
     * output neighbour and others
     * @param origin face to be compared
     * @param faces faces
     * @param vertices vertices
     */
    private static findNeighbour(origin: THREE.Face3, faces: THREE.Face3[], vertices: THREE.Vector3[]): FacesGroup {
        const facesGroup = new FacesGroup();
        facesGroup.neighbours = [];
        facesGroup.remainders = [];
        _.each(faces, (face: THREE.Face3) => {
            const touch = vertices[origin.a].equals(vertices[face.a])
                || vertices[origin.a].equals(vertices[face.b])
                || vertices[origin.a].equals(vertices[face.c])
                || vertices[origin.b].equals(vertices[face.a])
                || vertices[origin.b].equals(vertices[face.b])
                || vertices[origin.b].equals(vertices[face.c])
                || vertices[origin.c].equals(vertices[face.a])
                || vertices[origin.c].equals(vertices[face.b])
                || vertices[origin.c].equals(vertices[face.c]);
            if (touch) {
                facesGroup.neighbours.push(face);
            } else {
                facesGroup.remainders.push(face);
            }
        });
        return facesGroup;
    }
}
