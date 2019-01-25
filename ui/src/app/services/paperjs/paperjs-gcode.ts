import { Path } from 'paper';
import { Journey } from 'src/app/services/paperjs/paperjs-model';
import * as _ from 'lodash';
import { PaperJSUtils } from 'src/app/services/paperjs/paperjs-utils';
import { Group } from 'paper';

export class PaperJSGcode {
    public static buildGcode(area: Group, journeys: Journey[]): string {
        const inner = PaperJSUtils.bounds(area, 0);

        let gcode = '(Translate ' + inner.left + ' ' + inner.top + ')\n';
        gcode += 'G90 (Absolute Positioning)\n';
        gcode += 'M03 S18000 (Spindle CW on)\n';
        gcode += 'G0 Z8   (move to 8mm on the Z axis)\n';
        gcode += 'G0 F900 (set the feedrate to 900mm/minute)\n';

        let it = 0;
        _.each(journeys, (journey: Journey) => {
            gcode += '(Shape ' + journey.path.name + ')\n';
            const start = journey.position.clone();
            start.x -= inner.left;
            start.y -= inner.top;
            gcode += '(Start ' + start + ')\n';
            gcode += 'G0 Z8   (move to 8mm on the Z axis)\n';
            gcode += 'G0 X' + PaperJSGcode.round(start.x, 100) + ' Y' + PaperJSGcode.round(start.y, 100) + '\n';
            gcode += 'G1 Z6   (move to 8mm on the Z axis)\n';
            // path begin can be away from start
            const offset = journey.path.getOffsetOf(journey.position);
            for (let indice = offset; indice < journey.path.length + offset; indice += 0.2) {
                const point = journey.path.getPointAt(indice % journey.path.length);
                point.x -= inner.left;
                point.y -= inner.top;
                gcode += 'G1 X' + PaperJSGcode.round(point.x, 100) + ' Y' + PaperJSGcode.round(point.y, 100) + '\n';
            }
            it++;
        });

        return gcode;
    }

    public static round(n: number, precision: number): number {
        return Math.round(n * precision + Number.EPSILON) / precision;
    }
}