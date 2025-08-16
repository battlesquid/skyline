import Module from 'manifold-3d';

const wasm = await Module();
wasm.setup();

const { Manifold, CrossSection } = wasm;

export interface ManifoldDimensions {
    width: number;
    length: number;
    height: number;
}

export interface ManifoldFrustum extends ManifoldDimensions {
    lengthPadding: number;
    widthPadding: number;
}

export interface ManifoldSlot extends ManifoldDimensions {
    offset?: number;
}

function getSlopeAngle(frustum: ManifoldFrustum) {
    const { width, length, widthPadding, lengthPadding, height } = frustum;

    const baseWidth = width + widthPadding;
    const baseLength = length + lengthPadding;

    // Calculate the horizontal distance from center to edge at the base vs top
    // const baseDimension = side === "width" ? baseWidth : baseLength;
    // const topDimension = side === "width" ? this.width : this.length;
    const baseDimension = baseLength;
    const topDimension = length;

    // The horizontal difference between base and top edge
    const horizontalDifference = (baseDimension - topDimension) / 2;

    // Calculate the slope angle using arctangent
    const slopeAngle = Math.atan(horizontalDifference / height);

    return slopeAngle;
}

function toDeg(rad: number) {
    return rad * (180 / Math.PI);
}

function toRad(deg: number) {
    return deg * (Math.PI / 180);
}

export function getNormal(frustum: ManifoldFrustum) {
    const angle = getSlopeAngle(frustum);
    return [0, Math.cos(angle), Math.sin(angle)];
}

export function makeFrustum(
    frustum: ManifoldFrustum,
    nameSlot: ManifoldSlot,
    yearSlot: ManifoldSlot
) {
    const { length, width, lengthPadding, widthPadding, height } = frustum;

    const baseLength = length + lengthPadding;
    const baseWidth = width + widthPadding;
    const topLengthScale = length / baseLength;
    const topWidthScale = width / baseWidth;

    const angle = toDeg(getSlopeAngle(frustum));
    const normal = getNormal(frustum);

    const TRANSLATION = -(nameSlot.length / 2) + 0.001;

    const nameSlotOffset = nameSlot.offset ?? 0;
    const yearSlotOffset = yearSlot.offset ?? 0;

    const nameSlotPosition = [
        baseWidth / 2 - (nameSlot.width / 2) - (nameSlotOffset + widthPadding / 2) + (TRANSLATION * normal[0]),
        (length / 2) + (lengthPadding / 4) + (TRANSLATION * normal[1]),
        (TRANSLATION * normal[2])
    ] as const;

    const yearSlotPosition = [
        (-baseWidth / 2) + (yearSlot.width / 2) + (yearSlotOffset - lengthPadding / 2) + (TRANSLATION * normal[0]),
        (length / 2) + (lengthPadding / 4) + (TRANSLATION * normal[1]),
        (TRANSLATION * normal[2])
    ] as const;

    const nameSlotCube = Manifold
        .cube([nameSlot.width, nameSlot.length + 0.002, nameSlot.height], true)
        .rotate([angle, 0, 0])
        .translate(nameSlotPosition);

    const yearSlotCube = Manifold
        .cube([yearSlot.width, yearSlot.length + 0.002, yearSlot.height], true)
        .rotate([angle, 0, 0])
        .translate(yearSlotPosition);

    return CrossSection
        .square([baseWidth, baseLength], true)
        .extrude(height, 0, 0, [topWidthScale, topLengthScale], true)
        .subtract(nameSlotCube)
        .subtract(yearSlotCube);
}

const frustumProps: ManifoldFrustum = {
    width: 30,
    length: 10,
    widthPadding: 1,
    lengthPadding: 2,
    height: 2
}

export const nameSlotProps: ManifoldSlot = {
    width: 5,
    length: 0.25,
    height: 1
}

export const yearSlotProps: ManifoldSlot = {
    width: 3,
    length: 0.25,
    height: 1
}

export const _frustum = makeFrustum(frustumProps, nameSlotProps, yearSlotProps);

const result = _frustum