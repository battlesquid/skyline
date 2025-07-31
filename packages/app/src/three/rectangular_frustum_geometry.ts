import { BufferAttribute, BufferGeometry } from "three";

export class RectangularFrustumGeometry extends BufferGeometry {
	private static readonly BASE_WIDTH_PADDING = 5;
	private static readonly BASE_LENGTH_PADDING = 7;

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
		const baseLength =
			topLength + RectangularFrustumGeometry.BASE_LENGTH_PADDING;

		const vertices = new Float32Array([
			// bottom
			-baseWidth / 2,
			-height / 2,
			-baseLength / 2, // 0 bottom back-left
			baseWidth / 2,
			-height / 2,
			-baseLength / 2, // 1 bottom back-right
			baseWidth / 2,
			-height / 2,
			baseLength / 2, // 2 bottom front-right
			-baseWidth / 2,
			-height / 2,
			baseLength / 2, // 3 bottom front-left

			// top
			-topWidth / 2,
			height / 2,
			-topLength / 2, // 4: top back-left
			topWidth / 2,
			height / 2,
			-topLength / 2, // 5: top back-right
			topWidth / 2,
			height / 2,
			topLength / 2, // 6:  top front-right
			-topWidth / 2,
			height / 2,
			topLength / 2, // 7:  top front-left
		]);

		this.setAttribute("position", new BufferAttribute(vertices, 3));
		const indices = [
			// Sides (CCW from outside)
			1,
			0,
			5,
			5,
			0,
			4, // back

			2,
			1,
			6,
			6,
			1,
			5, // right

			3,
			2,
			7,
			7,
			2,
			6, // front

			0,
			3,
			4,
			4,
			3,
			7, // left

			// Base (flip triangle order to face downward)
			0,
			1,
			2,
			0,
			2,
			3,

			// Top
			4,
			6,
			5,
			4,
			7,
			6,
		];

		this.setIndex(indices);
		this.computeVertexNormals();
	}

	/**
	 * Calculates the slope angle of the frustum in radians.
	 * This is the angle between the sloped face and the horizontal plane.
	 * @param side - Optional parameter to specify which side: 'width' or 'length'. Defaults to 'length'.
	 * @returns The slope angle in radians
	 */
	calculateSlopeAngle(side: "width" | "length" = "length"): number {
		const baseWidth =
			this.width + RectangularFrustumGeometry.BASE_WIDTH_PADDING;
		const baseLength =
			this.length + RectangularFrustumGeometry.BASE_LENGTH_PADDING;

		// Calculate the horizontal distance from center to edge at the base vs top
		const baseDimension = side === "width" ? baseWidth : baseLength;
		const topDimension = side === "width" ? this.width : this.length;

		// The horizontal difference between base and top edge
		const horizontalDifference = (baseDimension - topDimension) / 2;

		// Calculate the slope angle using arctangent
		const slopeAngle = Math.atan(horizontalDifference / -this.height);

		return slopeAngle;
	}   

	/**
	 * Calculates the slope angle of the frustum in degrees.
	 * @param side - Optional parameter to specify which side: 'width' or 'length'. Defaults to 'length'.
	 * @returns The slope angle in degrees
	 */
	calculateSlopeAngleDegrees(side: "width" | "length" = "length"): number {
		return this.calculateSlopeAngle(side) * (180 / Math.PI);
	}

	/**
	 * Calculates the slope angles for both width and length sides.
	 * @returns An object containing slope angles for both dimensions in radians and degrees
	 */
	calculateAllSlopeAngles(): {
		width: { radians: number; degrees: number };
		length: { radians: number; degrees: number };
	} {
		const widthRadians = this.calculateSlopeAngle("width");
		const lengthRadians = this.calculateSlopeAngle("length");

		return {
			width: {
				radians: widthRadians,
				degrees: widthRadians * (180 / Math.PI),
			},
			length: {
				radians: lengthRadians,
				degrees: lengthRadians * (180 / Math.PI),
			},
		};
	}
}
