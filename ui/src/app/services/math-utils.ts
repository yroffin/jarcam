export class MathUtils {
    public static round(n: number, precision: number): number {
        return Math.round(n * precision + Number.EPSILON) / precision;
    }
}
