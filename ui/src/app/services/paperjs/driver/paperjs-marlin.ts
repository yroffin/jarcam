import { Path, Point } from 'paper';
import { Journey, BrimBean, PointBean } from 'src/app/services/paperjs/paperjs-model';
import * as _ from 'lodash';
import { PaperJSUtils } from 'src/app/services/paperjs/paperjs-utils';
import { Group } from 'paper';
import { ScanPiecesBean } from 'src/app/stores/parameters.service';
import { PaperJSGcodeInterface } from 'src/app/services/paperjs/paperjs-interface';
import { StringUtils } from 'src/app/services/string-utils';

export class GcodeCtx {
    maxz: number;
    wanted: number;
    real: number;
    gcode: string;
    limit: number;
}

export class PaperJSMarlin {

    private brimsArray: Path[];

    public constructor(brims: BrimBean[], brimSize: number) {
        // Build brim detector
        this.brimsArray = [];
        _.each(brims, (brim: BrimBean) => {
            const path = PaperJSUtils.drawBrim('gcode#brim', brim, false, brimSize);
            this.brimsArray.push(path);
        });
    }

    public LinearMove0ToZ(ctx: GcodeCtx, z: number) {
        ctx.gcode = `${ctx.gcode}(move/z to ${this.f(z)}/${this.f(ctx.wanted)} mm)\n`;
        ctx.gcode = `${ctx.gcode}G00 Z${this.f(z)}\n`;
        ctx.real = z;
    }

    public LinearMove1ToZ(ctx: GcodeCtx, point: Point) {
        if (ctx.wanted < ctx.limit) {
            // Check for brim crossing when wanted is under the limit
            const crossing = _.filter(this.brimsArray, (brim: Path) => {
                return brim.contains(point);
            });

            let authorized;
            // Limit is on
            if (crossing.length) {
                authorized = ctx.limit;
            } else {
                authorized = ctx.wanted;
            }

            // Check for any change
            if (ctx.real !== (authorized - ctx.maxz)) {
                ctx.gcode = `${ctx.gcode}(crossing/z ${this.f(authorized - ctx.maxz)}/${this.f(ctx.wanted - ctx.maxz)} mm)\n`;
                ctx.gcode = `${ctx.gcode}G01 Z${this.f(authorized - ctx.maxz)}\n`;
                ctx.real = authorized - ctx.maxz;
            }
        } else {
            if (ctx.real !== (ctx.wanted - ctx.maxz)) {
                ctx.gcode = `${ctx.gcode}(restore/z ${this.f(ctx.wanted - ctx.maxz)}/${this.f(ctx.wanted - ctx.maxz)})\n`;
                ctx.gcode = `${ctx.gcode}G01 Z${this.f(ctx.wanted - ctx.maxz)}\n`;
                ctx.real = ctx.wanted - ctx.maxz;
            }
        }
    }

    public LinearMove0ToXY(ctx: GcodeCtx, point: Point) {
        ctx.gcode = `${ctx.gcode}G00 X${this.f(point.x)} Y${this.f(point.y)}\n`;
    }

    public LinearMove1ToXY(ctx: GcodeCtx, point: Point) {
        ctx.gcode = `${ctx.gcode}G01 X${this.f(point.x)} Y${this.f(point.y)}\n`;
    }

    public SetFeedrate0(ctx: GcodeCtx, feedrate: number) {
        ctx.gcode = `${ctx.gcode}(set the feedrate to ${feedrate} mm/minute)\n`;
        ctx.gcode = `${ctx.gcode}G00 F${feedrate}\n`;
    }

    public SetFeedrate1(ctx: GcodeCtx, feedrate: number) {
        ctx.gcode = `${ctx.gcode}(set the feedrate to ${feedrate} mm/minute)\n`;
        ctx.gcode = `${ctx.gcode}G01 F${feedrate}\n`;
    }

    private f(value: number) {
        return StringUtils.format('%5.3f', [value]);
    }
}
