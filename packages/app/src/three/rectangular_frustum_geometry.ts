import { BufferAttribute, BufferGeometry, Float32BufferAttribute } from "three";

export enum RectangularFrustumGeometrySide {
	Width = "width",
	Length = "length"
}

export class RectangularFrustumGeometry extends BufferGeometry {
	readonly width: number;
	readonly length: number;
	readonly height: number;
	readonly baseWidthPadding: number;
	readonly baseLengthPadding: number;


	constructor(width: number, length: number, height: number, baseWidthPadding = 0, baseLengthPadding = 0) {
		super();
		this.width = width;
		this.length = length;
		this.height = height;
		this.baseWidthPadding = baseWidthPadding;
		this.baseLengthPadding = baseLengthPadding;

		const topWidth = this.width;
		const topLength = this.length;
		const baseWidth = topWidth + this.baseWidthPadding;
		const baseLength =
			topLength + this.baseLengthPadding;

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
		// TODO: think about correctly computing uv coordinates
		// only here to make csg happy
		this.setAttribute("uv", new Float32BufferAttribute([], 2));
	}

	/**
	 * Calculates the slope angle of the frustum in radians.
	 * This is the angle between the sloped face and the horizontal plane.
	 * @param side - Optional parameter to specify which side: 'width' or 'length'. Defaults to 'length'.
	 * @returns The slope angle in radians
	 */
	calculateSlopeAngle(side: RectangularFrustumGeometrySide = RectangularFrustumGeometrySide.Length): number {
		const baseWidth =
			this.width + this.baseWidthPadding;
		const baseLength =
			this.length + this.baseLengthPadding;

		// Calculate the horizontal distance from center to edge at the base vs top
		const baseDimension = side === "width" ? baseWidth : baseLength;
		const topDimension = side === "width" ? this.width : this.length;

		// The horizontal difference between base and top edge
		const horizontalDifference = (baseDimension - topDimension) / 2;

		// Calculate the slope angle using arctangent
		const slopeAngle = Math.atan(horizontalDifference / -this.height);

		return slopeAngle;
	}

	calculateMidpointSegmentLength(side: RectangularFrustumGeometrySide = RectangularFrustumGeometrySide.Length) {
		return side === RectangularFrustumGeometrySide.Length
			? this.baseLengthPadding / 4
			: this.baseWidthPadding / 4;
	}

	/**
	 * Calculates the slope angle of the frustum in degrees.
	 * @param side - Optional parameter to specify which side: 'width' or 'length'. Defaults to 'length'.
	 * @returns The slope angle in degrees
	 */
	calculateSlopeAngleDegrees(side: RectangularFrustumGeometrySide = RectangularFrustumGeometrySide.Length): number {
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
		const widthRadians = this.calculateSlopeAngle(RectangularFrustumGeometrySide.Width);
		const lengthRadians = this.calculateSlopeAngle(RectangularFrustumGeometrySide.Length);

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
