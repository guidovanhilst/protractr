/**
 * @module gcs/geometry
 */
/** */
import Line from "./line";
import Point from "./point";
import Circle from "./circle";
import Variable from "../variable";
import Arc from "./arc";

export default class Util {

    /**
     * Returns the average point
     * returns `new Point(avgX, avgY)`
     * @param points
     */
    static averageOfPoints(...points: Point[]) {
        let x = 0;
        let y = 0;
        for(let point of points) {
            x += point.x;
            y += point.y;
        }
        return new Point(x / points.length, y / points.length);
    }

    /**
     * Returns the length of the line
     * @param line
     */
    static lengthOfLine(line: Line): number {
        return Util.distanceBetweenPoints(line.p0, line.p1);
    }

    /**
     * Return the distance between p0 and p1
     * @param p0
     * @param p1
     */
    static distanceBetweenPoints(p0: Point, p1: Point): number {
        let dx = p0.x - p1.x;
        let dy = p0.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Return the distance from point to its projection onto line
     * @param line
     * @param point
     */
    static distanceToLine(line: Line, point: Point) {
        let projection = Util.projectOntoLine(line, point);
        return Util.distanceBetweenPoints(point, projection);
    }

    /**
     * Return the distance from point to the closest point on segment
     * @param segment
     * @param point
     */
    static distanceToSegment(segment: Line, point: Point) {
        let projection = Util.projectOntoSegment(segment, point);
        return Util.distanceBetweenPoints(point, projection);
    }

    /**
     * Distance from point to the nearest point on circle
     * @param circle
     * @param point
     */
    static distanceToCircle(circle: Circle, point: Point) {
        return Math.abs(Util.distanceBetweenPoints(circle.c, point) - circle.r);
    }

    /**
     *
     * @param point
     */
    static magnitudeOfPoint(point: Point) {
        let x = point.x;
        let y = point.y;
        return Math.sqrt(x * x + y * y);
    }

    /**
     * Return a new point with the magnitude 1, pointing in the same direction
     * If the point has no magnitude, returns `new Point(0, 1)`
     * @param point
     */
    static normalize(point: Point): Point {
        let mag = Util.magnitudeOfPoint(point);
        if (mag == 0) {
            return new Point(0, 1);
        }
        return new Point(point.x / mag, point.y / mag);
    }

    /**
     * Projects point onto circle.
     * If point in center of circle, returns top of circle.
     * @param point
     * @param circle
     */
    static projectOntoCircle(circle: Circle, point: Point) {
        return Util.pointInDirection(circle.c, point, circle.r);
    }

    /**
     * Projects point onto arc
     * @param arc
     * @param point
     */
    static projectOntoArc(arc: Arc, point: Point) {
        let angle = Util.getAngleBetween(arc.c, point);
        if(Util.isAngleBetween(arc.angle0, arc.angle1, angle)) {
            return Util.projectOntoCircle(arc, point);
        }

        let d0 = Util.distanceBetweenPoints(point, arc.p0);
        let d1 = Util.distanceBetweenPoints(point, arc.p1);
        if(d0 < d1) {
            return arc.p0.copy();
        } else {
            return arc.p1.copy();
        }
    }

    static isAngleBetween(startAngle: number, endAngle: number, angle: number): boolean {
        endAngle = (endAngle - startAngle) < 0 ? endAngle - startAngle + Math.PI * 2 : endAngle - startAngle;
        angle = (angle - startAngle) < 0 ? angle - startAngle + Math.PI * 2 : angle - startAngle;
        return (angle < endAngle);
    }

    /**
     * Project point onto line. Point may not be on the line, but it will be co-linear.
     * @param point
     * @param line
     */
    static projectOntoLine(line: Line, point: Point): Point {
        let r = Util.projectionFactorBetween(line, point);
        return Util.pointAlongLine(line, r);
    }

    /**
     * Project point onto line, but make sure the point remains on the line
     * @param point
     * @param line
     */
    static projectOntoSegment(line: Line, point: Point): Point {
        let r = Util.projectionFactorBetween(line, point);
        if (r < 0) r = 0;
        else if (r > 1 || isNaN(r)) r = 1;
        return Util.pointAlongLine(line, r);
    }

    /**
     * Return a point co-lienar with line, with a position determined by r.
     * r = 0: line.p0
     * r = 1: line.p1
     * Numbers outside of [0, 1] are valid.
     * @param r
     * @param line
     */
    static pointAlongLine(line: Line, r: number): Point {
        let px = line.p0.x + r * (line.p1.x - line.p0.x);
        let py = line.p0.y + r * (line.p1.y - line.p0.y);
        return new Point(px, py);
    }

    /**
     * Returns fraction of projection along line
     * 0 is line.p0, 1 is line.p1
     * @param point
     * @param line
     */
    static projectionFactorBetween(line: Line, point: Point): number {
        if (line.p0.equals(point)) return 0;
        if (line.p1.equals(point)) return 1;
        let dx = line.p0.x - line.p1.x;
        let dy = line.p0.y - line.p1.y;
        let len2 = dx * dx + dy * dy;
        return -((point.x - line.p0.x) * dx + (point.y - line.p0.y) * dy) / len2;
    }

    /**
     * Determine if three points are clockwise (1), counterclockwise(-1) or colinear(0)
     * @param p0
     * @param p1
     * @param p2
     */
    static orientation(p0: Point, p1: Point, p2: Point): number {
        let val = (p1.y - p0.y) * (p2.x - p1.x) -
            (p1.x - p0.x) * (p2.y - p1.y);

        if (Math.abs(val) < 0.1) return 0;  // colinear

        return (val > 0) ? 1 : -1; // clock or counterclock wise
    }

    /**
     * Given that point is co-linear to line, return if it lies on the line
     * @param point
     * @param line
     */
    static onSegment(line: Line, point: Point): boolean {
        return point.x <= Math.max(line.p0.x, line.p1.x) &&
               point.x >= Math.min(line.p0.x, line.p1.x) &&
               point.y <= Math.max(line.p0.y, line.p1.y) &&
               point.y >= Math.min(line.p0.y, line.p1.y);
    }

    /**
     * Returns true if line0 intersects line1
     * @param line0
     * @param line1
     */
    static segmentsIntersect(line0: Line, line1: Line) {
        if(Util.lengthOfLine(line0) == 0 || Util.lengthOfLine(line1) == 0) return false;

        let o0 = Util.orientation(line0.p0, line0.p1, line1.p0);
        let o1 = Util.orientation(line0.p0, line0.p1, line1.p1);
        let o2 = Util.orientation(line1.p0, line1.p1, line0.p0);
        let o3 = Util.orientation(line1.p0, line1.p1, line0.p1);

        //General case
        if (o0 != o1 && o2 != o3) return true;

        // Special Cases
        if (o0 == 0 && Util.onSegment(line0, line1.p0)) return true;
        if (o1 == 0 && Util.onSegment(line0, line1.p1)) return true;
        if (o2 == 0 && Util.onSegment(line1, line0.p0)) return true;
        if (o3 == 0 && Util.onSegment(line1, line0.p1)) return true;

        return false;
    }

    /**
     * Return [variable, delta] pairs corresponding to changing point to goal.
     * @param point
     * @param goal
     */
    static pointDeltas(point: Point, goal: Point): [Variable, number][] {
        return [
            [point._x, goal.x - point.x],
            [point._y, goal.y - point.y],
        ];
    }

    /**
     * Return a point which is point reflected across pivot
     * @param point
     * @param pivot
     */
    static reflectOver(point: Point, pivot: Point): Point {
        let dx = point.x - pivot.x;
        let dy = point.y - pivot.y;
        return new Point(point.x - dx * 2, point.y - dy * 2);
    }

    /**
     * Check for any forced regression lines.
     * These can be caused by constant variables or variable links
     * @param points
     */
    static forcedRegressionLine(...points: Point[]): Line {
        // look for any constants
        let constantXPoints: Point[] = [];
        let constantYPoints: Point[] = [];

        let avgX: number = 0;
        let avgY: number = 0;

        for(let p of points) {
            avgX += p.x;
            avgY += p.y;
            if(p._x.constant) constantXPoints.push(p);
            if(constantXPoints.length >= 2) {
                return new Line(constantXPoints[0], constantXPoints[1]);
            }
            if(p._y.constant) constantYPoints.push(p);
            if(constantYPoints.length >= 2) {
                return new Line(constantYPoints[0], constantYPoints[1]);
            }
        }
        avgX /= points.length;
        avgY /= points.length;

        // we also check for linked variables... this will take care of
        // points with existing horizontal or vertical relations
        for(let p0 of points) {
            for(let p1 of points) {
                if(p0 === p1) continue;
                if(p0._x._v === p1._x._v) return new Line(new Point(avgX, p0.y), new Point(avgX, p1.y));
                if(p0._y._v === p1._y._v) return new Line(new Point(p0.x, avgY), new Point(p1.x, avgY));
            }
        }
        return null;
    }

    /**
     * Return a line representing the least squares regression of points.
     * This returns the best regression out of x^2 and y^2.
     * @param points
     */
    static leastSquaresRegression(...points: Point[]): Line {
        let xs = 0;
        let ys = 0;
        let x2s = 0;
        let y2s = 0;
        let xys = 0;
        let n = points.length;
        for(let p of points) {
            xs += p.x;
            ys += p.y;
            x2s += p.x * p.x;
            y2s += p.y * p.y;
            xys += p.x * p.y;
        }
        let numerator = (n * xys) - (xs * ys);
        let denominator = n * x2s - (xs * xs);
        if (denominator === 0 || Math.abs(numerator / denominator) > 1) {
            denominator = n * y2s - (ys * ys);

            let slope = numerator / denominator;
            let xintercept = (xs - slope * ys) / n;

            let p0 = new Point(xintercept, 0);
            let p1 = new Point(xintercept + slope, 1);
            return new Line(p0, p1);
        }
        let slope = numerator / denominator;
        let yintercept = (ys - slope * xs) / n;

        let p0 = new Point(0, yintercept);
        let p1 = new Point(1, yintercept + slope);
        return new Line(p0, p1);
    }

    /**
     * Return a point that is `distance` away from `from` in the direction of `to`
     * @param from
     * @param to
     * @param distance
     */
    static pointInDirection(from: Point, to: Point, distance: number) {
        // ray represents the direction from from to to
        let ray = new Point(to.x - from.x, to.y - from.y);
        // now we set the magnitude of the ray to the distance
        let normalized = Util.normalize(ray);
        normalized.x *= distance;
        normalized.y *= distance;
        // then we translate the point back relative to from
        return new Point(normalized.x + from.x, normalized.y + from.y);
    }

    /**
     * Returns if `point` is within the rectangle created by `corner0` and `corner1`
     * @param corner0
     * @param corner1
     * @param point
     */
    static pointWithinRectangle(corner0: Point, corner1: Point, point: Point): boolean {
        return (
            (corner0.x > point.x && corner1.x < point.x) ||
            (corner0.x < point.x && corner1.x > point.x)) && (
            (corner0.y > point.y && corner1.y < point.y) ||
            (corner0.y < point.y && corner1.y > point.y));
    }

    /**
     * Returns if `point` lies within `circle`
     * @param circle
     * @param point
     */
    static pointWithinCircle(circle: Circle, point: Point): boolean {
        return Util.distanceBetweenPoints(circle.c, point) <= circle.r;
    }

    /**
     * Returns if line intersects or is contained by circle
     * @param circle
     * @param line
     */
    static lineIntersectsCircle(circle: Circle, line: Line): boolean {
        return Util.distanceToSegment(line, circle.c) <= circle.r;
    }


    /**
     * Angle of the line from pivot to point in radians
     * @param pivot
     * @param point
     */
    static getAngleBetween(pivot: Point, point: Point): number {
        let dx = point.x - pivot.x;
        let dy = point.y - pivot.y;
        return Math.atan2(dy, dx);
    }

    /**
     * Return a point `radius` away from `pivot` at the specified `angle`.
     * @param pivot
     * @param radius
     * @param angle
     */
    static pointAtAngle(pivot: Point, radius: number, angle: number): Point {
        let x = Math.cos(angle) * radius;
        let y = Math.sin(angle) * radius;
        return new Point(pivot.x + x, pivot.y + y);
    }
}
