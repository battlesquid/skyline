import { Base, Geometry, Subtraction } from "@react-three/csg";
import { Text3D } from "@react-three/drei";
import opentype from "opentype.js";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    BoxGeometry,
    type BufferGeometry,
    type Group,
    type Mesh,
    MeshStandardMaterial,
} from "three";
import type { ContributionWeeks } from "../api/types";
import { getDefaultParameters } from "../defaults";
import { useBoundingBox } from "../hooks/useBoundingBox";
import { useExtrudedSvg } from "../hooks/useExtrudedSvg";
import { LOGOS } from "../logos";
import { useParametersContext } from "../stores/parameters";
import { getInsetTextSvg } from "./inset_text";
import { RectangularFrustumGeometry } from "./rectangular_frustum_geometry";
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

    const [geometry, setGeometry] = useState<BufferGeometry>(
        new BoxGeometry(0, 0, 0),
    );
    const [rot, setRot] = useState(0);

    useEffect(() => {
        const width = computed.modelLength + computed.paddingWidth;
        const length = computed.modelWidth * years.length + computed.paddingWidth;
        const height = computed.platformHeight;

        let geom: BufferGeometry;
        let newRot = 0;

        switch (inputs.shape) {
            case SkylineBaseShape.Prism:
                geom = new BoxGeometry(width, height, length);
                newRot = 0;
                break;
            case SkylineBaseShape.Frustum: {
                geom = new RectangularFrustumGeometry(width, length, height);
                newRot = (geom as RectangularFrustumGeometry).calculateSlopeAngle();
                break;
            }
        }
        setGeometry(geom);
        setRot(newRot);
    }, [inputs.shape, inputs.insetText, years, computed]);

    const material = useMemo(
        () =>
            new MeshStandardMaterial({
                color: inputs.showContributionColor
                    ? getDefaultParameters().inputs.color
                    : inputs.color,
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

    const logo = useRef<Group | null>(null);
    const [, logoSvgBoundingBox, logoThreeBB] = useExtrudedSvg({
        svg: LOGOS.Circle,
        material,
        group: logo,
        onGroupReady(group) {
            const wantedHeight = 0.65 * computed.platformHeight;
            const scale = wantedHeight / logoSvgBoundingBox.height;
            group.scale.set(scale, -scale, scale);
        }
    });

    const insetName = useRef<Group | null>(null);
    const [, insetNameSvgBB, insetNameThreeBB] = useExtrudedSvg({
        svg: getInsetTextSvg(computed.resolvedName, fontRef.current, computed.textSize * 9),
        material,
        depth: inputs.insetDepth,
        group: insetName,
        onGroupReady(group) {
            const wantedHeight = nameBoundingBox.y;
            const scale = wantedHeight / insetNameSvgBB.height;
            group.scale.set(scale, -scale, 1);
        }
    });

    const LOGO_Y_OFFSET = logoThreeBB.y / 2;
    const LOGO_DEPTH_OFFSET = inputs.shape === "frustum" ? 0.5 : 0;
    const TEXT_DEPTH_OFFSET = inputs.shape === "frustum" ? 0.5 : -0.1;
    const BRUSH_Z_OFFSET = inputs.shape === "frustum" ? 2 : 0;


    return (
        <group>
            <group
                ref={logo}
                rotation={[rot, 0, 0]}
                position={[
                    -computed.xMidpointOffset + 5,
                    -computed.platformMidpoint + LOGO_Y_OFFSET,
                    (computed.modelWidth * years.length) / 2 +
                    inputs.padding +
                    LOGO_DEPTH_OFFSET,
                ]}
            />
            <group
                ref={insetName}
                rotation={[rot, 0, 0]}
                position={[
                    -computed.xMidpointOffset + 12,
                    -computed.platformMidpoint + insetNameThreeBB.y / 2,
                    (computed.modelWidth * years.length) / 2 + BRUSH_Z_OFFSET + inputs.padding - inputs.insetDepth
                ]}
            />
            <Text3D
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
            </Text3D>
            <mesh
                onPointerEnter={(e) => e.stopPropagation()}
                position={[0, -computed.platformMidpoint, 0]}
            >
                <meshStandardMaterial flatShading color={color} />

                <Geometry>
                    <Base geometry={geometry} />
                    <Subtraction
                        rotation={[rot, 0, 0]}
                        position={[
                            -computed.xMidpointOffset + insetNameThreeBB.x / 2 + 12,
                            0,
                            (computed.modelWidth * years.length) / 2 + BRUSH_Z_OFFSET + inputs.padding - inputs.insetDepth / 2
                        ]}
                    >
                        <boxGeometry args={[insetNameThreeBB.x, insetNameThreeBB.y, inputs.insetDepth]} />
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
                    </Subtraction>
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
                </Geometry>
                {/* 
                <mesh
                    
                    castShadow
                    receiveShadow
                    geometry={geometry}
                    position={[0, -computed.platformMidpoint, 0]}
                >
                    <meshStandardMaterial flatShading color={color} />
                </mesh> */}
            </mesh>
        </group>
    );
}
