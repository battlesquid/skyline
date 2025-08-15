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
    const slopeAngle = Math.atan(horizontalDifference / -height) * (180 / Math.PI);

    return slopeAngle;
}

function getNormal(props: FrustumProps) {
    const angle = getSlopeAngle(props);
    return [0, -Math.sin(angle), -Math.cos(angle)]
}

function makeFrustum(props: FrustumProps) {
    const { length, width, lengthPadding, widthPadding, height } = props;
    const baseLength = length + lengthPadding;
    const baseWidth = width + widthPadding;
    const topLengthScale = length / baseLength;
    const topWidthScale = width / baseWidth;

    console.log(getSlopeAngle(props));
    console.log(getNormal(props))

    const slotPosition = [0, length / 4, height / 2] as const;

    const cube = Manifold
        .cube(10, true)
        .rotate([90 - getSlopeAngle(props), 0, 0])
        .translate(slotPosition);

    return CrossSection
        .square([baseLength, baseWidth], true)
        .extrude(height, 0, 0, [topLengthScale, topWidthScale], true)
        .subtract(cube);

}

const props: FrustumProps = {
    length: 30,
    width: 10,
    lengthPadding: 1.5,
    widthPadding: 6.5,
    height: 2
}

const result = makeFrustum(props)