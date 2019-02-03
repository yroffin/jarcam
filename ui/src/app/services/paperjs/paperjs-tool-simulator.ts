import { PaperJSSimulatorInterface } from 'src/app/services/paperjs/paperjs-interface';
import { ShapeGroup, Journey } from 'src/app/services/paperjs/paperjs-model';
import { Group, Path, Point, Rectangle, CurveLocation } from 'paper';
import { AreaPoint, Area } from 'src/app/services/three/area.class';

import * as _ from 'lodash';
import { PaperJSUtils } from 'src/app/services/paperjs/paperjs-utils';
import { ScanPiecesBean } from 'src/app/stores/parameters.service';

export class PaperJSSimulator implements PaperJSSimulatorInterface {

    constructor() {
    }

    /**
     * tool path simulation
     * @param journeys path
     * @param radius tool radius
     * @param domInsert insert in dom
     */
    public simulation(journeys: Journey[], radius: number, domInsert: boolean): void {
        _.each(journeys, (journey) => {
            const circle = new Path.Circle({
                center: journey.position,
                radius: 1,
                strokeColor: 'red',
                strokeWidth: 0.5,
                fillColor: 'black',
                insert: domInsert
            });

            for (let indice = 0; indice < journey.path.length; indice += 0.2) {
                const tool = new Path.Circle({
                    center: journey.path.getPointAt(indice),
                    radius: radius,
                    dashArray: [1, indice / journey.path.length],
                    insert: domInsert
                });
                tool.strokeColor = 'black';
                tool.strokeWidth = 0.05;
            }
        });
    }

}
