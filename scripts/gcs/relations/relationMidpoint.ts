/**
 * @module gcs/relations
 */
/** */

import Relation, {VariableDelta} from "./relation";
import Variable from "../variable";
import Point from "../geometry/point";
import Util from "../geometry/util";
import Figure from "../geometry/figure";
import Line from "../geometry/line";

export default class RelationMidpoint extends Relation {
    variables: Variable[];
    midpoint: Point;
    line: Line;

    constructor(point: Point, line: Line) {
        super("midpoint");
        this.variables = [
            point._x,
            point._y,
            line.p0._x,
            line.p0._y,
            line.p1._x,
            line.p1._y,
        ];
        this.midpoint = point;
        this.line = line;
    }

    getDeltas(): VariableDelta[] {
        let deltas: VariableDelta[] = [];

        let midpoint = Util.averageOfPoints(this.line.p0, this.line.p1);
        deltas.push(...Util.pointDeltas(this.midpoint, midpoint));

        let reflectP0 = Util.reflectOver(this.line.p0, this.midpoint);
        deltas.push(...Util.pointDeltas(this.line.p1, reflectP0));

        let reflectP1 = Util.reflectOver(this.line.p1, this.midpoint);
        deltas.push(...Util.pointDeltas(this.line.p0, reflectP1));

        return deltas;
    }

    getError(): number {
        let midpoint = Util.averageOfPoints(this.line.p0, this.line.p1);
        return Util.distanceBetweenPoints(this.midpoint, midpoint);
    }

    getVariables(): Variable[] {
        return this.variables;
    }
}