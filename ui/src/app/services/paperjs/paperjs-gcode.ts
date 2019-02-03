import { Path } from 'paper';
import { Journey } from 'src/app/services/paperjs/paperjs-model';
import * as _ from 'lodash';
import { PaperJSUtils } from 'src/app/services/paperjs/paperjs-utils';
import { Group } from 'paper';
import { ScanPiecesBean } from 'src/app/stores/parameters.service';
import { PaperJSGcodeInterface } from 'src/app/services/paperjs/paperjs-interface';

export class PaperJSGcode implements PaperJSGcodeInterface {

    public build(
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        current: number,
        maxz: number,
        radius: number,
        journeys: Journey[]): string {
        return this._buildGcode(minx, maxx, miny, maxy, current, maxz, radius, journeys);
    }

    private _buildGcode(
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        current: number,
        maxz: number,
        radius: number,
        journeys: Journey[]): string {
        const inner = PaperJSUtils.bounds(minx, maxx, miny, maxy, 4);

        let gcode = `\n(Translate ${inner.left} / ${inner.top} )\n`;
        gcode = `${gcode}G90 (Absolute Positioning)\n`;
        gcode = `${gcode}M03 S18000 (Spindle CW on)\n`;
        gcode = `${gcode}G0 Z${maxz}   (move to ${maxz}mm on the Z axis)\n`;
        gcode = `${gcode}G0 F900 (set the feedrate to 900mm/minute)\n`;

        let it = 0;
        _.each(journeys, (journey: Journey) => {
            gcode = `${gcode}(Shape ${journey.path.name})\n`;
            const start = journey.position.clone();
            start.x -= inner.left;
            start.y -= inner.top;
            gcode = `${gcode}(Start ${start})\n`;
            gcode = `${gcode}G0 Z${maxz}   (move to ${maxz}mm on the Z axis)\n`;
            gcode = `${gcode}G0 X${PaperJSGcode.round(start.x, 100)} Y${PaperJSGcode.round(start.y, 100)}\n`;
            gcode = `${gcode}G1 Z${current}   (move to ${current}mm on the Z axis)\n`;
            // path begin can be away from start
            const offset = journey.path.getOffsetOf(journey.position);
            for (let indice = offset; indice < journey.path.length + offset; indice += 0.2) {
                const point = journey.path.getPointAt(indice % journey.path.length);
                point.x -= inner.left;
                point.y -= inner.top;
                gcode = `${gcode}G1 X${PaperJSGcode.round(point.x, 100)} Y${PaperJSGcode.round(point.y, 100)}\n`;
            }
            it++;
        });

        return gcode;
    }

    public static round(n: number, precision: number): number {
        return Math.round(n * precision + Number.EPSILON) / precision;
    }
}
