import * as THREE from 'three';
import * as _ from 'lodash';
import { StlLoaderService } from 'src/app/services/three/stl-loader.service';
import { PlanarUtils } from 'src/app/services/three/planar-utils';

let scene: THREE.Scene;
let mesh: THREE.Mesh;
let mill: THREE.Mesh;
let layer: THREE.Plane;
let detection: PlanarUtils;

let stlLoaderService;

describe('Collide', () => {

    let factoryPiece = (originalGeometry: THREE.BufferGeometry) => {
        // Cf. https://threejs.org/docs/#api/en/materials/MeshToonMaterial
        class MeshToonMaterial extends THREE.MeshPhongMaterial {
            public isMeshToonMaterial(): boolean {
                return true;
            }
        }

        let geometry = new THREE.Geometry().fromBufferGeometry(originalGeometry);
        geometry.computeVertexNormals();

        let material = new MeshToonMaterial({
            lights: true,
            transparent: true,
            opacity: 0.5,
        });

        let mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'piece';
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        return mesh;
    }

    beforeEach((done) => {
        scene = new THREE.Scene();
        layer = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
        detection = new PlanarUtils();

        // Add mill
        let geometry = new THREE.CylinderGeometry(4, 4, 4, 32);
        let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        mill = new THREE.Mesh(geometry, material);
        mill.position.set(40, -10, 4)
        scene.add(mill);


        // fix slice on z to 4 mm
        layer.constant = 4;
        mill.translateZ(layer.constant);

        // Load STL and allocate piece to build
        stlLoaderService = new StlLoaderService();
        stlLoaderService.loadStl(
            scene,
            '/assets/cube.stl',
            (geometry: THREE.BufferGeometry) => {
                mesh = factoryPiece(geometry);
                scene.add(mesh);
                scene.updateMatrixWorld(false);
                done();
            },
            () => {
            },
            () => {
            });
    });

    let collide = () => {
        let result = detection.collisisionDetection(scene, mill, 0.01);
        console.info('collide', result);
        return result;
    }

    it('Should ray collide', () => {
        let ray = new THREE.Ray();
        ray.set(new THREE.Vector3(0, 0, 5), new THREE.Vector3(1, 0, 0).normalize());
        let a = new THREE.Vector3(20, 0, -10);
        let b = new THREE.Vector3(10, 10, 10);
        let c = new THREE.Vector3(10, -20, 30);
        let target = new THREE.Vector3(10, 0, -10);
        let result = ray.intersectTriangle(a, b, c, false, target);
        expect(result).toBe(target);
    });

    it('Should ray collide on mesh', () => {
        let ray = new THREE.Ray();
        ray.set(new THREE.Vector3(0, 0, 2), new THREE.Vector3(100, 100, -10).normalize());

        let geometry = new THREE.BoxGeometry(15, 15, 15);
        let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        let cube = new THREE.Mesh(geometry, material);
        cube.rotateX(0.5);
        cube.rotateY(0.5);
        cube.rotateZ(0.5);
        cube.translateX(50);
        scene.add(cube);
        scene.updateMatrixWorld(false);

        //cube.updateMatrixWorld(true);

        let result = detection.collisisionDetectionRaw([ray], cube, 50);
        expect(result).toBe(true);
    });

    it('Should have many segments', () => {
        console.info('scene', scene);
        // compute new slice
        detection.intersect(layer, mesh);
        console.info('meshes', detection.meshes);
        expect(detection.meshes.length > 0).toBe(true);
    });

    it('Should detect a collicsion', () => {
        console.info('scene', scene);
        // compute new slice
        let raycast = detection.intersect(layer, mesh);
        console.info(mill.position);
        expect(collide()).toBe(false);
    });

    it('Should detect a collicsion after a move', () => {
        console.info('scene', scene);

        // compute new slice
        detection.intersect(layer, mesh);

        console.info(mill.position);
        expect(collide()).toBe(false);

        mill.translateX(-30);
        console.info(mill.position);
        expect(collide()).toBe(true);

        mill.translateX(10);
        console.info(mill.position);
        expect(collide()).toBe(false);
    });

});

describe('Distance', () => {

    it('Should split vertex with a minimal distance', () => {
        let vertices = PlanarUtils.split(
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(10,0,0),
            1
        );
    });

});