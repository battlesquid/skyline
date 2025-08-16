import Module from 'manifold-3d';

const wasm = await Module();
wasm.setup();

const { Manifold, CrossSection } = wasm;
interface Dimensions {
    width: number;
    length: number;
    height: number;
}

interface FrustumProps extends Dimensions {
    lengthPadding: number;
    widthPadding: number;
}

function getSlopeAngle({ width, length, widthPadding, lengthPadding, height }: FrustumProps) {
    const baseWidth =
        width + widthPadding;
    const baseLength =
        length + lengthPadding;

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
    return rad * (180 / Math.PI)
}

function toRad(deg: number) {
    return deg * (Math.PI / 180);
}

function getNormal(props: FrustumProps) {
    const angle = getSlopeAngle(props);
    return [0, Math.cos(angle), Math.sin(angle)]
}

function makeSlot(width: number, length: number, height: number) {
    return Manifold.cube([width, length, height], true)
}

function makeFrustum(frustumProps: FrustumProps, slot: Dimensions) {
    const { length, width, lengthPadding, widthPadding, height } = frustumProps;

    const baseLength = length + lengthPadding;
    const baseWidth = width + widthPadding;
    const topLengthScale = length / baseLength;
    const topWidthScale = width / baseWidth;

    console.log(`Top Dimensions: ${topWidthScale} x ${topLengthScale}`)

    const angle = toDeg(getSlopeAngle(frustumProps));
    const normal = getNormal(frustumProps);
    console.log(angle);
    console.log(normal);

    const TRANSLATION = -(slot.length / 2) + 0.001;

    const slotPosition = [
        baseWidth / 2 - 4 + (TRANSLATION * normal[0]),
        (length / 2) + (lengthPadding / 4) + (TRANSLATION * normal[1]),
        (TRANSLATION * normal[2])
    ] as const;

    const cube = Manifold
        .cube([slot.width, slot.length + 0.002, slot.height], true)
        .rotate([angle, 0, 0])
        .translate(slotPosition);

    return CrossSection
        .square([baseWidth, baseLength], true)
        .extrude(height, 0, 0, [topWidthScale, topLengthScale], true)
        .subtract(cube);
}

const frustumProps: FrustumProps = {
    width: 30,
    length: 10,
    widthPadding: 0,
    lengthPadding: 0,
    height: 2
}

const slotProps: Dimensions = {
    width: 5,
    length: 0.25,
    height: 1
}

const frustum = makeFrustum(frustumProps, slotProps);

const result = frustum