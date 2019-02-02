import { ShapeGroup } from 'src/app/services/paperjs/paperjs-model';
import { Area } from 'src/app/services/three/area.class';

export interface PaperJSShapeBuilderInterface {
    build(areas: Array<Area>, radius: number, domInsert: boolean): ShapeGroup;
}
