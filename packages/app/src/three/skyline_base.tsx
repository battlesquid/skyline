import opentype from "opentype.js";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    BufferGeometry,
    type Group,
    type Mesh,
    MeshStandardMaterial
} from "three";
import type { ContributionWeeks } from "../api/types";
import { getDefaultParameters } from "../defaults";
import { useBoundingBox } from "../hooks/useBoundingBox";
import { useExtrudedSvg } from "../hooks/useExtrudedSvg";
import { LOGOS } from "../logos";
import { ManifoldDimensions, type ManifoldFrustum, ManifoldSlot, makeFrustum, yearSlotProps, } from "../manifold/frustum";
import { mesh2geometry } from "../manifold/utils";
import { useParametersContext } from "../stores/parameters";
import { getInsetTextSvg } from "./inset_text";
import { SkylineBaseShape } from "./types";

export interface SkylineBaseProps {
    color: string;
    years: ContributionWeeks[];
}

export function SkylineBase({
    color,
    years
}: SkylineBaseProps) {
    const inputs = useParametersContext((state) => state.inputs);
    const computed = useParametersContext((state) => state.computed);

    const yearRef = useRef<Mesh | null>(null);
    const nameRef = useRef<Mesh | null>(null);

    const { size: yearBoundingBox } = useBoundingBox({
        obj: yearRef
    }, [inputs.name, inputs.startYear, inputs.endYear, inputs.font]);

    const { size: nameBoundingBox } = useBoundingBox({
        obj: nameRef
    }, [computed.resolvedName, inputs.font]);


    const material = useMemo(
        () =>
            new MeshStandardMaterial({
                color: inputs.showContributionColor
                    ? getDefaultParameters().inputs.color
                    : inputs.color,
                flatShading: true
            }),
        [inputs.color, inputs.showContributionColor],
    );

    const fontRef = useRef<opentype.Font | null>(null);
    useEffect(() => {
        const loadFont = async () => {
            const response = await fetch(`/fonts/ttf/Inter_Bold.ttf`);
            const buffer = await response.arrayBuffer();
            const font = opentype.parse(buffer);
            fontRef.current = font;
        }
        loadFont();
    }, []);

    const logoRef = useRef<Group | null>(null);
    const logo = useExtrudedSvg({
        svg: LOGOS.Circle,
        ref: logoRef,
        material,
        onObjectReady(group) {
            const wantedHeight = 0.65 * computed.platformHeight;
            const scale = wantedHeight / logo.svgBoundingBox.height;
            group.scale.set(scale, -scale, scale);
        },
    });

    const insetNameRef = useRef<Group | null>(null);
    const nameExtrusion = useExtrudedSvg({
        svg: getInsetTextSvg(computed.resolvedName, fontRef.current, computed.textSize * 9),
        ref: insetNameRef,
        material,
        depth: inputs.insetDepth,
        onObjectReady(group) {
            const wantedHeight = 0.65 * computed.platformHeight;
            const scale = wantedHeight / nameExtrusion.svgBoundingBox.height;
            group.scale.set(scale, -scale, 1);
        },
    });

    const frustumProps: ManifoldFrustum = useMemo(() => {
        const width = computed.modelLength + computed.paddingWidth;
        const length = computed.modelWidth * years.length + computed.paddingWidth;
        const height = computed.platformHeight;

        return {
            width,
            length,
            height,
            lengthPadding: 7 * +(inputs.shape === SkylineBaseShape.Frustum),
            widthPadding: 5 * +(inputs.shape === SkylineBaseShape.Frustum)
        }
    }, [computed, inputs.shape]);

    const [geometry, setGeometry] = useState(new BufferGeometry());
    const [rot, setRot] = useState(0);

    useEffect(() => {
        const nameSlotProps: ManifoldSlot = {
            width: nameExtrusion.threeBoundingBox.x,
            length: nameExtrusion.threeBoundingBox.z,
            height: nameExtrusion.threeBoundingBox.y,
            offset: 15
        }
        const geom = mesh2geometry(makeFrustum(frustumProps, nameSlotProps, yearSlotProps).getMesh())
        setGeometry(geom);
    }, [inputs.insetText, years, nameExtrusion.threeBoundingBox]);

    const TEXT_DEPTH_OFFSET = inputs.shape === "frustum" ? 0.5 : -0.1;

    return (
        <>
            <mesh
                geometry={geometry}
                position={[0, -computed.platformMidpoint, 0]}
            >
                <meshStandardMaterial flatShading color={color} />
            </mesh>
            {/* <Text3D
                visible={false}
                ref={nameRef}
                font={inputs.font}
                rotation={[rot, 0, 0]}
                receiveShadow
                castShadow
                position={[
                    -computed.xMidpointOffset + nameBoundingBox.x / 2 + 12,
                    -computed.platformMidpoint - 0.5,
                    (computed.modelWidth * years.length) / 2 +
                    inputs.padding +
                    TEXT_DEPTH_OFFSET,
                ]}
                height={inputs.textDepth}
                size={computed.textSize}
            >
                {computed.resolvedName}
                <meshStandardMaterial color={color} />
            </Text3D> */}

            <object3D
                ref={logoRef}
                rotation={[rot, 0, 0]}
            // position={[
            //     -computed.xMidpointOffset + 8 - (baseNormal.x * NORMAL_TRANSLATION.LOGO),
            //     -computed.platformMidpoint + (baseNormal.y * NORMAL_TRANSLATION.LOGO),
            //     (computed.modelWidth * years.length / 2) + inputs.padding + geometry.calculateMidpointSegmentLength() - (baseNormal.z * NORMAL_TRANSLATION.LOGO)
            // ]}
            />
            <object3D
                visible={true}
                ref={insetNameRef}
                rotation={[rot, 0, 0]}
            // position={[
            //     -computed.xMidpointOffset + nameExtrusion.threeBoundingBox.x / 2,
            //     -computed.platformMidpoint,
            //     (computed.modelWidth * years.length / 2) + inputs.padding
            // ]}
            />

            {/* <mesh
                visible={false}
                name="csg_mesh"
                onPointerEnter={(e) => e.stopPropagation()}
                position={[0, -computed.platformMidpoint, 0]}
                castShadow
            >
                <meshStandardMaterial flatShading wireframe color={color} />
                <Geometry ref={csgRef}>
                    <Base geometry={geometry}>
                        <Helper type={VertexNormalsHelper} args={[1]} />

                    </Base>
                    <Subtraction

                        rotation={[rot, 0, 0]}
                        position={[
                            -computed.xMidpointOffset + 12 - (baseNormal.x * (NORMAL_TRANSLATION.NAME - 0.1)) + insetNameThreeBB.x / 2,
                            (baseNormal.y * (NORMAL_TRANSLATION.NAME - 0.1)),
                            (computed.modelWidth * years.length / 2) + inputs.padding + geometry.calculateMidpointSegmentLength() - (baseNormal.z * (NORMAL_TRANSLATION.NAME - 0.1))
                        ]}
                    >
                        <boxGeometry name="name_subtraction" args={[insetNameThreeBB.x, insetNameThreeBB.y, inputs.insetDepth]} />
                        {/* <Text3D
                            ref={nameRef}
                            font={inputs.font}
                            rotation={[rot, 0, 0]}
                            receiveShadow
                            castShadow
                               position={[
                            -computed.xMidpointOffset + nameBoundingBox.x / 2 + 12,
                            ,
                            (computed.modelWidth * years.length) / 2,
                        ]}
                            height={inputs.textDepth}
                            size={computed.textSize}
                        >
                            {}
                        </Text3D> */}
            {/* </Subtraction> */}
            {/* <Subtraction position={[
                        computed.xMidpointOffset - yearBoundingBox.x / 2 - 5,
                        -computed.platformMidpoint - 0.5,
                        (computed.modelWidth * years.length) / 2 +
                        computed.paddingWidth / 2 +
                        TEXT_DEPTH_OFFSET,
                    ]}>
                        <Text3D
                            ref={yearRef}
                            font={inputs.font}
                            receiveShadow
                            castShadow
                            rotation={[rot, 0, 0]}

                            height={inputs.textDepth}
                            size={computed.textSize}
                        >
                            {formatYearText(inputs.startYear, inputs.endYear)}
                        </Text3D>
                    </Subtraction> */}
            {/* </Geometry>
            </mesh> */}
        </>
    );
}
