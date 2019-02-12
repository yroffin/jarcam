import { Path, Point } from 'paper';
import { Journey, BrimBean, PointBean } from 'src/app/services/paperjs/paperjs-model';
import * as _ from 'lodash';
import { PaperJSUtils } from 'src/app/services/paperjs/paperjs-utils';
import { Group } from 'paper';
import { ScanPiecesBean } from 'src/app/stores/parameters.service';
import { PaperJSGcodeInterface } from 'src/app/services/paperjs/paperjs-interface';
import { StringUtils } from 'src/app/services/string-utils';
import { PaperJSMarlin, GcodeCtx } from 'src/app/services/paperjs/driver/paperjs-marlin';

export class PaperJSGcode implements PaperJSGcodeInterface {

    private gcodeBuilder: PaperJSMarlin;

    public header(
        minx: number,
        maxx: number,
        miny: number,
        maxy: number,
        maxz: number, brims: BrimBean[], brimSize: number
    ): string {
        const inner = PaperJSUtils.bounds(minx, maxx, miny, maxy, 4);

        const ctx: GcodeCtx = {
            maxz: maxz,
            wanted: 0,
            real: 0,
            limit: 2,
            gcode: ``
        };

        ctx.gcode = `\n(Translate ${inner.left} / ${inner.top} )\n`;
        ctx.gcode = `${ctx.gcode}(Brim size set to ${brimSize} mm with tools diameter included)\n`;
        ctx.gcode = `${ctx.gcode}G90\n`;
        ctx.gcode = `${ctx.gcode}M03 S18000 (Spindle CW on)\n`;

        this.gcodeBuilder = new PaperJSMarlin(brims, brimSize);
        this.gcodeBuilder.SetFeedrate0(ctx, 2000);
        this.gcodeBuilder.SetFeedrate1(ctx, 900);
        this.gcodeBuilder.LinearMove0ToZ(ctx, 0);

        ctx.gcode = `${ctx.gcode}G01 S1\n`;

        return ctx.gcode;
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
        journeys: Journey[]): string {
        const inner = PaperJSUtils.bounds(minx, maxx, miny, maxy, 4);

        const ctx: GcodeCtx = {
            maxz: maxz,
            wanted: wanted,
            real: wanted,
            limit: 2,
            gcode: ``
        };

        let it = 0;
        _.each(journeys, (journey: Journey) => {
            if (!journey.position) {
                return;
            }
            ctx.gcode = `${ctx.gcode}(Shape ${journey.path.name})\n`;
            const start = journey.position.clone();
            start.x -= inner.left;
            start.y -= inner.top;
            this.gcodeBuilder.LinearMove0ToZ(ctx, 0);
            this.gcodeBuilder.LinearMove0ToXY(ctx, start);

            // Check for Z in zero position
            this.gcodeBuilder.LinearMove1ToZ(ctx, journey.position);

            // path begin can be away from start
            const offset = journey.path.getOffsetOf(journey.position);
            for (let indice = offset; indice < journey.path.length + offset; indice += 0.2) {
                const point = journey.path.getPointAt(indice % journey.path.length);
                // Check for Z
                this.gcodeBuilder.LinearMove1ToZ(ctx, point);
                // Apply translation
                point.x -= inner.left;
                point.y -= inner.top;
                this.gcodeBuilder.LinearMove1ToXY(ctx, point);
            }
            it++;
        });

        return ctx.gcode;
    }
}
