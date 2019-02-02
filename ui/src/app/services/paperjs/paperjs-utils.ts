import { Path, Point } from 'paper';
import * as _ from 'lodash';
import { Group } from 'paper';
import { ScanPiecesBean } from 'src/app/stores/parameters.service';

export class PaperJSUtils {
    /**
     * create a grid helper
     * @param size grid size
     * @param step step size
     */
    public static gridHelper(size: number, step: number) {
        let x, y;

        let segments = [];
        for (y = -size; y < size; y += step) {
            segments.push([-size, y], [size, y], [0, y], [0, y + step]);
        }

        const gridX = new Path({
            segments: segments,
            selected: false
        });

        gridX.strokeColor = 'grey';
        gridX.strokeWidth = 0.05;

        segments = [];
        for (x = -size; x < size; x += step) {
            segments.push([x, -size], [x, size], [x, 0], [x + step, 0]);
        }

        const gridY = new Path({
            segments: segments,
            selected: false
        });

        gridY.strokeColor = 'grey';
        gridY.strokeWidth = 0.05;

        const axeX = new Path({
            segments: [[-size, 0], [size, 0], [size - 5, 5], [size - 5, -5], [size, 0]]
        });
        axeX.strokeColor = 'red';
        axeX.strokeWidth = 0.2;

        const axeY = new Path({
            segments: [[0, -size], [0, size], [5, size - 5], [-5, size - 5], [0, size]]
        });
        axeY.strokeColor = 'green';
        axeY.strokeWidth = 0.2;
    }

    /**
     * compute bound of this area
     * @param area the area
     * @param distance the distance to add to these bounds
     */
    public static bounds(scan: ScanPiecesBean, distance: number): any {
        // Compute bound
        const top = scan.miny, bottom = scan.maxy, left = scan.minx, right = scan.maxx;

        return {
            top: top - distance,
            left: left - distance,
            bottom: bottom + distance,
            right: right + distance
        };
    }

    /**
     * add a new median
     * @param from point from
     * @param to point to
     * @param insert insert in graphic ?
     */
    public static createVector(from: Point, to: Point, insert: boolean): Path {
        const path = new Path.Line({
            from: from,
            to: to,
            strokeColor: 'yellow',
            strokeWidth: 0.2,
            insert: insert
        });
        return path;
    }
}
