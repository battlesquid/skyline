import Module from 'manifold-3d';

const wasm = await Module();
wasm.setup();

const { Manifold, CrossSection } = wasm;

interface FrustumProps {
    length: number;
    width: number;
    lengthPadding: number;
    widthPadding: number;
    height: number;
}

function getSlopeAngle({ length, width, lengthPadding, widthPadding, height }: FrustumProps) {
    const baseWidth =
        width + widthPadding;
    const baseLength =
        length + lengthPadding;

    // Calculate the horizontal distance from center to edge at the base vs top
    // const baseDimension = side === "width" ? baseWidth : baseLength;
    // const topDimension = side === "width" ? this.width : this.length;
    const baseDimension = baseWidth;
    const topDimension = width;

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

function makeFrustum(props: FrustumProps) {
    const { length, width, lengthPadding, widthPadding, height } = props;
    const baseLength = length + lengthPadding;
    const baseWidth = width + widthPadding;
    const topLengthScale = length / baseLength;
    const topWidthScale = width / baseWidth;

    console.log(`Top Dimensions: ${topWidthScale} x ${topLengthScale}`)

    const angle = toDeg(getSlopeAngle(props));
    const normal = getNormal(props);
    console.log(angle);
    console.log(normal);

    const TRANSLATION = 0.5;

    const slotPosition = [
        baseLength / 2 - 4 + (TRANSLATION * normal[0]),
        (width / 2) + (widthPadding / 4) + (TRANSLATION * normal[1]),
        (TRANSLATION * normal[2])
    ] as const;
    // const slotPosition = [0, 0, height - 0.5] as const;

    const cube = Manifold
        .cube(1, true)
        .rotate([angle, 0, 0])
        .translate(slotPosition);

    // return cube.add(Manifold.cube(1, true).translate(0, 0, 3));
    return CrossSection
        .square([baseLength, baseWidth], true)
        .extrude(height, 0, 0, [topLengthScale, topWidthScale], true)
        .add(cube);


}

const props: FrustumProps = {
    length: 30,
    width: 10,
    lengthPadding: 0,
    widthPadding: 2,
    height: 2
}

const result = makeFrustum(props)