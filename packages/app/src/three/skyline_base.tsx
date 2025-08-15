import { Base, CSGGeometryRef, Geometry, Subtraction } from "@react-three/csg";
import { Helper, Text3D } from "@react-three/drei";
import opentype from "opentype.js";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    BoxGeometry,
    BoxHelper,
    type Group,
    type Mesh,
    MeshStandardMaterial
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
import { useSceneStore } from "../stores/scene";

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
    const setBaseRef = useSceneStore((state) => state.setBaseRef);

    const yearRef = useRef<Mesh | null>(null);
    const nameRef = useRef<Mesh | null>(null);

    const { size: yearBoundingBox } = useBoundingBox({
        obj: yearRef
    }, [inputs.name, inputs.startYear, inputs.endYear, inputs.font]);

    const { size: nameBoundingBox } = useBoundingBox({
        obj: nameRef
    }, [computed.resolvedName, inputs.font]);

    const [geometry, setGeometry] = useState<RectangularFrustumGeometry>(
        new RectangularFrustumGeometry(0, 0, 0),
    );
    const [rot, setRot] = useState(0);

    useEffect(() => {
        const width = computed.modelLength + computed.paddingWidth;
        const length = computed.modelWidth * years.length + computed.paddingWidth;
        const height = computed.platformHeight;
        const geom = inputs.shape === SkylineBaseShape.Frustum
            ? new RectangularFrustumGeometry(width, length, height, 5, 7)
            : new RectangularFrustumGeometry(width, length, height);
        setGeometry(geom);
        setRot(geom.calculateSlopeAngle());
    }, [inputs.shape, inputs.insetText, years, computed]);

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

    const logo = useRef<Group | null>(null);
    const [, logoSvgBoundingBox, logoThreeBB] = useExtrudedSvg({
        svg: LOGOS.Circle,
        object: logo,
        material,
        onObjectReady(group) {
            const wantedHeight = 0.65 * computed.platformHeight;
            const scale = wantedHeight / logoSvgBoundingBox.height;
            group.scale.set(scale, -scale, scale);
        },
    });

    const insetName = useRef<Group | null>(null);
    const [, insetNameSvgBB, insetNameThreeBB] = useExtrudedSvg({
        svg: getInsetTextSvg(computed.resolvedName, fontRef.current, computed.textSize * 9),
        object: insetName,
        material,
        depth: inputs.insetDepth - 0.1,
        onObjectReady(group) {
            const wantedHeight = 0.65 * computed.platformHeight;
            const scale = wantedHeight / insetNameSvgBB.height;
            group.scale.set(scale, -scale, 1);
        },
    });

    const TEXT_DEPTH_OFFSET = inputs.shape === "frustum" ? 0.5 : -0.1;

    const baseNormal = useMemo(() => {
        return geometry.getNormal();
    }, [geometry]);

    const NORMAL_TRANSLATION = {
        LOGO: -logoThreeBB.z / 2,
        NAME: insetNameThreeBB.z / 2
    }

    const csgRef = useRef<CSGGeometryRef | null>(null);
    useEffect(() => {
        if (csgRef.current !== null) {
            setBaseRef(csgRef.current);
        }
    }, [csgRef, inputs.insetText])

    return (
        <>
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
                ref={logo}
                rotation={[rot, 0, 0]}
                position={[
                    -computed.xMidpointOffset + 8 - (baseNormal.x * NORMAL_TRANSLATION.LOGO),
                    -computed.platformMidpoint + (baseNormal.y * NORMAL_TRANSLATION.LOGO),
                    (computed.modelWidth * years.length / 2) + inputs.padding + geometry.calculateMidpointSegmentLength() - (baseNormal.z * NORMAL_TRANSLATION.LOGO)
                ]}
            />
            <object3D
                visible={true}
                ref={insetName}
                rotation={[rot, 0, 0]}
                position={[
                    -computed.xMidpointOffset + 12 - (baseNormal.x * NORMAL_TRANSLATION.NAME) + insetNameThreeBB.x / 2,
                    -computed.platformMidpoint + (baseNormal.y * NORMAL_TRANSLATION.NAME),
                    (computed.modelWidth * years.length / 2) + inputs.padding + geometry.calculateMidpointSegmentLength() - (baseNormal.z * NORMAL_TRANSLATION.NAME)
                ]}
            />

            <mesh
                name="csg_mesh"
                onPointerEnter={(e) => e.stopPropagation()}
                position={[0, -computed.platformMidpoint, 0]}
                castShadow
            >
                <meshStandardMaterial flatShading wireframe color={color} />
                <Geometry ref={csgRef}>
                    <Base geometry={new BoxGeometry( computed.modelLength + computed.paddingWidth, computed.platformHeight, computed.modelWidth * years.length + computed.paddingWidth,  )} />
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
            </mesh>
        </>
    );
}
