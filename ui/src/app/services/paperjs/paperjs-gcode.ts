import { Path, Point } from 'paper';
import { Journey, BrimBean, PointBean } from 'src/app/services/paperjs/paperjs-model';
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
        wanted: number,
        maxz: number,
        journeys: Journey[], brims: BrimBean[], brimSize: number): string {
        let real = wanted;
        const inner = PaperJSUtils.bounds(minx, maxx, miny, maxy, 4);

        // Build brim detector
        const brimsArray: Path[] = [];
        _.each(brims, (brim: BrimBean) => {
            const path = PaperJSUtils.drawBrim('gcode#brim', brim, false, brimSize);
            brimsArray.push(path);
        });

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
            gcode = `${gcode}(move to ${this.formatter(wanted - maxz)}mm on the Z axis)\n`;
            gcode = `${gcode}G01 Z${this.formatter(wanted - maxz)}\n`;
            real = wanted;
            // path begin can be away from start
            const offset = journey.path.getOffsetOf(journey.position);
            for (let indice = offset; indice < journey.path.length + offset; indice += 0.2) {
                const point = journey.path.getPointAt(indice % journey.path.length);
                // Check for brim crossing
                const crossing = _.filter(brimsArray, (brim: Path) => {
                    return brim.contains(point);
                });
                let authorized;
                const limit = crossing.length > 0 && ((wanted - maxz) <= (2 - maxz));
                // Limit is on
                if (limit) {
                    authorized = 2;
                } else {
                    authorized = wanted;
                }
                // Check for any change
                if (authorized !== real) {
                    gcode = `${gcode}(crossing detected ${authorized - maxz})\n`;
                    gcode = `${gcode}G01 Z${this.formatter(authorized - maxz)}\n`;
                    real = authorized;
                }
                point.x -= inner.left;
                point.y -= inner.top;
                gcode = `${gcode}G01 X${this.formatter(point.x)} Y${this.formatter(point.y)}\n`;
            }
            it++;
        });

        return gcode;
    }
}
