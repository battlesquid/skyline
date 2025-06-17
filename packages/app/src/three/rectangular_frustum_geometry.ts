import { BufferAttribute, BufferGeometry } from "three";

export class RectangularFrustumGeometry extends BufferGeometry {
    private static readonly BASE_WIDTH_PADDING = 5;
    private static readonly BASE_LENGTH_PADDING = 10;

    readonly width: number;
    readonly length: number;
    readonly height: number;

    constructor(width: number, length: number, height: number) {
        super();
        this.width = width;
        this.length = length;
        this.height = height;

        const topWidth = width;
        const topLength = length;
        const baseWidth = topWidth + RectangularFrustumGeometry.BASE_WIDTH_PADDING;
        const baseLength = topLength + RectangularFrustumGeometry.BASE_LENGTH_PADDING;

        const vertices = new Float32Array([
            // bottom
            -baseWidth / 2, -height / 2, -baseLength / 2, // 0 bottom back-left
            baseWidth / 2, -height / 2, -baseLength / 2, // 1 bottom back-right
            baseWidth / 2, -height / 2, baseLength / 2, // 2 bottom front-right
            -baseWidth / 2, -height / 2, baseLength / 2, // 3 bottom front-left

            // top
            -topWidth / 2, height / 2, -topLength / 2, // 4: top back-left
            topWidth / 2, height / 2, -topLength / 2,  // 5: top back-right
            topWidth / 2, height / 2, topLength / 2,  // 6:  top front-right
            -topWidth / 2, height / 2, topLength / 2, // 7:  top front-left
        ]);

        this.setAttribute("position", new BufferAttribute(vertices, 3));
        const indices = [
            // Sides (CCW from outside)
            1, 0, 5,
            5, 0, 4, // back

            2, 1, 6,
            6, 1, 5, // right


            3, 2, 7,
            7, 2, 6, // front

            0, 3, 4,
            4, 3, 7, // left

            // Base (flip triangle order to face downward)
            0, 1, 2,
            0, 2, 3,

            // Top
            4, 6, 5,
            4, 7, 6
        ];

        this.setIndex(indices);
        this.computeVertexNormals();
    }

    /**
     * Returns the angle of the frustum's sloped side. 
     * Useful for aligning objects to the face of the frustum.
     */
    atan2() {
        const baseLength = this.length + RectangularFrustumGeometry.BASE_LENGTH_PADDING;
        return Math.atan2(-this.height, baseLength - this.length);
    }
}