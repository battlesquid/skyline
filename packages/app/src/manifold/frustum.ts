import Module, { type Manifold as ManifoldType, type Vec3 } from "manifold-3d";
import { type BufferGeometry, Vector3 } from "three";
import { mesh2geometry } from "./utils";

const wasm = await Module();
wasm.setup();

const { Manifold, CrossSection } = wasm;

export interface ManifoldDimensions {
    width: number;
    length: number;
    height: number;
}

export interface ManifoldFrustumArgs extends ManifoldDimensions {
    lengthPadding: number;
    widthPadding: number;
}

export interface ManifoldSlot extends ManifoldDimensions {
    offset?: number;
}

export type ManifoldFrustumSide = "length" | "width";

export const getSlopeAngle = (frustum: ManifoldFrustumArgs, side: ManifoldFrustumSide = "length"): number => {
    const { width, length, widthPadding, lengthPadding, height } = frustum;

    const baseWidth = width + widthPadding;
    const baseLength = length + lengthPadding;

    // Calculate the horizontal distance from center to edge at the base vs top
    const baseDimension = side === "width" ? baseWidth : baseLength;
    const topDimension = side === "width" ? width : length;

    // The horizontal difference between base and top edge
    const horizontalDifference = (baseDimension - topDimension) / 2;

    // Calculate the slope angle using arctangent
    const slopeAngle = Math.atan(horizontalDifference / height);

    return slopeAngle;
}

const toDeg = (rad: number): number => {
    return rad * (180 / Math.PI);
}

export const getNormal = (frustum: ManifoldFrustumArgs): Vec3 => {
    const angle = getSlopeAngle(frustum);
    return [0, Math.cos(angle), Math.sin(angle)];
}

export const getThreeNormal = (frustum: ManifoldFrustumArgs): Vector3 => {
    const normal = getNormal(frustum);
    return new Vector3(normal[0], normal[2], normal[1]);
}

export interface BaseFrustum {
    angle: number;
}

export interface ManifoldFrustum extends BaseFrustum {
    manifold: ManifoldType;
    normal: Vec3;
}

export interface ThreeFrustum extends BaseFrustum {
    geometry: BufferGeometry;
    normal: Vector3;
}

export const makeManifoldFrustum = (
    frustum: ManifoldFrustumArgs,
    nameSlot: ManifoldSlot,
    yearSlot: ManifoldSlot
): ManifoldFrustum => {
    const { length, width, lengthPadding, widthPadding, height } = frustum;

    const baseLength = length + lengthPadding;
    const baseWidth = width + widthPadding;
    const topLengthScale = length / baseLength;
    const topWidthScale = width / baseWidth;

    const angle = getSlopeAngle(frustum);
    const normal = getNormal(frustum);

    /**
     * Although it causes no functional bugs, placing the slot perfectly against the frustum surface causes visual artifacts.
     * Simply adding a very small amount of padding width to the slot fixes this
     */
    const SLOT_VISIBILITY_PADDING = 0.002;

    const TRANSLATION = -(nameSlot.length / 2) + SLOT_VISIBILITY_PADDING / 2;

    const nameSlotOffset = nameSlot.offset ?? 0;
    const yearSlotOffset = yearSlot.offset ?? 0;

    const nameSlotPosition = [
        baseWidth / 2 - (nameSlot.width / 2) - (nameSlotOffset + widthPadding / 2) + (TRANSLATION * normal[0]),
        (length / 2) + (lengthPadding / 4) + (TRANSLATION * normal[1]),
        (TRANSLATION * normal[2])
    ] as const;

    const yearSlotPosition = [
        (-baseWidth / 2) + (yearSlot.width / 2) + (yearSlotOffset + widthPadding / 2) + (TRANSLATION * normal[0]),
        (length / 2) + (lengthPadding / 4) + (TRANSLATION * normal[1]),
        (TRANSLATION * normal[2])
    ] as const;

    const nameSlotCube = Manifold
        .cube([nameSlot.width, nameSlot.length + SLOT_VISIBILITY_PADDING, nameSlot.height], true)
        .rotate([toDeg(angle), 0, 0])
        .translate(nameSlotPosition);

    const yearSlotCube = Manifold
        .cube([yearSlot.width, yearSlot.length + SLOT_VISIBILITY_PADDING, yearSlot.height], true)
        .rotate([toDeg(angle), 0, 0])
        .translate(yearSlotPosition);

    const manifold = CrossSection
        .square([baseWidth, baseLength], true)
        .extrude(height, 0, 0, [topWidthScale, topLengthScale], true)
        .subtract(nameSlotCube)
        .subtract(yearSlotCube);

    return { manifold, angle, normal };
}

export const makeThreeFrustum = (...args: Parameters<typeof makeManifoldFrustum>): ThreeFrustum => {
    const { manifold, angle } = makeManifoldFrustum(...args);
    const normal = getThreeNormal(args[0]);
    const geometry = mesh2geometry(manifold.getMesh());
    return { angle: -angle, geometry, normal };
}

export const emptyThreeFrustum = (): ThreeFrustum => makeThreeFrustum(
    {
        width: 0,
        length: 0,
        height: 0,
        widthPadding: 0,
        lengthPadding: 0,
    },
    {
        width: 0,
        length: 0,
        height: 0
    },
    {
        width: 0,
        length: 0,
        height: 0
    }
);
