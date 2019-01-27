import * as THREE from 'three';
import * as _ from 'lodash';
import { Area } from 'src/app/services/three/area.class';
import { MathUtils } from 'src/app/services/math-utils';

class FacesGroup {
    neighbours: THREE.Face3[];
    remainders: THREE.Face3[];
}

export class ScanMeshes {

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
