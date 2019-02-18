import { PaperJSShapeBuilderInterface } from 'src/app/services/paperjs/paperjs-interface';
import { ShapeGroup } from 'src/app/services/paperjs/paperjs-model';
import { Group, Path } from 'paper';
import { AreaPoint, Area } from 'src/app/services/three/area.class';

import * as _ from 'lodash';
import { PaperJSContour } from 'src/app/services/paperjs/paperjs-contour';
import { PaperJSUtils } from 'src/app/services/paperjs/paperjs-utils';

export class PaperJSShapeBuilder implements PaperJSShapeBuilderInterface {

    constructor() {
    }

    /**
     * build all shape
     * @param domInsert should insert in dom ?
     */
    public build(areas: Array<Area>, radius: number, domInsert: boolean): ShapeGroup {
        const shapes: ShapeGroup = {
            opened: new Group(),
            closed: new Group(),
            journeys: []
        };

        // Iterate on area to build shape
        _.each(areas, (area: Area) => {
            const segments = [];
            _.each(area.points(), (vertice: AreaPoint) => {
                segments.push([vertice.origin.x, vertice.origin.y]);
            });

            const areaPath = this.createPath(segments, area.name, domInsert);
            // is open ?
            if (area.isOpen()) {
                shapes.opened.addChild(areaPath);
            } else {
                shapes.closed.addChild(areaPath);
            }
        });

        // open area
        shapes.openFinePath = this.openedShape(shapes.opened, radius, domInsert);
        // Raw path use a larger tool radius
        shapes.openRawPath = this.openedShape(shapes.opened, radius + 0.75, domInsert);

        // closed area and bound
        shapes.closeFinePath = this.closedShape(shapes.closed, radius, domInsert);
        // Raw path use a larger tool radius
        shapes.closeRawPath = this.closedShape(shapes.closed, radius + 0.75, domInsert);

        return shapes;
    }

    /**
     * create a path
     * @param segments segments
     * @param name name
     * @param domInsert insert in dom ?
     */
    private createPath(segments: any, name: string, domInsert: boolean): Path {
        const areaPath = new Path({
            segments: segments,
            selected: false,
            closed: true,
            name: name,
            strokeColor: 'red',
            strokeWidth: 0.4,
            visible: true,
            insert: domInsert
        });
        areaPath.onMouseEnter = function (event) {
            this.selected = true;
            _.each(this.data.linked, (link) => {
                link.visible = true;
            });
        };
        areaPath.onMouseLeave = function (event) {
            this.selected = false;
            _.each(this.data.linked, (link) => {
                link.visible = false;
            });
        };
        const dsp = PaperJSUtils.display(areaPath.bounds.bottomRight, areaPath.name, domInsert);
        // Use data to store all linked element
        // a linked element is just paper object associated to this path
        // Text description etc ...
        areaPath.data.linked = [dsp];
        return areaPath;
    }

    /**
     * build contour on opened shape
     * @param closed group
     * @param domInsert should insert it in dom ?
     */
    private openedShape(opened: Group, radius: number, domInsert: boolean): Group {
        const group: Group = new Group();
        _.each(opened.children, (path: Path) => {
            const contour = PaperJSContour.contour(true, path, radius, 10, 0.05, false, domInsert);
            group.addChild(contour);
        });
        return group;
    }

    /**
     * build contour on closed shape
     * @param closed group
     * @param domInsert should insert it in dom ?
     */
    private closedShape(closed: Group, radius: number, domInsert: boolean): Group {
        const group: Group = new Group();
        _.each(closed.children, (path: Path) => {
            const contour = PaperJSContour.contour(false, path, radius, 10, 0.05, false, domInsert);
            group.addChild(contour);
        });
        return group;
    }
}
