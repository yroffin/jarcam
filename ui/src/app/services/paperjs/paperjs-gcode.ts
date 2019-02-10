import { Path } from 'paper';
import { Journey } from 'src/app/services/paperjs/paperjs-model';
import * as _ from 'lodash';
import { PaperJSUtils } from 'src/app/services/paperjs/paperjs-utils';
import { Group } from 'paper';
import { ScanPiecesBean } from 'src/app/stores/parameters.service';
import { PaperJSGcodeInterface } from 'src/app/services/paperjs/paperjs-interface';
import { StringUtils } from 'src/app/services/string-utils';

export class PaperJSGcode implements PaperJSGcodeInterface {

    public header(
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        maxz: number
    ): string {
        const inner = PaperJSUtils.bounds(minx, maxx, miny, maxy, 4);

        let gcode = `\n(Translate ${inner.left} / ${inner.top} )\n`;
        gcode = `${gcode}G90\n`;
        gcode = `${gcode}M03 S18000 (Spindle CW on)\n`;
        gcode = `${gcode}(set the feedrate to 2000mm/minute)\n`;
        gcode = `${gcode}G00 F2000\n`;
        gcode = `${gcode}(set the feedrate to 900mm/minute)\n`;
        gcode = `${gcode}G01 F900\n`;
        gcode = `${gcode}G01 S1\n`;
        gcode = `${gcode}(move to ${this.formatter(0)}mm on the Z axis)\n`;
        gcode = `${gcode}G00 Z${this.formatter(0)}\n`;

        return gcode;
    }

    private formatter(value: number) {
        return StringUtils.format('%5.4f', [value]);
    }

    public build(
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        current: number,
        maxz: number,
        journeys: Journey[]): string {
        const inner = PaperJSUtils.bounds(minx, maxx, miny, maxy, 4);

        let gcode = ``;

        let it = 0;
        _.each(journeys, (journey: Journey) => {
            if (!journey.position) {
                return;
            }
            gcode = `${gcode}(Shape ${journey.path.name})\n`;
            const start = journey.position.clone();
            start.x -= inner.left;
            start.y -= inner.top;
            gcode = `${gcode}(Start ${start})\n`;
            gcode = `${gcode}(move to ${this.formatter(0)} mm on the Z axis)\n`;
            gcode = `${gcode}G00 Z${this.formatter(0)}\n`;
            gcode = `${gcode}G00 X${this.formatter(start.x)} Y${this.formatter(start.y)}\n`;
            gcode = `${gcode}(move to ${this.formatter(current - maxz)}mm on the Z axis)\n`;
            gcode = `${gcode}G01 Z${this.formatter(current - maxz)} F600\n`;
            // path begin can be away from start
            const offset = journey.path.getOffsetOf(journey.position);
            for (let indice = offset; indice < journey.path.length + offset; indice += 0.2) {
                const point = journey.path.getPointAt(indice % journey.path.length);
                point.x -= inner.left;
                point.y -= inner.top;
                gcode = `${gcode}G01 X${this.formatter(point.x)} Y${this.formatter(point.y)}\n`;
            }
            it++;
        });

        return gcode;
    }
}
