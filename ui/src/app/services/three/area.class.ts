import * as THREE from 'three';
import * as _ from 'lodash';

export class Normal {
    origin: THREE.Vector3;
    direction: THREE.Vector3;
}

export class Area {
    public meshes: THREE.Object3D[];
    public vertices2d: THREE.Vector3[];

    public raycasters: Normal[];
    public isBound: boolean;
    private name: string;

    public topLeft: THREE.Vector3;
    public topRight: THREE.Vector3;
    public bottomRight: THREE.Vector3;
    public bottomLeft: THREE.Vector3;

    public constructor(isBound: boolean, name: string) {
        this.isBound = isBound;
        this.name = name;
        this.meshes = [];
        this.raycasters = [];
    }

    public compute2dShape() {
        this.vertices2d = [];
        _.each(this.raycasters, (raycaster) => {
            this.vertices2d.push(raycaster.origin.clone());
        });
    }

    private computeBoundingBox(top: THREE.Vector3, right: THREE.Vector3, bottom: THREE.Vector3, left: THREE.Vector3) {
        // scan all raycaster to find the bounding rect
        _.each(this.raycasters, (raycaster: Normal) => {
            if (raycaster.origin.x < top.x) {
                top = raycaster.origin;
            }
            if (raycaster.origin.x > bottom.x) {
                bottom = raycaster.origin;
            }
            if (raycaster.origin.y > right.y) {
                right = raycaster.origin;
            }
            if (raycaster.origin.y < left.y) {
                left = raycaster.origin;
            }
        });

        // clone object
        const topVertice = top.clone();
        const bottomVertice = bottom.clone();
        const leftVertice = left.clone();
        const rightVertice = right.clone();

        this.topLeft = topVertice;
        this.topRight = topVertice.clone();
        this.bottomRight = bottomVertice;
        this.bottomLeft = bottomVertice.clone();

        this.topLeft.y = leftVertice.y;
        this.topRight.y = rightVertice.y;
        this.bottomRight.y = rightVertice.y;
        this.bottomLeft.y = leftVertice.y;
    }

    public computeInfo(): THREE.Group {
        this.computeBoundingBox(this.raycasters[0].origin, this.raycasters[0].origin, this.raycasters[0].origin, this.raycasters[0].origin);

        const group = new THREE.Group();

        const matLite = new THREE.MeshBasicMaterial({
            color: 0x006699,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });

        const dashed = new THREE.LineDashedMaterial({
            color: 0x000000,
            linewidth: 1,
            scale: 1,
            dashSize: 3,
            gapSize: 1,
        });

        return group;
    }

    private isOpen(): boolean {
        return this.area() - this.areaNormal() < 0;
    }

    private area(): number {
        const points: Array<THREE.Vector2> = [];
        _.each(this.raycasters, (raycaster) => {
            points.push(new THREE.Vector2(raycaster.origin.x, raycaster.origin.y));
        });
        return Math.abs(THREE.ShapeUtils.area(points));
    }

    private areaNormal(): number {
        const points: Array<THREE.Vector2> = [];
        _.each(this.raycasters, (raycaster) => {
            points.push(new THREE.Vector2(raycaster.origin.x + raycaster.direction.x, raycaster.origin.y + raycaster.direction.y));
        });
        return Math.abs(THREE.ShapeUtils.area(points));
    }
}
